"use server";

import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { semesterSchema } from "@/lib/validation";
import { processSemesterData, processDashboardData, type CourseInput } from "@/lib/gpa-calculator";
import type { TotalMarksType } from "@/lib/quality-points";

async function getAuthenticatedUser() {
  const cookieHeader = (await headers()).get("cookie");
  const session = await auth.api.getSession(
    cookieHeader ? { headers: { cookie: cookieHeader } } : undefined
  );

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to continue");
  }

  return session.user;
}

function invalidateAcademicCaches() {
  updateTag("dashboard-data");
  updateTag("admin-data");
}

const getCachedSemesterWithCourses = unstable_cache(
  async (semesterId: string, userId: string) => {
    const semester = await prisma.semester.findFirst({
      where: {
        id: semesterId,
        userId,
      },
      include: {
        courses: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!semester) return null;

    const courseInputs: CourseInput[] = semester.courses.map(
      (course: typeof semester.courses[number]): CourseInput => ({
        name: course.name,
        creditHours: course.creditHours,
        totalMarks: course.totalMarks as TotalMarksType,
        obtainedMarks: course.obtainedMarks,
        isAudit: course.isAudit,
      })
    );

    const semesterData = processSemesterData(
      semester.id,
      semester.name,
      courseInputs
    );

    const coursesWithIds = semesterData.courses.map((course, index) => ({
      ...course,
      id: semester.courses[index].id,
    }));

    return {
      ...semesterData,
      courses: coursesWithIds,
      createdAt: semester.createdAt,
      updatedAt: semester.updatedAt,
    };
  },
  ["semester-with-courses"],
  { revalidate: 300, tags: ["dashboard-data"] }
);

const getCachedAllSemesters = unstable_cache(
  async (userId: string) => {
    const semesters = await prisma.semester.findMany({
      where: { userId },
      include: {
        courses: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const semesterInputs = semesters.map((semester) => ({
      id: semester.id,
      name: semester.name,
      courses: semester.courses.map((course) => ({
        name: course.name,
        creditHours: course.creditHours,
        totalMarks: course.totalMarks as TotalMarksType,
        obtainedMarks: course.obtainedMarks,
        isAudit: course.isAudit,
      })),
    }));

    const dashboardData = processDashboardData(semesterInputs);
    const semestersWithMeta = dashboardData.semesters.map((semester, index) => ({
      ...semester,
      createdAt: semesters[index].createdAt,
      updatedAt: semesters[index].updatedAt,
      courseCount: semesters[index].courses.length,
    }));

    return {
      ...dashboardData,
      semesters: semestersWithMeta,
    };
  },
  ["all-semesters"],
  { revalidate: 300, tags: ["dashboard-data"] }
);

export async function createSemester(name: string) {
  try {
    const user = await getAuthenticatedUser();

    // Validate input
    const validationResult = semesterSchema.safeParse({ name });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Invalid input",
      };
    }

    const semester = await prisma.semester.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    });

    invalidateAcademicCaches();
    revalidatePath("/dashboard");

    return { success: true, data: semester };
  } catch (error) {
    console.error("Error creating semester:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create semester",
    };
  }
}

export async function updateSemester(semesterId: string, name: string) {
  try {
    const user = await getAuthenticatedUser();

    // Verify ownership
    const existing = await prisma.semester.findFirst({
      where: {
        id: semesterId,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Semester not found or access denied" };
    }

    // Validate input
    const validationResult = semesterSchema.safeParse({ name });
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Invalid input",
      };
    }

    const semester = await prisma.semester.update({
      where: { id: semesterId },
      data: { name: name.trim() },
    });

    invalidateAcademicCaches();
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/semester/${semesterId}`);

    return { success: true, data: semester };
  } catch (error) {
    console.error("Error updating semester:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update semester",
    };
  }
}

export async function deleteSemester(semesterId: string) {
  try {
    const user = await getAuthenticatedUser();

    // Verify ownership
    const existing = await prisma.semester.findFirst({
      where: {
        id: semesterId,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Semester not found or access denied" };
    }

    // Delete semester (courses will be cascade deleted)
    await prisma.semester.delete({
      where: { id: semesterId },
    });

    invalidateAcademicCaches();
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting semester:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete semester",
    };
  }
}

export async function getSemesterWithCourses(semesterId: string) {
  try {
    const user = await getAuthenticatedUser();

    const semester = await getCachedSemesterWithCourses(semesterId, user.id);

    if (!semester) {
      return { success: false, error: "Semester not found or access denied" };
    }

    return {
      success: true,
      data: semester,
    };
  } catch (error) {
    console.error("Error getting semester:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get semester",
    };
  }
}

export async function getAllSemesters() {
  try {
    const user = await getAuthenticatedUser();

    const dashboardData = await getCachedAllSemesters(user.id);

    return {
      success: true,
      data: dashboardData,
    };
  } catch (error) {
    console.error("Error getting semesters:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get semesters",
    };
  }
}

export type SearchResults = {
  semesters: { id: string; name: string; courseCount: number }[];
  courses: {
    id: string;
    name: string;
    semesterId: string;
    semesterName: string;
  }[];
};

export async function searchDashboard(query: string): Promise<{
  success: boolean;
  data: SearchResults;
  error?: string;
}> {
  const empty: SearchResults = { semesters: [], courses: [] };
  try {
    const user = await getAuthenticatedUser();
    const q = query.trim();

    if (!q) {
      return { success: true, data: empty };
    }

    const [semesters, courses] = await Promise.all([
      prisma.semester.findMany({
        where: {
          userId: user.id,
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          _count: { select: { courses: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 6,
      }),
      prisma.course.findMany({
        where: {
          semester: { userId: user.id },
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          semester: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      }),
    ]);

    return {
      success: true,
      data: {
        semesters: semesters.map((s) => ({
          id: s.id,
          name: s.name,
          courseCount: s._count.courses,
        })),
        courses: courses.map((c) => ({
          id: c.id,
          name: c.name,
          semesterId: c.semester.id,
          semesterName: c.semester.name,
        })),
      },
    };
  } catch (error) {
    console.error("Error searching dashboard:", error);
    return {
      success: false,
      data: empty,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

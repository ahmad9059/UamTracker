"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { semesterSchema } from "@/lib/validation";
import { processSemesterData, processDashboardData, type CourseInput } from "@/lib/gpa-calculator";
import type { TotalMarksType } from "@/lib/quality-points";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to continue");
  }

  return session.user;
}

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

    const semester = await prisma.semester.findFirst({
      where: {
        id: semesterId,
        userId: user.id,
      },
      include: {
        courses: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!semester) {
      return { success: false, error: "Semester not found or access denied" };
    }

    // Convert courses to CourseInput format
    const courseInputs: CourseInput[] = semester.courses.map((course): CourseInput => ({
      name: course.name,
      creditHours: course.creditHours,
      totalMarks: course.totalMarks as TotalMarksType,
      obtainedMarks: course.obtainedMarks,
      isAudit: course.isAudit,
    }));

    // Process semester data with GPA calculation
    const semesterData = processSemesterData(
      semester.id,
      semester.name,
      courseInputs
    );

    // Return with raw course IDs for editing
    const coursesWithIds = semesterData.courses.map((course, index) => ({
      ...course,
      id: semester.courses[index].id,
    }));

    return {
      success: true,
      data: {
        ...semesterData,
        courses: coursesWithIds,
        createdAt: semester.createdAt,
        updatedAt: semester.updatedAt,
      },
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

    const semesters = await prisma.semester.findMany({
      where: { userId: user.id },
      include: {
        courses: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Convert to dashboard data format
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

    // Add raw semester data for editing
    const semestersWithMeta = dashboardData.semesters.map((semester, index) => ({
      ...semester,
      createdAt: semesters[index].createdAt,
      updatedAt: semesters[index].updatedAt,
      courseCount: semesters[index].courses.length,
    }));

    return {
      success: true,
      data: {
        ...dashboardData,
        semesters: semestersWithMeta,
      },
    };
  } catch (error) {
    console.error("Error getting semesters:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get semesters",
    };
  }
}

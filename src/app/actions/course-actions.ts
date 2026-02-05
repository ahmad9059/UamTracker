"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { courseSchema } from "@/lib/validation";
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

async function verifySemesterOwnership(semesterId: string, userId: string) {
  const semester = await prisma.semester.findFirst({
    where: {
      id: semesterId,
      userId: userId,
    },
  });

  if (!semester) {
    throw new Error("Semester not found or access denied");
  }

  return semester;
}

async function verifyCourseOwnership(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      semester: {
        userId: userId,
      },
    },
    include: {
      semester: true,
    },
  });

  if (!course) {
    throw new Error("Course not found or access denied");
  }

  return course;
}

export async function createCourse(
  semesterId: string,
  data: {
    name: string;
    creditHours: number;
    totalMarks: TotalMarksType;
    obtainedMarks: number;
    isAudit?: boolean;
  }
) {
  try {
    const user = await getAuthenticatedUser();
    await verifySemesterOwnership(semesterId, user.id);

    // Validate input
    const validationResult = courseSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || "Invalid input",
      };
    }

    const course = await prisma.course.create({
      data: {
        name: data.name,
        creditHours: data.creditHours,
        totalMarks: data.totalMarks,
        obtainedMarks: data.obtainedMarks,
        isAudit: data.isAudit ?? false,
        semesterId: semesterId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/semester/${semesterId}`);

    return { success: true, data: course };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

export async function updateCourse(
  courseId: string,
  data: Partial<{
    name: string;
    creditHours: number;
    totalMarks: TotalMarksType;
    obtainedMarks: number;
    isAudit: boolean;
  }>
) {
  try {
    const user = await getAuthenticatedUser();
    const existingCourse = await verifyCourseOwnership(courseId, user.id);

    // Build update data with validation
    const updateData: {
      name?: string;
      creditHours?: number;
      totalMarks?: number;
      obtainedMarks?: number;
      isAudit?: boolean;
    } = {};

    if (data.name !== undefined) {
      if (data.name.length < 1) {
        return { success: false, error: "Course name is required" };
      }
      updateData.name = data.name;
    }

    if (data.isAudit !== undefined) {
      updateData.isAudit = data.isAudit;
    }

    const willBeAudit = updateData.isAudit ?? existingCourse.isAudit;

    if (data.creditHours !== undefined) {
      if (data.creditHours <= 0) {
        return { success: false, error: "Credit hours must be positive" };
      }
      updateData.creditHours = data.creditHours;
    }

    if (data.totalMarks !== undefined) {
      if (![20, 40, 60, 80, 100].includes(data.totalMarks)) {
        return { success: false, error: "Invalid total marks value" };
      }
      updateData.totalMarks = data.totalMarks;
    }

    if (data.obtainedMarks !== undefined) {
      const totalMarks = data.totalMarks ?? existingCourse.totalMarks;
      if (data.obtainedMarks < 0) {
        return { success: false, error: "Obtained marks cannot be negative" };
      }
      if (data.obtainedMarks > totalMarks) {
        return { success: false, error: "Obtained marks cannot exceed total marks" };
      }
      updateData.obtainedMarks = data.obtainedMarks;
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/semester/${existingCourse.semesterId}`);

    return { success: true, data: course };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update course",
    };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const user = await getAuthenticatedUser();
    const course = await verifyCourseOwnership(courseId, user.id);

    await prisma.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/semester/${course.semesterId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete course",
    };
  }
}

export async function getCourse(courseId: string) {
  try {
    const user = await getAuthenticatedUser();
    const course = await verifyCourseOwnership(courseId, user.id);

    return { success: true, data: course };
  } catch (error) {
    console.error("Error getting course:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get course",
    };
  }
}

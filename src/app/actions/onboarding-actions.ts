"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { TotalMarksType } from "@/lib/quality-points";
import { VALID_TOTAL_MARKS } from "@/lib/quality-points";

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

export type OnboardingCourse = {
  name: string;
  creditHours: number;
  totalMarks: TotalMarksType;
  obtainedMarks: number;
  isAudit: boolean;
};

export type OnboardingSemester = {
  name: string;
  courses: OnboardingCourse[];
};

function validateOnboardingData(semesters: OnboardingSemester[]): string | null {
  if (semesters.length === 0) {
    return "At least one semester is required";
  }

  if (semesters.length > 8) {
    return "Maximum 8 semesters allowed";
  }

  for (let i = 0; i < semesters.length; i++) {
    const semester = semesters[i];

    if (!semester.name || semester.name.trim().length === 0) {
      return `Semester ${i + 1}: Name is required`;
    }

    if (semester.name.trim().length > 50) {
      return `Semester ${i + 1}: Name too long (max 50 characters)`;
    }

    if (semester.courses.length === 0) {
      return `Semester "${semester.name}": At least one course is required`;
    }

    for (let j = 0; j < semester.courses.length; j++) {
      const course = semester.courses[j];

      if (!course.name || course.name.trim().length === 0) {
        return `Semester "${semester.name}", Course ${j + 1}: Name is required`;
      }

      if (course.name.trim().length > 100) {
        return `Semester "${semester.name}", Course ${j + 1}: Name too long`;
      }

      if (course.creditHours <= 0 || course.creditHours > 10) {
        return `Semester "${semester.name}", Course "${course.name}": Credit hours must be between 0 and 10`;
      }

      if (!VALID_TOTAL_MARKS.includes(course.totalMarks)) {
        return `Semester "${semester.name}", Course "${course.name}": Total marks must be 20, 40, 60, 80, or 100`;
      }

      if (course.obtainedMarks < 0) {
        return `Semester "${semester.name}", Course "${course.name}": Obtained marks cannot be negative`;
      }

      if (course.obtainedMarks > course.totalMarks) {
        return `Semester "${semester.name}", Course "${course.name}": Obtained marks cannot exceed total marks`;
      }
    }
  }

  return null;
}

export async function completeOnboarding(semesters: OnboardingSemester[]) {
  try {
    const user = await getAuthenticatedUser();

    // Validate all data
    const validationError = validateOnboardingData(semesters);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Use a transaction to create all semesters and courses atomically
    await prisma.$transaction(async (tx) => {
      for (const semester of semesters) {
        await tx.semester.create({
          data: {
            name: semester.name.trim(),
            userId: user.id,
            courses: {
              create: semester.courses.map((course) => ({
                name: course.name.trim(),
                creditHours: course.creditHours,
                totalMarks: course.totalMarks,
                obtainedMarks: course.obtainedMarks,
                isAudit: course.isAudit,
              })),
            },
          },
        });
      }

      // Mark onboarding as completed
      await tx.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete onboarding",
    };
  }
}

export async function skipOnboarding() {
  try {
    const user = await getAuthenticatedUser();

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to skip onboarding",
    };
  }
}

export async function checkOnboardingStatus() {
  try {
    const user = await getAuthenticatedUser();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingCompleted: true },
    });

    return {
      success: true,
      onboardingCompleted: dbUser?.onboardingCompleted ?? false,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return {
      success: false,
      onboardingCompleted: false,
    };
  }
}

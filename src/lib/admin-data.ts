import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import { processDashboardData, type CourseInput } from "@/lib/gpa-calculator";
import { getQualityPoint, type Grade, type TotalMarksType } from "@/lib/quality-points";

const DEGREE_CREDIT_TARGET = 130;

const adminUserInclude = Prisma.validator<Prisma.UserInclude>()({
  accounts: {
    select: {
      providerId: true,
    },
  },
  sessions: {
    where: {
      expiresAt: {
        gt: new Date(0),
      },
    },
    select: {
      id: true,
      expiresAt: true,
    },
  },
  semesters: {
    include: {
      courses: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
});

type UserWithAcademicData = Prisma.UserGetPayload<{
  include: typeof adminUserInclude;
}>;

type CourseRecord = UserWithAcademicData["semesters"][number]["courses"][number];

export type AcademicStatus = "not-started" | "at-risk" | "on-track" | "excellent";

export type AdminUserSummary = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  authProviders: string[];
  activeSessionCount: number;
  semesterCount: number;
  courseCount: number;
  auditCourseCount: number;
  cgpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
  completionPercent: number;
  status: AcademicStatus;
  lastActivityAt: Date;
};

export type AdminSemesterSummary = {
  id: string;
  name: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  gpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
  courseCount: number;
  updatedAt: Date;
};

export type AdminCourseSummary = {
  id: string;
  name: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  semesterId: string;
  semesterName: string;
  creditHours: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: Grade;
  qualityPoint: number;
  isAudit: boolean;
  updatedAt: Date;
};

export type AdminActiveSession = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export type AdminActivity = {
  id: string;
  type: "user" | "semester" | "course" | "session";
  title: string;
  detail: string;
  href: string;
  createdAt: Date;
};

export type AdminDashboardData = {
  metrics: {
    totalUsers: number;
    verifiedUsers: number;
    onboardedUsers: number;
    newUsersLast7Days: number;
    activeSessions: number;
    totalSemesters: number;
    totalCourses: number;
    auditCourses: number;
    platformCgpa: number;
    totalCreditHours: number;
    totalQualityPoints: number;
    atRiskUsers: number;
    excellentUsers: number;
    notStartedUsers: number;
  };
  users: AdminUserSummary[];
  semesters: AdminSemesterSummary[];
  recentCourses: AdminCourseSummary[];
  activeSessions: AdminActiveSession[];
  gradeDistribution: Array<{ grade: Grade; count: number }>;
  userGrowth: Array<{ label: string; users: number }>;
  recentActivity: AdminActivity[];
};

function isTotalMarksType(totalMarks: number): totalMarks is TotalMarksType {
  return [20, 40, 60, 80, 100].includes(totalMarks);
}

function toCourseInput(course: CourseRecord): CourseInput {
  return {
    name: course.name,
    creditHours: course.creditHours,
    totalMarks: isTotalMarksType(course.totalMarks) ? course.totalMarks : 100,
    obtainedMarks: course.obtainedMarks,
    isAudit: course.isAudit,
  };
}

function getLatestDate(dates: Date[]) {
  return dates.reduce((latest, date) => (date > latest ? date : latest), dates[0] ?? new Date(0));
}

function getAcademicStatus(courseCount: number, cgpa: number): AcademicStatus {
  if (courseCount === 0) return "not-started";
  if (cgpa < 2.5) return "at-risk";
  if (cgpa >= 3.5) return "excellent";
  return "on-track";
}

function buildAcademicData(user: UserWithAcademicData) {
  const semesterInputs = user.semesters.map((semester) => ({
    id: semester.id,
    name: semester.name,
    courses: semester.courses.map(toCourseInput),
  }));

  return processDashboardData(semesterInputs);
}

function buildUserSummary(user: UserWithAcademicData): AdminUserSummary {
  const academic = buildAcademicData(user);
  const courseCount = user.semesters.reduce(
    (sum, semester) => sum + semester.courses.length,
    0
  );
  const auditCourseCount = user.semesters.reduce(
    (sum, semester) => sum + semester.courses.filter((course) => course.isAudit).length,
    0
  );
  const activityDates = [
    user.updatedAt,
    ...user.semesters.map((semester) => semester.updatedAt),
    ...user.semesters.flatMap((semester) => semester.courses.map((course) => course.updatedAt)),
  ];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    authProviders: Array.from(new Set(user.accounts.map((account) => account.providerId))),
    activeSessionCount: user.sessions.length,
    semesterCount: user.semesters.length,
    courseCount,
    auditCourseCount,
    cgpa: academic.cgpa,
    totalCreditHours: academic.totalCreditHours,
    totalQualityPoints: academic.totalQualityPoints,
    completionPercent: Math.min((academic.totalCreditHours / DEGREE_CREDIT_TARGET) * 100, 100),
    status: getAcademicStatus(courseCount, academic.cgpa),
    lastActivityAt: getLatestDate(activityDates),
  };
}

function buildSemesterSummaries(users: UserWithAcademicData[]): AdminSemesterSummary[] {
  return users.flatMap((user) => {
    const academic = buildAcademicData(user);
    const byId = new Map(academic.semesters.map((semester) => [semester.id, semester]));

    return user.semesters.map((semester) => {
      const processed = byId.get(semester.id);

      return {
        id: semester.id,
        name: semester.name,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        gpa: processed?.gpa ?? 0,
        totalCreditHours: processed?.totalCreditHours ?? 0,
        totalQualityPoints: processed?.totalQualityPoints ?? 0,
        courseCount: semester.courses.length,
        updatedAt: semester.updatedAt,
      };
    });
  });
}

function buildCourseSummaries(users: UserWithAcademicData[]): AdminCourseSummary[] {
  return users.flatMap((user) =>
    user.semesters.flatMap((semester) =>
      semester.courses.map((course) => {
        const totalMarks = isTotalMarksType(course.totalMarks) ? course.totalMarks : 100;
        const quality = getQualityPoint(course.obtainedMarks, totalMarks);

        return {
          id: course.id,
          name: course.name,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          semesterId: semester.id,
          semesterName: semester.name,
          creditHours: course.creditHours,
          totalMarks: course.totalMarks,
          obtainedMarks: course.obtainedMarks,
          percentage: quality.percentage,
          grade: course.isAudit ? "P" : quality.grade,
          qualityPoint: quality.qualityPoint,
          isAudit: course.isAudit,
          updatedAt: course.updatedAt,
        };
      })
    )
  );
}

function buildGradeDistribution(courses: AdminCourseSummary[]) {
  const counts: Record<Grade, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
    P: 0,
  };

  courses.forEach((course) => {
    counts[course.grade] += 1;
  });

  return (Object.keys(counts) as Grade[]).map((grade) => ({
    grade,
    count: counts[grade],
  }));
}

function buildUserGrowth(users: AdminUserSummary[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString("en", { month: "short" }),
      users: 0,
    };
  });

  users.forEach((user) => {
    const bucket = months.find(
      (month) =>
        month.year === user.createdAt.getFullYear() &&
        month.month === user.createdAt.getMonth()
    );

    if (bucket) bucket.users += 1;
  });

  return months.map(({ label, users: count }) => ({ label, users: count }));
}

function buildRecentActivity(
  users: AdminUserSummary[],
  semesters: AdminSemesterSummary[],
  courses: AdminCourseSummary[],
  sessions: AdminActiveSession[]
): AdminActivity[] {
  return [
    ...users.slice(0, 8).map((user) => ({
      id: `user-${user.id}`,
      type: "user" as const,
      title: user.name || user.email,
      detail: user.onboardingCompleted ? "Completed onboarding" : "Registered account",
      href: `/admin/users/${user.id}`,
      createdAt: user.createdAt,
    })),
    ...semesters.slice(0, 8).map((semester) => ({
      id: `semester-${semester.id}`,
      type: "semester" as const,
      title: semester.name,
      detail: `${semester.userName || semester.userEmail} updated semester data`,
      href: `/admin/users/${semester.userId}`,
      createdAt: semester.updatedAt,
    })),
    ...courses.slice(0, 8).map((course) => ({
      id: `course-${course.id}`,
      type: "course" as const,
      title: course.name,
      detail: `${course.grade} grade in ${course.semesterName}`,
      href: `/admin/users/${course.userId}`,
      createdAt: course.updatedAt,
    })),
    ...sessions.slice(0, 8).map((session) => ({
      id: `session-${session.id}`,
      type: "session" as const,
      title: session.userName || session.userEmail,
      detail: "Active sign-in session",
      href: `/admin/users/${session.userId}`,
      createdAt: session.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
}

const getCachedAdminDashboardData = unstable_cache(
  async (): Promise<AdminDashboardData> => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [users, activeSessions] = await Promise.all([
    prisma.user.findMany({
      include: {
        ...adminUserInclude,
        sessions: {
          where: {
            expiresAt: {
              gt: now,
            },
          },
          select: {
            id: true,
            expiresAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.session.findMany({
      where: {
        expiresAt: {
          gt: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const summaries = users.map(buildUserSummary);
  const semesters = buildSemesterSummaries(users).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const courses = buildCourseSummaries(users).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const activeSessionSummaries = activeSessions.map((session) => ({
    id: session.id,
    userId: session.userId,
    userName: session.user.name,
    userEmail: session.user.email,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
  }));
  const totalCreditHours = summaries.reduce((sum, user) => sum + user.totalCreditHours, 0);
  const totalQualityPoints = summaries.reduce((sum, user) => sum + user.totalQualityPoints, 0);

  return {
    metrics: {
      totalUsers: summaries.length,
      verifiedUsers: summaries.filter((user) => user.emailVerified).length,
      onboardedUsers: summaries.filter((user) => user.onboardingCompleted).length,
      newUsersLast7Days: summaries.filter((user) => user.createdAt >= sevenDaysAgo).length,
      activeSessions: activeSessionSummaries.length,
      totalSemesters: semesters.length,
      totalCourses: courses.length,
      auditCourses: courses.filter((course) => course.isAudit).length,
      platformCgpa: totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0,
      totalCreditHours,
      totalQualityPoints,
      atRiskUsers: summaries.filter((user) => user.status === "at-risk").length,
      excellentUsers: summaries.filter((user) => user.status === "excellent").length,
      notStartedUsers: summaries.filter((user) => user.status === "not-started").length,
    },
    users: summaries.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()),
    semesters,
    recentCourses: courses.slice(0, 20),
    activeSessions: activeSessionSummaries,
    gradeDistribution: buildGradeDistribution(courses),
    userGrowth: buildUserGrowth(summaries),
    recentActivity: buildRecentActivity(summaries, semesters, courses, activeSessionSummaries),
  };
  },
  ["admin-dashboard-data"],
  { revalidate: 30, tags: ["admin-data"] }
);

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  return getCachedAdminDashboardData();
}

const getCachedAdminUserProfile = unstable_cache(
  async (userId: string) => {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ...adminUserInclude,
      sessions: {
        where: {
          expiresAt: {
            gt: now,
          },
        },
        select: {
          id: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!user) return null;

  const summary = buildUserSummary(user);
  const academic = buildAcademicData(user);
  const courses = buildCourseSummaries([user]);
  const processedById = new Map(academic.semesters.map((semester) => [semester.id, semester]));

  return {
    summary,
    gradeDistribution: buildGradeDistribution(courses),
    semesters: user.semesters.map((semester) => ({
      raw: semester,
      academic: processedById.get(semester.id),
    })),
  };
  },
  ["admin-user-profile"],
  { revalidate: 60, tags: ["admin-data"] }
);

export async function getAdminUserProfile(userId: string) {
  return getCachedAdminUserProfile(userId);
}

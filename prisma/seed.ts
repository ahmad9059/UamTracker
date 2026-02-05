import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCourse = {
  name: string;
  creditHours: number;
  totalMarks: number;
  obtainedMarks: number;
  isAudit?: boolean;
};

type SeedSemester = {
  name: string;
  courses: SeedCourse[];
};

// Normalize courses so totalMarks always matches creditHours * 20
function normalizeCourse(course: SeedCourse): SeedCourse {
  // Audit / pass courses: keep credit hours 0, ignore marks, mark as audit
  if (course.isAudit || course.creditHours === 0) {
    return {
      ...course,
      creditHours: 0,
      isAudit: true,
      totalMarks: course.totalMarks || 20,
      obtainedMarks: 0,
    };
  }

  const targetTotal = course.creditHours * 20;
  const sourceTotal = course.totalMarks || targetTotal;
  const scaledObtained = Math.round((course.obtainedMarks / sourceTotal) * targetTotal);

  return {
    ...course,
    totalMarks: targetTotal,
    obtainedMarks: Math.min(targetTotal, scaledObtained),
  };
}

const semesters: SeedSemester[] = [
  {
    name: "1st Semester",
    courses: [
      { name: "Application of Information & Communication Technologies", creditHours: 3, totalMarks: 60, obtainedMarks: 51 },
      { name: "Programming Fundamentals", creditHours: 4, totalMarks: 80, obtainedMarks: 72 },
      { name: "Applied Physics", creditHours: 3, totalMarks: 60, obtainedMarks: 43 },
      { name: "Ideology & Constitution of Pakistan", creditHours: 2, totalMarks: 40, obtainedMarks: 23 },
      { name: "Functional English", creditHours: 3, totalMarks: 60, obtainedMarks: 34 },
      // Pass/Non-GPA course (exclude from GPA by setting creditHours to 0)
      { name: "Social & Religious Tolerance (Pass/Non-GPA)", creditHours: 0, totalMarks: 40, obtainedMarks: 23, isAudit: true },
    ],
  },
  {
    name: "2nd Semester",
    courses: [
      { name: "Object Oriented Programming", creditHours: 4, totalMarks: 80, obtainedMarks: 71 },
      { name: "Digital Logic Design", creditHours: 3, totalMarks: 60, obtainedMarks: 44 },
      { name: "Quantitative Reasoning I", creditHours: 3, totalMarks: 60, obtainedMarks: 50 },
      { name: "Islamic Studies", creditHours: 2, totalMarks: 40, obtainedMarks: 26 },
      { name: "Expository Writing", creditHours: 3, totalMarks: 60, obtainedMarks: 35 },
      { name: "Quranic Studies (Pass/Non-GPA)", creditHours: 0, totalMarks: 20, obtainedMarks: 15 },
      { name: "Quranic Studies (Pass/Non-GPA)", creditHours: 0, totalMarks: 20, obtainedMarks: 15, isAudit: true },
      { name: "Citizenship Education & Community Engagement (Pass/Non-GPA)", creditHours: 0, totalMarks: 60, obtainedMarks: 46, isAudit: true },
    ],
  },
  {
    name: "3rd Semester",
    courses: [
      { name: "Data Structures & Algorithms", creditHours: 4, totalMarks: 80, obtainedMarks: 68 },
      { name: "Computer Organization", creditHours: 3, totalMarks: 60, obtainedMarks: 52 },
      { name: "Linear Algebra", creditHours: 3, totalMarks: 60, obtainedMarks: 50 },
      { name: "Probability & Statistics I", creditHours: 3, totalMarks: 60, obtainedMarks: 44 },
      { name: "Technical Writing", creditHours: 3, totalMarks: 60, obtainedMarks: 44 },
      { name: "Islamic Studies II", creditHours: 2, totalMarks: 40, obtainedMarks: 30 },
    ],
  },
  {
    name: "4th Semester",
    courses: [
      { name: "Multivariable Calculus", creditHours: 3, totalMarks: 60, obtainedMarks: 41 },
      { name: "Operating Systems", creditHours: 3, totalMarks: 60, obtainedMarks: 42 },
      { name: "Database Systems", creditHours: 4, totalMarks: 80, obtainedMarks: 68 },
      { name: "Analysis of Algorithms", creditHours: 3, totalMarks: 60, obtainedMarks: 50 },
      { name: "Computer Architecture", creditHours: 3, totalMarks: 60, obtainedMarks: 49 },
      { name: "Probability & Statistics", creditHours: 3, totalMarks: 60, obtainedMarks: 43 },
      // Audit/Pass course; exclude from GPA
      { name: "Quranic Studies II (Audit/Non-GPA)", creditHours: 0, totalMarks: 20, obtainedMarks: 14, isAudit: true },
    ],
  },
];

async function main() {
  const userEmail = "ahmadhassan9059@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`User with email ${userEmail} not found!`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name || user.email}`);

  await prisma.semester.deleteMany({ where: { userId: user.id } });
  console.log("Cleared existing semesters...");

  for (const sem of semesters) {
    const semester = await prisma.semester.create({
      data: {
        name: sem.name,
        userId: user.id,
        courses: {
          create: sem.courses.map((course) => {
            const normalized = normalizeCourse(course);
            return {
              ...normalized,
              isAudit: normalized.isAudit ?? false,
            };
          }),
        },
      },
    });
    console.log(`Created semester: ${semester.name}`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`Created ${semesters.length} semesters from provided dataset.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

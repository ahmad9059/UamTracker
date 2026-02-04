import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mapCourse = (course: {
  name: string;
  creditHours: number;
  totalMarks: number;
  obtainedMarks: number;
}) => {
  const targetTotal = course.creditHours * 20;
  const sourceTotal = course.totalMarks || targetTotal;
  const scaledObtained = Math.round(
    (course.obtainedMarks / sourceTotal) * targetTotal
  );

  return {
    ...course,
    totalMarks: targetTotal,
    obtainedMarks: Math.min(targetTotal, scaledObtained),
  };
};

async function main() {
  const userEmail = "ahmadhassan9059@gmail.com";

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`User with email ${userEmail} not found!`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name || user.email}`);

  // Delete existing semesters for this user (to avoid duplicates)
  await prisma.semester.deleteMany({
    where: { userId: user.id },
  });

  console.log("Cleared existing semesters...");

  // Semester 1 - Fall 2023
  const semester1 = await prisma.semester.create({
    data: {
      name: "Fall 2023",
      userId: user.id,
      courses: {
        create: [
          mapCourse({
            name: "Introduction to Programming",
            creditHours: 4,
            totalMarks: 100,
            obtainedMarks: 88,
          }),
          mapCourse({
            name: "Calculus I",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 75,
          }),
          mapCourse({
            name: "English Composition",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 82,
          }),
          mapCourse({
            name: "Physics I",
            creditHours: 4,
            totalMarks: 100,
            obtainedMarks: 70,
          }),
          mapCourse({
            name: "Islamic Studies",
            creditHours: 2,
            totalMarks: 100,
            obtainedMarks: 90,
          }),
          mapCourse({
            name: "Computer Fundamentals Lab",
            creditHours: 1,
            totalMarks: 40,
            obtainedMarks: 35,
          }),
        ],
      },
    },
  });

  console.log(`Created semester: ${semester1.name}`);

  // Semester 2 - Spring 2024
  const semester2 = await prisma.semester.create({
    data: {
      name: "Spring 2024",
      userId: user.id,
      courses: {
        create: [
          mapCourse({
            name: "Object Oriented Programming",
            creditHours: 4,
            totalMarks: 100,
            obtainedMarks: 85,
          }),
          mapCourse({
            name: "Calculus II",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 68,
          }),
          mapCourse({
            name: "Discrete Mathematics",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 78,
          }),
          mapCourse({
            name: "Digital Logic Design",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 82,
          }),
          mapCourse({
            name: "Pakistan Studies",
            creditHours: 2,
            totalMarks: 100,
            obtainedMarks: 85,
          }),
          mapCourse({
            name: "OOP Lab",
            creditHours: 1,
            totalMarks: 40,
            obtainedMarks: 38,
          }),
        ],
      },
    },
  });

  console.log(`Created semester: ${semester2.name}`);

  // Semester 3 - Fall 2024
  const semester3 = await prisma.semester.create({
    data: {
      name: "Fall 2024",
      userId: user.id,
      courses: {
        create: [
          mapCourse({
            name: "Data Structures & Algorithms",
            creditHours: 4,
            totalMarks: 100,
            obtainedMarks: 92,
          }),
          mapCourse({
            name: "Database Systems",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 88,
          }),
          mapCourse({
            name: "Computer Organization",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 75,
          }),
          mapCourse({
            name: "Linear Algebra",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 72,
          }),
          mapCourse({
            name: "Technical Writing",
            creditHours: 2,
            totalMarks: 100,
            obtainedMarks: 80,
          }),
          mapCourse({
            name: "DSA Lab",
            creditHours: 1,
            totalMarks: 40,
            obtainedMarks: 36,
          }),
        ],
      },
    },
  });

  console.log(`Created semester: ${semester3.name}`);

  // Semester 4 - Spring 2025
  const semester4 = await prisma.semester.create({
    data: {
      name: "Spring 2025",
      userId: user.id,
      courses: {
        create: [
          mapCourse({
            name: "Operating Systems",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 84,
          }),
          mapCourse({
            name: "Software Engineering",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 79,
          }),
          mapCourse({
            name: "Computer Networks",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 86,
          }),
          mapCourse({
            name: "Probability & Statistics",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 71,
          }),
          mapCourse({
            name: "Professional Ethics",
            creditHours: 2,
            totalMarks: 100,
            obtainedMarks: 88,
          }),
          mapCourse({
            name: "Database Lab",
            creditHours: 1,
            totalMarks: 40,
            obtainedMarks: 34,
          }),
        ],
      },
    },
  });

  console.log(`Created semester: ${semester4.name}`);

  // Semester 5 - Fall 2025
  const semester5 = await prisma.semester.create({
    data: {
      name: "Fall 2025",
      userId: user.id,
      courses: {
        create: [
          mapCourse({
            name: "Artificial Intelligence",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 91,
          }),
          mapCourse({
            name: "Web Development",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 94,
          }),
          mapCourse({
            name: "Theory of Automata",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 76,
          }),
          mapCourse({
            name: "Information Security",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 83,
          }),
          mapCourse({
            name: "Numerical Computing",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 69,
          }),
          mapCourse({
            name: "Web Development Lab",
            creditHours: 1,
            totalMarks: 40,
            obtainedMarks: 37,
          }),
        ],
      },
    },
  });

  console.log(`Created semester: ${semester5.name}`);

  // Semester 6 - Spring 2026
  const semester6 = await prisma.semester.create({
    data: {
      name: "Spring 2026",
      userId: user.id,
      courses: {
        create: [
          mapCourse({
            name: "Machine Learning",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 87,
          }),
          mapCourse({
            name: "Mobile App Development",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 90,
          }),
          mapCourse({
            name: "Compiler Construction",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 74,
          }),
          mapCourse({
            name: "Cloud Computing",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 82,
          }),
          mapCourse({
            name: "Final Year Project I",
            creditHours: 3,
            totalMarks: 100,
            obtainedMarks: 85,
          }),
          mapCourse({
            name: "Mobile App Lab",
            creditHours: 1,
            totalMarks: 40,
            obtainedMarks: 36,
          }),
        ],
      },
    },
  });

  console.log(`Created semester: ${semester6.name}`);

  console.log("\n✅ Seed completed successfully!");
  console.log("Created 6 semesters with 6 courses each for Computer Science degree.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

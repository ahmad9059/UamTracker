import { getQualityPoint, type TotalMarksType, type Grade, isValidTotalMarks } from "./quality-points";

// Course input for calculation
export type CourseInput = {
  name?: string; // Optional for public calculator
  creditHours: number;
  totalMarks: TotalMarksType;
  obtainedMarks: number;
  isAudit?: boolean; // Audit/Pass course, excluded from GPA
};

// Course with calculated quality point info
export type CourseWithQP = CourseInput & {
  qualityPoint: number;
  grade: Grade;
  percentage: number;
  weightedQP: number; // equals qualityPoint (QP already weighted by credit hours, but zeroed for audit)
  isAudit: boolean;
};

// GPA calculation result
export type GPAResult = {
  gpa: number;
  totalQualityPoints: number;
  totalCreditHours: number;
  courses: CourseWithQP[];
};

// Semester data with courses and GPA
export type SemesterData = {
  id: string;
  name: string;
  courses: CourseWithQP[];
  gpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
};

// Dashboard data with all semesters and CGPA
export type DashboardData = {
  semesters: SemesterData[];
  cgpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
};

/**
 * Calculate GPA for a set of courses
 * Formula: GPA = Sum of qualityPoint / Sum of creditHours
 */
export function calculateGPA(courses: CourseInput[]): GPAResult {
  // Handle empty courses
  if (courses.length === 0) {
    return {
      gpa: 0,
      totalQualityPoints: 0,
      totalCreditHours: 0,
      courses: [],
    };
  }

  // Process each course to get quality points (audit courses are excluded from GPA totals)
  const processedCourses: CourseWithQP[] = courses.map((course) => {
    const isAudit = Boolean(course.isAudit);

    const { qualityPoint, grade, percentage } = getQualityPoint(
      course.obtainedMarks,
      course.totalMarks
    );

    return {
      ...course,
      isAudit,
      qualityPoint,
      grade: isAudit ? "P" : grade,
      percentage,
      weightedQP: isAudit ? 0 : qualityPoint, // exclude audit courses from GPA sums
    };
  });

  // Only include non-audit courses with credit hours > 0 in GPA math
  const gpaCourses = processedCourses.filter(
    (course) => !course.isAudit && course.creditHours > 0
  );

  // Calculate totals
  const totalCreditHours = gpaCourses.reduce(
    (sum, course) => sum + course.creditHours,
    0
  );

  const totalQualityPoints = gpaCourses.reduce(
    (sum, course) => sum + course.weightedQP,
    0
  );

  // Calculate GPA (handle division by zero) – keep full precision, round only on display
  const gpa = totalCreditHours > 0
    ? totalQualityPoints / totalCreditHours
    : 0;

  return {
    gpa,
    totalQualityPoints,
    totalCreditHours,
    courses: processedCourses,
  };
}

/**
 * Calculate CGPA across multiple semesters
 * Formula: CGPA = Sum of all quality points / Sum of all credit hours
 */
export function calculateCGPA(semesters: SemesterData[]): number {
  // Handle empty semesters
  if (semesters.length === 0) {
    return 0;
  }

  const totalQualityPoints = semesters.reduce(
    (sum, semester) => sum + semester.totalQualityPoints,
    0
  );

  const totalCreditHours = semesters.reduce(
    (sum, semester) => sum + semester.totalCreditHours,
    0
  );

  // Handle division by zero
  if (totalCreditHours === 0) {
    return 0;
  }

  return totalQualityPoints / totalCreditHours;
}

/**
 * Process raw course data into SemesterData format
 */
export function processSemesterData(
  id: string,
  name: string,
  courses: CourseInput[]
): SemesterData {
  const result = calculateGPA(courses);

  return {
    id,
    name,
    courses: result.courses,
    gpa: result.gpa,
    totalCreditHours: result.totalCreditHours,
    totalQualityPoints: result.totalQualityPoints,
  };
}

/**
 * Process multiple semesters into DashboardData format
 */
export function processDashboardData(
  semesters: Array<{ id: string; name: string; courses: CourseInput[] }>
): DashboardData {
  const processedSemesters = semesters.map((semester) =>
    processSemesterData(semester.id, semester.name, semester.courses)
  );

  const cgpa = calculateCGPA(processedSemesters);

  const totalCreditHours = processedSemesters.reduce(
    (sum, semester) => sum + semester.totalCreditHours,
    0
  );

  const totalQualityPoints = processedSemesters.reduce(
    (sum, semester) => sum + semester.totalQualityPoints,
    0
  );

  return {
    semesters: processedSemesters,
    cgpa,
    totalCreditHours,
    totalQualityPoints,
  };
}

/**
 * Validation result type
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Validate course input
 */
export function validateCourseInput(course: CourseInput): ValidationResult {
  const errors: string[] = [];

  const isAudit = Boolean(course.isAudit);

  // Validate credit hours
  if (course.creditHours <= 0) {
    errors.push("Credit hours must be a positive number");
  }

  // Validate total marks
  if (!isValidTotalMarks(course.totalMarks)) {
    errors.push("Total marks must be one of: 20, 40, 60, 80, or 100");
  }

  // Validate obtained marks
  if (course.obtainedMarks < 0) {
    errors.push("Obtained marks cannot be negative");
  }

  if (course.obtainedMarks > course.totalMarks) {
    errors.push("Obtained marks cannot exceed total marks");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

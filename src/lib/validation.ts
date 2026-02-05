import { z } from "zod";
import { VALID_TOTAL_MARKS, type TotalMarksType } from "./quality-points";

// Course input schema
export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(100, "Course name too long"),
  isAudit: z.boolean().optional().default(false),
  creditHours: z
    .number({ message: "Credit hours must be a number" })
    .positive("Credit hours must be positive")
    .max(10, "Credit hours cannot exceed 10"),
  totalMarks: z
    .number()
    .refine(
      (val): val is TotalMarksType => VALID_TOTAL_MARKS.includes(val as TotalMarksType),
      "Total marks must be 20, 40, 60, 80, or 100"
    ),
  obtainedMarks: z
    .number({ message: "Obtained marks must be a number" })
    .min(0, "Obtained marks cannot be negative"),
}).superRefine((data, ctx) => {
  if (data.obtainedMarks > data.totalMarks) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Obtained marks cannot exceed total marks",
      path: ["obtainedMarks"],
    });
  }
});

// Course input schema for public calculator (name optional)
export const publicCourseSchema = z.object({
  isAudit: z.boolean().optional().default(false),
  creditHours: z
    .number({ message: "Credit hours must be a number" })
    .positive("Credit hours must be positive")
    .max(10, "Credit hours cannot exceed 10"),
  totalMarks: z
    .number()
    .refine(
      (val): val is TotalMarksType => VALID_TOTAL_MARKS.includes(val as TotalMarksType),
      "Total marks must be 20, 40, 60, 80, or 100"
    ),
  obtainedMarks: z
    .number({ message: "Obtained marks must be a number" })
    .min(0, "Obtained marks cannot be negative"),
}).superRefine((data, ctx) => {
  if (data.obtainedMarks > data.totalMarks) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Obtained marks cannot exceed total marks",
      path: ["obtainedMarks"],
    });
  }
});

// Semester schema
export const semesterSchema = z.object({
  name: z
    .string()
    .min(1, "Semester name is required")
    .max(50, "Semester name too long"),
});

// User registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

// User login schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

// Infer types from schemas
export type CourseFormData = z.infer<typeof courseSchema>;
export type PublicCourseFormData = z.infer<typeof publicCourseSchema>;
export type SemesterFormData = z.infer<typeof semesterSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Validation helper functions
export function validateCourse(data: unknown) {
  return courseSchema.safeParse(data);
}

export function validatePublicCourse(data: unknown) {
  return publicCourseSchema.safeParse(data);
}

export function validateSemester(data: unknown) {
  return semesterSchema.safeParse(data);
}

export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data);
}

export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

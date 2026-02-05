"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, Calculator, TrendingUp, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { calculateGPA, type GPAResult } from "@/lib/gpa-calculator";
import { type TotalMarksType, VALID_TOTAL_MARKS, isValidTotalMarks } from "@/lib/quality-points";

type CalculatorCourse = {
  id: string;
  creditHours: string;
  totalMarks: TotalMarksType;
  obtainedMarks: string;
};

type CGPASemester = {
  id: string;
  name: string;
  creditHours: string;
  gpa: string;
};

const creditToTotalMarks = (credit: string | number): TotalMarksType | null => {
  const num = typeof credit === "number" ? credit : parseFloat(credit);
  if (!Number.isFinite(num)) return null;
  const rounded = Math.round(num);
  if (rounded < 1 || rounded > 5) return null;
  const mapped = rounded * 20;
  return isValidTotalMarks(mapped) ? (mapped as TotalMarksType) : null;
};

const totalToCreditHours = (total: TotalMarksType): string | null => {
  const credit = total / 20;
  return credit >= 1 && credit <= 5 ? String(credit) : null;
};

const emptyResult: GPAResult = {
  gpa: 0,
  totalQualityPoints: 0,
  totalCreditHours: 0,
  courses: [],
};

export default function DashboardCalculatorPage() {
  const [courses, setCourses] = useState<CalculatorCourse[]>([
    { id: uuidv4(), creditHours: "3", totalMarks: 60, obtainedMarks: "" },
  ]);
  const [result, setResult] = useState<GPAResult>(emptyResult);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [semesters, setSemesters] = useState<CGPASemester[]>([
    { id: uuidv4(), name: "Semester 1", creditHours: "", gpa: "" },
  ]);
  const [cgpa, setCgpa] = useState(0);
  const [cgpaErrors, setCgpaErrors] = useState<Record<string, string>>({});

  const calculateResult = useCallback(() => {
    const newErrors: Record<string, string> = {};

    const validCourses = courses.filter((course) => {
      const creditHours = parseFloat(course.creditHours);
      const obtainedMarks = parseFloat(course.obtainedMarks);

      if (!course.creditHours || !course.obtainedMarks) {
        return false;
      }

      if (isNaN(creditHours) || creditHours < 1 || creditHours > 5) {
        newErrors[`${course.id}-creditHours`] = "Credit hours must be between 1 and 5";
        return false;
      }

      if (isNaN(obtainedMarks) || obtainedMarks < 0) {
        newErrors[`${course.id}-obtainedMarks`] = "Marks must be 0 or greater";
        return false;
      }

      if (obtainedMarks > course.totalMarks) {
        newErrors[`${course.id}-obtainedMarks`] = `Cannot exceed ${course.totalMarks}`;
        return false;
      }

      return true;
    });

    setErrors(newErrors);

    if (validCourses.length === 0) {
      setResult(emptyResult);
      return;
    }

    const courseInputs = validCourses.map((course) => ({
      creditHours: parseFloat(course.creditHours),
      totalMarks: course.totalMarks,
      obtainedMarks: parseFloat(course.obtainedMarks),
    }));

    const gpaResult = calculateGPA(courseInputs);
    setResult(gpaResult);
  }, [courses]);

  useEffect(() => {
    calculateResult();
  }, [calculateResult]);

  const calculateCgpa = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const valid = semesters.filter((s) => {
      const ch = parseFloat(s.creditHours);
      const g = parseFloat(s.gpa);

      if (!s.creditHours || !s.gpa) return false;
      if (isNaN(ch) || ch <= 0) {
        newErrors[`${s.id}-ch`] = "Credit hours must be positive";
        return false;
      }
      if (isNaN(g) || g < 0 || g > 4) {
        newErrors[`${s.id}-gpa`] = "GPA must be between 0 and 4";
        return false;
      }
      return true;
    });

    setCgpaErrors(newErrors);

    if (valid.length === 0) {
      setCgpa(0);
      return;
    }

    const totalQualityPoints = valid.reduce(
      (sum, s) => sum + parseFloat(s.gpa) * parseFloat(s.creditHours),
      0
    );
    const totalCreditHours = valid.reduce(
      (sum, s) => sum + parseFloat(s.creditHours),
      0
    );

    setCgpa(
      totalCreditHours > 0
        ? Math.round((totalQualityPoints / totalCreditHours) * 100) / 100
        : 0
    );
  }, [semesters]);

  useEffect(() => {
    calculateCgpa();
  }, [calculateCgpa]);

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: uuidv4(), creditHours: "3", totalMarks: 60, obtainedMarks: "" },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  const updateCourse = (
    id: string,
    field: keyof CalculatorCourse,
    value: string | TotalMarksType
  ) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const updateCourseWithSync = (
    id: string,
    field: keyof CalculatorCourse,
    value: string | TotalMarksType
  ) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== id) return course;

        const updated: CalculatorCourse = { ...course, [field]: value } as CalculatorCourse;

        if (field === "creditHours") {
          const mappedTotal = creditToTotalMarks(value as string);
          if (mappedTotal) {
            updated.creditHours = String(mappedTotal / 20);
            updated.totalMarks = mappedTotal;
            if (
              updated.obtainedMarks &&
              parseFloat(updated.obtainedMarks) > mappedTotal
            ) {
              updated.obtainedMarks = "";
            }
          }
        }

        if (field === "totalMarks") {
          const total = value as TotalMarksType;
          const mappedCredit = totalToCreditHours(total);
          if (mappedCredit) {
            updated.creditHours = mappedCredit;
          }
          if (
            updated.obtainedMarks &&
            parseFloat(updated.obtainedMarks) > total
          ) {
            updated.obtainedMarks = "";
          }
        }

        return updated;
      })
    );
  };

  const addSemester = () => {
    const nextNumber = semesters.length + 1;
    setSemesters([
      ...semesters,
      { id: uuidv4(), name: `Semester ${nextNumber}`, creditHours: "", gpa: "" },
    ]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length === 1) return;
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  const updateSemester = (
    id: string,
    field: keyof CGPASemester,
    value: string
  ) => {
    setSemesters((prev) =>
      prev.map((sem) => (sem.id === id ? { ...sem, [field]: value } : sem))
    );
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-500/10 text-emerald-500";
      case "B":
        return "bg-blue-500/10 text-blue-500";
      case "C":
        return "bg-amber-500/10 text-amber-500";
      case "D":
        return "bg-orange-500/10 text-orange-500";
      case "P":
        return "bg-teal-500/10 text-teal-600";
      default:
        return "bg-red-500/10 text-red-500";
    }
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium mb-3">
            <Calculator className="h-4 w-4" />
            Dashboard Quick Calculator
          </div>
          <h1 className="text-3xl font-bold text-foreground">GPA &amp; CGPA Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate without leaving your dashboard. Results are not saved automatically.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* Course Input Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Enter Your Courses
                </CardTitle>
                <CardDescription>
                  Add courses and enter marks to calculate your GPA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-12 gap-3 items-start p-4 bg-background rounded-lg border border-border/60"
                  >
                    <div className="col-span-12 sm:col-span-1 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Credit Hours
                      </label>
                      <Input
                        type="number"
                        placeholder="3"
                        value={course.creditHours}
                        onChange={(e) =>
                          updateCourseWithSync(
                            course.id,
                            "creditHours",
                            e.target.value
                          )
                        }
                        className={errors[`${course.id}-creditHours`] ? "border-red-500" : ""}
                        min="1"
                        max="5"
                        step="1"
                      />
                      {errors[`${course.id}-creditHours`] && (
                        <span className="text-xs text-red-500">
                          {errors[`${course.id}-creditHours`]}
                        </span>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Total Marks
                      </label>
                      <Select
                        value={String(course.totalMarks)}
                        onValueChange={(value) =>
                          updateCourseWithSync(
                            course.id,
                            "totalMarks",
                            parseInt(value) as TotalMarksType
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VALID_TOTAL_MARKS.map((marks) => (
                            <SelectItem key={marks} value={String(marks)}>
                              {marks}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-10 sm:col-span-4">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Obtained Marks
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={course.obtainedMarks}
                        onChange={(e) =>
                          updateCourse(course.id, "obtainedMarks", e.target.value)
                        }
                        className={errors[`${course.id}-obtainedMarks`] ? "border-red-500" : ""}
                        min="0"
                        max={course.totalMarks}
                      />
                      {errors[`${course.id}-obtainedMarks`] && (
                        <span className="text-xs text-red-500">
                          {errors[`${course.id}-obtainedMarks`]}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(course.id)}
                        disabled={courses.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addCourse} className="w-full font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </CardContent>
            </Card>

            {/* CGPA Section */}
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  CGPA Calculator
                </CardTitle>
                <CardDescription>
                  CGPA = (Sum of quality points from all semesters) / (Sum of credit hours from all semesters)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {semesters.map((sem, index) => (
                  <div
                    key={sem.id}
                    className="grid grid-cols-12 gap-3 items-start p-4 bg-background rounded-lg border border-border/60"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Semester
                      </label>
                      <Input
                        value={sem.name}
                        onChange={(e) =>
                          updateSemester(sem.id, "name", e.target.value)
                        }
                        placeholder={`Semester ${index + 1}`}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Credit Hours
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={sem.creditHours}
                        onChange={(e) =>
                          updateSemester(sem.id, "creditHours", e.target.value)
                        }
                        className={cgpaErrors[`${sem.id}-ch`] ? "border-red-500" : ""}
                        placeholder="15"
                      />
                      {cgpaErrors[`${sem.id}-ch`] && (
                        <span className="text-xs text-red-500">
                          {cgpaErrors[`${sem.id}-ch`]}
                        </span>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        GPA
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="4"
                        step="0.01"
                        value={sem.gpa}
                        onChange={(e) =>
                          updateSemester(sem.id, "gpa", e.target.value)
                        }
                        className={cgpaErrors[`${sem.id}-gpa`] ? "border-red-500" : ""}
                        placeholder="3.5"
                      />
                      {cgpaErrors[`${sem.id}-gpa`] && (
                        <span className="text-xs text-red-500">
                          {cgpaErrors[`${sem.id}-gpa`]}
                        </span>
                      )}
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex items-end justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSemester(sem.id)}
                        disabled={semesters.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addSemester} className="w-full font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Semester
                </Button>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-sm font-semibold text-primary">Your CGPA</div>
                  <div className="text-4xl font-bold text-primary mt-1">
                    {cgpa.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    CGPA uses the formula: Σ(total quality points) / Σ(total credit hours)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 shadow-soft border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calculator className="h-5 w-5 text-primary" />
                  Your GPA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {result.gpa.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    out of 4.00
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{result.totalCreditHours}</div>
                    <div className="text-xs text-muted-foreground">Credit Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{result.totalQualityPoints.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Quality Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.courses.length > 0 && (
              <Card className="shadow-soft border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.courses.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            #{index + 1}
                          </span>
                          <Badge variant="outline" className={getGradeColor(course.grade)}>
                            {course.grade}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            QP: {course.qualityPoint.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {course.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Alert variant="default" className="border-primary/30 bg-primary/5">
              <AlertDescription>
                Calculations here are for quick checks. To save results, add courses to your semesters in the dashboard.
              </AlertDescription>
            </Alert>
          </div>
        </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  SkipForward,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type TotalMarksType, VALID_TOTAL_MARKS } from "@/lib/quality-points";
import {
  completeOnboarding,
  skipOnboarding,
  type OnboardingSemester,
  type OnboardingCourse,
} from "@/app/actions/onboarding-actions";

const MAX_SEMESTERS = 8;

function createEmptyCourse(): OnboardingCourse {
  return {
    name: "",
    creditHours: 3,
    totalMarks: 100,
    obtainedMarks: 0,
    isAudit: false,
  };
}

function createEmptySemester(index: number): OnboardingSemester {
  return {
    name: `Semester ${index + 1}`,
    courses: [createEmptyCourse()],
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: welcome, 1: add semesters, 2: review
  const [semesters, setSemesters] = useState<OnboardingSemester[]>([
    createEmptySemester(0),
  ]);
  const [activeSemesterIndex, setActiveSemesterIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Semester handlers ---
  function addSemester() {
    if (semesters.length >= MAX_SEMESTERS) return;
    const newSemesters = [
      ...semesters,
      createEmptySemester(semesters.length),
    ];
    setSemesters(newSemesters);
    setActiveSemesterIndex(newSemesters.length - 1);
  }

  function removeSemester(index: number) {
    if (semesters.length <= 1) return;
    const newSemesters = semesters.filter((_, i) => i !== index);
    setSemesters(newSemesters);
    if (activeSemesterIndex >= newSemesters.length) {
      setActiveSemesterIndex(newSemesters.length - 1);
    } else if (activeSemesterIndex > index) {
      setActiveSemesterIndex(activeSemesterIndex - 1);
    }
  }

  function updateSemesterName(index: number, name: string) {
    const newSemesters = [...semesters];
    newSemesters[index] = { ...newSemesters[index], name };
    setSemesters(newSemesters);
  }

  // --- Course handlers ---
  function addCourse(semesterIndex: number) {
    const newSemesters = [...semesters];
    newSemesters[semesterIndex] = {
      ...newSemesters[semesterIndex],
      courses: [...newSemesters[semesterIndex].courses, createEmptyCourse()],
    };
    setSemesters(newSemesters);
  }

  function removeCourse(semesterIndex: number, courseIndex: number) {
    const semester = semesters[semesterIndex];
    if (semester.courses.length <= 1) return;
    const newSemesters = [...semesters];
    newSemesters[semesterIndex] = {
      ...newSemesters[semesterIndex],
      courses: semester.courses.filter((_, i) => i !== courseIndex),
    };
    setSemesters(newSemesters);
  }

  function updateCourse(
    semesterIndex: number,
    courseIndex: number,
    field: keyof OnboardingCourse,
    value: string | number | boolean
  ) {
    const newSemesters = [...semesters];
    const courses = [...newSemesters[semesterIndex].courses];
    courses[courseIndex] = { ...courses[courseIndex], [field]: value };
    newSemesters[semesterIndex] = { ...newSemesters[semesterIndex], courses };
    setSemesters(newSemesters);
  }

  // --- Validation ---
  function validateCurrentStep(): string | null {
    for (let i = 0; i < semesters.length; i++) {
      const sem = semesters[i];
      if (!sem.name.trim()) return `Semester ${i + 1}: Name is required`;
      if (sem.courses.length === 0)
        return `Semester "${sem.name}": Add at least one course`;
      for (let j = 0; j < sem.courses.length; j++) {
        const c = sem.courses[j];
        if (!c.name.trim())
          return `Semester "${sem.name}", Course ${j + 1}: Name is required`;
        if (c.creditHours <= 0)
          return `Semester "${sem.name}", "${c.name}": Credit hours must be positive`;
        if (c.obtainedMarks < 0)
          return `Semester "${sem.name}", "${c.name}": Obtained marks cannot be negative`;
        if (c.obtainedMarks > c.totalMarks)
          return `Semester "${sem.name}", "${c.name}": Obtained marks cannot exceed ${c.totalMarks}`;
      }
    }
    return null;
  }

  // --- Navigation ---
  function handleNext() {
    setError(null);
    if (step === 1) {
      const validationError = validateCurrentStep();
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 2));
  }

  function handleBack() {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  // --- Submit ---
  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    const result = await completeOnboarding(semesters);
    if (!result.success) {
      setError(result.error || "Failed to complete onboarding");
      setIsSubmitting(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSkip() {
    setIsSkipping(true);
    setError(null);
    const result = await skipOnboarding();
    if (!result.success) {
      setError(result.error || "Failed to skip onboarding");
      setIsSkipping(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const totalCourses = semesters.reduce(
    (sum, s) => sum + s.courses.length,
    0
  );
  const isLoading = isSubmitting || isSkipping;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Welcome", "Add Semesters", "Review"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground shadow-md"
                    : i < step
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="w-4 text-center">{i + 1}</span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < 2 && (
                <div
                  className={`w-8 h-px ${
                    i < step ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ===== STEP 0: WELCOME ===== */}
        {step === 0 && (
          <div className="text-center max-w-lg mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-lg border border-primary/10">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Welcome to GPA Tracker
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Let&apos;s set up your academic record. You can add your
                semesters and courses to start tracking your GPA right away.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                {
                  icon: BookOpen,
                  title: "Add Semesters",
                  desc: "Create up to 8 semesters",
                },
                {
                  icon: Sparkles,
                  title: "Enter Courses",
                  desc: "Add course details & marks",
                },
                {
                  icon: CheckCircle2,
                  title: "Track GPA",
                  desc: "See your progress instantly",
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="border-border/50 shadow-sm"
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleNext}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 shadow-md rounded-xl font-semibold"
              >
                Get Started
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full sm:w-auto text-muted-foreground rounded-xl"
              >
                {isSkipping ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SkipForward className="h-4 w-4 mr-2" />
                )}
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 1: ADD SEMESTERS & COURSES ===== */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Add Your Semesters
              </h2>
              <p className="text-muted-foreground">
                Add up to {MAX_SEMESTERS} semesters with their courses. You can
                always edit these later.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Semester tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {semesters.map((sem, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSemesterIndex(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    i === activeSemesterIndex
                    ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {sem.name || `Semester ${i + 1}`}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({sem.courses.length})
                  </span>
                </button>
              ))}
              {semesters.length < MAX_SEMESTERS && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSemester}
                  className="rounded-lg border-dashed"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Semester
                </Button>
              )}
            </div>

            {/* Active semester editor */}
            {semesters[activeSemesterIndex] && (
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-5 space-y-5">
                  {/* Semester name */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label
                        htmlFor="semester-name"
                        className="text-sm font-semibold"
                      >
                        Semester Name
                      </Label>
                      <Input
                        id="semester-name"
                        placeholder="e.g., Fall 2024"
                        value={semesters[activeSemesterIndex].name}
                        onChange={(e) =>
                          updateSemesterName(
                            activeSemesterIndex,
                            e.target.value
                          )
                        }
                        className="mt-1.5"
                      />
                    </div>
                    {semesters.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSemester(activeSemesterIndex)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Courses list */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Courses</Label>
                      <span className="text-xs text-muted-foreground">
                        {semesters[activeSemesterIndex].courses.length} course
                        {semesters[activeSemesterIndex].courses.length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    {semesters[activeSemesterIndex].courses.map(
                      (course, courseIndex) => (
                        <div
                          key={courseIndex}
                          className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Course {courseIndex + 1}
                            </span>
                            {semesters[activeSemesterIndex].courses.length >
                              1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeCourse(
                                    activeSemesterIndex,
                                    courseIndex
                                  )
                                }
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>

                          {/* Course name */}
                          <div>
                            <Label className="text-xs">Course Name</Label>
                            <Input
                              placeholder="e.g., Introduction to CS"
                              value={course.name}
                              onChange={(e) =>
                                updateCourse(
                                  activeSemesterIndex,
                                  courseIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="mt-1 h-9 text-sm"
                            />
                          </div>

                          {/* Audit toggle */}
                          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2">
                            <div>
                              <p className="text-xs font-medium">
                                Audit / Pass Course
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                No GPA impact
                              </p>
                            </div>
                            <Switch
                              checked={course.isAudit}
                              onCheckedChange={(checked) =>
                                updateCourse(
                                  activeSemesterIndex,
                                  courseIndex,
                                  "isAudit",
                                  checked
                                )
                              }
                            />
                          </div>

                          {/* Credit hours, total marks, obtained marks */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Credit Hours</Label>
                              <Input
                                type="number"
                                placeholder="3"
                                min="0.5"
                                step="0.5"
                                max="10"
                                value={course.creditHours || ""}
                                onChange={(e) =>
                                  updateCourse(
                                    activeSemesterIndex,
                                    courseIndex,
                                    "creditHours",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="mt-1 h-9 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Total Marks</Label>
                              <Select
                                value={String(course.totalMarks)}
                                onValueChange={(value) =>
                                  updateCourse(
                                    activeSemesterIndex,
                                    courseIndex,
                                    "totalMarks",
                                    parseInt(value) as TotalMarksType
                                  )
                                }
                              >
                                <SelectTrigger className="mt-1 h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VALID_TOTAL_MARKS.map((marks) => (
                                    <SelectItem
                                      key={marks}
                                      value={String(marks)}
                                    >
                                      {marks}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Obtained Marks</Label>
                              <Input
                                type="number"
                                placeholder={`0-${course.totalMarks}`}
                                min="0"
                                max={course.totalMarks}
                                step="0.5"
                                value={course.obtainedMarks || ""}
                                onChange={(e) =>
                                  updateCourse(
                                    activeSemesterIndex,
                                    courseIndex,
                                    "obtainedMarks",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="mt-1 h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCourse(activeSemesterIndex)}
                      className="w-full border-dashed rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-muted-foreground rounded-xl"
                >
                  {isSkipping ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SkipForward className="h-4 w-4 mr-2" />
                  )}
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary to-primary/90 rounded-xl font-semibold"
                >
                  Review
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: REVIEW ===== */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Review Your Setup
              </h2>
              <p className="text-muted-foreground">
                Confirm your semesters and courses before proceeding.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {semesters.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Semester{semesters.length !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {totalCourses}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Course{totalCourses !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Semester breakdown */}
            <div className="space-y-3">
              {semesters.map((sem, i) => (
                <Card key={i} className="border-border/50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{sem.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {sem.courses.length} course
                          {sem.courses.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-3">
                      <div className="grid gap-2">
                        {sem.courses.map((course, j) => (
                          <div
                            key={j}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{course.name}</span>
                              {course.isAudit && (
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                                  Audit
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground shrink-0 ml-2">
                              {course.obtainedMarks}/{course.totalMarks} | {course.creditHours} CH
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 rounded-xl font-semibold shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

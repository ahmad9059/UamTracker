export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ArrowLeft, BookOpen, Award, Clock, TrendingUp, Percent } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getSemesterWithCourses } from "@/app/actions/semester-actions";
import { AddCourseDialog } from "@/components/dashboard/add-course-dialog";
import { EditCourseDialog } from "@/components/dashboard/edit-course-dialog";
import { DeleteCourseButton } from "@/components/dashboard/delete-course-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SemesterPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getSemesterWithCourses(id);

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Semester not found.</p>
        <p className="text-sm text-destructive mt-2">{result.error}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const semester = result.data;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-gradient-to-br from-chart-2/20 to-chart-2/10 text-chart-2 border border-chart-2/20";
      case "B":
        return "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20";
      case "C":
        return "bg-gradient-to-br from-chart-4/20 to-chart-4/10 text-chart-4 border border-chart-4/20";
      case "D":
        return "bg-gradient-to-br from-chart-5/20 to-chart-5/10 text-chart-5 border border-chart-5/20";
      case "P":
        return "bg-gradient-to-br from-emerald-400/20 to-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30";
      default:
        return "bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive border border-destructive/20";
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return "bg-gradient-to-br from-chart-2/20 to-chart-2/10 text-chart-2 border border-chart-2/20";
    if (gpa >= 3.0) return "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20";
    if (gpa >= 2.5) return "bg-gradient-to-br from-chart-4/20 to-chart-4/10 text-chart-4 border border-chart-4/20";
    if (gpa >= 2.0) return "bg-gradient-to-br from-chart-5/20 to-chart-5/10 text-chart-5 border border-chart-5/20";
    return "bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive border border-destructive/20";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" asChild className="mb-4 -ml-4 hover:bg-accent/50">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{semester.name}</h1>
          <p className="text-base text-muted-foreground mt-1.5">
            Manage your courses and track your performance
          </p>
        </div>
        <AddCourseDialog semesterId={id} />
      </div>

      {/* Semester Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card-elevated rounded-2xl p-6 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Semester GPA</span>
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${semester.gpa >= 3.5 ? 'text-chart-2' : semester.gpa >= 3.0 ? 'text-primary' : semester.gpa >= 2.5 ? 'text-chart-4' : 'text-chart-5'}`}>
                {semester.gpa.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">/ 4.00</span>
            </div>
            <div className="mt-3 h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                style={{ width: `${(semester.gpa / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Credit Hours</span>
              <div className="w-10 h-10 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-chart-3" />
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">{semester.totalCreditHours}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Total hours enrolled</p>
          </div>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Quality Points</span>
              <div className="w-10 h-10 bg-gradient-to-br from-chart-1/20 to-chart-1/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">{semester.totalQualityPoints.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">GPA × Credit hours</p>
          </div>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Total Courses</span>
              <div className="w-10 h-10 bg-gradient-to-br from-chart-4/20 to-chart-4/10 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-chart-4" />
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground">{semester.courses.length}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Enrolled this semester</p>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="glass-card-elevated rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Course Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                All courses in this semester with their grades and quality points
              </p>
            </div>
            {semester.courses.length > 0 && (
              <AddCourseDialog semesterId={id} />
            )}
          </div>
        </div>

        <div className="p-6">
          {semester.courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Courses Yet</h3>
              <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                Add your first course to start tracking your GPA for this semester.
              </p>
              <AddCourseDialog semesterId={id} />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="font-bold text-foreground">Course Name</TableHead>
                      <TableHead className="text-center font-bold text-foreground">Credit Hours</TableHead>
                      <TableHead className="text-center font-bold text-foreground">Total Marks</TableHead>
                      <TableHead className="text-center font-bold text-foreground">Obtained</TableHead>
                      <TableHead className="text-center font-bold text-foreground">Percentage</TableHead>
                      <TableHead className="text-center font-bold text-foreground">Grade</TableHead>
                      <TableHead className="text-center font-bold text-foreground">Quality Points</TableHead>
                      <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semester.courses.map((course) => (
                      <TableRow 
                        key={course.id} 
                        className="hover:bg-primary/5 transition-colors border-border"
                      >
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex flex-col">
                            <span>{course.name}</span>
                            {course.isAudit && (
                              <span className="text-xs text-muted-foreground mt-0.5">Audit / Pass (no GPA impact)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center px-3 py-1.5 bg-muted/50 rounded-lg text-sm font-medium">
                            {course.creditHours}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{course.totalMarks}</TableCell>
                        <TableCell className="text-center font-medium">{course.obtainedMarks}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
                            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                            {course.percentage.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getGradeColor(course.grade)} font-bold text-sm px-3 py-1.5`}>
                            {course.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-foreground text-base">
                            {course.qualityPoint.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditCourseDialog
                              courseId={course.id}
                              semesterId={id}
                              initialData={{
                                name: course.name || "",
                                creditHours: course.creditHours,
                                totalMarks: course.totalMarks,
                                obtainedMarks: course.obtainedMarks,
                              }}
                            />
                            <DeleteCourseButton courseId={course.id} courseName={course.name || ""} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

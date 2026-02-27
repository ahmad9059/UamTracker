export const dynamic = 'force-dynamic';

import Link from "next/link";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getAllSemesters } from "@/app/actions/semester-actions";
import { CreateSemesterDialog } from "@/components/dashboard/create-semester-dialog";
import { DeleteSemesterButton } from "@/components/dashboard/delete-semester-button";
import { GPAChart } from "@/components/dashboard/gpa-chart";
import { StatCards } from "@/components/dashboard/stat-cards";

export default async function DashboardPage() {
  const result = await getAllSemesters();

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
        <p className="text-sm text-destructive mt-2">{result.error}</p>
      </div>
    );
  }

  const { semesters, cgpa, totalCreditHours, totalQualityPoints } = result.data;

  // Strip non-serializable fields (Dates) before passing to client components.
  const clientSemesters = semesters.map((s) => ({
    ...s,
    createdAt: s.createdAt?.toISOString?.() ?? null,
    updatedAt: s.updatedAt?.toISOString?.() ?? null,
  }));

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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1.5">
            Welcome back! Track your academic progress.
          </p>
        </div>
        <CreateSemesterDialog />
      </div>

      {/* Stat Cards */}
      <StatCards
        cgpa={cgpa}
        totalCreditHours={totalCreditHours}
        totalQualityPoints={totalQualityPoints}
        semesterCount={clientSemesters.length}
      />

      {/* Charts Section */}
      {clientSemesters.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5">Analytics Overview</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <GPAChart semesters={clientSemesters} type="bar" />
            <GPAChart semesters={clientSemesters} type="line" />
          </div>
        </div>
      )}

      {/* Semesters List */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">Your Semesters</h2>
          {clientSemesters.length > 0 && (
            <Link href="#" className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {clientSemesters.length === 0 ? (
          <div className="glass-card-elevated rounded-2xl border-2 border-dashed border-primary/20 p-16 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-5">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Semesters Yet</h3>
              <p className="text-base text-muted-foreground mb-8 max-w-md">
                Start tracking your academic progress by creating your first semester.
              </p>
              <CreateSemesterDialog />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clientSemesters.map((semester, index) => (
              <div
                key={semester.id}
                className="glass-card-elevated rounded-2xl group hover:shadow-soft transition-all duration-200 relative overflow-hidden"
              >
                <div className="p-6 relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-base border border-primary/10">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base">{semester.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {semester.courseCount || semester.courses.length} courses
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getGPAColor(semester.gpa)}`}>
                      {semester.gpa.toFixed(2)}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Credit Hours</p>
                      <p className="text-base font-bold text-foreground">{semester.totalCreditHours}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Quality Points</p>
                      <p className="text-base font-bold text-foreground">{semester.totalQualityPoints.toFixed(1)}</p>
                    </div>
                  </div>

                  {/* GPA Progress Bar */}
                  <div className="mt-4 mb-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground font-medium">GPA Progress</span>
                      <span className="font-bold gradient-text">
                        {Math.min((semester.gpa / 4) * 100, 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((semester.gpa / 4) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-10 font-semibold rounded-xl hover:bg-primary/5 border-border/60 transition-all duration-300"
                    >
                      <Link href={`/dashboard/semester/${semester.id}`}>
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                    <DeleteSemesterButton semesterId={semester.id} semesterName={semester.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

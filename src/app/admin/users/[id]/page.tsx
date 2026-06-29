export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BookOpen, Clock, Mail, UserRound } from "lucide-react";

import { AdminGradeDistributionChart } from "@/components/admin/admin-charts";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AcademicStatusBadge, BooleanBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUserProfile } from "@/lib/admin-data";
import { getQualityPoint, type TotalMarksType } from "@/lib/quality-points";

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function isTotalMarksType(totalMarks: number): totalMarks is TotalMarksType {
  return [20, 40, 60, 80, 100].includes(totalMarks);
}

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const profile = await getAdminUserProfile(id);

  if (!profile) notFound();

  const { summary } = profile;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-4 -ml-4 rounded-xl hover:bg-accent/50">
            <Link href="/admin/users">
              <ArrowLeft className="size-4" />
              Back to users
            </Link>
          </Button>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/10 text-primary">
            <UserRound className="mr-1 size-3" />
            Student record
          </Badge>
          <h1 className="text-3xl font-bold text-foreground">{summary.name || "Unnamed student"}</h1>
          <p className="mt-2 text-muted-foreground">{summary.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AcademicStatusBadge status={summary.status} />
            <BooleanBadge value={summary.emailVerified} trueLabel="Email verified" falseLabel="Email unverified" />
            <BooleanBadge value={summary.onboardingCompleted} trueLabel="Onboarding complete" falseLabel="Onboarding pending" />
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-semibold">
          <a href={`mailto:${summary.email}`}>
            <Mail className="size-4" />
            Contact student
          </a>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon={Award}
          label="CGPA"
          value={summary.cgpa.toFixed(2)}
          detail={`${summary.totalQualityPoints.toFixed(1)} quality points earned`}
          accent="emerald"
          progress={(Math.min(summary.cgpa, 4) / 4) * 100}
        />
        <AdminMetricCard
          icon={Clock}
          label="Credit hours"
          value={summary.totalCreditHours.toFixed(0)}
          detail={`${summary.completionPercent.toFixed(0)}% of a 130-credit path`}
          progress={summary.completionPercent}
        />
        <AdminMetricCard
          icon={BookOpen}
          label="Courses"
          value={summary.courseCount}
          detail={`${summary.auditCourseCount} audit/pass courses`}
          accent="blue"
        />
        <AdminMetricCard
          icon={UserRound}
          label="Sessions"
          value={summary.activeSessionCount}
          detail={`Joined ${formatDate(summary.createdAt)}`}
          accent="indigo"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminGradeDistributionChart data={profile.gradeDistribution} />
        <div className="glass-card-elevated rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground">Account Snapshot</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Auth providers</p>
              <p className="mt-2 font-semibold text-foreground">{summary.authProviders.join(", ") || "Email/password"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Last activity</p>
              <p className="mt-2 font-semibold text-foreground">{formatDate(summary.lastActivityAt)}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Semesters</p>
              <p className="mt-2 font-semibold text-foreground">{summary.semesterCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Profile updated</p>
              <p className="mt-2 font-semibold text-foreground">{formatDate(summary.updatedAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {profile.semesters.length === 0 ? (
          <div className="glass-card-elevated rounded-2xl border-2 border-dashed border-primary/20 p-12 text-center">
            <BookOpen className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-xl font-bold text-foreground">No academic records yet</h2>
            <p className="mt-2 text-muted-foreground">This user has not created a semester or course.</p>
          </div>
        ) : (
          profile.semesters.map(({ raw, academic }) => (
            <div key={raw.id} className="glass-card-elevated rounded-2xl p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{raw.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {formatDate(raw.updatedAt)} · {raw.courses.length} courses
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                  GPA {academic?.gpa.toFixed(2) ?? "0.00"}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-right">Credit Hours</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-right">Grade</TableHead>
                      <TableHead className="text-right">Quality Point</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {raw.courses.map((course) => {
                      const totalMarks = isTotalMarksType(course.totalMarks) ? course.totalMarks : 100;
                      const quality = getQualityPoint(course.obtainedMarks, totalMarks);
                      const grade = course.isAudit ? "P" : quality.grade;

                      return (
                        <TableRow key={course.id}>
                          <TableCell>
                            <p className="font-semibold text-foreground">{course.name}</p>
                            {course.isAudit ? <p className="text-xs text-muted-foreground">Audit/pass course</p> : null}
                          </TableCell>
                          <TableCell className="text-right">{course.creditHours}</TableCell>
                          <TableCell className="text-right">{course.obtainedMarks}/{course.totalMarks}</TableCell>
                          <TableCell className="text-right">{quality.percentage.toFixed(1)}%</TableCell>
                          <TableCell className="text-right font-bold">{grade}</TableCell>
                          <TableCell className="text-right font-bold">{course.isAudit ? "0.00" : quality.qualityPoint.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

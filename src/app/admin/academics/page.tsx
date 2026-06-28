export const dynamic = "force-dynamic";

import Link from "next/link";
import { Award, BookOpenCheck, Clock, GraduationCap, LibraryBig, TriangleAlert } from "lucide-react";

import { AdminGradeDistributionChart } from "@/components/admin/admin-charts";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AcademicStatusBadge } from "@/components/admin/admin-status-badge";
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
import { getAdminDashboardData } from "@/lib/admin-data";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AdminAcademicsPage() {
  const data = await getAdminDashboardData();
  const topStudents = data.users
    .filter((user) => user.courseCount > 0)
    .sort((a, b) => b.cgpa - a.cgpa)
    .slice(0, 6);
  const needsAttention = data.users
    .filter((user) => user.status === "at-risk")
    .sort((a, b) => a.cgpa - b.cgpa)
    .slice(0, 6);
  const recentSemesters = data.semesters.slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/10 text-primary">
            <BookOpenCheck className="mr-1 size-3" />
            Academic operations
          </Badge>
          <h1 className="text-3xl font-bold text-foreground">Academic Health</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Review GPA performance, course volume, audit/pass usage, and students who may need help.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl font-semibold">
          <Link href="/admin/users?status=at-risk">Open attention list</Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon={Award}
          label="Platform CGPA"
          value={data.metrics.platformCgpa.toFixed(2)}
          detail={`${data.metrics.totalQualityPoints.toFixed(1)} total quality points`}
          accent="emerald"
          progress={(Math.min(data.metrics.platformCgpa, 4) / 4) * 100}
        />
        <AdminMetricCard
          icon={Clock}
          label="Credit hours"
          value={data.metrics.totalCreditHours.toFixed(0)}
          detail="Total GPA-bearing credits tracked"
          progress={Math.min((data.metrics.totalCreditHours / Math.max(data.metrics.totalUsers * 130, 1)) * 100, 100)}
        />
        <AdminMetricCard
          icon={LibraryBig}
          label="Semesters"
          value={data.metrics.totalSemesters}
          detail="Student-created academic periods"
          accent="blue"
        />
        <AdminMetricCard
          icon={TriangleAlert}
          label="Needs attention"
          value={data.metrics.atRiskUsers}
          detail="Students below a 2.50 CGPA"
          accent="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminGradeDistributionChart data={data.gradeDistribution} />
        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Top Students</h2>
              <p className="mt-1 text-sm text-muted-foreground">Highest CGPA among users with course records.</p>
            </div>
            <GraduationCap className="size-5 text-primary" />
          </div>
          <div className="space-y-3">
            {topStudents.map((user, index) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/50 p-4 transition-colors hover:bg-primary/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.courseCount} courses · {user.totalCreditHours.toFixed(0)} credits</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground">{user.cgpa.toFixed(2)}</span>
              </Link>
            ))}
            {topStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No student GPA records yet.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Students Below Threshold</h2>
              <p className="mt-1 text-sm text-muted-foreground">CGPA below 2.50 based on entered courses.</p>
            </div>
            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {needsAttention.length} visible
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">CGPA</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsAttention.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/admin/users/${user.id}`} className="font-semibold text-foreground hover:text-primary">
                        {user.name || user.email}
                      </Link>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell><AcademicStatusBadge status={user.status} /></TableCell>
                    <TableCell className="text-right font-bold">{user.cgpa.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{user.totalCreditHours.toFixed(0)}</TableCell>
                  </TableRow>
                ))}
                {needsAttention.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No students are currently below the threshold.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground">Recent Courses</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest course records added or edited by students.</p>
          </div>
          <div className="space-y-3">
            {data.recentCourses.slice(0, 7).map((course) => (
              <Link
                key={course.id}
                href={`/admin/users/${course.userId}`}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/50 p-4 transition-colors hover:bg-primary/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{course.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.userName || course.userEmail} · {course.semesterName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{course.grade}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(course.updatedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card-elevated rounded-2xl p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">Recent Semesters</h2>
          <p className="mt-1 text-sm text-muted-foreground">Semester-level GPA snapshots across the platform.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">GPA</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSemesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell className="font-semibold text-foreground">{semester.name}</TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${semester.userId}`} className="hover:text-primary">
                      {semester.userName || semester.userEmail}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-bold">{semester.gpa.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{semester.courseCount}</TableCell>
                  <TableCell className="text-right">{semester.totalCreditHours.toFixed(0)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatDate(semester.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

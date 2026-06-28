export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpenCheck,
  GraduationCap,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";

import { AdminGradeDistributionChart, AdminUserGrowthChart } from "@/components/admin/admin-charts";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AcademicStatusBadge, BooleanBadge } from "@/components/admin/admin-status-badge";
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
import { getAdminDashboardData } from "@/lib/admin-data";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminOverviewPage() {
  const data = await getAdminDashboardData();
  const onboardingRate = data.metrics.totalUsers
    ? (data.metrics.onboardedUsers / data.metrics.totalUsers) * 100
    : 0;
  const verifiedRate = data.metrics.totalUsers
    ? (data.metrics.verifiedUsers / data.metrics.totalUsers) * 100
    : 0;
  const attentionUsers = data.users
    .filter((user) => user.status === "at-risk" || user.status === "not-started")
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="glass-card-elevated relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="mr-1 size-3" />
              Admin control room
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Platform oversight for academic progress.
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Monitor users, GPA health, semester data, and active sessions from the same academic design system students already use.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl font-semibold">
              <Link href="/admin/users">
                Review users
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-semibold">
              <Link href="/admin/academics">Academic health</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon={Users}
          label="Total users"
          value={data.metrics.totalUsers}
          detail={`${data.metrics.newUsersLast7Days} joined in the last 7 days`}
          progress={onboardingRate}
        />
        <AdminMetricCard
          icon={Award}
          label="Platform CGPA"
          value={data.metrics.platformCgpa.toFixed(2)}
          detail={`${data.metrics.totalCreditHours.toFixed(0)} GPA-bearing credit hours`}
          accent="emerald"
          progress={(Math.min(data.metrics.platformCgpa, 4) / 4) * 100}
        />
        <AdminMetricCard
          icon={BookOpenCheck}
          label="Courses tracked"
          value={data.metrics.totalCourses}
          detail={`${data.metrics.auditCourses} audit/pass courses excluded from CGPA`}
          accent="blue"
        />
        <AdminMetricCard
          icon={Activity}
          label="Active sessions"
          value={data.metrics.activeSessions}
          detail={`${verifiedRate.toFixed(0)}% of users have verified email`}
          accent="indigo"
          progress={verifiedRate}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminUserGrowthChart data={data.userGrowth} />
        <AdminGradeDistributionChart data={data.gradeDistribution} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Attention Queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">Students who need onboarding or academic review.</p>
            </div>
            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <TriangleAlert className="mr-1 size-3" />
              {data.metrics.atRiskUsers + data.metrics.notStartedUsers} flagged
            </Badge>
          </div>
          {attentionUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <GraduationCap className="mx-auto mb-3 size-8 text-primary" />
              <p className="font-semibold text-foreground">No urgent student records.</p>
              <p className="mt-1 text-sm text-muted-foreground">All tracked students are onboarded or academically on track.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">CGPA</TableHead>
                    <TableHead className="text-right">Courses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attentionUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Link href={`/admin/users/${user.id}`} className="font-semibold text-foreground hover:text-primary">
                          {user.name || "Unnamed student"}
                        </Link>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </TableCell>
                      <TableCell><AcademicStatusBadge status={user.status} /></TableCell>
                      <TableCell className="text-right font-semibold">{user.cgpa.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{user.courseCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="glass-card-elevated rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest account and academic changes.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link href="/admin/users">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <Link
                key={activity.id}
                href={activity.href}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/50 p-4 transition-colors hover:bg-primary/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{activity.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">{formatDate(activity.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card-elevated rounded-2xl p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Newest Users</h2>
            <p className="mt-1 text-sm text-muted-foreground">Verification, onboarding, and academic start status.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold">
            <Link href="/admin/users">Open directory</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead>Academic Status</TableHead>
                <TableHead className="text-right">Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.slice(0, 6).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`} className="font-semibold text-foreground hover:text-primary">
                      {user.name || "Unnamed student"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{user.email}</span>
                      <BooleanBadge value={user.emailVerified} trueLabel="Verified" falseLabel="Unverified" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <BooleanBadge value={user.onboardingCompleted} trueLabel="Complete" falseLabel="Pending" />
                  </TableCell>
                  <TableCell><AcademicStatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatDate(user.lastActivityAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Activity, Clock, MonitorSmartphone, ShieldCheck, UserCheck } from "lucide-react";

import { AdminMetricCard } from "@/components/admin/admin-metric-card";
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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function compactUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  if (userAgent.includes("Firefox")) return "Firefox browser";
  if (userAgent.includes("Chrome")) return "Chrome browser";
  if (userAgent.includes("Safari")) return "Safari browser";
  if (userAgent.includes("Edg")) return "Edge browser";
  return userAgent.slice(0, 54);
}

export default async function AdminSessionsPage() {
  const data = await getAdminDashboardData();
  const verifiedRate = data.metrics.totalUsers
    ? (data.metrics.verifiedUsers / data.metrics.totalUsers) * 100
    : 0;
  const onboardingRate = data.metrics.totalUsers
    ? (data.metrics.onboardedUsers / data.metrics.totalUsers) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/10 text-primary">
          <ShieldCheck className="mr-1 size-3" />
          Auth and sessions
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">Session Monitoring</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Read-only visibility into active Better Auth sessions, email verification, and onboarding health.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          icon={Activity}
          label="Active sessions"
          value={data.metrics.activeSessions}
          detail="Currently unexpired user sessions"
          accent="primary"
        />
        <AdminMetricCard
          icon={UserCheck}
          label="Verified users"
          value={data.metrics.verifiedUsers}
          detail={`${verifiedRate.toFixed(0)}% of all registered users`}
          accent="emerald"
          progress={verifiedRate}
        />
        <AdminMetricCard
          icon={MonitorSmartphone}
          label="Onboarded users"
          value={data.metrics.onboardedUsers}
          detail={`${onboardingRate.toFixed(0)}% completed setup`}
          accent="blue"
          progress={onboardingRate}
        />
        <AdminMetricCard
          icon={Clock}
          label="Pending setup"
          value={data.metrics.notStartedUsers}
          detail="Users with no academic records yet"
          accent="amber"
        />
      </section>

      <section className="glass-card-elevated rounded-2xl p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Active Sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Session tokens are never displayed. Only account and device metadata is shown.</p>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            {data.activeSessions.length} visible
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead className="text-right">Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.activeSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Link href={`/admin/users/${session.userId}`} className="font-semibold text-foreground hover:text-primary">
                      {session.userName || session.userEmail}
                    </Link>
                    <p className="text-xs text-muted-foreground">{session.userEmail}</p>
                  </TableCell>
                  <TableCell>{compactUserAgent(session.userAgent)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{session.ipAddress || "Not captured"}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatDateTime(session.createdAt)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatDateTime(session.expiresAt)}</TableCell>
                </TableRow>
              ))}
              {data.activeSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No active sessions found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card-elevated rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground">Security posture</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Better Auth handles sessions and secure cookies. Admin pages additionally verify the signed-in email against server-side admin emails.
          </p>
        </div>
        <div className="glass-card-elevated rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground">Operational mode</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This admin dashboard is read-only. It does not expose account deletion, impersonation, or mutation flows.
          </p>
        </div>
        <div className="glass-card-elevated rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground">Access source</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure admin access with the <code className="rounded bg-muted px-1 py-0.5">ADMIN_EMAILS</code> environment variable.
          </p>
        </div>
      </section>
    </div>
  );
}

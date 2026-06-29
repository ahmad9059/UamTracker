export const dynamic = "force-dynamic";

import Link from "next/link";
import { Search, Users } from "lucide-react";

import { AcademicStatusBadge, BooleanBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboardData, type AcademicStatus } from "@/lib/admin-data";

type UsersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

const statusOptions: Array<{ value: "all" | AcademicStatus; label: string }> = [
  { value: "all", label: "All users" },
  { value: "not-started", label: "Not started" },
  { value: "at-risk", label: "Needs attention" },
  { value: "on-track", label: "On track" },
  { value: "excellent", label: "Excellent" },
];

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();
  const status = (params.status ?? "all") as "all" | AcademicStatus;
  const data = await getAdminDashboardData();

  const filteredUsers = data.users.filter((user) => {
    const matchesQuery = query
      ? [user.name, user.email].filter(Boolean).some((value) => value!.toLowerCase().includes(query))
      : true;
    const matchesStatus = status === "all" ? true : user.status === status;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/10 text-primary">
            <Users className="mr-1 size-3" />
            User directory
          </Badge>
          <h1 className="text-3xl font-bold text-foreground">Students and Accounts</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Search users, review verification and onboarding status, and open student academic records.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredUsers.length}</span> of {data.metrics.totalUsers} users
        </div>
      </div>

      <form className="glass-card-elevated grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_220px_auto]" action="/admin/users">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={params.q ?? ""} placeholder="Search by name or email" className="h-11 rounded-xl pl-10" />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <Button type="submit" className="h-11 rounded-xl font-semibold">Filter</Button>
      </form>

      <section className="glass-card-elevated rounded-2xl p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Academic Status</TableHead>
                <TableHead className="text-right">CGPA</TableHead>
                <TableHead className="text-right">Semesters</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-semibold text-foreground">{user.name || "Unnamed student"}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <BooleanBadge value={user.emailVerified} trueLabel="Verified" falseLabel="Unverified" />
                      <BooleanBadge value={user.onboardingCompleted} trueLabel="Onboarded" falseLabel="Pending" />
                    </div>
                  </TableCell>
                  <TableCell><AcademicStatusBadge status={user.status} /></TableCell>
                  <TableCell className="text-right font-bold">{user.cgpa.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{user.semesterCount}</TableCell>
                  <TableCell className="text-right">{user.courseCount}</TableCell>
                  <TableCell className="text-right">{user.activeSessionCount}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="rounded-xl font-semibold">
                      <Link href={`/admin/users/${user.id}`}>View record</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                    No users match the current filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

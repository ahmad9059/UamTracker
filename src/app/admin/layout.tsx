export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import AdminLayoutClient from "@/components/admin/admin-layout-client";
import { requireAdminSession } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard | UamTracker",
  description: "Admin oversight for UamTracker users, GPA records, academics, and sessions.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession("/admin");

  const clientSession = {
    user: {
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    },
  };

  return <AdminLayoutClient session={clientSession}>{children}</AdminLayoutClient>;
}

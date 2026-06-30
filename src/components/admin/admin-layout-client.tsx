"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpenCheck,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  PanelLeftOpen,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

type SessionData = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

const navigationItems = [
  {
    title: "Control Room",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Academics", url: "/admin/academics", icon: BookOpenCheck },
      { title: "Sessions", url: "/admin/sessions", icon: Activity },
    ],
  },
  {
    title: "Workspace",
    items: [
      { title: "Student Dashboard", url: "/dashboard", icon: GraduationCap },
    ],
  },
];

function getInitials(session: SessionData) {
  return session.user.name
    ? session.user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.slice(0, 2).toUpperCase() || "A";
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/admin/users/")) return "Student Record";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/academics")) return "Academics";
  if (pathname.startsWith("/admin/sessions")) return "Sessions";
  return "Admin Overview";
}

function AdminSidebar({ session }: { session: SessionData }) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const userInitials = getInitials(session);

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r bg-sidebar/95 backdrop-blur">
      <SidebarRail className="group-data-[collapsible=icon]:flex" />
      <SidebarHeader className="h-16 border-b border-sidebar-border px-3 py-3">
        <div className="flex h-full w-full items-center justify-between gap-2">
          <Link href="/admin" className="flex h-full min-w-0 flex-1 items-center gap-3 transition-all group-data-[collapsible=icon]:justify-center">
            <div className="relative size-9 flex-shrink-0 overflow-hidden rounded-full border border-sidebar-border shadow-sm">
              <Image src="/icon.svg" alt="UamTracker logo" fill priority className="object-cover" />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">UamTracker</span>
              <span className="truncate text-xs text-sidebar-foreground/60">GPA Records</span>
            </div>
          </Link>
          <SidebarTrigger className="size-8 rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-5 px-1 pb-6 pt-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
        {navigationItems.map((section, index) => (
          <SidebarGroup key={section.title} className={index > 0 ? "border-t border-sidebar-border/60 pt-2" : ""}>
            <SidebarGroupLabel className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/60 group-data-[collapsible=icon]:sr-only">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
                {section.items.map((item) => {
                  const isActive = item.url === "/admin" ? pathname === item.url : pathname.startsWith(item.url);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`group relative overflow-hidden rounded-xl border border-transparent transition-all group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:border-sidebar-border group-data-[collapsible=icon]:p-0 ${
                          isActive
                            ? "border-primary/15 bg-primary/10 text-primary"
                            : "text-sidebar-foreground/85 hover:border-sidebar-border/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className="size-4.5" strokeWidth={2} />
                          <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                          {isActive ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden" /> : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className="hidden px-1 md:block group-data-[collapsible=icon]:hidden">
          <div className="rounded-md border border-sidebar-border/70 bg-sidebar/70 p-4 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
              <ShieldCheck className="size-3" />
              Admin mode
            </div>
            <p className="text-sm font-semibold text-sidebar-foreground">Operational oversight</p>
            <p className="mt-1 text-xs text-sidebar-foreground/70">
              Read-only visibility into accounts, GPA records, and active sessions.
            </p>
          </div>
        </div>

        <div className="hidden items-center justify-center group-data-[collapsible=icon]:flex">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full border border-sidebar-border bg-sidebar/80 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={toggleSidebar}
          >
            <PanelLeftOpen className="size-5" />
            <span className="sr-only">Expand sidebar</span>
          </Button>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="rounded-xl transition-all hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar size="default">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "Admin"} />
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-sidebar-foreground">{session.user.name || "Admin"}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">{session.user.email}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl" side="bottom" align="end" sideOffset={4}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Student dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarToggleButton() {
  const { setOpen, state } = useSidebar();

  if (state !== "collapsed") return null;

  return (
    <Button onClick={() => setOpen(true)} variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
      <PanelLeftOpen className="size-5" />
      <span className="sr-only">Expand Sidebar</span>
    </Button>
  );
}

export default function AdminLayoutClient({ children, session }: { children: React.ReactNode; session: SessionData }) {
  const pathname = usePathname();
  const userInitials = getInitials(session);

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-background">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/5 via-primary/2 to-transparent blur-3xl" />
            <div className="absolute -right-48 top-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-primary/3 via-primary/1 to-transparent blur-3xl" />
          </div>

          <AdminSidebar session={session} />

          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarToggleButton />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Admin</p>
                  <h1 className="text-base font-bold text-foreground sm:text-lg">{getPageTitle(pathname)}</h1>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <ThemeToggle />
                  <Separator orientation="vertical" className="h-6" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 gap-2 rounded-lg px-2 hover:bg-muted">
                        <Avatar size="default">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || "Admin"} />
                          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{userInitials}</AvatarFallback>
                        </Avatar>
                        <span className="hidden text-sm font-semibold lg:block">{session.user.name || "Admin"}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-lg">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Student dashboard
                        </Link>
                      </DropdownMenuItem>
                      <LogoutButton />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            <main className="relative flex-1 p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

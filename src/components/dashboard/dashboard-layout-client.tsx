"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronRight,
  PanelLeftOpen,
  Github,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DashboardNotification } from "@/lib/dashboard-notifications";

// Navigation items
const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Calculator", url: "/dashboard/calculator", icon: Calculator },
      { title: "Grades Tables", url: "/dashboard/grades", icon: BookOpen },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Help & Support", url: "/dashboard/support", icon: HelpCircle },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
];

type SessionData = {
  isAdmin?: boolean;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

function AppSidebar({ session }: { session: SessionData }) {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const sections = session.isAdmin
    ? [
        ...navigationItems,
        {
          title: "Administration",
          items: [{ title: "Admin Console", url: "/admin", icon: ShieldCheck }],
        },
      ]
    : navigationItems;
  const userInitials = session.user.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session.user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r bg-sidebar/95 backdrop-blur">
      <SidebarRail className="group-data-[collapsible=icon]:flex" />

      <SidebarHeader className="border-b border-sidebar-border h-16 px-3 py-3">
        <div className="flex items-center justify-between w-full h-full gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0 flex-1 h-full group-data-[collapsible=icon]:justify-center transition-all"
          >
            <div className="relative size-9 overflow-hidden rounded-full border border-sidebar-border shadow-sm flex-shrink-0">
              <Image
                src="/icon.svg"
                alt="UamTracker logo"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-sm text-sidebar-foreground">
                UamTracker
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                GPA Records
              </span>
            </div>
          </Link>

          {/* Collapse trigger moves out of the logo area when collapsed */}
          <SidebarTrigger className="size-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors rounded-lg group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 pt-4 pb-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4 gap-5">
        {sections.map((section, index) => (
          <SidebarGroup key={section.title} className={index > 0 ? "pt-2 border-t border-sidebar-border/60" : ""}>
            <SidebarGroupLabel className="px-2 mb-1 text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-[0.14em] group-data-[collapsible=icon]:sr-only">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
                {section.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`group relative overflow-hidden rounded-xl border border-transparent transition-all group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-sidebar-border ${
                          isActive
                            ? "bg-primary/10 text-primary border-primary/15"
                            : "text-sidebar-foreground/85 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 hover:border-sidebar-border/70"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className="size-4.5" strokeWidth={2} />
                          <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Promo / attribution card pinned near bottom (above workspace) */}
        <div className="hidden group-data-[collapsible=icon]:hidden md:block mt-auto px-1 ">
          <div className="rounded-md border border-sidebar-border/70 bg-sidebar/70 p-4  shadow-sm">
            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              New
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-sidebar-foreground">
                GitHub · ahmad9059
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                Explore the source, issues, and updates for UamTracker.
              </p>
            </div>
            <div className="mt-3">
              <Button asChild size="sm" className="h-9 px-3 rounded-lg w-full justify-center gap-2">
                <a href="https://github.com/ahmad9059" target="_blank" rel="noreferrer">
                  <span className="inline-flex items-center gap-2">
                    <Github className="size-4" />
                    <span>Try it out</span>
                    <ExternalLink className="size-4" />
                  </span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full border border-sidebar-border bg-sidebar/80 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
            <div className="flex items-center justify-between text-xs text-sidebar-foreground/60 px-1 pb-2 group-data-[collapsible=icon]:hidden">
              <span>Workspace</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-[11px] font-semibold">
                Active
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all rounded-xl"
                >
                  <Avatar size="default">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {session.user.name || "User"}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {session.user.email}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/calculator" className="cursor-pointer">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {session.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Console
                    </Link>
                  </DropdownMenuItem>
                )}
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

export default function DashboardLayoutClient({
  children,
  session,
  notifications,
}: {
  children: React.ReactNode;
  session: SessionData;
  notifications: DashboardNotification[];
}) {
  const pathname = usePathname();
  const userInitials = session.user.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session.user.email?.slice(0, 2).toUpperCase() || "U";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-background">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/5 via-primary/2 to-transparent blur-3xl" />
            <div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-primary/3 via-primary/1 to-transparent blur-3xl" />
          </div>

          <AppSidebar session={session} />

          <SidebarInset className="flex-1">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <div className="flex h-16 items-center gap-4 px-6">
                {/* Sidebar Toggle for Collapsed State */}
                <SidebarToggleButton />

                {/* Search */}
                <DashboardSearch />

                {/* Right Section */}
                <div className="ml-auto flex items-center gap-3">
                  <ThemeToggle />
                  <DashboardNotifications notifications={notifications} />

                  <Separator orientation="vertical" className="h-6" />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-9 rounded-lg hover:bg-muted px-2 gap-2"
                      >
                        <Avatar size="default">
                          <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold hidden lg:block">
                          {session.user.name || "User"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-lg">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/calculator" className="cursor-pointer">
                          <Calculator className="mr-2 h-4 w-4" />
                          Calculator
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {session.isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Admin Console
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <LogoutButton />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 relative">
              <div className="mx-auto">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

// Sidebar Toggle Button Component for Header
function SidebarToggleButton() {
  const { setOpen, state } = useSidebar();

  // Only show when sidebar is collapsed
  if (state !== "collapsed") return null;

  return (
    <Button
      onClick={() => setOpen(true)}
      variant="ghost"
      size="icon"
      className="size-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
    >
      <PanelLeftOpen className="size-5" />
      <span className="sr-only">Expand Sidebar</span>
    </Button>
  );
}

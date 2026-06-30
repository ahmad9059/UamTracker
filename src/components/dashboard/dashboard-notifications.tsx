"use client";

import Link from "next/link";
import { useEffect, useMemo, useTransition, useState } from "react";
import { Bell, CheckCheck, CircleAlert, Inbox, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAllDashboardNotificationsRead,
  markDashboardNotificationRead,
} from "@/app/actions/notification-actions";
import type { DashboardNotification } from "@/lib/dashboard-notifications";

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function NotificationIcon({ tone }: { tone: DashboardNotification["tone"] }) {
  if (tone === "warning") {
    return <CircleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  }

  if (tone === "success") {
    return <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  }

  return <Bell className="h-4 w-4 text-primary" />;
}

export function DashboardNotifications({
  notifications,
}: {
  notifications: DashboardNotification[];
}) {
  const [items, setItems] = useState(notifications);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const unreadCount = useMemo(
    () => items.filter((item) => item.readAt === null).length,
    [items]
  );

  const markAsRead = (id: string) => {
    const notification = items.find((item) => item.id === id);
    if (!notification || notification.readAt) return;

    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, readAt } : item))
    );

    startTransition(() => {
      void markDashboardNotificationRead(id);
    });
  };

  const markAllAsRead = () => {
    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) => (item.readAt ? item : { ...item, readAt }))
    );

    startTransition(() => {
      void markAllDashboardNotificationsRead();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-muted"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-primary-foreground shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-w-[calc(100vw-2rem)] rounded-xl p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {items.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4" />
              Mark read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No notifications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You are all caught up for now.
            </p>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto p-2">
            {items.map((notification) => {
              const unread = notification.readAt === null;

              return (
                <DropdownMenuItem key={notification.id} asChild className="cursor-pointer rounded-lg p-0">
                  <Link
                    href={notification.href}
                    onClick={() => markAsRead(notification.id)}
                    className="flex w-full gap-3 px-3 py-3"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <NotificationIcon tone={notification.tone} />
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold leading-5 text-foreground">
                          {notification.title}
                        </span>
                        {unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="block text-sm leading-5 text-muted-foreground">
                        {notification.description}
                      </span>
                      <span className="block text-xs font-medium text-muted-foreground/80">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

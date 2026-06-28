"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Loader2,
  GraduationCap,
  BookOpen,
  CornerDownLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  searchDashboard,
  type SearchResults,
} from "@/app/actions/semester-actions";

type FlatItem =
  | {
      type: "semester";
      id: string;
      label: string;
      sublabel: string;
      href: string;
    }
  | {
      type: "course";
      id: string;
      label: string;
      sublabel: string;
      href: string;
    };

const EMPTY: SearchResults = { semesters: [], courses: [] };

export function DashboardSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  // Flattened list used for keyboard navigation.
  const items = useMemo<FlatItem[]>(() => {
    const semesterItems: FlatItem[] = results.semesters.map((s) => ({
      type: "semester",
      id: s.id,
      label: s.name,
      sublabel: `${s.courseCount} course${s.courseCount === 1 ? "" : "s"}`,
      href: `/dashboard/semester/${s.id}`,
    }));
    const courseItems: FlatItem[] = results.courses.map((c) => ({
      type: "course",
      id: c.id,
      label: c.name,
      sublabel: c.semesterName,
      href: `/dashboard/semester/${c.semesterId}`,
    }));
    return [...semesterItems, ...courseItems];
  }, [results]);

  const hasResults = items.length > 0;
  const trimmed = query.trim();

  // Debounced search.
  useEffect(() => {
    if (!trimmed) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const res = await searchDashboard(trimmed);
      // Ignore out-of-order responses.
      if (id !== requestId.current) return;
      setResults(res.success ? res.data : EMPTY);
      setActiveIndex(0);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [trimmed]);

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Close when navigating to a new route.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Global shortcut: "/" or Cmd/Ctrl+K focuses the search.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isShortcut =
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" &&
          !["INPUT", "TEXTAREA"].includes(
            (e.target as HTMLElement)?.tagName ?? "",
          ) &&
          !(e.target as HTMLElement)?.isContentEditable);
      if (isShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(item: FlatItem) {
    setOpen(false);
    setQuery("");
    setResults(EMPTY);
    router.push(item.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!hasResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) go(item);
    }
  }

  const showDropdown = open && trimmed.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="dashboard-search-results"
          autoComplete="off"
          placeholder="Search courses, semesters..."
          className="pl-10 pr-10 bg-muted/50 border-muted focus-visible:ring-1 focus-visible:ring-primary/20 h-10 rounded-lg"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {showDropdown && (
        <div
          id="dashboard-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-soft overflow-hidden"
        >
          {!hasResults ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              {loading ? "Searching..." : `No results for "${trimmed}"`}
            </div>
          ) : (
            <div className="max-h-[22rem] overflow-y-auto py-2">
              {results.semesters.length > 0 && (
                <SectionLabel>Semesters</SectionLabel>
              )}
              {items.map((item, index) => {
                // Insert the "Courses" label before the first course item.
                const showCoursesLabel =
                  item.type === "course" &&
                  index === items.findIndex((it) => it.type === "course");
                return (
                  <div key={`${item.type}-${item.id}`}>
                    {showCoursesLabel && <SectionLabel>Courses</SectionLabel>}
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => go(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        index === activeIndex
                          ? "bg-accent"
                          : "hover:bg-accent/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          item.type === "semester"
                            ? "bg-primary/10 text-primary"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        )}
                      >
                        {item.type === "semester" ? (
                          <GraduationCap className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.sublabel}
                        </span>
                      </span>
                      {index === activeIndex && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

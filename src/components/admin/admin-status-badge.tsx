import { Badge } from "@/components/ui/badge";
import type { AcademicStatus } from "@/lib/admin-data";

export function AcademicStatusBadge({ status }: { status: AcademicStatus }) {
  const classes: Record<AcademicStatus, string> = {
    "not-started": "bg-muted text-muted-foreground border-border",
    "at-risk": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    "on-track": "bg-primary/10 text-primary border-primary/20",
    excellent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  };
  const labels: Record<AcademicStatus, string> = {
    "not-started": "Not started",
    "at-risk": "Needs attention",
    "on-track": "On track",
    excellent: "Excellent",
  };

  return (
    <Badge variant="outline" className={`${classes[status]} font-semibold`}>
      {labels[status]}
    </Badge>
  );
}

export function BooleanBadge({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <Badge
      variant="outline"
      className={
        value
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-semibold"
          : "bg-muted text-muted-foreground border-border font-semibold"
      }
    >
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}

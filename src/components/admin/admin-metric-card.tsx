import type { LucideIcon } from "lucide-react";

const accentClasses = {
  primary: "from-primary/20 to-primary/10 text-primary border-primary/15",
  blue: "from-chart-2/20 to-chart-2/10 text-chart-2 border-chart-2/15",
  indigo: "from-chart-3/20 to-chart-3/10 text-chart-3 border-chart-3/15",
  slate: "from-chart-4/20 to-chart-4/10 text-chart-4 border-chart-4/15",
  amber: "from-amber-500/20 to-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/15",
  emerald: "from-emerald-500/20 to-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/15",
  rose: "from-rose-500/20 to-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/15",
};

type Accent = keyof typeof accentClasses;

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "primary",
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  accent?: Accent;
  progress?: number;
}) {
  const safeProgress = Math.max(0, Math.min(progress ?? 0, 100));

  return (
    <div className="glass-card-elevated rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:shadow-soft">
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex size-12 items-center justify-center rounded-xl border bg-gradient-to-br ${accentClasses[accent]}`}>
            <Icon className="size-5" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{detail}</p>
        {typeof progress === "number" ? (
          <div className="h-2 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

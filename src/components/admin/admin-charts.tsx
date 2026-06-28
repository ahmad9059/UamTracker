"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type UserGrowthPoint = {
  label: string;
  users: number;
};

type GradePoint = {
  grade: string;
  count: number;
};

type TooltipPayload = Array<{ value?: number; name?: string; payload?: Record<string, unknown> }>;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const name = payload[0]?.name ?? "Value";

  return (
    <div className="glass-premium rounded-xl border border-border/60 px-4 py-2.5">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">
        {name}: {value}
      </p>
    </div>
  );
}

export function AdminUserGrowthChart({ data }: { data: UserGrowthPoint[] }) {
  return (
    <div className="glass-card-elevated rounded-2xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Growth</h2>
          <p className="mt-1 text-sm text-muted-foreground">New accounts over the last six months.</p>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adminUserGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              name="Users"
              dataKey="users"
              stroke="var(--chart-1)"
              strokeWidth={3}
              fill="url(#adminUserGrowth)"
              dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdminGradeDistributionChart({ data }: { data: GradePoint[] }) {
  return (
    <div className="glass-card-elevated rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Grade Distribution</h2>
        <p className="mt-1 text-sm text-muted-foreground">All tracked courses, including audit/pass courses.</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adminGradeBars" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.64} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in srgb, var(--chart-2) 10%, transparent)" }} />
            <Bar name="Courses" dataKey="count" fill="url(#adminGradeBars)" radius={[10, 10, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

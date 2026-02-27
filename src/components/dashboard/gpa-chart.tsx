"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
};

interface SemesterData {
  id: string;
  name: string;
  gpa: number;
  totalCreditHours: number;
}

interface GPAChartProps {
  semesters: SemesterData[];
  type: "bar" | "line";
}

export function GPAChart({ semesters, type }: GPAChartProps) {
  const data = semesters.map((semester) => ({
    name: semester.name,
    GPA: semester.gpa,
    creditHours: semester.totalCreditHours,
  }));

  if (data.length === 0) {
    return null;
  }

  const totalWeightedGPA = data.reduce(
    (sum, d) => sum + d.GPA * d.creditHours,
    0
  );
  const totalCH = data.reduce((sum, d) => sum + d.creditHours, 0);
  const averageGPA = totalCH > 0 ? totalWeightedGPA / totalCH : 0;

  function CustomTooltip({
    active,
    payload,
    label,
  }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    const value = payload[0]?.value;

    return (
      <div className="glass-premium px-4 py-2.5 rounded-xl border border-border/60">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold gradient-text">
          GPA: {typeof value === "number" ? value.toFixed(2) : value}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-elevated rounded-2xl p-6 group hover:shadow-soft transition-all duration-200 relative overflow-hidden">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {type === "bar" ? "GPA Overview" : "GPA Trend"}
            </h3>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xs font-medium text-muted-foreground">Average GPA:</span>
              <span className="text-base font-bold gradient-text">{averageGPA.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
            <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${type === "bar" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
              Bar
            </button>
            <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${type === "line" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
              Line
            </button>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 4]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "color-mix(in srgb, var(--chart-1) 10%, transparent)" }}
                />
                <Bar
                  dataKey="GPA"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 4]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="GPA"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={{ fill: "var(--chart-1)", strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, fill: "var(--chart-1)", stroke: "var(--background)", strokeWidth: 3 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

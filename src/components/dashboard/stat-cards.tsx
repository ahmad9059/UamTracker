"use client";

import { Award, Clock, TrendingUp, BookOpen } from "lucide-react";

interface StatCardsProps {
  cgpa: number;
  totalCreditHours: number;
  totalQualityPoints: number;
  semesterCount: number;
}

export function StatCards({
  cgpa,
  totalCreditHours,
  totalQualityPoints,
  semesterCount,
}: StatCardsProps) {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const getGPAStatus = (gpa: number) => {
    if (gpa >= 3.5) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400" };
    if (gpa >= 3.0) return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (gpa >= 2.5) return { label: "Average", color: "text-amber-600 dark:text-amber-400" };
    return { label: "Needs Work", color: "text-red-600 dark:text-red-400" };
  };

  const safeCgpa = clamp(cgpa, 0, 4);
  const gpaStatus = getGPAStatus(safeCgpa);
  const gpaProgress = clamp((safeCgpa / 4.0) * 100, 0, 100);
  const creditProgress = clamp((totalCreditHours / 130) * 100, 0, 100);
  const maxQp = Math.max(totalCreditHours * 4, 1); // avoid div/0
  const qualityProgress = clamp((totalQualityPoints / maxQp) * 100, 0, 100);
  const semesterProgress = clamp((semesterCount / 8) * 100, 0, 100);

  const stats = [
    {
      icon: Award,
      iconBg: "from-primary/20 to-primary/10",
      iconColor: "text-primary",
      value: safeCgpa.toFixed(2),
      change: gpaStatus.label,
      changeColor: gpaStatus.color,
      label: "Cumulative GPA",
      sublabel: "Progress",
      progress: gpaProgress,
      progressColor: "bg-gradient-to-r from-primary to-primary/80",
    },
    {
      icon: Clock,
      iconBg: "from-chart-2/20 to-chart-2/10",
      iconColor: "text-chart-2",
      value: totalCreditHours.toString(),
      change: "+15% this sem",
      changeColor: "text-chart-2",
      label: "Credit Hours",
      sublabel: "Completed",
      progress: creditProgress,
      progressColor: "bg-gradient-to-r from-chart-2 to-chart-2/80",
    },
    {
      icon: TrendingUp,
      iconBg: "from-chart-3/20 to-chart-3/10",
      iconColor: "text-chart-3",
      value: totalQualityPoints.toFixed(1),
      change: "Total Earned",
      changeColor: "text-chart-3",
      label: "Quality Points",
      sublabel: "Accumulated",
      progress: qualityProgress,
      progressColor: "bg-gradient-to-r from-chart-3 to-chart-3/80",
    },
    {
      icon: BookOpen,
      iconBg: "from-chart-4/20 to-chart-4/10",
      iconColor: "text-chart-4",
      value: semesterCount.toString(),
      change: `${semesterCount}/8 semesters`,
      changeColor: "text-chart-4",
      label: "Semesters",
      sublabel: "Completion",
      progress: semesterProgress,
      progressColor: "bg-gradient-to-r from-chart-4 to-chart-4/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass-card-elevated rounded-2xl p-6 group hover:shadow-soft transition-all duration-200 relative overflow-hidden"
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center border border-${stat.iconColor}/10`}>
                <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold gradient-text">{stat.value}</span>
                <p className={`text-xs font-semibold ${stat.changeColor} mt-1`}>{stat.change}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">{stat.label}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-medium">{stat.sublabel}</span>
                <span className="font-bold">{stat.progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.progressColor} rounded-full transition-all duration-700`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

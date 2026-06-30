import Link from "next/link";
import { ArrowRight, GraduationCap, Info, Sigma } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QUALITY_POINT_TABLES,
  VALID_TOTAL_MARKS,
  type Grade,
  type TotalMarksType,
} from "@/lib/quality-points";

type Band = Exclude<Grade, "F" | "P">;

type QPRow = {
  band: Band;
  marks: string;
  qp: string;
};

type ActiveQPRow = {
  grade: Band;
  qualityPoint: number;
};

const bandStyles: Record<Band, string> = {
  A: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  B: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  C: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  D: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const rowStyles: Record<Band, string> = {
  A: "bg-emerald-500/15 hover:bg-emerald-500/25",
  B: "bg-blue-500/15 hover:bg-blue-500/25",
  C: "bg-amber-500/15 hover:bg-amber-500/25",
  D: "bg-red-500/15 hover:bg-red-500/25",
};

const gradingScale: { band: Band; range: string; label: string }[] = [
  { band: "A", range: "80% - 100%", label: "Excellent" },
  { band: "B", range: "65% - 79%", label: "Good" },
  { band: "C", range: "50% - 64%", label: "Average" },
  { band: "D", range: "40% - 49%", label: "Pass" },
];

function formatQualityPoint(value: number) {
  return value.toFixed(2);
}

function formatMarksRange(start: number, end: number) {
  return start === end ? String(start) : `${start} - ${end}`;
}

function formatCreditHours(total: TotalMarksType) {
  const creditHours = total / 20;
  return `${creditHours} Credit Hour${creditHours === 1 ? "" : "s"}`;
}

function buildRows(total: TotalMarksType): QPRow[] {
  const table = QUALITY_POINT_TABLES[total];
  const rows: QPRow[] = [];
  let start: number | null = null;
  let previous = 0;
  let current: ActiveQPRow | null = null;

  const pushCurrent = (end: number) => {
    if (!current || start === null) return;
    rows.push({
      band: current.grade,
      marks: formatMarksRange(start, end),
      qp: formatQualityPoint(current.qualityPoint),
    });
  };

  table.forEach((entry, mark) => {
    if (entry.grade === "F" || entry.grade === "P" || entry.qualityPoint <= 0) {
      pushCurrent(previous);
      start = null;
      current = null;
      previous = mark;
      return;
    }

    if (
      !current ||
      current.grade !== entry.grade ||
      current.qualityPoint !== entry.qualityPoint
    ) {
      pushCurrent(previous);
      start = mark;
      current = { grade: entry.grade as Band, qualityPoint: entry.qualityPoint };
    }

    previous = mark;
  });

  pushCurrent(previous);

  return rows;
}

export function GradesReference({
  calculatorHref = "/calculator",
  showBadge = true,
}: {
  calculatorHref?: string;
  showBadge?: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {showBadge ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <GraduationCap className="h-4 w-4" />
              Grading System
            </div>
          ) : null}
          <h1 className="text-3xl font-bold text-foreground">Quality Point Reference</h1>
          <p className="text-base text-muted-foreground mt-1.5">
            UamTracker quality point tables used to calculate your GPA and CGPA.
          </p>
        </div>
      </div>

      <div className="columns-1 gap-6 lg:columns-2">
        {VALID_TOTAL_MARKS.map((total) => (
          <Card key={total} className="glass-card shadow-soft border-border/50 mb-6 break-inside-avoid">
            <CardHeader>
              <CardTitle className="text-xl">
                Marks out of {total} ({formatCreditHours(total)})
              </CardTitle>
              <CardDescription>
                Quality points awarded for marks out of {total} ({formatCreditHours(total).toLowerCase()})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="text-base [&_td]:py-3 [&_th]:h-auto [&_th]:py-3">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Grade</TableHead>
                    <TableHead className="text-base font-semibold">Marks (out of {total})</TableHead>
                    <TableHead className="text-right text-base font-semibold">Quality Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildRows(total).map((row) => (
                    <TableRow key={`${row.band}-${row.marks}`} className={rowStyles[row.band]}>
                      <TableCell>
                        <Badge variant="outline" className={`text-sm font-bold ${bandStyles[row.band]}`}>
                          {row.band}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{row.marks}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{row.qp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Grading Scale</CardTitle>
          <CardDescription>Letter grades by percentage band</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {gradingScale.map((grade) => (
              <div
                key={grade.band}
                className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background p-4 transition-colors hover:border-primary/30"
              >
                <Badge variant="outline" className={`w-fit px-3 text-lg font-bold ${bandStyles[grade.band]}`}>
                  {grade.band}
                </Badge>
                <span className="text-base font-semibold text-foreground">{grade.range}</span>
                <span className="text-sm text-muted-foreground">{grade.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sigma className="h-5 w-5 text-primary" />
            How GPA &amp; CGPA Are Calculated
          </CardTitle>
          <CardDescription>The formulas behind your results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-background p-4">
            <p className="text-sm font-semibold text-foreground mb-1">GPA</p>
            <p className="text-sm text-muted-foreground">
              Sum of total quality points in a semester / Sum of total credit hours in that semester
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background p-4">
            <p className="text-sm font-semibold text-foreground mb-1">CGPA</p>
            <p className="text-sm text-muted-foreground">
              Sum of total quality points from the 1st to the latest semester / Sum of total credit hours across all those semesters
            </p>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p>
              Credit hours map to total marks (e.g. a 1 credit-hour course is marked out of 20, a 5 credit-hour course out of 100).
            </p>
          </div>
          <Link href={calculatorHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3">
            Try the GPA Calculator
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

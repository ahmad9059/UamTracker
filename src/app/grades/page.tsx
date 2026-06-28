import Link from "next/link";
import { GraduationCap, Sigma, Info, ArrowRight } from "lucide-react";
import { Navbar, Footer } from "@/components/landing";
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
import { Badge } from "@/components/ui/badge";

type Band = "A" | "B" | "C" | "D";
type QPRow = { band: Band; marks: string; qp: string };

const bandStyles: Record<Band, string> = {
  A: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  B: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  C: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  D: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const gradingScale: { band: Band; range: string; label: string }[] = [
  { band: "A", range: "80% – 100%", label: "Excellent" },
  { band: "B", range: "65% – 79%", label: "Good" },
  { band: "C", range: "50% – 64%", label: "Average" },
  { band: "D", range: "40% – 49%", label: "Pass" },
];

const TOTALS = ["20", "40", "60", "80", "100"] as const;
type Total = (typeof TOTALS)[number];

const qpTables: Record<Total, QPRow[]> = {
  "20": [
    { band: "D", marks: "8", qp: "1.00" },
    { band: "D", marks: "9", qp: "1.50" },
    { band: "C", marks: "10", qp: "2.00" },
    { band: "C", marks: "11", qp: "2.33" },
    { band: "C", marks: "12", qp: "2.67" },
    { band: "B", marks: "13", qp: "3.00" },
    { band: "B", marks: "14", qp: "3.33" },
    { band: "B", marks: "15", qp: "3.67" },
    { band: "A", marks: "16 – 20", qp: "4.00" },
  ],
  "40": [
    { band: "D", marks: "16", qp: "2.00" },
    { band: "D", marks: "17", qp: "2.50" },
    { band: "D", marks: "18", qp: "3.00" },
    { band: "D", marks: "19", qp: "3.50" },
    { band: "C", marks: "20", qp: "4.00" },
    { band: "C", marks: "21", qp: "4.33" },
    { band: "C", marks: "22", qp: "4.67" },
    { band: "C", marks: "23", qp: "5.00" },
    { band: "C", marks: "24", qp: "5.33" },
    { band: "C", marks: "25", qp: "5.67" },
    { band: "B", marks: "26", qp: "6.00" },
    { band: "B", marks: "27", qp: "6.33" },
    { band: "B", marks: "28", qp: "6.67" },
    { band: "B", marks: "29", qp: "7.00" },
    { band: "B", marks: "30", qp: "7.33" },
    { band: "B", marks: "31", qp: "7.67" },
    { band: "A", marks: "32 – 40", qp: "8.00" },
  ],
  "60": [
    { band: "D", marks: "24", qp: "3.00" },
    { band: "D", marks: "25", qp: "3.50" },
    { band: "D", marks: "26", qp: "4.00" },
    { band: "D", marks: "27", qp: "4.50" },
    { band: "D", marks: "28", qp: "5.00" },
    { band: "D", marks: "29", qp: "5.50" },
    { band: "C", marks: "30", qp: "6.00" },
    { band: "C", marks: "31", qp: "6.33" },
    { band: "C", marks: "32", qp: "6.67" },
    { band: "C", marks: "33", qp: "7.00" },
    { band: "C", marks: "34", qp: "7.33" },
    { band: "C", marks: "35", qp: "7.67" },
    { band: "C", marks: "36", qp: "8.00" },
    { band: "C", marks: "37", qp: "8.33" },
    { band: "C", marks: "38", qp: "8.67" },
    { band: "B", marks: "39", qp: "9.00" },
    { band: "B", marks: "40", qp: "9.33" },
    { band: "B", marks: "41", qp: "9.67" },
    { band: "B", marks: "42", qp: "10.00" },
    { band: "B", marks: "43", qp: "10.33" },
    { band: "B", marks: "44", qp: "10.67" },
    { band: "B", marks: "45", qp: "11.00" },
    { band: "B", marks: "46", qp: "11.33" },
    { band: "B", marks: "47", qp: "11.67" },
    { band: "A", marks: "48 – 60", qp: "12.00" },
  ],
  "80": [
    { band: "D", marks: "32", qp: "4.00" },
    { band: "D", marks: "33", qp: "4.50" },
    { band: "D", marks: "34", qp: "5.00" },
    { band: "D", marks: "35", qp: "5.50" },
    { band: "D", marks: "36", qp: "6.00" },
    { band: "D", marks: "37", qp: "6.50" },
    { band: "D", marks: "38", qp: "7.00" },
    { band: "D", marks: "39", qp: "7.50" },
    { band: "C", marks: "40", qp: "8.00" },
    { band: "C", marks: "41", qp: "8.33" },
    { band: "C", marks: "42", qp: "8.67" },
    { band: "C", marks: "43", qp: "9.00" },
    { band: "C", marks: "44", qp: "9.33" },
    { band: "C", marks: "45", qp: "9.67" },
    { band: "C", marks: "46", qp: "10.00" },
    { band: "C", marks: "47", qp: "10.33" },
    { band: "C", marks: "48", qp: "10.67" },
    { band: "C", marks: "49", qp: "11.00" },
    { band: "C", marks: "50", qp: "11.33" },
    { band: "C", marks: "51", qp: "11.67" },
    { band: "B", marks: "52", qp: "12.00" },
    { band: "B", marks: "53", qp: "12.33" },
    { band: "B", marks: "54", qp: "12.67" },
    { band: "B", marks: "55", qp: "13.00" },
    { band: "B", marks: "56", qp: "13.33" },
    { band: "B", marks: "57", qp: "13.67" },
    { band: "B", marks: "58", qp: "14.00" },
    { band: "B", marks: "59", qp: "14.33" },
    { band: "B", marks: "60", qp: "14.67" },
    { band: "B", marks: "61", qp: "15.00" },
    { band: "B", marks: "62", qp: "15.33" },
    { band: "B", marks: "63", qp: "15.67" },
    { band: "A", marks: "64 – 80", qp: "16.00" },
  ],
  "100": [
    { band: "D", marks: "40", qp: "5.00" },
    { band: "D", marks: "41", qp: "5.50" },
    { band: "D", marks: "42", qp: "6.00" },
    { band: "D", marks: "43", qp: "6.50" },
    { band: "D", marks: "44", qp: "7.00" },
    { band: "D", marks: "45", qp: "7.50" },
    { band: "D", marks: "46", qp: "8.00" },
    { band: "D", marks: "47", qp: "8.50" },
    { band: "D", marks: "48", qp: "9.00" },
    { band: "D", marks: "49", qp: "9.50" },
    { band: "C", marks: "50", qp: "10.00" },
    { band: "C", marks: "51", qp: "10.33" },
    { band: "C", marks: "52", qp: "10.67" },
    { band: "C", marks: "53", qp: "11.00" },
    { band: "C", marks: "54", qp: "11.33" },
    { band: "C", marks: "55", qp: "11.67" },
    { band: "C", marks: "56", qp: "12.00" },
    { band: "C", marks: "57", qp: "12.33" },
    { band: "C", marks: "58", qp: "12.67" },
    { band: "C", marks: "59", qp: "13.00" },
    { band: "C", marks: "60", qp: "13.33" },
    { band: "C", marks: "61", qp: "13.67" },
    { band: "C", marks: "62", qp: "14.00" },
    { band: "C", marks: "63", qp: "14.33" },
    { band: "C", marks: "64", qp: "14.67" },
    { band: "B", marks: "65", qp: "15.00" },
    { band: "B", marks: "66", qp: "15.33" },
    { band: "B", marks: "67", qp: "15.67" },
    { band: "B", marks: "68", qp: "16.00" },
    { band: "B", marks: "69", qp: "16.33" },
    { band: "B", marks: "70", qp: "16.67" },
    { band: "B", marks: "71", qp: "17.00" },
    { band: "B", marks: "72", qp: "17.33" },
    { band: "B", marks: "73", qp: "17.67" },
    { band: "B", marks: "74", qp: "18.00" },
    { band: "B", marks: "75", qp: "18.33" },
    { band: "B", marks: "76", qp: "18.67" },
    { band: "B", marks: "77", qp: "19.00" },
    { band: "B", marks: "78", qp: "19.33" },
    { band: "B", marks: "79", qp: "19.67" },
    { band: "A", marks: "80 – 100", qp: "20.00" },
  ],
};

export default function GradesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <GraduationCap className="h-4 w-4" />
              Grading System
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Quality Point Reference
            </h1>
            <p className="text-base text-muted-foreground mt-1.5">
              UAM-University quality point tables used to calculate your GPA and CGPA.
            </p>
          </div>
        </div>

        {/* Grading Scale */}
        <Card className="glass-card shadow-soft border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Grading Scale</CardTitle>
            <CardDescription>Letter grades by percentage band</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {gradingScale.map((g) => (
                <div
                  key={g.band}
                  className="flex flex-col gap-2 p-4 bg-background rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className={`w-fit font-bold text-base px-3 ${bandStyles[g.band]}`}
                  >
                    {g.band}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {g.range}
                  </span>
                  <span className="text-xs text-muted-foreground">{g.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Point Tables */}
        <div className="columns-1 lg:columns-2 gap-6">
          {TOTALS.map((t) => (
            <Card
              key={t}
              className="glass-card shadow-soft border-border/50 mb-6 break-inside-avoid"
            >
              <CardHeader>
                <CardTitle className="text-xl">Marks out of {t}</CardTitle>
                <CardDescription>
                  Quality points awarded for marks out of {t}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Grade</TableHead>
                      <TableHead className="font-semibold">
                        Marks (out of {t})
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Quality Points
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qpTables[t].map((row) => (
                      <TableRow key={`${row.band}-${row.marks}`}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-bold ${bandStyles[row.band]}`}
                          >
                            {row.band}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{row.marks}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {row.qp}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formula */}
        <Card className="glass-card shadow-soft border-border/50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sigma className="h-5 w-5 text-primary" />
              How GPA &amp; CGPA Are Calculated
            </CardTitle>
            <CardDescription>
              The formulas behind your results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-xl border border-border/50">
              <p className="text-sm font-semibold text-foreground mb-1">GPA</p>
              <p className="text-sm text-muted-foreground">
                Sum of total quality points in a semester ÷ Sum of total credit
                hours in that semester
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border/50">
              <p className="text-sm font-semibold text-foreground mb-1">CGPA</p>
              <p className="text-sm text-muted-foreground">
                Sum of total quality points from the 1st to the latest semester ÷
                Sum of total credit hours across all those semesters
              </p>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <p>
                Credit hours map to total marks (e.g. a 1 credit-hour course is
                marked out of 20, a 5 credit-hour course out of 100).
              </p>
            </div>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              Try the GPA Calculator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

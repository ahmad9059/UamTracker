import { CheckCircle, Info } from "lucide-react";

const grades = [
  { grade: "A", range: "80-100%", points: "4.00", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { grade: "B", range: "65-79%", points: "3.00-3.70", color: "text-primary", bg: "bg-primary/10" },
  { grade: "C", range: "50-64%", points: "2.00-2.70", color: "text-amber-500", bg: "bg-amber-500/10" },
  { grade: "D", range: "40-49%", points: "1.00-1.50", color: "text-orange-500", bg: "bg-orange-500/10" },
  { grade: "F", range: "Below 40%", points: "0.00", color: "text-red-500", bg: "bg-red-500/10" },
];

export function GradingSystem() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Info className="h-4 w-4" />
              Official Grading System
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              UamTracker{" "}
              <span className="gradient-text">Grading System</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding how your grades are calculated using the supported
              quality point system in GPA Records.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Grade Criteria Card */}
            <div className="glass-card rounded-xl p-6 lg:p-8 shadow-soft h-fit">
              <h3 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Grade Criteria
              </h3>
              <div className="space-y-2">
                {grades.map((item) => (
                  <div
                    key={item.grade}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={`w-11 h-11 ${item.bg} rounded-lg flex items-center justify-center font-bold text-lg ${item.color} shrink-0`}
                    >
                      {item.grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`h-4 w-4 ${item.color} shrink-0`} />
                        <span className="font-semibold text-foreground">
                          {item.range}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Quality Point: {item.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Card */}
            <div className="space-y-5">
              <div className="glass-card rounded-xl p-6 lg:p-8 shadow-soft">
                <h3 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  GPA Formula
                </h3>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 mb-5">
                  <code className="text-lg font-mono text-foreground block text-center">
                    GPA = Σ(QP × CH) / Σ(CH)
                  </code>
                  <div className="text-center mt-3 space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">QP</span> = Quality Points
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">CH</span> = Credit Hours
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  The system supports courses with total marks of{" "}
                  <span className="font-semibold text-foreground">
                    20, 40, 60, 80, or 100
                  </span>
                  , each with their own quality point mapping based on
                  university standards.
                </p>
              </div>

              {/* Mark Types */}
              <div className="glass-card rounded-xl p-6 lg:p-8 shadow-soft">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Supported Mark Types
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {["20", "40", "60", "80", "100"].map((mark) => (
                    <div
                      key={mark}
                      className="px-4 py-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center"
                    >
                      <span className="text-lg font-bold text-primary">
                        {mark}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        marks
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

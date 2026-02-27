import {
  Calculator,
  BarChart3,
  BookOpen,
  TrendingUp,
  Users,
  GraduationCap,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Accurate GPA Calculation",
    description:
      "Uses UAM-University's official quality point system for precise calculations across all mark types (20, 40, 60, 80, 100).",
    color: "bg-primary",
    size: "large",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description:
      "Track your progress with beautiful charts and graphs. See your GPA trends across semesters at a glance.",
    color: "bg-chart-3",
    size: "medium",
  },
  {
    icon: BookOpen,
    title: "Semester Management",
    description:
      "Organize your courses by semester. Add, edit, and delete courses with ease.",
    color: "bg-chart-2",
    size: "medium",
  },
  {
    icon: TrendingUp,
    title: "CGPA Tracking",
    description:
      "Automatically calculate your cumulative GPA across all semesters. Watch your progress grow.",
    color: "bg-chart-5",
    size: "small",
  },
  {
    icon: Users,
    title: "Personal Dashboard",
    description:
      "Your own private space to track all your academic data securely.",
    color: "bg-chart-4",
    size: "small",
  },
  {
    icon: GraduationCap,
    title: "Public Calculator",
    description:
      "Quick GPA calculations without signing up. Perfect for checking grades on the go.",
    color: "bg-chart-1",
    size: "small",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get your GPA calculated in real-time as you enter your grades.",
    color: "bg-chart-5",
    size: "small",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your academic data is encrypted and only accessible by you.",
    color: "bg-muted",
    size: "small",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-0 mesh-pattern opacity-30" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Powerful features designed specifically for UAM-University students to track, 
            analyze, and improve their academic performance.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {/* Large Feature Card */}
          <div className="lg:col-span-2 lg:row-span-2 group">
            <div className="h-full glass-card rounded-xl p-8 hover:shadow-medium transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
              <div className={`w-12 h-12 rounded-lg ${features[0].color} flex items-center justify-center mb-6 shadow-soft text-primary-foreground`}>
                <Calculator className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {features[0].title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {features[0].description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["20", "40", "60", "80", "100"].map((mark) => (
                  <div
                    key={mark}
                    className="bg-accent/50 rounded-lg px-4 py-2 text-center"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {mark} Marks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medium Feature Cards */}
          {features.slice(1, 3).map((feature, index) => (
            <div key={index} className="lg:col-span-1 group">
              <div className="h-full glass-card rounded-xl p-6 hover:shadow-medium transition-all duration-300">
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-4 shadow-soft text-primary-foreground`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}

          {/* Small Feature Cards */}
          {features.slice(3).map((feature, index) => (
            <div key={index} className="group">
              <div className="h-full glass-card rounded-xl p-5 hover:shadow-soft transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-md ${feature.color} flex items-center justify-center shrink-0 shadow-subtle text-primary-foreground`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

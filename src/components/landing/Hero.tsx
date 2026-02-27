"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calculator,
  Sparkles,
  TrendingUp,
  BookOpen,
  Award,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";

export function Hero() {
  return (
    <section className="relative min-h-screen aurora-hero-enhanced overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl orb-1" />
        <div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-primary/15 via-primary/10 to-transparent blur-3xl orb-2" />
        <div className="absolute -bottom-48 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-primary/10 via-primary/5 to-transparent blur-3xl orb-3" />
      </div>

      {/* Subtle mesh pattern overlay */}
      <div className="absolute inset-0 mesh-pattern opacity-30" />

      <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-20 relative min-h-[calc(100vh-5rem)] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-primary/5 px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:bg-primary/10">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>

              <span className="text-sm font-semibold tracking-tight text-foreground/90">
                Built for UAM-University Students
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-6 animate-fade-in-up-delay-1">
              <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] font-extrabold leading-[1.05] tracking-tight">
                Track Your
                <br />
                <span className="gradient-text-animated">Academic Journey</span>
                <br />
                with Precision
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Calculate your GPA and CGPA using UAM-University&apos;s official
                grading system. Visualize progress, manage courses, and achieve
                your goals.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-delay-2">
              <Button
                size="lg"
                asChild
                className="text-base px-7 h-12 rounded-xl font-semibold shadow-medium hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90"
              >
                <Link href="/register">
                  Start Tracking
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-7 h-12 rounded-xl font-semibold glass-premium hover:bg-accent/80 shadow-soft hover:shadow-medium transition-all duration-300 border-border/60"
              >
                <Link href="/calculator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Try Calculator
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2 animate-fade-in-up-delay-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["A", "B", "C", "D"].map((letter, i) => (
                    <div
                      key={letter}
                      className={`w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground shadow-soft ${
                        i === 0
                          ? "bg-gradient-to-br from-primary to-primary/80"
                          : i === 1
                            ? "bg-gradient-to-br from-chart-2 to-chart-2/80"
                            : i === 2
                              ? "bg-gradient-to-br from-chart-3 to-chart-3/80"
                              : "bg-gradient-to-br from-chart-4 to-chart-4/80"
                      }`}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Trusted by students
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <span className="text-sm font-medium text-muted-foreground">
                Free forever • No credit card
              </span>
            </div>
          </div>

          {/* Right Content - Hero Illustration with Floating Cards */}
          <div className="relative hidden lg:flex lg:justify-center lg:items-center animate-slide-in-right">
            {/* Main Illustration */}
            <div className="relative float-gentle">
              <Image
                src="/hero-img-2.svg"
                alt="Academic journey illustration"
                className="w-full max-w-lg h-auto drop-shadow-xl"
                width={640}
                height={480}
                priority
              />
            </div>

            {/* Floating Card 1 - GPA Trend (top-left) */}
            <div className="absolute top-8 -left-4 xl:left-0 glass-card-elevated rounded-xl p-4 float-rotate shadow-elevated z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-chart-2/20 to-chart-2/5 rounded-xl flex items-center justify-center border border-chart-2/20">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <div className="text-sm font-bold text-chart-2">+0.25</div>
                  <div className="text-xs text-muted-foreground font-medium">
                    GPA Improved
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 2 - CGPA (top-right) */}
            <div className="absolute top-4 -right-4 xl:right-0 glass-card-elevated rounded-xl p-4 float-gentle-delayed shadow-elevated z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold gradient-text-animated">
                    <AnimatedCounter end={3.75} duration={2500} />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Current CGPA
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 3 - Achievement (bottom-right) */}
            <div className="absolute bottom-16 -right-2 xl:right-4 glass-card-elevated rounded-xl p-4 float-gentle shadow-elevated z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-chart-5/20 to-chart-5/10 rounded-xl flex items-center justify-center border border-chart-5/20">
                  <Award className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    Dean&apos;s List
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Achievement
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-fade-in-up-delay-5">
          <span className="text-xs font-medium tracking-wide uppercase">
            Scroll to explore
          </span>
          <div className="w-8 h-12 border-2 border-border rounded-full p-1.5 flex justify-center">
            <ChevronDown className="w-4 h-4 scroll-bounce text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
}

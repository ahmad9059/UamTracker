import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-primary" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 mesh-pattern opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground mb-8">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            Start Your Academic Journey
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Ready to Track Your{" "}
            <span className="text-primary-foreground/90 underline decoration-primary-foreground/30 underline-offset-8">
              Success?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-primary-foreground/85 mb-10 max-w-xl mx-auto leading-relaxed">
            Join students who are already using UamTracker GPA Records to
            achieve their academic goals and visualize their progress.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/95 text-lg px-8 h-12 rounded-lg font-semibold shadow-medium hover:shadow-elevated transition-all group"
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border border-primary-foreground/30 bg-primary/30 text-primary-foreground hover:bg-primary/40 text-lg px-8 h-12 rounded-lg font-semibold backdrop-blur-sm transition-all"
            >
              <Link href="/calculator">Try Calculator First</Link>
            </Button>
          </div>

          {/* Trust Note */}
          <p className="text-primary-foreground/70 text-sm mt-8">
            Free forever • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

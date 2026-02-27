import Link from "next/link";
import { GraduationCap, Mail, MapPin, ExternalLink } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Calculator", href: "/calculator" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  account: [
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/register" },
  ],
  university: [
    { label: "UAM-University Website", href: "https://mnsuam.edu.pk", external: true },
    { label: "Student Portal", href: "https://portal.mnsuam.edu.pk", external: true },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-primary p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold block leading-tight">
                  UAM-University
                </span>
                <span className="text-xs text-white/60 -mt-0.5 block">
                  GPA Tracker
                </span>
              </div>
            </Link>
            <p className="text-white/60 leading-relaxed mb-6">
              Track your academic progress with UAM-University&apos;s official
              grading system. Built for students, by students.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  UAM-University of Agriculture, Multan
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-sm">support@gpa-tracker.edu</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* University Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">University</h4>
            <ul className="space-y-3">
              {footerLinks.university.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} UAM-University GPA Tracker. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-white/40 text-sm">
                Build with 🤍 by{" "}
                <a
                  href="https://github.com/ahmad9059"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
                >
                  ahmad9059
                </a>{" "}
                for UAM students
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

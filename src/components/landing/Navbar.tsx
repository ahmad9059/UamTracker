"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userInitials =
    session?.user?.name
      ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : session?.user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 pt-4">
        <nav className="glass-strong rounded-4xl shadow-soft">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg group-hover:bg-primary/30 transition-all" />
                <div className="relative w-10 h-10 rounded-lg shadow-sm overflow-hidden">
                  <img
                    src="/icon.svg"
                    alt="UAM University Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">
                  UAM-University
                </span>
                <span className="text-xs text-muted-foreground -mt-0.5">
                  GPA Tracker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="#features"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
              >
                How It Works
              </Link>
              <Link
                href="/calculator"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
              >
                Calculator
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {session?.user ? (
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "Profile"} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left leading-tight">
                    <p className="text-sm font-semibold text-foreground">{session.user.name || "Your account"}</p>
                    <p className="text-xs text-muted-foreground">Go to dashboard</p>
                  </div>
                </Link>
              ) : (
                <>
                  <Button variant="ghost" asChild className="font-medium">
                    <Link href="/login">Sign In</Link>
                  </Button>
              <Button
                asChild
                className="font-semibold shadow-soft hover:shadow-medium transition-shadow"
              >
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-accent/50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 px-6 py-4 space-y-2">
              <Link
                href="#features"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/calculator"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Calculator
              </Link>
              <div className="pt-4 flex flex-col gap-2">
                {session?.user ? (
                  <Button asChild className="w-full">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

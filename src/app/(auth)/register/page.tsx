"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, UserPlus, Loader2 } from "lucide-react";
import { Navbar } from "@/components/landing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { signIn, signUp, useSession } from "@/lib/auth-client";
import Image from "next/image";
import { registerSchema, type RegisterFormData } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();

  const { data: session, isPending: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const justSignedUp = useRef(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        if (result.error.message?.includes("already exists")) {
          setError("An account with this email already exists");
        } else {
          setError(result.error.message || "Failed to create account");
        }
        return;
      }

      justSignedUp.current = true;
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleSignUp() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result?.error) {
        setError(result.error.message || "Google sign-in failed");
        return;
      }

      const redirectUrl = (result as { url?: string } | undefined)?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Google sign-up error:", err);
      setError("Unable to continue with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionLoading && session?.session && !justSignedUp.current) {
      router.replace("/dashboard");
    }
  }, [session, sessionLoading, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card shadow-xl border-border/50">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Start tracking your academic progress today
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Your full name"
                              className="pl-10"
                              disabled={isLoading || isGoogleLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10"
                              disabled={isLoading || isGoogleLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="At least 8 characters"
                              className="pl-10"
                              disabled={isLoading || isGoogleLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create account
                      </>
                    )}
                  </Button>

                  <div className="relative py-2 text-center text-xs text-muted-foreground">
                    <span className="px-2 bg-card relative z-10">or continue with</span>
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading || isGoogleLoading}
                    onClick={onGoogleSignUp}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <Image
                          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                          alt="Google"
                          width={18}
                          height={18}
                          className="mr-2"
                        />
                        Continue with Google
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to track your GPA responsibly.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

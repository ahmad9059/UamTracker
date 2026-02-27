"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { Navbar } from "@/components/landing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { signIn, useSession } from "@/lib/auth-client";
import Image from "next/image";
import { loginSchema, type LoginFormData } from "@/lib/validation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { data: session, isPending: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl,
      });

      if (result.error) {
        if (
          result.error.message?.toLowerCase().includes("email not verified") ||
          result.error.status === 403
        ) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }
        setError(result.error.message || "Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });

      if (result?.error) {
        setError(result.error.message || "Google sign-in failed");
        return;
      }

      // Some adapters handle redirect internally; ensure navigation as fallback
      const redirectUrl = (result as { url?: string } | undefined)?.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Unable to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  // Redirect away from login when already authenticated
  useEffect(() => {
    if (!sessionLoading && session?.session) {
      router.replace(callbackUrl);
    }
  }, [session, sessionLoading, router, callbackUrl]);

  return (
    <Card className="glass-card shadow-xl border-border/50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
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
                        disabled={isLoading}
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
                        placeholder="Enter your password"
                        className="pl-10"
                        disabled={isLoading}
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
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
              onClick={onGoogleSignIn}
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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Create account
          </Link>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          <Link href="/calculator" className="hover:underline">
            Try the calculator without signing in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

function LoginFormSkeleton() {
  return (
    <Card className="glass-card shadow-xl border-border/50">
      <CardHeader className="space-y-1 text-center">
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

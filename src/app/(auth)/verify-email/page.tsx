"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/landing";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { authClient } from "@/lib/auth-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });
      setResendSuccess(true);
    } catch {
      setResendError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="glass-card shadow-xl border-border/50">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a verification link to <strong>{email}</strong>
            </>
          ) : (
            "We sent a verification link to your email address"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {resendSuccess && (
          <Alert>
            <AlertDescription>
              Verification email sent! Check your inbox.
            </AlertDescription>
          </Alert>
        )}
        {resendError && (
          <Alert variant="destructive">
            <AlertDescription>{resendError}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>
            Click the link in the email to verify your account and access the
            dashboard.
          </p>
          <p>The link expires in 1 hour.</p>
        </div>

        {email && (
          <Button
            onClick={handleResend}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend verification email
              </>
            )}
          </Button>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          <Link
            href="/login"
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<div />}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

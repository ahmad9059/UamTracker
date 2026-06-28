"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  submitSupportRequest,
  type SupportActionState,
} from "@/app/actions/support-actions";
import { useSession } from "@/lib/auth-client";
import { AlertCircle, CheckCircle2, Loader2, Mail, MessageCircle, BookOpen } from "lucide-react";

const initialSupportActionState: SupportActionState = {
  success: false,
  message: "",
};

export default function SupportPage() {
  const { data: session } = useSession();
  const [state, formAction] = useActionState(
    submitSupportRequest,
    initialSupportActionState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [dismissedResultId, setDismissedResultId] = useState(0);
  const resultId = state.submissionId ?? 0;
  const resultDialogOpen = Boolean(state.message) && dismissedResultId !== resultId;

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
    if (session?.user?.name && nameRef.current && !nameRef.current.value) {
      nameRef.current.value = session.user.name;
    }
    if (session?.user?.email && emailRef.current && !emailRef.current.value) {
      emailRef.current.value = session.user.email;
    }
  }, [session?.user?.email, session?.user?.name, state.success]);

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help &amp; Support</h1>
        <p className="text-muted-foreground mt-2">
          Find quick answers or reach out for assistance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-soft border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Send us a message through secure Gmail SMTP and we’ll get back shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
                <Input
                  ref={nameRef}
                  id="name"
                  name="name"
                  placeholder="Your name"
                  defaultValue={session?.user?.name ?? ""}
                  aria-invalid={Boolean(state.fieldErrors?.name)}
                />
                {state.fieldErrors?.name && (
                  <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
                <Input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue={session?.user?.email ?? ""}
                  aria-invalid={Boolean(state.fieldErrors?.email)}
                />
                {state.fieldErrors?.email && (
                  <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="subject">Subject</label>
              <Input
                id="subject"
                name="subject"
                placeholder="How can we help?"
                aria-invalid={Boolean(state.fieldErrors?.subject)}
              />
              {state.fieldErrors?.subject && (
                <p className="text-xs text-destructive">{state.fieldErrors.subject}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="message">Message</label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe the issue or question..."
                rows={5}
                aria-invalid={Boolean(state.fieldErrors?.message)}
              />
              {state.fieldErrors?.message && (
                <p className="text-xs text-destructive">{state.fieldErrors.message}</p>
              )}
            </div>
            <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-soft border-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Email</CardTitle>
                <CardDescription>uam@ahmadx.dev</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We usually respond within one business day.
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Community</CardTitle>
                <CardDescription>Join the discussion</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Ask questions, share tips, and see common solutions.
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Docs &amp; Guides</CardTitle>
                <CardDescription>Getting started resources</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Review how to add semesters, courses, and interpret GPA/CGPA.
            </CardContent>
          </Card>

          <Separator />

          <p className="text-xs text-muted-foreground">
            Tip: For urgent account issues (like sign-in problems), email us directly with your registered address.
          </p>
        </div>
      </div>

      <Dialog
        open={resultDialogOpen}
        onOpenChange={(open) => {
          if (!open) setDismissedResultId(resultId);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div
              className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${
                state.success
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {state.success ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <DialogTitle className="text-center">
              {state.success ? "Message sent" : "Message not sent"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {state.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setDismissedResultId(resultId)}
            >
              {state.success ? "Done" : "Okay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="font-semibold shadow-soft">
      {pending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
      {pending ? "Sending..." : "Send message"}
    </Button>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageCircle, BookOpen } from "lucide-react";

export default function SupportPage() {
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
            <CardDescription>Send us a message and we’ll get back shortly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="subject">Subject</label>
              <Input id="subject" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="message">Message</label>
              <Textarea id="message" placeholder="Describe the issue or question..." rows={4} />
            </div>
            <Button>Send message</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-soft border-border/60">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Email</CardTitle>
                <CardDescription>support@gpa-tracker.app</CardDescription>
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
    </div>
  );
}

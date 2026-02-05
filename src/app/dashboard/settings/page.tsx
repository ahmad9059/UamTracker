"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Update your account preferences and notification settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft border-border/60">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Keep your account details up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="you@example.com" type="email" />
            </div>
            <Button className="mt-2">Save changes</Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-border/60">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what updates you’d like to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Semester updates</p>
                <p className="text-sm text-muted-foreground">Reminders about GPA changes and new courses.</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} aria-label="Semester updates" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Product news</p>
                <p className="text-sm text-muted-foreground">Release notes, tips, and feature announcements.</p>
              </div>
              <Switch checked={false} onCheckedChange={() => {}} aria-label="Product news" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security alerts</p>
                <p className="text-sm text-muted-foreground">Unusual activity or sign-in alerts.</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} aria-label="Security alerts" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft border-border/60">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Manage sensitive actions for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

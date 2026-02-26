"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { createSemester } from "@/app/actions/semester-actions";

export function CreateSemesterDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createSemester(name);

    if (!result.success) {
      setError(result.error || "Failed to create semester");
      setIsLoading(false);
      return;
    }

    setOpen(false);
    setName("");
    router.refresh();

    // Navigate to the new semester
    if (result.data?.id) {
      router.push(`/dashboard/semester/${result.data.id}`);
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-10 bg-gradient-to-r from-primary to-primary/90 transition-all duration-200 text-white rounded-xl font-semibold">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Semester
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Create New Semester</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Add a new semester to track your courses and GPA.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="py-4">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Semester Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Fall 2024, Spring 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use a descriptive name like &quot;Fall 2024&quot; or &quot;Spring 2025&quot;
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              size="sm"
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/90 transition-all duration-200 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Semester
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

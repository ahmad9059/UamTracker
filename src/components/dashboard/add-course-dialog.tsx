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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

import { createCourse } from "@/app/actions/course-actions";
import { type TotalMarksType, VALID_TOTAL_MARKS } from "@/lib/quality-points";

interface AddCourseDialogProps {
  semesterId: string;
}

export function AddCourseDialog({ semesterId }: AddCourseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [totalMarks, setTotalMarks] = useState<TotalMarksType>(100);
  const [obtainedMarks, setObtainedMarks] = useState("");
  const [isAudit, setIsAudit] = useState(false);

  function resetForm() {
    setName("");
    setCreditHours("");
    setTotalMarks(100);
    setObtainedMarks("");
    setIsAudit(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const creditHoursNum = parseFloat(creditHours);
    const obtainedMarksNum = parseFloat(obtainedMarks || "0");

    if (!isAudit) {
      if (isNaN(creditHoursNum) || creditHoursNum <= 0) {
        setError("Credit hours must be a positive number");
        setIsLoading(false);
        return;
      }

      if (isNaN(obtainedMarksNum) || obtainedMarksNum < 0) {
        setError("Obtained marks must be 0 or greater");
        setIsLoading(false);
        return;
      }

      if (obtainedMarksNum > totalMarks) {
        setError(`Obtained marks cannot exceed ${totalMarks}`);
        setIsLoading(false);
        return;
      }
    }

    const result = await createCourse(semesterId, {
      name: name.trim(),
      creditHours: creditHoursNum,
      totalMarks,
      obtainedMarks: obtainedMarksNum,
      isAudit,
    });

    if (!result.success) {
      setError(result.error || "Failed to add course");
      setIsLoading(false);
      return;
    }

    setOpen(false);
    resetForm();
    router.refresh();
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Enter the course details to add it to this semester.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                placeholder="e.g., Introduction to Computer Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Audit / Pass Course</p>
                <p className="text-xs text-muted-foreground">No GPA impact. Shows grade as P (Pass).</p>
              </div>
              <Switch
                checked={isAudit}
                onCheckedChange={(checked) => {
                  setIsAudit(checked);
                  if (checked) {
                    setCreditHours("0");
                    setObtainedMarks("0");
                  } else {
                    setCreditHours("");
                    setObtainedMarks("");
                  }
                }}
                disabled={isLoading}
                aria-label="Mark as audit course"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="creditHours">Credit Hours</Label>
                <Input
                  id="creditHours"
                  type="number"
                  placeholder={isAudit ? "0 (audit)" : "3"}
                  min="0"
                  step="0.5"
                  value={creditHours}
                  onChange={(e) => setCreditHours(e.target.value)}
                  disabled={isLoading || isAudit}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Select
                  value={String(totalMarks)}
                  onValueChange={(value) => setTotalMarks(parseInt(value) as TotalMarksType)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_TOTAL_MARKS.map((marks) => (
                      <SelectItem key={marks} value={String(marks)}>
                        {marks}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="obtainedMarks">Obtained Marks</Label>
              <Input
                id="obtainedMarks"
                type="number"
                placeholder={isAudit ? `0 - ${totalMarks}` : `0 - ${totalMarks}`}
                min="0"
                max={totalMarks}
                step="0.5"
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !name.trim() ||
                (!isAudit && (!creditHours || !obtainedMarks))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

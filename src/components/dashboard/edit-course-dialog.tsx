"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Loader2, Save } from "lucide-react";

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

import { updateCourse } from "@/app/actions/course-actions";
import { type TotalMarksType, VALID_TOTAL_MARKS } from "@/lib/quality-points";

interface EditCourseDialogProps {
  courseId: string;
  semesterId: string;
  initialData: {
    name: string;
    creditHours: number;
    totalMarks: TotalMarksType;
    obtainedMarks: number;
    isAudit?: boolean;
  };
}

export function EditCourseDialog({ courseId, semesterId, initialData }: EditCourseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData.name);
  const [creditHours, setCreditHours] = useState(String(initialData.creditHours));
  const [totalMarks, setTotalMarks] = useState<TotalMarksType>(initialData.totalMarks);
  const [obtainedMarks, setObtainedMarks] = useState(String(initialData.obtainedMarks));
  const [isAudit, setIsAudit] = useState(Boolean(initialData.isAudit));

  function resetForm() {
    setName(initialData.name);
    setCreditHours(String(initialData.creditHours));
    setTotalMarks(initialData.totalMarks);
    setObtainedMarks(String(initialData.obtainedMarks));
    setIsAudit(Boolean(initialData.isAudit));
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

    const result = await updateCourse(courseId, {
      name: name.trim(),
      creditHours: creditHoursNum,
      totalMarks,
      obtainedMarks: obtainedMarksNum,
      isAudit,
    });

    if (!result.success) {
      setError(result.error || "Failed to update course");
      setIsLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details below.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Course Name</Label>
              <Input
                id="edit-name"
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
                    setCreditHours(String(initialData.creditHours || 0));
                    setObtainedMarks(String(initialData.obtainedMarks || 0));
                  }
                }}
                disabled={isLoading}
                aria-label="Mark as audit course"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-creditHours">Credit Hours</Label>
                <Input
                  id="edit-creditHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={creditHours}
                  onChange={(e) => setCreditHours(e.target.value)}
                  disabled={isLoading || isAudit}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-totalMarks">Total Marks</Label>
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
              <Label htmlFor="edit-obtainedMarks">Obtained Marks</Label>
              <Input
                id="edit-obtainedMarks"
                type="number"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

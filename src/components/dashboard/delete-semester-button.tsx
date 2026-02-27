"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteSemester } from "@/app/actions/semester-actions";

interface DeleteSemesterButtonProps {
  semesterId: string;
  semesterName: string;
}

export function DeleteSemesterButton({ semesterId, semesterName }: DeleteSemesterButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsLoading(true);

    const result = await deleteSemester(semesterId);

    if (result.success) {
      router.refresh();
    } else {
      console.error("Failed to delete semester:", result.error);
    }

    setIsLoading(false);
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Semester
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>&quot;{semesterName}&quot;</strong>?
            This will also delete all courses in this semester. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

-- Add audit flag to courses while keeping existing data
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "isAudit" BOOLEAN NOT NULL DEFAULT false;

-- Composite indexes for the app's authenticated dashboard and admin query paths.
CREATE INDEX IF NOT EXISTS "User_createdAt_desc_idx" ON "User"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_createdAt_desc_idx" ON "Session"("expiresAt", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Account_userId_providerId_idx" ON "Account"("userId", "providerId");
CREATE INDEX IF NOT EXISTS "Verification_identifier_value_idx" ON "Verification"("identifier", "value");
CREATE INDEX IF NOT EXISTS "Verification_expiresAt_idx" ON "Verification"("expiresAt");
CREATE INDEX IF NOT EXISTS "Semester_userId_createdAt_idx" ON "Semester"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Semester_updatedAt_desc_idx" ON "Semester"("updatedAt" DESC);
CREATE INDEX IF NOT EXISTS "Course_semesterId_createdAt_idx" ON "Course"("semesterId", "createdAt");
CREATE INDEX IF NOT EXISTS "Course_updatedAt_desc_idx" ON "Course"("updatedAt" DESC);

-- Dashboard search uses case-insensitive substring matching; pg_trgm keeps it fast.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "Semester_name_trgm_idx" ON "Semester" USING GIN (lower("name") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Course_name_trgm_idx" ON "Course" USING GIN (lower("name") gin_trgm_ops);

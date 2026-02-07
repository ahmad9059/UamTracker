# GPA Tracker (UAM University)

A production‑ready Next.js application that helps UAM‑University students calculate GPA and CGPA, manage semesters and courses, and visualize academic progress. The app combines a public calculator with an authenticated dashboard backed by Prisma, PostgreSQL, and Better Auth (email/password plus Google).

---

## Features
- **Landing + Public Calculator** – Anyone can calculate GPA/CGPA using UAM’s official grading tables without signing in.
- **Authenticated Dashboard** – Create semesters, add/edit/delete courses, view per‑semester GPA, cumulative CGPA, and credit/quality‑point totals.
- **UAM Grading Model** – Exact per‑mark quality‑point tables for totals 20/40/60/80/100 (see `data/GPA.md`), audit/pass courses excluded from GPA.
- **Charts & Insights** – Bar/line GPA trends (Recharts) and stat cards summarizing credits, quality points, and CGPA.
- **Account & Sessions** – Better Auth with Prisma adapter, Google OAuth, secure cookies, middleware‑protected dashboard routes.
- **Responsive UI** – Next.js App Router, modern UI primitives, animated landing sections, dashboard sidebar/header layout.
- **PWA Ready** – Manifest provided; optional service worker registration for production builds (`src/components/pwa-register.tsx`).

---

## Architecture & Tech Stack
- **Framework**: Next.js 16 (App Router, server actions, dynamic rendering where needed).
- **Language**: TypeScript.
- **UI**: Tailwind CSS v4, custom components, Radix/CTA patterns, Recharts for data viz.
- **State/Form**: React 19, React Hook Form + Zod validation.
- **Auth**: Better Auth (email/password + Google) with Prisma adapter.
- **Database**: PostgreSQL (Neon‑compatible). ORM via Prisma 5.
- **Charts**: Recharts (bar/area for GPA trends).
- **Utilities**: UUID, class-variance-authority, clsx, tailwind-merge.

---

## Data Model (Prisma)
`prisma/schema.prisma`
- `User` – core profile, has many `Semester`, `Session`, `Account`.
- `Semester` – name, belongs to `User`, has many `Course`.
- `Course` – name, creditHours (float), totalMarks (int), obtainedMarks (float), isAudit (bool).
- `Session`, `Account`, `Verification` – managed by Better Auth.

---

## GPA/CGPA Logic
- Quality points come from `src/lib/quality-points.ts`, generated from `data/GPA.md`.
- **GPA formula**: Σ(quality points) / Σ(credit hours) for non‑audit courses only.
- **CGPA formula**: Σ(semester quality points) / Σ(semester credit hours).
- Audit/pass courses (`isAudit=true`) contribute grade `P` and are excluded from totals.
- Supported total marks: 20, 40, 60, 80, 100 (validated by Zod).

---

## Project Structure (key paths)
- `src/app/page.tsx` – landing composition.
- `src/app/calculator/page.tsx` – public calculator experience.
- `src/app/(auth)/login|register` – auth pages (Better Auth client hooks).
- `src/app/dashboard/*` – protected experience (overview, calculator, semesters, settings, support).
- `src/app/actions/*` – server actions for semesters/courses (auth‑guarded).
- `src/components/dashboard/*` – dashboard layout, dialogs, charts, buttons.
- `src/lib/*` – auth, DB client, GPA logic, validation schemas, utilities.
- `prisma/schema.prisma` – database schema.
- `data/GPA.md` – authoritative grading/quality‑point table.

---

## Prerequisites
- Node.js 20+
- pnpm (recommended) or npm/yarn
- PostgreSQL URL (Neon or any Postgres)
- Google OAuth credentials (for social login)

---

## Environment Variables (`.env.local`)
```bash
DATABASE_URL=postgres://user:pass@host:5432/db
BETTER_AUTH_URL=http://localhost:3000          # or your deployed base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000       # used by client auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Optional: VERCEL_URL is injected on Vercel; Better Auth will prefer it for cookies.
```

> In production, ensure HTTPS so Better Auth issues `__Secure-` cookies. `auth` picks `VERCEL_URL` over localhost to avoid wrong-domain cookies on Vercel.

---

## Setup & Running Locally
```bash
pnpm install            # installs deps and runs postinstall (prisma generate)
pnpm prisma migrate dev # create/migrate DB (prompt for name)
pnpm dev                # start Next.js on http://localhost:3000
```

Other scripts:
- `pnpm build` – `prisma generate` then `next build`
- `pnpm start` – production server
- `pnpm lint` – ESLint

---

## Database & Migrations
- Prisma client generation happens on `postinstall` and `build`.
- Run `pnpm prisma migrate dev` for local changes; use `prisma migrate deploy` in CI/prod.
- Models use cascade deletes for semesters/courses tied to a user.

---

## Authentication Flow
- Middleware (`src/middleware.ts`) protects `/dashboard/**`; unauthenticated users are redirected to `/login` with `callbackUrl`.
- Session retrieval in layouts uses `auth.api.getSession` with forwarded cookies to support SSR and server actions.
- Google sign‑in/sign‑up available; fallback email/password with validation and friendly errors.

---

## GPA Calculator Details
- Calculator maps credit hours 1–5 to total marks (×20) for convenience; validation prevents over‑max marks.
- Audit courses are flagged and excluded from GPA math while still displayed with grade `P`.
- GPA/CGPA recompute reactively; dashboards reuse the same core functions used by server actions.

---

## Deployment Notes
- Optimized for Vercel (auth route uses `runtime = "nodejs"`).
- Set all environment variables in the hosting provider.
- Ensure migrations are applied before first start.
- PWA: add `public/sw.js` if enabling service worker; manifest is already configured.

---

## Support & Contact
- In‑app support page (`/dashboard/support`) provides quick contact and docs pointers.
- For production incidents (auth, data), rotate secrets and reissue sessions.

---

## Contributing
1) Fork/branch, create feature/fix.  
2) Keep TypeScript strictness and ESLint passing.  
3) Add/update Prisma migrations when touching the schema.  
4) Open a PR with clear testing notes (manual steps are acceptable).  

---

## License
Proprietary – contact the maintainer for reuse permissions.

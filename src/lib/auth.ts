import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

// Resolve the correct public origin so cookies are issued for the domain the app
// actually runs on (Vercel preview/prod or localhost). In production, Vercel
// injects VERCEL_URL (without protocol). Prefer it over a localhost env value to
// avoid setting cookies for the wrong domain and getting kicked back to /login.
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const envBaseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

const baseURL =
  (vercelUrl && envBaseUrl?.includes("localhost") ? vercelUrl : envBaseUrl) ||
  vercelUrl ||
  "http://localhost:3000";

const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      envBaseUrl,
      vercelUrl,
      "https://uam-tracker.vercel.app",
    ].filter(Boolean)
  )
) as string[];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api/auth",
  baseURL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
    // Force secure cookies in prod so Better Auth uses __Secure- prefix
    // and SameSite=Lax+Secure. Keeps login working on Vercel.
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;

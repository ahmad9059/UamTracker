import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Ensure this handler runs in the Node.js runtime on Vercel.
export const runtime = "nodejs";

export const { POST, GET } = toNextJsHandler(auth);

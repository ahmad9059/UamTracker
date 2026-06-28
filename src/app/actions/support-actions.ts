"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";
import { supportSchema } from "@/lib/validation";

export type SupportActionState = {
  success: boolean;
  message: string;
  submissionId?: number;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
};

async function getAuthenticatedUser() {
  const cookieHeader = (await headers()).get("cookie");
  const session = await auth.api.getSession(
    cookieHeader ? { headers: { cookie: cookieHeader } } : undefined
  );

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to contact support");
  }

  return session.user;
}

export async function submitSupportRequest(
  _prevState: SupportActionState,
  formData: FormData
): Promise<SupportActionState> {
  try {
    const user = await getAuthenticatedUser();
    const raw = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    };

    const result = supportSchema.safeParse(raw);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please fix the highlighted fields.",
        submissionId: Date.now(),
        fieldErrors: {
          name: errors.name?.[0],
          email: errors.email?.[0],
          subject: errors.subject?.[0],
          message: errors.message?.[0],
        },
      };
    }

    await sendSupportEmail({
      ...result.data,
      accountEmail: user.email,
    });

    return {
      success: true,
      message: "Message sent successfully. We will get back to you shortly.",
      submissionId: Date.now(),
    };
  } catch (error) {
    console.error("Support request failed:", error);
    return {
      success: false,
      submissionId: Date.now(),
      message:
        error instanceof Error ? error.message : "Failed to send message. Please try again.",
    };
  }
}

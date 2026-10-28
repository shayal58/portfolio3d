import { z } from "zod";

// ============================================
// SECTION 5: CONTACT FORM RULES
// One schema, used by the form (instant feedback)
// and by the server (the check that counts).
// ============================================
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "That name is too long (80 characters max)."),
  email: z.string().trim().max(120, "That email is too long.").pipe(z.email("Please enter a valid email address.")),
  subject: z.string().trim().min(3, "Please add a short subject.").max(120, "Keep the subject under 120 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Your message is a little short. Add a few more details.")
    .max(4000, "Please keep the message under 4,000 characters."),
  /** Honeypot: hidden from people, filled in by spam bots. Must stay empty. */
  company: z.string().max(0).optional().default(""),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = "name" | "email" | "subject" | "message";

/** Field → first error message, for showing next to each input. */
export function fieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ContactField;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** What the API answers. */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: "invalid"; fields: Partial<Record<ContactField, string>> }
  | { ok: false; error: "not_configured" | "rate_limited" | "send_failed" | "bad_request" };

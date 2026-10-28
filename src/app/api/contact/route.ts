import { NextResponse } from "next/server";
import { contactSchema, fieldErrors, type ContactResponse } from "@/lib/contact";

// ============================================
// SECTION 5: CONTACT FORM DELIVERY
// Sends form messages to your inbox through Resend
// (resend.com, free tier). Set these environment
// variables in Vercel → Settings → Environment
// Variables (and in .env.local for local testing):
//   RESEND_API_KEY     your Resend API key
//   CONTACT_TO_EMAIL   where messages should arrive
//   CONTACT_FROM_EMAIL optional sender; defaults to
//                      Resend's test sender, which can
//                      only deliver to your own Resend
//                      account email.
// Until the first two are set, the form stays hidden.
// ============================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };

// Best-effort, per server instance. Stops casual repeat submissions.
const hits = new Map<string, number[]>();

function configured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

function reply(body: ContactResponse, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Lets the page know whether to show the form. */
export function GET() {
  return NextResponse.json({ enabled: configured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!configured()) return reply({ ok: false, error: "not_configured" }, 503);

  // Rate limit by client address.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) return reply({ ok: false, error: "rate_limited" }, 429);

  // Parse, with a size cap.
  let data: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return reply({ ok: false, error: "bad_request" }, 413);
    data = JSON.parse(raw);
  } catch {
    return reply({ ok: false, error: "bad_request" }, 400);
  }

  // Bots fill the hidden field. Answer like a success so they move on.
  if (data && typeof data === "object" && "company" in data && (data as { company?: unknown }).company) {
    return reply({ ok: true }, 200);
  }

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return reply({ ok: false, error: "invalid", fields: fieldErrors(parsed.error) }, 422);
  }

  const { name, email, subject, message } = parsed.data;
  recent.push(now);
  hits.set(ip, recent);

  try {
    // RESEND_API_URL is only for testing against a mock server; leave it unset.
    const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + String(process.env.RESEND_API_KEY),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `Portfolio: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}\n\n— Sent from the contact form on your portfolio`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    // Only report success once Resend has accepted the email.
    if (!res.ok) {
      console.error("Contact form: Resend rejected the message", res.status, await res.text().catch(() => ""));
      return reply({ ok: false, error: "send_failed" }, 502);
    }
    return reply({ ok: true }, 200);
  } catch (err) {
    console.error("Contact form: could not reach Resend", err);
    return reply({ ok: false, error: "send_failed" }, 502);
  }
}

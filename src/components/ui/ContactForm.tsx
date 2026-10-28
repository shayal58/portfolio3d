"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, Github, Loader2, Send } from "lucide-react";
import { contactSchema, fieldErrors, type ContactField, type ContactResponse } from "@/lib/contact";
import { profile } from "@/data/profile";
import { WhatsAppLink } from "./WhatsAppLink";

type Status = "checking" | "disabled" | "idle" | "sending" | "sent" | "error";

const FIELDS: Array<{ name: ContactField; label: string; type?: string; rows?: number; autoComplete?: string }> = [
  { name: "name", label: "name", autoComplete: "name" },
  { name: "email", label: "email", type: "email", autoComplete: "email" },
  { name: "subject", label: "subject" },
  { name: "message", label: "message", rows: 5 },
];

const ERROR_TEXT: Record<string, string> = {
  rate_limited: "Too many messages in a short time. Please wait a few minutes and try again.",
  send_failed: "The message couldn't be delivered right now. Please try again, or reach me on GitHub.",
  not_configured: "The form isn't connected yet. Please reach me on GitHub instead.",
  bad_request: "Something went wrong with the form. Please refresh the page and try again.",
  network: "Couldn't reach the server. Check your connection and try again.",
};

/**
 * Terminal-style contact form. It only says a message was sent after the
 * server confirms the email service accepted it. Hidden (with a GitHub
 * fallback) until email delivery is configured on the server.
 */
export function ContactForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>("checking");
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contact", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => !cancelled && setStatus(d.enabled ? "idle" : "disabled"))
      .catch(() => !cancelled && setStatus("disabled"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    // Instant check in the browser; the server checks again.
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fe = fieldErrors(parsed.error);
      setErrors(fe);
      const first = FIELDS.find((f) => fe[f.name]);
      if (first) (form.elements.namedItem(first.name) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    setBanner(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({ ok: false, error: "bad_request" }))) as ContactResponse;
      if (body.ok) {
        setSentTo(parsed.data.email);
        setStatus("sent");
        form.reset();
        return;
      }
      if (body.error === "invalid") setErrors(body.fields);
      else setBanner(ERROR_TEXT[body.error] ?? ERROR_TEXT.bad_request);
      setStatus(body.error === "not_configured" ? "disabled" : "error");
    } catch {
      setBanner(ERROR_TEXT.network);
      setStatus("error");
    }
  }

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* Terminal title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 font-mono text-[11px] text-muted">
        <span className="truncate">shayal@bharatpur:~/contact</span>
        <span className="inline-flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className={`size-2 rounded-full ${
              status === "idle" || status === "sending" || status === "sent" || status === "error"
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                : "bg-muted/50"
            }`}
          />
          {status === "checking" ? "connecting…" : status === "disabled" ? "offline" : "online"}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {status === "checking" && <p className="font-mono text-sm text-muted">&gt; checking the line…</p>}

        {status === "disabled" && (
          <div className="space-y-4">
            <p className="font-mono text-sm text-muted">&gt; The message form isn&apos;t switched on yet. Reach me here instead:</p>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl border border-line bg-white/[0.03] p-4 hover:border-accent/60"
            >
              <span className="inline-flex items-center gap-3">
                <Github size={18} aria-hidden /> Reach me on GitHub
              </span>
              <ArrowUpRight size={16} aria-hidden className="text-accent" />
            </a>
            <WhatsAppLink compact />
            {process.env.NODE_ENV === "development" && (
              <p className="rounded-xl border border-dashed border-accent/40 p-3 text-xs leading-relaxed text-muted">
                Developer note (only visible in <code>npm run dev</code>): set <code>RESEND_API_KEY</code> and{" "}
                <code>CONTACT_TO_EMAIL</code> to turn the form on. See the README.
              </p>
            )}
          </div>
        )}

        {status === "sent" && (
          <div role="status" className="space-y-3 py-4">
            <p className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <CheckCircle2 size={20} aria-hidden className="text-emerald-400" /> Message delivered
            </p>
            <p className="text-sm leading-relaxed text-muted">
              Thanks for reaching out. I&apos;ll reply to <span className="text-fg">{sentTo}</span>.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase hover:text-accent-hover"
            >
              Send another message
            </button>
          </div>
        )}

        {(status === "idle" || status === "sending" || status === "error") && (
          <form noValidate onSubmit={onSubmit} className="space-y-4" aria-describedby={banner ? `${id}-banner` : undefined}>
            {FIELDS.map((f) => {
              const err = errors[f.name];
              const inputId = `${id}-${f.name}`;
              const common = {
                id: inputId,
                name: f.name,
                autoComplete: f.autoComplete,
                "aria-invalid": err ? true : undefined,
                "aria-describedby": err ? `${inputId}-error` : undefined,
                disabled: status === "sending",
                className: "w-full resize-none bg-transparent text-sm text-fg outline-none placeholder:text-muted/50",
              };
              return (
                <div key={f.name}>
                  <label
                    htmlFor={inputId}
                    className={`terminal-field flex gap-3 rounded-xl border px-4 py-3 transition-[border-color,box-shadow] ${
                      err ? "border-red-400/70" : "border-line"
                    } ${f.rows ? "items-start" : "items-center"}`}
                  >
                    <span className="shrink-0 font-mono text-xs text-accent">&gt; {f.label}</span>
                    {f.rows ? <textarea rows={f.rows} {...common} /> : <input type={f.type ?? "text"} {...common} />}
                  </label>
                  {err && (
                    <p id={`${inputId}-error`} className="mt-1.5 pl-1 text-xs text-red-300">
                      {err}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Honeypot: invisible to people and screen readers */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>

            {banner && (
              <p id={`${id}-banner`} role="alert" className="rounded-xl border border-red-400/40 bg-red-400/5 p-3 text-sm text-red-200">
                {banner}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-mono text-xs font-medium tracking-[0.18em] text-bg uppercase transition-[background-color,transform] hover:bg-accent-hover active:scale-[0.98] disabled:opacity-70"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={14} aria-hidden className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Send message <Send size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

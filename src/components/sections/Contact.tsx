"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import AnimatedText from "@/components/ui/AnimatedText";
import MagneticButton from "@/components/ui/MagneticButton";
import { formatPhone } from "@/lib/utils";
import type { CompanySetting } from "@/payload-types";

type Status = "idle" | "sending" | "sent" | "error";

/** Big closing CTA + contact form (posts to /api/contact). */
export default function Contact({ company }: { company: CompanySetting }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const activeSocials = (company.socials ?? []).filter((s) => Boolean(s.href));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Something went wrong");
      setStatus("sent");
      track("contact_submitted");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
      track("contact_failed");
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container-x">
        {/* CTA */}
        <div className="text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="eyebrow">Contact</span>
          </div>
          <AnimatedText
            as="h2"
            text="Let's build the system"
            className="display-lg block"
          />
          <AnimatedText
            as="h2"
            text="your business runs on."
            className="display-lg block text-gradient"
            delay={0.1}
          />
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: details */}
          <div className="lg:col-span-5">
            <p className="text-fg-dim" data-reveal>
              Tell us what&apos;s manual, slow, or held together by memory right
              now — that&apos;s usually where we start. We reply within 24 hours,
              and the first conversation is about your problem, not a pitch
              deck.
            </p>
            <a
              href={`mailto:${company.email}`}
              data-cursor="button"
              className="group mt-8 inline-flex items-center gap-2 font-display text-xl font-medium md:text-2xl"
            >
              <span className="border-b border-transparent transition-colors group-hover:border-white">
                {company.email}
              </span>
            </a>
            {company.phone && (
              <a
                href={`tel:+${company.phone}`}
                data-cursor="button"
                className="group mt-3 flex items-center gap-2 font-display text-xl font-medium md:text-2xl"
              >
                <span className="border-b border-transparent transition-colors group-hover:border-white">
                  {formatPhone(company.phone)}
                </span>
              </a>
            )}
            <div className="mt-10">
              <p className="eyebrow mb-4">Elsewhere</p>
              <div className="flex flex-wrap gap-3">
                {company.phone && (
                  <a
                    href={`https://wa.me/${company.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="button"
                    className="rounded-full border border-line px-4 py-2 text-sm text-fg-dim transition-colors hover:border-white hover:text-white"
                  >
                    WhatsApp
                  </a>
                )}
                {activeSocials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href as string}
                    data-cursor="button"
                    className="rounded-full border border-line px-4 py-2 text-sm text-fg-dim transition-colors hover:border-white hover:text-white"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <p className="mt-10 font-mono text-xs uppercase tracking-widest text-fg-faint" data-reveal>
              {company.location}
            </p>
            {company.officeAddress && (
              <p className="mt-2 max-w-xs font-mono text-xs uppercase tracking-widest text-fg-faint" data-reveal>
                {company.officeAddress}
              </p>
            )}
          </div>

          {/* Right: form */}
          <form onSubmit={onSubmit} className="glass rounded-3xl p-6 md:p-8 lg:col-span-7" data-reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Name" name="name" placeholder="Jane Doe" required />
              <Field label="Email" name="email" type="email" placeholder="jane@company.com" required />
            </div>
            <div className="mt-5">
              <Field label="Company" name="company" placeholder="Acme Inc." />
            </div>
            {/* Honeypot — hidden from people, catnip for bots. Not `display:none`,
                which some bots skip; off-screen and untabbable instead. */}
            <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
              <label>
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="mt-5">
              <label className="eyebrow mb-2 block">How can we help?</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Tell us about your project, or just say you'd like to talk it through first."
                className="w-full resize-none rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fg-faint focus:border-accent"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                data-cursor="button"
                disabled={status === "sending" || status === "sent"}
                className="btn btn-primary disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send message"}
              </button>
              {status === "sent" && (
                <span className="text-sm text-accent">Thanks — we&apos;ll be in touch shortly.</span>
              )}
              {status === "error" && (
                <span className="text-sm text-red-400">
                  {error}{" "}
                  <a href={`mailto:${company.email}`} className="underline hover:text-white">
                    Email us directly
                  </a>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* big CTA button */}
        <div className="mt-20 flex justify-center" data-reveal>
          <MagneticButton href={`mailto:${company.email}`} variant="ghost" className="!px-8 !py-5 !text-lg" strength={0.5}>
            Or just say hello →
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="eyebrow mb-2 block">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fg-faint focus:border-accent"
      />
    </div>
  );
}

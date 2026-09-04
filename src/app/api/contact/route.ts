import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Contact form endpoint.
 *
 * Delivery is attempted through every configured channel. The request only
 * succeeds if at least one of them actually accepted the lead — an enquiry that
 * was silently dropped must never look like a success to the sender.
 *
 * Writing to the Payload Leads collection needs no configuration and always
 * runs — every enquiry shows up in /admin regardless of which optional
 * channels below are set up, so a fresh deploy with no env vars configured
 * yet still never drops a real lead.
 *
 * Optional env:
 *   RESEND_API_KEY              enables email delivery
 *   CONTACT_TO_EMAIL            defaults to muneeb24400@gmail.com
 *   CONTACT_FROM_EMAIL          defaults to onboarding@resend.dev
 *   NEXT_PUBLIC_SUPABASE_URL    enables persistence to a `leads` table
 *   SUPABASE_SERVICE_ROLE_KEY   (server-only)
 *   FORMSPREE_ENDPOINT          enables forwarding to a Formspree form
 */

type Lead = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  /** Honeypot — real users never fill this, bots usually do. */
  website?: string;
};

type StoredLead = Required<Omit<Lead, "website">> & { received_at: string };

const FALLBACK_EMAIL = "muneeb24400@gmail.com";

// 8kb is generous for name/email/company/message — a legitimate
// submission is a few hundred bytes. Rejecting oversized bodies before
// `request.json()` parses them avoids fully buffering an attacker-sent
// multi-megabyte payload into memory just to then reject it.
const MAX_BODY_BYTES = 8 * 1024;

/**
 * Minimal per-IP rate limit for a single low-traffic public endpoint — a
 * fixed window counter in memory, not a shared/distributed store. That's a
 * real, known limitation (resets on restart, doesn't span multiple server
 * instances) that's an acceptable tradeoff for a contact form's actual
 * traffic and threat model; it isn't a general-purpose rate limiter.
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function clientIp(request: Request): string {
  // Most hosts (including Vercel) set this; falls back to a shared bucket
  // if it's ever absent rather than throwing, since this is abuse mitigation,
  // not an access-control decision.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

async function sendEmail(lead: StoredLead): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const to = process.env.CONTACT_TO_EMAIL || FALLBACK_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Linzido <onboarding@resend.dev>";

  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company || "—"],
  ];

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px">
      <h2 style="color:#c41a2e;margin:0 0 16px">New enquiry via linzido.com</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#666;white-space:nowrap">${k}</td>` +
              `<td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`
          )
          .join("")}
      </table>
      <div style="padding:16px;background:#f6f6f6;border-left:3px solid #c41a2e;white-space:pre-wrap">${escapeHtml(
        lead.message
      )}</div>
      <p style="color:#999;font-size:12px;margin-top:20px">Received ${lead.received_at}</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `New enquiry — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
        reply_to: lead.email,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend rejected the lead:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend request failed:", err);
    return false;
  }
}

async function persist(lead: StoredLead): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      console.error("Supabase insert failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase request failed:", err);
    return false;
  }
}

async function saveLead(lead: StoredLead): Promise<boolean> {
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "leads",
      data: {
        name: lead.name,
        email: lead.email,
        company: lead.company || undefined,
        message: lead.message,
        receivedAt: lead.received_at,
      },
    });
    return true;
  } catch (err) {
    console.error("Writing lead to Payload failed:", err);
    return false;
  }
}

async function sendToFormspree(lead: StoredLead): Promise<boolean> {
  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) return false;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Formspree's default response is an HTML redirect; this asks for
        // JSON instead, which is what a server-side fetch actually needs.
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        company: lead.company,
        message: lead.message,
      }),
    });
    if (!res.ok) {
      console.error("Formspree rejected the lead:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Formspree request failed:", err);
    return false;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // A client could lie about this header, so it's a first line of defense,
  // not the only one — the hosting platform's own upstream request-size
  // limit (e.g. Vercel's serverless function body cap) is the real backstop.
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: Lead;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, message } = body;

  // Honeypot: accept and discard so the bot sees success and moves on.
  if (body.website) return NextResponse.json({ ok: true });

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 422 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 422 });
  }
  if (!message || typeof message !== "string" || message.trim().length < 5) {
    return NextResponse.json({ error: "Tell me a little about the project." }, { status: 422 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "That message is a little too long." }, { status: 422 });
  }

  const lead: StoredLead = {
    name: name.trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    company: body.company?.toString().trim().slice(0, 200) || "",
    message: message.trim(),
    received_at: new Date().toISOString(),
  };

  const [saved, emailed, stored, formspreed] = await Promise.all([
    saveLead(lead),
    sendEmail(lead),
    persist(lead),
    sendToFormspree(lead),
  ]);

  // saveLead needs no external configuration, so this only fails if the
  // database itself is unreachable — a genuine outage, not a missing env var.
  if (saved || emailed || stored || formspreed) {
    return NextResponse.json({ ok: true });
  }

  console.error("All delivery channels failed for lead:", lead);
  return NextResponse.json(
    { error: `Couldn't send that. Please email ${FALLBACK_EMAIL} directly.` },
    { status: 502 }
  );
}

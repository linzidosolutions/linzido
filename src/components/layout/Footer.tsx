"use client";

import Logo from "@/components/ui/Logo";
import { NAV_LINKS } from "@/lib/site";
import { formatPhone } from "@/lib/utils";
import type { CompanySetting } from "@/payload-types";

export default function Footer({ company }: { company: CompanySetting }) {
  const year = new Date().getFullYear();
  const activeSocials = (company.socials ?? []).filter((s) => Boolean(s.href));
  return (
    <footer className="relative z-10 overflow-hidden border-t border-line bg-bg pt-20">
      {/* oversized wordmark */}
      <div className="container-x">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo className="text-2xl" />
            <p className="mt-5 max-w-xs text-sm text-fg-dim">
              {company.tagline}
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-fg-faint">
              {company.location}
            </p>
            {company.officeAddress && (
              <p className="mt-2 max-w-xs font-mono text-xs uppercase tracking-widest text-fg-faint">
                {company.officeAddress}
              </p>
            )}
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <p className="eyebrow mb-4">Sitemap</p>
            <ul className="flex flex-col gap-2 text-sm text-fg-dim">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} data-cursor="button" className="transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Connect</p>
            <ul className="flex flex-col gap-2 text-sm text-fg-dim">
              {company.phone && (
                <li>
                  <a href={`tel:+${company.phone}`} data-cursor="button" className="transition-colors hover:text-white">
                    {formatPhone(company.phone)}
                  </a>
                </li>
              )}
              {company.phone && (
                <li>
                  <a
                    href={`https://wa.me/${company.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="button"
                    className="transition-colors hover:text-white"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {activeSocials.map((s) => (
                <li key={s.label}>
                  <a href={s.href as string} data-cursor="button" className="transition-colors hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-line py-6 md:flex-row">
          <p className="font-mono text-xs text-fg-faint">
            © {year} {company.name}. Built by the same team that runs it.
          </p>
          <p className="font-mono text-xs text-fg-faint">
            Built with Next.js · GSAP · Three.js
          </p>
        </div>
      </div>

      {/* giant fading wordmark */}
      <div className="pointer-events-none select-none overflow-hidden">
        <p className="translate-y-[18%] text-center font-display text-[22vw] font-medium leading-none tracking-tighter text-white/[0.03]">
          Linzido
        </p>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { useStageMode } from "@/hooks/useStageMode";
import { patchUnmountRace } from "@/lib/patchUnmountRace";

patchUnmountRace();
import type { ServiceWithSubServices } from "@/lib/payload-data";
import type {
  Project,
  ProcessStep,
  TeamMember,
  CompanySetting,
  Testimonial,
} from "@/payload-types";

import SmoothScroll from "@/components/providers/SmoothScroll";
import Background from "@/components/layout/Background";
import FlatBackdrop from "@/components/layout/FlatBackdrop";
import Cursor from "@/components/layout/Cursor";
import Preloader from "@/components/layout/Preloader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CommandPalette from "@/components/layout/CommandPalette";
import ScrollHint from "@/components/layout/ScrollHint";
import WorkshopDriver from "@/components/cinema/WorkshopDriver";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import Metrics from "@/components/sections/Metrics";
import TechStack from "@/components/sections/TechStack";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

const WorkshopStage = dynamic(() => import("@/components/three/WorkshopStage"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  services: ServiceWithSubServices[];
  projects: Project[];
  processSteps: ProcessStep[];
  timeline: NonNullable<CompanySetting["timeline"]>;
  founderNote: string;
  founder?: TeamMember;
  founders?: TeamMember[];
  company: CompanySetting;
  testimonials: Testimonial[];
};

export default function Experience({
  services,
  projects,
  processSteps,
  timeline,
  founderNote,
  founder,
  founders,
  company,
  testimonials,
}: Props) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const stage = useStageMode();
  const is3D = stage === "3d";
  useReveal();

  useEffect(() => {
    registerGsap();
    // `stage` starts "flat" on every load and can upgrade to "3d" a moment
    // later (see useStageMode), which drastically changes total page height
    // once WorkshopDriver's 10,000px pin mounts. Two things cache their own
    // idea of "how tall is this page" before that happens and need telling
    // afterward: GSAP's ScrollTrigger (refresh) and Lenis itself (resize) —
    // Lenis's own `limit` was confirmed stuck at the pre-3D scroll height,
    // which silently caps how far the user can actually scroll until it
    // self-corrects on its own resize observer.
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      (window as unknown as { __lenis?: { resize: () => void } }).__lenis?.resize();
    }, 120);
    return () => clearTimeout(t);
  }, [is3D]);

  return (
    <SmoothScroll>
      <Preloader onDone={() => setReady(true)} />

      {/* Fixed background — always behind the sections */}
      {is3D ? (
        <WorkshopStage
          projects={projects}
          founder={founder}
          founders={founders}
          founderNote={founderNote}
          company={company}
          services={services}
          testimonials={testimonials}
        />
      ) : (
        <FlatBackdrop />
      )}
      <Background particles={!is3D} />

      <Cursor />
      <Navbar onOpenPalette={() => setPaletteOpen(true)} company={company} />
      <CommandPalette
        open={paletteOpen}
        setOpen={setPaletteOpen}
        services={services}
        company={company}
      />

      {/* Scroll-to-top target for the navbar logo, present in either mode. */}
      <div id="top" className="absolute top-0 h-px w-px" aria-hidden />

      {/*
        The cinematic 3D scene doubles as the desktop hero, so its 10,000px
        pinned scroll region only exists when it's actually visible. Without
        this gate, mobile/no-WebGL/reduced-motion visitors landed on an empty
        background for 13+ screen-heights before reaching any real content —
        they get a real hero section instead.
      */}
      {is3D ? (
        <>
          {/*
            In 3D mode the page's only H1 lives inside Hero, which doesn't
            render here — the pitch is delivered as a WebGL canvas texture
            instead of real text. That left the page with zero H1s for both
            screen readers and search engines whenever this branch was
            active. This sr-only heading (visually identical to nothing —
            it's never seen) restores exactly one H1 without touching the
            visible design in either mode.
          */}
          <h1 className="sr-only">
            {company.name} — {company.tagline}
          </h1>
          <WorkshopDriver />
          <ScrollHint />
        </>
      ) : (
        <Hero ready={ready} company={company} />
      )}

      {/* Content sections — each has its own id anchor so nav links land here */}
      <main>
        <About timeline={timeline} company={company} founders={founders} />
        <Services services={services} />
        <Work projects={projects} />
        <Process steps={processSteps} />
        <Metrics metrics={company.metrics ?? []} />
        <TechStack tech={company.tech ?? []} />
        <Testimonials testimonials={testimonials} />
        <Contact company={company} />
      </main>

      <Footer company={company} />
    </SmoothScroll>
  );
}

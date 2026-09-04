"use client";

import { useEffect, useRef, useMemo, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { workshopState, SCENES, sceneT, smooth } from "@/lib/workshopState";
import { projectCoverUrl } from "@/lib/media";
import { scrollToSection } from "@/lib/scrollTo";
import { ScrollTrigger } from "@/lib/gsap";
import { isLowEndDevice } from "@/lib/deviceTier";
import type {
  Project,
  TeamMember,
  CompanySetting,
  Service,
  Testimonial,
} from "@/payload-types";

/* ────────────────────────────────────────────────────────────────────────────
   Palette
   ──────────────────────────────────────────────────────────────────────────── */

const RED = "#e53935";
const RED_DIM = "#8e1510";
const HOLO = "#5aa9ff";
const WARM = "#fff0d4";

/* ────────────────────────────────────────────────────────────────────────────
   Canvas-texture helpers

   Every screen in the scene is drawn with the 2D canvas API — no image
   downloads, so the experience is interactive on first paint.
   ──────────────────────────────────────────────────────────────────────────── */

function mkTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  draw(el.getContext("2d")!);
  const t = new THREE.CanvasTexture(el);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Word-wraps admin-entered text (arbitrary length) within a fixed pixel
 * budget, ellipsizing the last line instead of overflowing the panel when
 * the copy runs long. Returns the y position after the last line drawn.
 */
function wrapText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Infinity
): number {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let drawn = 0;
  let cy = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && g.measureText(test).width > maxWidth) {
      if (drawn + 1 >= maxLines) {
        let truncated = line;
        while (truncated.length > 0 && g.measureText(`${truncated}…`).width > maxWidth) {
          truncated = truncated.slice(0, -1).trimEnd();
        }
        g.fillText(`${truncated}…`, x, cy);
        return cy;
      }
      g.fillText(line, x, cy);
      cy += lineHeight;
      drawn++;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) g.fillText(line, x, cy);
  return cy;
}

/** Desktop with a prominent ENTER button — the gateway in scene 4. */
function enterTexture() {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#07070a";
    g.fillRect(0, 0, 1024, 640);
    for (let x = 0; x < 1024; x += 64) {
      g.strokeStyle = "rgba(90,169,255,0.05)";
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 640);
      g.stroke();
    }
    for (let y = 0; y < 640; y += 64) {
      g.strokeStyle = "rgba(90,169,255,0.05)";
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1024, y);
      g.stroke();
    }
    g.fillStyle = RED;
    g.fillRect(0, 0, 1024, 5);

    g.textAlign = "center";
    g.font = "500 26px monospace";
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillText("LINZIDO  //  CREATIVE SYSTEM", 512, 180);

    g.font = "600 78px sans-serif";
    g.fillStyle = "#ffffff";
    g.fillText("Step inside", 512, 288);

    // ENTER button
    g.fillStyle = RED;
    g.fillRect(392, 352, 240, 78);
    g.font = "600 30px monospace";
    g.fillStyle = "#fff";
    g.fillText("ENTER", 512, 402);

    g.font = "22px monospace";
    g.fillStyle = "rgba(255,255,255,0.30)";
    g.fillText("keep scrolling", 512, 520);
    g.textAlign = "left";
  });
}

/**
 * The four Developer Room panels read as one funnel in the order the camera
 * passes them: hook → offer → proof → trust + action. Every one of them is
 * built from admin data, so adding a service or editing a metric in /admin
 * updates the 3D scene too. (They used to be hardcoded, which had already
 * drifted: the scene advertised a set of services the rest of the site no
 * longer offered.)
 */

/** Panel 1 — the hook. First and largest thing a visitor reads. */
function pitchTexture(p: {
  companyName: string;
  tagline: string;
  description: string;
  serviceCount: number;
}) {
  return mkTex(1024, 640, (g) => {
    const bg = g.createLinearGradient(0, 0, 1024, 640);
    bg.addColorStop(0, "#0e0b18");
    bg.addColorStop(1, "#060409");
    g.fillStyle = bg;
    g.fillRect(0, 0, 1024, 640);

    const lb = g.createLinearGradient(0, 0, 0, 640);
    lb.addColorStop(0, "#e53935");
    lb.addColorStop(0.55, "rgba(229,57,53,0.35)");
    lb.addColorStop(1, "rgba(229,57,53,0)");
    g.fillStyle = lb;
    g.fillRect(0, 0, 5, 640);

    const tg = g.createLinearGradient(0, 0, 0, 90);
    tg.addColorStop(0, "rgba(229,57,53,0.10)");
    tg.addColorStop(1, "rgba(229,57,53,0)");
    g.fillStyle = tg;
    g.fillRect(0, 0, 1024, 90);

    g.font = "600 14px sans-serif";
    g.fillStyle = "rgba(229,57,53,0.60)";
    g.fillText(`001 — ${p.companyName.toUpperCase()}`, 48, 50);

    g.font = "700 52px sans-serif";
    g.fillStyle = "#ffffff";
    const headlineEnd = wrapText(g, p.tagline, 48, 140, 900, 62, 3);

    g.strokeStyle = "rgba(255,255,255,0.10)";
    g.lineWidth = 1;
    const divY = headlineEnd + 44;
    g.beginPath(); g.moveTo(48, divY); g.lineTo(976, divY); g.stroke();

    g.font = "22px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.55)";
    wrapText(g, p.description, 48, divY + 46, 900, 34, 4);

    g.fillStyle = "rgba(229,57,53,0.13)";
    g.fillRect(48, 546, 330, 40);
    g.strokeStyle = "rgba(229,57,53,0.38)";
    g.lineWidth = 1;
    g.strokeRect(48, 546, 330, 40);
    g.font = "600 15px sans-serif";
    g.fillStyle = "#e53935";
    g.fillText(`${p.serviceCount} disciplines · one team`, 68, 572);
  });
}

/** Panel 2 — the offer. Every published service, straight from the CMS. */
function servicesTexture(p: {
  services: { index: string; title: string; desc: string }[];
}) {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#080910";
    g.fillRect(0, 0, 1024, 640);

    g.font = "600 14px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.28)";
    g.fillText("002 — SERVICES", 48, 50);

    g.font = "700 56px sans-serif";
    g.fillStyle = "#ffffff";
    g.fillText("WHAT WE DO", 48, 116);

    g.strokeStyle = "rgba(255,255,255,0.10)";
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(48, 150); g.lineTo(976, 150); g.stroke();

    // Row height adapts so the list stays inside the panel whether the admin
    // has three services or seven.
    const list = p.services.slice(0, 6);
    const top = 196;
    const rowH = Math.min(84, (600 - top) / Math.max(list.length, 1));

    list.forEach(({ index, title, desc }, i) => {
      const y = top + i * rowH;
      if (i > 0) {
        g.strokeStyle = "rgba(255,255,255,0.07)";
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(48, y - 26); g.lineTo(976, y - 26); g.stroke();
      }
      g.font = "600 15px sans-serif";
      g.fillStyle = "#e53935";
      g.fillText(index, 48, y);

      g.font = "700 27px sans-serif";
      g.fillStyle = "#ffffff";
      wrapText(g, title, 98, y, 700, 30, 1);

      g.font = "20px sans-serif";
      g.fillStyle = "rgba(229,57,53,0.50)";
      g.textAlign = "right";
      g.fillText("→", 976, y);
      g.textAlign = "left";

      g.font = "16px sans-serif";
      g.fillStyle = "rgba(255,255,255,0.40)";
      wrapText(g, desc, 98, y + 27, 820, 20, 1);
    });
  });
}

/** Panel 3 — the proof. Metrics and, when one exists, a client's own words. */
/** Panel 3 — the founder, in their own words. Same visual language as the
 * other numbered panels in this room (small label + red underline rule). */
function founderProfileTexture(p: { name: string; role: string; bio: string }) {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#080910";
    g.fillRect(0, 0, 1024, 640);

    // Same red-tint treatment as the co-founder panel (004) — top gradient
    // + left edge bar — so the two panels read as one consistent design.
    const rg = g.createLinearGradient(0, 0, 0, 100);
    rg.addColorStop(0, "rgba(229,57,53,0.08)");
    rg.addColorStop(1, "rgba(229,57,53,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 1024, 100);

    const lb = g.createLinearGradient(0, 0, 0, 640);
    lb.addColorStop(0, "#e53935");
    lb.addColorStop(0.5, "rgba(229,57,53,0.3)");
    lb.addColorStop(1, "rgba(229,57,53,0)");
    g.fillStyle = lb;
    g.fillRect(0, 0, 4, 640);

    g.font = "600 14px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.28)";
    g.fillText("003 — THE FOUNDER", 48, 50);
    g.fillStyle = "#e53935";
    g.fillRect(48, 60, 52, 2);

    g.strokeStyle = "rgba(255,255,255,0.08)";
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(24, 82); g.lineTo(1000, 82); g.stroke();

    g.font = "700 58px sans-serif";
    g.fillStyle = "#fff";
    g.fillText(p.name, 48, 174);

    g.font = "600 22px sans-serif";
    g.fillStyle = "#e53935";
    g.fillText(p.role, 48, 212);

    g.font = "500 23px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.80)";
    wrapText(g, p.bio, 48, 280, 928, 36, 8);
  });
}

/** Panel 4 — trust and the ask. Red-accented, because this one is the CTA. */
function founderCtaTexture(p: {
  companyName: string;
  companyUrl: string;
  cofounders: { name: string; role: string; note?: string }[];
}) {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#09080f";
    g.fillRect(0, 0, 1024, 640);

    const rg = g.createLinearGradient(0, 0, 0, 100);
    rg.addColorStop(0, "rgba(229,57,53,0.08)");
    rg.addColorStop(1, "rgba(229,57,53,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 1024, 100);

    const lb = g.createLinearGradient(0, 0, 0, 640);
    lb.addColorStop(0, "#e53935");
    lb.addColorStop(0.5, "rgba(229,57,53,0.3)");
    lb.addColorStop(1, "rgba(229,57,53,0)");
    g.fillStyle = lb;
    g.fillRect(0, 0, 4, 640);

    g.font = "600 14px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.28)";
    g.fillText("004 — WHO YOU'LL WORK WITH", 48, 50);

    // Three compact blocks stacked above the CTA — same per-person layout
    // (name / role / 3-line bio) repeated for each co-founder rather than
    // the old single founder + single co-founder split.
    const blockH = 126;
    const startY = 108;
    p.cofounders.slice(0, 3).forEach((cf, i) => {
      const y = startY + i * blockH;

      g.font = "700 24px sans-serif";
      g.fillStyle = "#ffffff";
      g.fillText(cf.name, 48, y);

      g.font = "600 16px sans-serif";
      g.fillStyle = "rgba(255,255,255,0.50)";
      g.fillText(`${cf.role} of ${p.companyName}`, 48, y + 24);

      if (cf.note) {
        g.font = "500 17px sans-serif";
        g.fillStyle = "rgba(255,255,255,0.72)";
        wrapText(g, cf.note, 48, y + 50, 900, 22, 3);
      }

      if (i < p.cofounders.length - 1 && i < 2) {
        g.strokeStyle = "rgba(255,255,255,0.08)";
        g.lineWidth = 1;
        const divY = y + blockH - 14;
        g.beginPath(); g.moveTo(48, divY); g.lineTo(976, divY); g.stroke();
      }
    });

    // Solid CTA — the one filled button anywhere in the scene.
    g.fillStyle = "#e53935";
    g.fillRect(48, 500, 250, 58);
    g.font = "700 20px sans-serif";
    g.fillStyle = "#ffffff";
    g.textAlign = "center";
    g.fillText("Book a call →", 173, 537);
    g.textAlign = "left";

    g.font = "600 16px sans-serif";
    g.fillStyle = "rgba(229,57,53,0.85)";
    g.fillText(p.companyUrl, 326, 537);
  });
}

function dashboardTexture() {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#0a0d12";
    g.fillRect(0, 0, 1024, 640);
    g.fillStyle = "#12161d";
    g.fillRect(0, 0, 1024, 76);
    g.font = "600 24px sans-serif";
    g.fillStyle = RED;
    g.fillText("◈ Campaign Performance", 28, 48);
    g.font = "20px sans-serif";
    g.fillStyle = "#3fb950";
    g.fillText("● LIVE", 880, 48);

    const stats: [string, string, string][] = [
      ["ROAS", "4.2×", "#3fb950"],
      ["CTR", "3.8%", "#5aa9ff"],
      ["SPEND", "$2.4k", "#e53935"],
      ["CONV", "124", "#d29922"],
    ];
    stats.forEach(([l, v, c], i) => {
      const x = 24 + i * 248;
      g.fillStyle = "#12161d";
      g.fillRect(x, 100, 232, 108);
      g.font = "700 44px sans-serif";
      g.fillStyle = c;
      g.fillText(v, x + 20, 162);
      g.font = "18px sans-serif";
      g.fillStyle = "#6b7280";
      g.fillText(l, x + 20, 192);
    });

    const vals = [42, 60, 38, 78, 55, 88, 64, 76, 50, 70, 84, 68];
    vals.forEach((h, i) => {
      const x = 30 + i * 82;
      const bh = h * 3.2;
      const grd = g.createLinearGradient(x, 560 - bh, x, 560);
      grd.addColorStop(0, RED);
      grd.addColorStop(1, RED_DIM);
      g.fillStyle = grd;
      g.fillRect(x, 560 - bh, 58, bh);
    });
    g.strokeStyle = HOLO;
    g.lineWidth = 3;
    g.beginPath();
    vals.forEach((h, i) => {
      const x = 30 + i * 82 + 29;
      const y = 560 - h * 3.2;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    });
    g.stroke();
    g.fillStyle = "#12161d";
    g.fillRect(0, 592, 1024, 48);
    g.font = "18px monospace";
    g.fillStyle = "#5aa9ff";
    g.fillText("Budget $150/day · last 30 days", 28, 622);
  });
}

/** Where /admin → Media should host the Content Calendar reference image. */
const CONTENT_CALENDAR_IMAGE_URL = "/content-calendar.png";

function socialTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const g = canvas.getContext("2d")!;

  const drawTitleText = () => {
    g.font = "600 26px sans-serif";
    g.fillStyle = "#fff";
    g.fillText("Content Calendar", 28, 52);
    g.font = "20px sans-serif";
    g.fillStyle = RED;
    g.fillText("July", 28, 84);
  };

  // Fallback, shown until (or if) the image below fails to load.
  g.fillStyle = "#0b0b12";
  g.fillRect(0, 0, 1024, 640);
  drawTitleText();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  // Fills the space below the title with the reference grid image, cropped
  // to cover — same load/draw pattern as project cover photos elsewhere in
  // this file. A missing image just leaves the title on its own.
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const top = 104;
    const areaW = 1024;
    const areaH = 640 - top;
    const scale = Math.max(areaW / img.width, areaH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;

    g.fillStyle = "#0b0b12";
    g.fillRect(0, top, areaW, areaH);

    g.save();
    g.beginPath();
    g.rect(0, top, areaW, areaH);
    g.clip();
    g.drawImage(img, (areaW - w) / 2, top + (areaH - h) / 2, w, h);
    g.restore();

    // A soft shadow under the title keeps it readable regardless of what
    // ends up directly beneath it in the cropped image.
    g.fillStyle = "#0b0b12";
    const seam = g.createLinearGradient(0, top - 20, 0, top);
    seam.addColorStop(0, "rgba(11,11,18,0)");
    seam.addColorStop(1, "rgba(11,11,18,0.9)");
    g.fillStyle = seam;
    g.fillRect(0, top - 20, areaW, 20);
    drawTitleText();

    tex.needsUpdate = true;
  };
  img.src = CONTENT_CALENDAR_IMAGE_URL;

  return tex;
}

function aiTexture() {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#05050f";
    g.fillRect(0, 0, 1024, 640);
    g.font = "600 24px monospace";
    g.fillStyle = RED;
    g.fillText("◈ AGENT NETWORK", 28, 48);
    const nodes = [
      { x: 140, y: 300, l: "INPUT", c: HOLO },
      { x: 360, y: 170, l: "SEARCH", c: "#5aa9ff" },
      { x: 360, y: 300, l: "REASON", c: RED },
      { x: 360, y: 440, l: "MEMORY", c: "#8957e5" },
      { x: 660, y: 300, l: "EXECUTE", c: "#3fb950" },
      { x: 890, y: 300, l: "OUTPUT", c: HOLO },
    ];
    [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [2, 4], [3, 4], [4, 5]].forEach(([a, b]) => {
      const n = nodes[a];
      const m = nodes[b];
      g.strokeStyle = n.c + "66";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(n.x, n.y);
      g.bezierCurveTo((n.x + m.x) / 2, n.y, (n.x + m.x) / 2, m.y, m.x, m.y);
      g.stroke();
    });
    nodes.forEach((n) => {
      const grd = g.createRadialGradient(n.x, n.y, 0, n.x, n.y, 76);
      grd.addColorStop(0, n.c + "44");
      grd.addColorStop(1, "transparent");
      g.fillStyle = grd;
      g.beginPath();
      g.arc(n.x, n.y, 76, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(n.x, n.y, 48, 0, Math.PI * 2);
      g.fillStyle = "#0a0a16";
      g.fill();
      g.strokeStyle = n.c;
      g.lineWidth = 3;
      g.stroke();
      g.font = "600 17px monospace";
      g.fillStyle = "#fff";
      g.textAlign = "center";
      g.fillText(n.l, n.x, n.y + 6);
      g.textAlign = "left";
    });
    g.font = "18px monospace";
    g.fillStyle = "#3fb950";
    g.fillText("● running · step 3/7", 28, 610);
  });
}

/**
 * One floating card per project, used in the Vault. Renders instantly with
 * text on a tinted gradient; if the project has a cover image, it's loaded
 * asynchronously and swapped in as the background (with a dark gradient for
 * text legibility) once ready — canvas textures draw synchronously, but an
 * image fetch can't be, so the card upgrades itself in place via
 * `texture.needsUpdate` rather than blocking the initial paint on the network.
 */
function projectTexture(
  title: string,
  category: string,
  desc: string,
  year: string,
  accent: string,
  coverUrl?: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;
  const g = canvas.getContext("2d")!;

  const drawText = (overPhoto: boolean) => {
    g.fillStyle = accent;
    g.fillRect(0, 0, 512, 6);

    // A drop shadow on the title/eyebrow is the difference between "text
    // that survives any photo behind it" and "text that only works on the
    // flat gradient fallback" — cheap insurance the gradient alone can't
    // fully guarantee against a busy screenshot.
    if (overPhoto) {
      g.shadowColor = "rgba(0,0,0,0.85)";
      g.shadowBlur = 14;
    }

    g.font = "700 19px monospace";
    g.fillStyle = accent;
    g.fillText(category.toUpperCase(), 32, 70);

    g.font = "700 40px sans-serif";
    g.fillStyle = "#fff";
    const titleEndY = wrapText(g, title, 32, 140, 448, 48, 2);

    g.shadowBlur = overPhoto ? 8 : 0;
    g.font = "600 17px sans-serif";
    g.fillStyle = "rgba(255,255,255,0.85)";
    wrapText(g, desc, 32, titleEndY + 46, 448, 25, 5);

    g.font = "600 20px monospace";
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.fillText(year, 32, 600);

    g.shadowBlur = 0;
    g.strokeStyle = accent + "88";
    g.lineWidth = 2;
    g.strokeRect(3, 3, 506, 634);
  };

  const drawFallback = () => {
    g.fillStyle = "#0a0a10";
    g.fillRect(0, 0, 512, 640);
    const grd = g.createLinearGradient(0, 0, 512, 640);
    grd.addColorStop(0, accent + "44");
    grd.addColorStop(1, "transparent");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 640);
    drawText(false);
  };

  drawFallback();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  if (coverUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      g.clearRect(0, 0, 512, 640);
      const scale = Math.max(512 / img.width, 640 / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      g.drawImage(img, (512 - w) / 2, (640 - h) / 2, w, h);

      // Dark gradient so text stays legible over an arbitrary photo — the
      // screenshot reads clearly in a thin band up top, then fades quickly
      // so everything from the title down sits on a near-solid backdrop
      // instead of competing with the photo's own UI and text.
      const overlay = g.createLinearGradient(0, 0, 0, 640);
      overlay.addColorStop(0, "rgba(6,6,10,0.35)");
      overlay.addColorStop(0.18, "rgba(6,6,10,0.62)");
      overlay.addColorStop(0.35, "rgba(6,6,10,0.85)");
      overlay.addColorStop(0.6, "rgba(6,6,10,0.93)");
      overlay.addColorStop(1, "rgba(6,6,10,0.97)");
      g.fillStyle = overlay;
      g.fillRect(0, 0, 512, 640);

      drawText(true);
      tex.needsUpdate = true;
    };
    // A missing/broken image quietly keeps the gradient fallback already drawn.
    img.src = coverUrl;
  }

  return tex;
}


function contactTexture() {
  return mkTex(1024, 640, (g) => {
    g.fillStyle = "#030305";
    g.fillRect(0, 0, 1024, 640);
    g.fillStyle = RED;
    g.fillRect(0, 0, 1024, 5);
    g.textAlign = "center";
    g.font = "20px monospace";
    g.fillStyle = "rgba(229,57,53,0.75)";
    g.fillText("─── AVAILABLE FOR NEW PROJECTS ───", 512, 128);
    g.font = "600 76px sans-serif";
    g.fillStyle = "#fff";
    g.fillText("Let's build", 512, 250);
    g.fillText("something", 512, 336);
    g.fillStyle = RED;
    g.fillText("exceptional.", 512, 422);
    g.font = "24px monospace";
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.fillText("muneeb24400@gmail.com", 512, 520);
    g.textAlign = "left";
  });
}

/* ────────────────────────────────────────────────────────────────────────────
   Camera path

   One keyframe per story beat. Position and look-at are interpolated with
   smoothstep so the move reads as a single continuous shot.
   ──────────────────────────────────────────────────────────────────────────── */

type Key = { p: number; pos: [number, number, number]; look: [number, number, number] };

const PATH: Key[] = [
  { p: 0.0, pos: [0, 2.5, 19], look: [0, 1.2, 0] },      // 1 Arrival — far, dark
  { p: 0.1, pos: [0, 2.4, 12], look: [0, 1.2, 0] },      // 2 Approach
  { p: 0.2, pos: [0, 2.1, 5.2], look: [0, 1.35, -1] },   // 3 Behind my shoulder
  { p: 0.3, pos: [0, 1.72, 2.9], look: [0, 1.5, -1.2] }, // 4 Enter the screen
  { p: 0.4, pos: [0, 1.5, -3.4], look: [0, 1.5, -9] },   //   through the glass
  { p: 0.55, pos: [0, 1.5, -17], look: [0, 1.5, -24] },  // 5 Developer room
  { p: 0.7, pos: [0, 1.5, -33], look: [0, 1.5, -40] },   // 6 Marketing centre
  // Sits exactly halfway (in scroll-progress) between Marketing Centre and
  // Project Vault (0.11 each side) — was 0.85, giving Marketing→AI Lab 0.15
  // and AI Lab→Vault only 0.07, i.e. the vault leg took less than half as
  // much scroll as the leg before it.
  { p: 0.81, pos: [0, 1.5, -49], look: [0, 1.5, -56] },  // 7 AI laboratory
  { p: 0.92, pos: [0, 1.5, -61], look: [0, 1.5, -68] },  // 8 Project vault
  // 9 Back to reality. The return is a 67-unit jump, so it is performed as a
  // hard cut inside a 0.006-wide window that sits entirely within the veil's
  // fully-opaque hold (0.926–0.944). Interpolating it instead would read as a
  // violent whip-pan through the corridors.
  { p: 0.93, pos: [0, 1.5, -64], look: [0, 1.5, -71] },
  { p: 0.936, pos: [0, 2.2, 6.0], look: [0, 1.3, -1] },
  { p: 0.95, pos: [0, 2.2, 6.0], look: [0, 1.3, -1] },
  { p: 0.98, pos: [1.7, 2.1, 5.2], look: [-0.2, 1.2, 0] }, // 10 The creator
  { p: 1.0, pos: [0, 1.62, 2.4], look: [0, 1.5, -1.2] }, // 11 Your turn
];

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _cardProj = new THREE.Vector3();

function sampplePath(p: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  let i = 0;
  while (i < PATH.length - 2 && p > PATH[i + 1].p) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const t = smooth(Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p))));
  outPos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], t),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], t),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], t)
  );
  outLook.set(
    THREE.MathUtils.lerp(a.look[0], b.look[0], t),
    THREE.MathUtils.lerp(a.look[1], b.look[1], t),
    THREE.MathUtils.lerp(a.look[2], b.look[2], t)
  );
}

function CameraRig() {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const s = workshopState;
    // Frame-rate independent smoothing toward the scroll target.
    const k = 1 - Math.pow(0.0016, delta);
    s.progress += (s.targetProgress - s.progress) * k;

    // Lag-smoothed pointer — cinematic inertia so the look-around feels floaty.
    const pk = 1 - Math.pow(0.004, delta);
    s.smoothX += (s.pointerX - s.smoothX) * pk;
    s.smoothY += (s.pointerY - s.smoothY) * pk;

    sampplePath(s.progress, _pos, _look);

    const inside = s.progress > 0.36 && s.progress < 0.93;

    // Position shift — gentle lateral drift regardless of phase.
    const posStrength = inside ? 0.55 : 1.0;
    camera.position.set(
      _pos.x + s.smoothX * 0.5 * posStrength,
      _pos.y - s.smoothY * 0.28 * posStrength,
      _pos.z
    );

    // Look-around — inside the screen the camera actually rotates toward the
    // cursor so the viewer can see whichever panel they aim at.
    const lookH = inside ? 5.5 : 0.5;  // horizontal rotation strength
    const lookV = inside ? 2.0 : 0.3;  // vertical rotation strength
    camera.lookAt(
      _look.x + s.smoothX * lookH,
      _look.y - s.smoothY * lookV,
      _look.z,
    );
  });

  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
   Scene 1–3, 9–11 — the physical workspace
   ──────────────────────────────────────────────────────────────────────────── */

/** Long ceiling fixture that fades up during Arrival, matching the reference. */
function OverheadLight() {
  const barRef = useRef<THREE.MeshStandardMaterial>(null);
  const spotRef = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    const p = workshopState.progress;
    // Rises through Arrival, holds, then powers down at the very end.
    const on = smooth(sceneT(p, SCENES.arrival));
    const off = 1 - smooth(sceneT(p, [0.985, 1.0]));
    const v = on * off;
    if (barRef.current) barRef.current.emissiveIntensity = 2.6 * v;
    if (spotRef.current) spotRef.current.intensity = 26 * v;
  });

  return (
    <group position={[0, 5.4, -0.4]}>
      <mesh>
        <boxGeometry args={[7.2, 0.16, 1.0]} />
        <meshStandardMaterial color="#15151a" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* Emissive underside — this is the visible light source */}
      <mesh position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.9, 0.82]} />
        <meshStandardMaterial
          ref={barRef}
          color={WARM}
          emissive={WARM}
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>
      <spotLight
        ref={spotRef}
        position={[0, -0.2, 0]}
        target-position={[0, -5.4, 0]}
        angle={0.75}
        penumbra={0.85}
        distance={16}
        decay={1.6}
        intensity={0}
        color={WARM}
      />
    </group>
  );
}

/** The glowing rectangle on the floor beneath the desk. */
function FloorGlow() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const p = workshopState.progress;
    const on = smooth(sceneT(p, [0.02, 0.16]));
    const off = 1 - smooth(sceneT(p, [0.985, 1.0]));
    if (matRef.current) matRef.current.opacity = 0.85 * on * off;
  });

  const tex = useMemo(
    () =>
      mkTex(512, 512, (g) => {
        g.clearRect(0, 0, 512, 512);
        g.strokeStyle = "rgba(150,220,255,1)";
        g.lineWidth = 10;
        g.shadowColor = "rgba(120,200,255,1)";
        g.shadowBlur = 40;
        const r = 46;
        g.beginPath();
        g.moveTo(40 + r, 40);
        g.lineTo(472 - r, 40);
        g.quadraticCurveTo(472, 40, 472, 40 + r);
        g.lineTo(472, 472 - r);
        g.quadraticCurveTo(472, 472, 472 - r, 472);
        g.lineTo(40 + r, 472);
        g.quadraticCurveTo(40, 472, 40, 472 - r);
        g.lineTo(40, 40 + r);
        g.quadraticCurveTo(40, 40, 40 + r, 40);
        g.stroke();
      }),
    []
  );

  return (
    <mesh position={[0, 0.02, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8.5, 8.5]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Seated silhouette. Built from primitives with a near-black matte material so
 * it reads purely as a shape rimmed by the monitor glow — exactly the language
 * of the reference frame.
 */
function Creator() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const p = workshopState.progress;

    // Hidden while the camera is inside the screen.
    g.visible = p < 0.34 || p > 0.93;

    // Scene 10 — stand up and walk out of frame to the left.
    const stand = smooth(sceneT(p, [0.952, 0.968]));
    const walk = smooth(sceneT(p, [0.968, 0.99]));
    g.position.y = stand * 0.42;
    g.position.x = -walk * 5.2;
    g.position.z = walk * 1.4;

    // Idle breathing before standing.
    if (p < 0.34) {
      g.position.y = Math.sin(performance.now() * 0.0011) * 0.012;
    }
  });

  const skin = (
    <meshStandardMaterial color="#050506" roughness={1} metalness={0} />
  );

  return (
    <group ref={groupRef} position={[0, 0, 1.35]}>
      {/* chair */}
      <mesh position={[0, 0.5, 0.35]}>
        <boxGeometry args={[1.0, 0.09, 0.9]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      <mesh position={[0, 1.05, 0.78]}>
        <boxGeometry args={[0.98, 1.05, 0.1]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.24, 0.35]}>
        <cylinderGeometry args={[0.07, 0.07, 0.48, 10]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 1.06, 0.3]}>
        <capsuleGeometry args={[0.31, 0.52, 6, 14]} />
        {skin}
      </mesh>
      {/* shoulders */}
      <mesh position={[0, 1.33, 0.3]} scale={[1.32, 0.62, 1]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        {skin}
      </mesh>
      {/* neck + head */}
      <mesh position={[0, 1.55, 0.3]}>
        <cylinderGeometry args={[0.08, 0.09, 0.14, 10]} />
        {skin}
      </mesh>
      <mesh position={[0, 1.73, 0.29]}>
        <sphereGeometry args={[0.19, 20, 18]} />
        {skin}
      </mesh>
      {/* hair mass — reads as the silhouette in the reference */}
      <mesh position={[0, 1.71, 0.37]} scale={[1.12, 1.16, 1.05]}>
        <sphereGeometry args={[0.2, 20, 18]} />
        <meshStandardMaterial color="#030304" roughness={1} />
      </mesh>

      {/* arms reaching to the desk */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.36, 1.12, -0.02]}
          rotation={[-0.72, 0, s * 0.12]}
        >
          <capsuleGeometry args={[0.085, 0.62, 5, 10]} />
          {skin}
        </mesh>
      ))}
    </group>
  );
}

/** Desk, monitor, keyboard — the anchor of the physical scene. */
function Workspace({ screen }: { screen: THREE.CanvasTexture }) {
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const cursorRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = workshopState.progress;
    // Screen wakes during Approach, blazes as we enter, dies at the end.
    const wake = smooth(sceneT(p, [0.12, 0.3]));
    const off = 1 - smooth(sceneT(p, [0.985, 1.0]));
    const revive = smooth(sceneT(p, [0.94, 0.97]));
    const lvl = Math.max(wake, revive) * off;
    if (screenMat.current) screenMat.current.emissiveIntensity = 0.35 + lvl * 0.75;
    if (glowRef.current) glowRef.current.intensity = 5.5 * lvl;

    // Cursor slides to the ENTER button and "clicks" just before we go through.
    const c = cursorRef.current;
    if (c) {
      const t = smooth(sceneT(p, [0.24, 0.325]));
      c.visible = p > 0.2 && p < 0.36;
      c.position.x = THREE.MathUtils.lerp(0.62, 0.0, t);
      c.position.y = THREE.MathUtils.lerp(1.05, 1.36, t);
      const click = sceneT(p, [0.325, 0.345]);
      c.scale.setScalar(1 - click * 0.45);
    }
  });

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#08080a" roughness={0.94} metalness={0.05} />
      </mesh>

      {/* desk */}
      <mesh position={[0, 1.02, -0.2]}>
        <boxGeometry args={[4.4, 0.07, 1.7]} />
        <meshStandardMaterial color="#141418" metalness={0.35} roughness={0.55} />
      </mesh>
      {[-2.05, 2.05].map((x) => (
        <mesh key={x} position={[x, 0.51, -0.2]}>
          <boxGeometry args={[0.07, 1.02, 1.5]} />
          <meshStandardMaterial color="#101014" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* monitor */}
      <group position={[0, 1.72, -0.95]}>
        <mesh position={[0, -0.52, 0.08]}>
          <cylinderGeometry args={[0.05, 0.08, 0.42, 10]} />
          <meshStandardMaterial color="#141418" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.73, 0.14]}>
          <boxGeometry args={[0.9, 0.04, 0.44]} />
          <meshStandardMaterial color="#141418" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh>
          <boxGeometry args={[3.05, 1.78, 0.07]} />
          <meshStandardMaterial color="#0c0c10" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.041]}>
          <planeGeometry args={[2.88, 1.62]} />
          <meshStandardMaterial
            ref={screenMat}
            map={screen}
            emissiveMap={screen}
            emissive="#ffffff"
            emissiveIntensity={0.35}
            toneMapped={false}
          />
        </mesh>
        {/* pointer that clicks ENTER */}
        <mesh ref={cursorRef} position={[0.6, 1.05, 0.05]}>
          <coneGeometry args={[0.045, 0.12, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <pointLight ref={glowRef} position={[0, 1.7, -0.4]} color={HOLO} distance={7} decay={2} intensity={0} />

      {/* keyboard */}
      <mesh position={[0, 1.08, 0.42]}>
        <boxGeometry args={[1.5, 0.04, 0.5]} />
        <meshStandardMaterial color="#141418" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.98, 1.08, 0.42]}>
        <boxGeometry args={[0.2, 0.035, 0.3]} />
        <meshStandardMaterial color="#141418" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Scenes 5–8 — the worlds behind the screen
   ──────────────────────────────────────────────────────────────────────────── */

/** A floating holographic panel.
 *  Cursor proximity (x-axis) surges the panel toward the camera,
 *  scales it up slightly, and brightens its edge glow.            */
function Panel({
  tex,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  tint = HOLO,
  fadeRange,
}: {
  tex: THREE.CanvasTexture;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  tint?: string;
  /** [start, end] scroll-progress this panel is the primary one, with a
   * short crossfade at each edge. Left undefined (the default, used by
   * every existing caller) means always fully opaque — matches the
   * per-effect pattern everywhere else in this file of reading
   * workshopState.progress directly inside useFrame, rather than a parent
   * pushing a value through props every frame. */
  fadeRange?: [number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const mainRef = useRef<THREE.MeshBasicMaterial>(null);
  // Float phase — deterministic so it never changes between renders.
  const seed = (position[0] * 12.9898 + position[2] * 78.233) % (Math.PI * 2);
  // Panels span roughly x ∈ [-3.6, 3.6]; divide by 7.2 to map to [-0.5, 0.5]
  // matching the pointerX range so the proximity check makes spatial sense.
  const normX = position[0] / 7.2;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    // Cursor proximity — use smoothX so the surge matches the camera rotation.
    const dx = Math.abs(workshopState.smoothX - normX);
    const proximity = smooth(Math.max(0, 1 - dx * 3.5));

    // Float
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + seed) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.34 + seed) * 0.012;

    // Surge toward camera (increase z = closer to viewer)
    ref.current.position.z = position[2] + proximity * 1.1;
    // Subtle scale-up
    ref.current.scale.setScalar(scale * (1 + proximity * 0.07));

    let fade = 1;
    if (fadeRange) {
      const [start, end] = fadeRange;
      const width = 0.02; // crossfade width on each edge, in scroll-progress
      const p = workshopState.progress;
      const fadeIn = smooth(Math.max(0, Math.min(1, (p - start) / width)));
      const fadeOut = smooth(Math.max(0, Math.min(1, (end - p) / width)));
      fade = Math.min(fadeIn, fadeOut);
    }

    // Edge glow brightens
    if (glowRef.current) glowRef.current.opacity = (0.16 + proximity * 0.30) * fade;
    if (mainRef.current) mainRef.current.opacity = 0.94 * fade;
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <mesh>
        <planeGeometry args={[2.6, 1.62]} />
        <meshBasicMaterial ref={mainRef} map={tex} toneMapped={false} transparent opacity={0.94} side={THREE.DoubleSide} />
      </mesh>
      {/* edge glow — brightens on hover */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.72, 1.74]} />
        <meshBasicMaterial ref={glowRef} color={tint} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Wireframe corridor that gives each interior world its sense of space. */
function Corridor({ z, length, color }: { z: number; length: number; color: string }) {
  return (
    <group position={[0, 0, z]}>
      <gridHelper args={[16, 16, color, color]} position={[0, -1.6, 0]}>
        <lineBasicMaterial attach="material" color={color} transparent opacity={0.1} />
      </gridHelper>
      <gridHelper args={[16, 16, color, color]} position={[0, 4.4, 0]}>
        <lineBasicMaterial attach="material" color={color} transparent opacity={0.06} />
      </gridHelper>
      {/* side rails */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 1.4, 0]}>
          <boxGeometry args={[0.04, 0.04, length]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

// Panel positions, shared between the "which panel is closest to the
// cursor" check below and the <Panel> instances rendered in JSX.
const ROOM_PANEL_POS: [number, number, number][] = [
  [-3.4, 1.9, -8], // t1 — founder
  [3.5, 1.5, -11], // t2 — company / about
  [-3.1, 1.3, -16], // t3 — services (list 1)
  [3.2, 2.1, -19], // t4 — services (list 2)
];

function DeveloperRoom({ t1, t2, t3, t4 }: { t1: THREE.CanvasTexture; t2: THREE.CanvasTexture; t3: THREE.CanvasTexture; t4: THREE.CanvasTexture }) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = workshopState.progress;
    const inRoom = p > 0.32 && p < 0.64;
    if (ref.current) ref.current.visible = inRoom;

    if (!inRoom) { workshopState.hoveredRoomPanelIdx = -1; return; }

    // Compare actual on-screen (projected) X, not raw world X — t1 and t3
    // sit at very different depths but a similar world X, so a flat world-X
    // comparison couldn't reliably tell them apart and clicks meant for the
    // founder panel would sometimes register on the services panel behind it.
    let best = 0, bestDist = Infinity;
    ROOM_PANEL_POS.forEach((pos, i) => {
      scratch.set(pos[0], pos[1], pos[2]).project(camera);
      const d = Math.abs(scratch.x - workshopState.smoothX * 2);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    workshopState.hoveredRoomPanelIdx = best;
  });
  return (
    <group ref={ref}>
      <Corridor z={-14} length={22} color={HOLO} />
      <Panel tex={t1} position={ROOM_PANEL_POS[0]} rotation={[0, 0.5, 0]} scale={1.2} />
      <Panel tex={t2} position={ROOM_PANEL_POS[1]} rotation={[0, -0.5, 0]} scale={1.05} />
      <Panel tex={t3} position={ROOM_PANEL_POS[2]} rotation={[0, 0.42, 0]} scale={0.95} />
      <Panel tex={t4} position={ROOM_PANEL_POS[3]} rotation={[0, -0.44, 0]} scale={1.1} tint={RED} />
    </group>
  );
}

const MARKETING_PANEL_POS: [number, number, number][] = [
  [3.6, 2.4, -29], // right dash — mirrors social's x (distance from the
  // right side equals social's distance from the left) and now matches its
  // z-depth too, so it sits the same distance from the corridor's center.
  [-3.6, 1.3, -29], // left social
];

function MarketingCentre({ dash, social }: { dash: THREE.CanvasTexture; social: THREE.CanvasTexture }) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = workshopState.progress;
    const inCentre = p > 0.48 && p < 0.79;
    if (ref.current) ref.current.visible = inCentre;

    if (!inCentre) { workshopState.hoveredMarketingPanelIdx = -1; return; }
    let best = 0, bestDist = Infinity;
    MARKETING_PANEL_POS.forEach((pos, i) => {
      scratch.set(pos[0], pos[1], pos[2]).project(camera);
      const d = Math.abs(scratch.x - workshopState.smoothX * 2);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    workshopState.hoveredMarketingPanelIdx = best;
  });
  return (
    <group ref={ref}>
      {/* Shortened from 22 — that overhung the panels (z=-25/-29) by up to
          11 units on each side, leaving bare rails floating in view well
          after both panels had scrolled past. 14 keeps a comfortable margin
          around them without the empty trailing corridor. */}
      <Corridor z={-30} length={14} color={RED} />
      <Panel tex={dash} position={MARKETING_PANEL_POS[0]} scale={1.05} tint={RED} />
      <Panel tex={social} position={MARKETING_PANEL_POS[1]} rotation={[0, 0.5, 0]} scale={1.05} />
    </group>
  );
}

function AiLab({ ai }: { ai: THREE.CanvasTexture }) {
  const ref = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.visible = workshopState.progress > 0.63 && workshopState.progress < 0.94;
    if (ringsRef.current) ringsRef.current.rotation.z = clock.getElapsedTime() * 0.14;
  });

  return (
    <group ref={ref}>
      <Corridor z={-46} length={22} color="#8957e5" />
      <Panel tex={ai} position={[0, 2.3, -46]} scale={1.55} tint="#8957e5" />

      {/* holographic rings around the corridor */}
      <group ref={ringsRef} position={[0, 1.5, -48]}>
        {[3.2, 4.1, 5.0].map((r, i) => (
          <mesh key={r} rotation={[0, 0, (i * Math.PI) / 5]}>
            <torusGeometry args={[r, 0.014, 6, 60]} />
            <meshBasicMaterial color={i % 2 ? HOLO : RED} transparent opacity={0.4} />
          </mesh>
        ))}
      </group>

      {/* drifting agent nodes */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 4.4, 1.5 + Math.cos(a) * 2.2, -44 - (i % 5) * 2.4]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshBasicMaterial color={i % 3 === 0 ? RED : HOLO} />
          </mesh>
        );
      })}
    </group>
  );
}

function ProjectVault({ cards }: { cards: THREE.CanvasTexture[] }) {
  const ref = useRef<THREE.Group>(null);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const mainMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const glowMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const p = workshopState.progress;
    const inVault = p > 0.79 && p < 0.945;
    if (ref.current) ref.current.visible = inVault;
    const t = clock.getElapsedTime();

    // Cards used to snap straight to full brightness the instant this group
    // became visible — every other room's content eases in via the wide
    // overlap with the scene before it, but the vault's own 0.79 boundary
    // gave its cards nothing to ease against. A short opacity ramp right at
    // that boundary gives them the same fade-in feel.
    const fadeIn = smooth(Math.max(0, Math.min(1, (p - 0.79) / 0.04)));
    mainMatRefs.current.forEach((m) => { if (m) m.opacity = fadeIn; });
    glowMatRefs.current.forEach((m) => { if (m) m.opacity = 0.18 * fadeIn; });

    // Hover used to be matched by a fixed column formula (assuming every
    // card sits at one of three hardcoded screen-x slots), which broke as
    // soon as there was more than one row — and even within a single row,
    // the camera's own mouse-driven look-around drift (see CameraRig) shifts
    // where each card actually lands on screen, so a fixed-slot guess could
    // point at the wrong neighbor. Projecting each card's real world
    // position through the actual camera and comparing that to the real
    // pointer position is correct by construction for any camera move,
    // row count, or column count — no hardcoded slots to keep in sync.
    let bestNear = -1;
    let bestIdx = -1;

    itemRefs.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.y = Math.sin(t * 0.28 + i) * 0.22;
      g.position.y = 1.5 + Math.sin(t * 0.5 + i * 1.3) * 0.14;

      _cardProj.copy(g.position).project(camera);
      if (_cardProj.z > 1 || _cardProj.z < -1) {
        // Behind the camera or outside its clip range — can't be hovered.
        g.scale.setScalar(1);
        return;
      }
      const dx = workshopState.pointerX - _cardProj.x / 2;
      const dy = workshopState.pointerY + _cardProj.y / 2;
      const near = 1 - Math.min(1, Math.hypot(dx, dy) * 3.2);
      g.scale.setScalar(1 + Math.max(0, near) * 0.12);
      if (near > bestNear) { bestNear = near; bestIdx = i; }
    });

    workshopState.hoveredProjectIdx = inVault ? bestIdx : -1;
  });

  return (
    <group ref={ref}>
      <Corridor z={-61} length={16} color={RED} />
      {cards.map((tex, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <group
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            position={[(col - 1) * 3.3, 1.5, -58 - row * 4.2]}
          >
            <mesh>
              <planeGeometry args={[1.9, 2.4]} />
              <meshBasicMaterial
                ref={(el) => { mainMatRefs.current[i] = el; }}
                map={tex}
                toneMapped={false}
                transparent
                opacity={0}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[2.02, 2.52]} />
              <meshBasicMaterial
                ref={(el) => { glowMatRefs.current[i] = el; }}
                color={RED}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Atmosphere
   ──────────────────────────────────────────────────────────────────────────── */

function Dust({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Seeded so the field is a pure function of nothing — stable across renders.
    let seed = 0x2f6e2b1;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const n = count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rand() - 0.5) * 26;
      arr[i * 3 + 1] = rand() * 8 - 1.5;
      arr[i * 3 + 2] = rand() * -78 + 14;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9fb8d8" size={0.035} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/**
 * Full-screen black plane parented to the camera. Covers the hard reposition
 * between the Vault and the workspace at 92–95%, which would otherwise be a
 * 60-unit whip-pan, and delivers the closing power-down.
 */
function Veil() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    camera.add(mesh);
    return () => {
      camera.remove(mesh);
    };
  }, [camera]);

  useFrame(() => {
    const p = workshopState.progress;
    // Fully opaque across 0.926–0.944, which brackets the hard cut at 0.936.
    const inCut = smooth(sceneT(p, [0.912, 0.926]));
    const outCut = smooth(sceneT(p, [0.944, 0.958]));
    const cut = inCut * (1 - outCut);
    // Final power-down.
    const end = smooth(sceneT(p, [0.99, 1.0])) * 0.82;
    // Opening darkness.
    const start = 1 - smooth(sceneT(p, [0.0, 0.06]));
    if (matRef.current) matRef.current.opacity = Math.max(cut, end, start * 0.55);
  });

  return (
    <mesh ref={ref} position={[0, 0, -0.4]} renderOrder={999}>
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial
        ref={matRef}
        color="#000000"
        transparent
        opacity={0.55}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Ambient level tracks the story: near-black at the ends, lit in the middle. */
function Ambience() {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const redRef = useRef<THREE.PointLight>(null);
  const holoRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = workshopState.progress;
    const wake = smooth(sceneT(p, [0.02, 0.2]));
    const off = 1 - smooth(sceneT(p, [0.98, 1.0]));
    if (ambRef.current) ambRef.current.intensity = (0.02 + wake * 0.16) * off;
    if (redRef.current) {
      redRef.current.intensity = 3.2 * off;
      redRef.current.position.z = -THREE.MathUtils.clamp(p * 66 - 4, -4, 62);
    }
    if (holoRef.current) {
      holoRef.current.intensity = 2.6 * off;
      holoRef.current.position.z = -THREE.MathUtils.clamp(p * 66 - 10, -8, 58);
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.02} />
      <pointLight ref={redRef} position={[-3, 3, 0]} color={RED} distance={22} decay={2} intensity={0} />
      <pointLight ref={holoRef} position={[3.5, 2.4, -8]} color={HOLO} distance={24} decay={2} intensity={0} />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Scene root
   ──────────────────────────────────────────────────────────────────────────── */

function Scene({
  projects,
  founder,
  founders,
  founderNote,
  company,
  services,
  // Kept for interface consistency with WorkshopStage's own props (which
  // forward it here) — no longer rendered since the founder-bio panel
  // replaced the testimonial panel it used to feed.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  testimonials,
}: {
  projects: Project[];
  founder?: TeamMember;
  founders?: TeamMember[];
  founderNote: string;
  company: CompanySetting;
  services: Service[];
  testimonials: Testimonial[];
}) {
  const tex = useMemo(() => {
    const founderFullName = founder?.name || company.founderName || "Our founder";
    const founderRole = founder?.role || "Founder";
    const cofounders = (founders ?? []).filter((f) =>
      f.role.toLowerCase().includes("co-founder")
    );
    return {
      enter: enterTexture(),
      aboutH: pitchTexture({
        companyName: company.name,
        tagline: company.tagline,
        description: company.description,
        serviceCount: services.length,
      }),
      aboutS: servicesTexture({
        services: services.map((s, i) => ({
          index: s.displayIndex || String(i + 1).padStart(2, "0"),
          title: s.title,
          desc: s.shortDesc,
        })),
      }),
      aboutTl1: founderProfileTexture({
        name: founderFullName,
        role: founderRole,
        bio: founder?.bio || founderNote,
      }),
      aboutTl2: founderCtaTexture({
        companyName: company.name,
        companyUrl: company.url.replace(/^https?:\/\//, ""),
        cofounders: cofounders.map((f) => ({
          name: f.name.split(" ")[0],
          role: f.role,
          note: f.bio ?? undefined,
        })),
      }),
      dash: dashboardTexture(),
      social: socialTexture(),
      ai: aiTexture(),
      contact: contactTexture(),
      cards: projects.map((p) =>
        projectTexture(p.title, p.category, p.desc, p.year, p.accent, projectCoverUrl(p))
      ),
    };
  }, [projects, founder, founders, founderNote, company, services]);

  // `mkTex` builds each CanvasTexture by hand (new THREE.CanvasTexture(...)),
  // so R3F never takes ownership of it the way it does objects created via
  // JSX — nothing disposes these automatically. Without this, every time the
  // scene remounts (e.g. resizing across the 3D/flat breakpoint) the old
  // canvases and GPU texture memory from the previous mount are never freed.
  useEffect(() => {
    return () => {
      for (const value of Object.values(tex)) {
        if (Array.isArray(value)) value.forEach((t) => t.dispose());
        else value.dispose();
      }
    };
  }, [tex]);

  return (
    <>
      <CameraRig />
      <Ambience />
      <fog attach="fog" args={["#000000", 12, 46]} />

      <OverheadLight />
      <FloorGlow />
      <Workspace screen={tex.enter} />
      <ContactScreen tex={tex.contact} />
      <Creator />

      <DeveloperRoom t1={tex.aboutH} t2={tex.aboutS} t3={tex.aboutTl1} t4={tex.aboutTl2} />
      <MarketingCentre dash={tex.dash} social={tex.social} />
      <AiLab ai={tex.ai} />
      <ProjectVault cards={tex.cards} />

      <Dust count={isLowEndDevice() ? 150 : 420} />
      <Veil />
    </>
  );
}

/**
 * Second screen surface sitting a hair in front of the monitor, faded in for
 * scene 11. Cheaper and smoother than swapping the texture on one material.
 */
function ContactScreen({ tex }: { tex: THREE.CanvasTexture }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const p = workshopState.progress;
    const show = smooth(sceneT(p, [0.955, 0.985]));
    const off = 1 - smooth(sceneT(p, [0.99, 1.0]));
    if (matRef.current) matRef.current.opacity = show * off;
  });
  return (
    <mesh position={[0, 1.72, -0.905]}>
      <planeGeometry args={[2.88, 1.62]} />
      <meshBasicMaterial ref={matRef} map={tex} transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Export
   ──────────────────────────────────────────────────────────────────────────── */

export default function WorkshopStage({
  projects,
  founder,
  founders,
  founderNote,
  company,
  services,
  testimonials,
}: {
  projects: Project[];
  founder?: TeamMember;
  founders?: TeamMember[];
  founderNote: string;
  company: CompanySetting;
  services: Service[];
  testimonials: Testimonial[];
}) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    const { hoveredProjectIdx, hoveredRoomPanelIdx, hoveredMarketingPanelIdx } = workshopState;

    if (hoveredProjectIdx >= 0) {
      const project = projects[hoveredProjectIdx];
      if (project) {
        // Kill the scroll-pin synchronously, before React ever starts
        // unmounting this tree for the route change. Left to its own
        // cleanup timing, GSAP's pin-spacer teardown could still be
        // mid-flight when React removes the same nodes, corrupting the
        // outgoing page's DOM for a frame or two — visible as a flash of
        // huge empty space at the top of the case-study page it lands on
        // before the layout catches up and settles.
        ScrollTrigger.getAll().forEach((t) => t.kill());
        router.push(`/work/${project.slug}`);
      }
      return;
    }

    if (hoveredRoomPanelIdx >= 0) {
      // Each panel lands on the section that expands on what it just said:
      // 0 pitch → about, 1 services → services, 2 proof → work, 3 CTA → contact.
      const target = ["#about", "#services", "#work", "#contact"][hoveredRoomPanelIdx];
      if (target) scrollToSection(target);
      return;
    }

    if (hoveredMarketingPanelIdx >= 0) {
      scrollToSection("#services");
    }
  }, [router, projects]);

  // R3F's default render loop ("always") keeps rendering every animation
  // frame even in a backgrounded tab — a full WebGL scene doing that
  // indefinitely for no visible benefit. Switching to "never" while hidden
  // and back to "always" on return stops that without touching anything
  // about how the scene looks or behaves while actually visible.
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      workshopState.pointerX = e.clientX / window.innerWidth - 0.5;
      workshopState.pointerY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  // Pointer cursor while hovering a vault card
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const hovered =
        workshopState.hoveredProjectIdx >= 0 ||
        workshopState.hoveredRoomPanelIdx >= 0 ||
        workshopState.hoveredMarketingPanelIdx >= 0;
      document.body.style.cursor = hovered ? "pointer" : "";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  // A cheaper device still gets the whole scene — just lower-resolution
  // render targets and fewer decorative extras (see Dust/AiLab below) rather
  // than antialiasing/pixel-ratio nobody asked for.
  const lowEnd = useMemo(() => isLowEndDevice(), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        frameloop={frameloop}
        dpr={lowEnd ? 1 : [1, 1.5]}
        camera={{ position: [0, 2.5, 19], fov: 46, near: 0.1, far: 120 }}
        gl={{ antialias: !lowEnd, alpha: false, powerPreference: "high-performance" }}
        // Measure immediately rather than on R3F's default 50ms debounce, and
        // drop the scroll listener — this canvas is fixed to the viewport, so
        // scrolling can never change its size.
        resize={{ debounce: 0, scroll: false }}
        onCreated={({ gl }) => gl.setClearColor("#000000", 1)}
      >
        <Suspense fallback={null}>
          <Scene
            projects={projects}
            founder={founder}
            founders={founders}
            founderNote={founderNote}
            company={company}
            services={services}
            testimonials={testimonials}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

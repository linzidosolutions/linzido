# Project cover images

Drop screenshots here and reference them from `src/lib/site.ts` — no code
changes needed. A project with no `cover` falls back to its generative gradient,
so the site never shows a broken image.

## Adding one

1. Save the file as `<project-id>.jpg` (the `id` in `PROJECTS`), e.g.
   `stay-track.jpg`.
2. Add the path to that project in `src/lib/site.ts`:

   ```ts
   {
     id: "stay-track",
     // …
     cover: "/work/stay-track.jpg",
   }
   ```

## Specs

| | |
|---|---|
| First card (`linzido`) | 2100 × 900 — renders at 21:9 |
| All other cards | 1600 × 1000 — renders at 16:10 |
| Format | JPG (or WebP), under ~300 KB |

Next.js optimises and serves modern formats automatically, so ship the
highest-quality source you have rather than pre-compressing hard.

## Founder photo

Separate from this folder — put it at `/public/` and set `FOUNDER_PHOTO` in
`src/lib/site.ts` (e.g. `"/muneeb.jpg"`). Portrait crop, around 800 × 1000.

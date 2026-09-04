import type { Media } from "@/payload-types";

/**
 * Resolves a Payload upload relationship to its served URL. Deliberately
 * has zero imports from payload-data.ts (which pulls in the full Payload
 * runtime) so client components can use it without bundling server-only
 * code — see the "chunking context does not support node:fs" build error
 * this fixed.
 */
export function mediaUrl(media?: number | Media | null): string | undefined {
  if (!media || typeof media === "number") return undefined;
  return media.url ?? undefined;
}

/**
 * A project's "cover" (used by the Work grid, the 3D scene's project cards,
 * and case-study OG images) and its "gallery" (real screenshots, used by the
 * case-study slider) are two separate admin fields. Filling in the gallery
 * doesn't automatically give a project a cover, which is a natural thing to
 * expect it to do — falling back to the first gallery image here means one
 * upload covers both without the admin having to duplicate it into a second
 * field.
 */
export function projectCoverUrl(project: {
  cover?: number | Media | null;
  gallery?: ({ image?: number | Media | null } | null)[] | null;
}): string | undefined {
  return mediaUrl(project.cover) ?? mediaUrl(project.gallery?.[0]?.image);
}

import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type {
  Service,
  SubService,
  Project,
  TeamMember,
  Testimonial,
  ProcessStep,
  Faq,
  CompanySetting,
} from "@/payload-types";

// Re-exported for convenience in Server Components; client components must
// import from "@/lib/media" directly (see that file for why).
export { mediaUrl, projectCoverUrl } from "@/lib/media";

/**
 * Server-only data layer. Every function here reads from Payload's Local API
 * (no HTTP round-trip — same process) and shapes the result so the existing
 * presentational components need only a prop-source change, never a redesign.
 *
 * Only *published* documents are returned to public pages; draft edits stay
 * invisible until an editor publishes them from /admin.
 */

const getClient = () => getPayload({ config });

export type ServiceWithSubServices = Service & { subServices: SubService[] };

// Wrapped in React's cache() — generateMetadata and the page component it
// describes both call these during the same render, and without this they
// each re-ran the query independently. Memoizing per-request (it resets
// between requests, unlike a module-level cache) turns what was 2-3x the
// necessary Payload/DB round-trips per page into one.
export const getServices = cache(async (): Promise<ServiceWithSubServices[]> => {
  const payload = await getClient();
  const [services, subServices] = await Promise.all([
    payload.find({
      collection: "services",
      where: { published: { equals: true } },
      sort: "order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "sub-services",
      sort: "order",
      limit: 300,
      depth: 0,
    }),
  ]);

  return services.docs.map((service) => ({
    ...service,
    subServices: subServices.docs
      .filter((s) => {
        const parentId = typeof s.parentService === "object" ? s.parentService.id : s.parentService;
        return parentId === service.id;
      })
      .sort((a, b) => a.order - b.order),
  }));
});

export const getServiceBySlug = cache(
  async (slug: string): Promise<ServiceWithSubServices | null> => {
    const services = await getServices();
    return services.find((s) => s.slug === slug) ?? null;
  }
);

export const getProjects = cache(async (): Promise<Project[]> => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "projects",
    where: { published: { equals: true } },
    sort: "order",
    limit: 100,
    depth: 1,
  });
  return result.docs;
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] ?? null;
});

export const getTeamMembers = cache(async (): Promise<TeamMember[]> => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "team-members",
    sort: "order",
    limit: 50,
    depth: 1,
  });
  return result.docs;
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "testimonials",
    sort: "order",
    limit: 50,
    depth: 0,
  });
  return result.docs;
});

export const getProcessSteps = cache(async (): Promise<ProcessStep[]> => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "process-steps",
    sort: "order",
    limit: 20,
    depth: 0,
  });
  return result.docs;
});

export const getFaqs = cache(async (relatedServiceId?: number): Promise<Faq[]> => {
  const payload = await getClient();
  const result = await payload.find({
    collection: "faqs",
    where: relatedServiceId
      ? { relatedService: { equals: relatedServiceId } }
      : {},
    sort: "order",
    limit: 100,
    depth: 0,
  });
  return result.docs;
});

export const getCompanySettings = cache(async (): Promise<CompanySetting> => {
  const payload = await getClient();
  return payload.findGlobal({ slug: "company-settings", depth: 0 });
});

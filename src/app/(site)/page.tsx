import Experience from "@/components/Experience";
import {
  getServices,
  getProjects,
  getProcessSteps,
  getTeamMembers,
  getCompanySettings,
  getTestimonials,
} from "@/lib/payload-data";

export default async function Home() {
  const [services, projects, processSteps, team, company, testimonials] = await Promise.all([
    getServices(),
    getProjects(),
    getProcessSteps(),
    getTeamMembers(),
    getCompanySettings(),
    getTestimonials(),
  ]);

  const founder = team.find((t) => t.role.toLowerCase().includes("founder")) ?? team[0];
  const founders = team.filter((t) => t.role.toLowerCase().includes("founder"));

  return (
    <Experience
      services={services}
      projects={projects}
      processSteps={processSteps}
      timeline={company.timeline ?? []}
      founderNote={company.founderNote ?? ""}
      founder={founder}
      founders={founders}
      company={company}
      testimonials={testimonials}
    />
  );
}

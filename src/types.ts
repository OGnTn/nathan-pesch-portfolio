export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
}

export interface PortfolioData {
  name: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  cv?: string;
  projects: Project[];
}

export const defaultPortfolioData: PortfolioData = {
  name: "Jane Doe",
  bio: "A passionate developer building elegant web experiences.",
  email: "jane@example.com",
  github: "https://github.com/janedoe",
  linkedin: "https://linkedin.com/in/janedoe",
  cv: "./nathan_pesch_cv_2026.pdf",
  projects: [
    {
      id: "1",
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with real-time inventory management.",
      images: [],
      tags: ["React", "Node.js", "Tailwind CSS"],
    },
    {
      id: "2",
      title: "Weather Dashboard",
      description: "A beautiful weather dashboard with location-based forecasts and interactive maps.",
      images: [],
      tags: ["TypeScript", "API", "Data Viz"],
    },
  ],
};

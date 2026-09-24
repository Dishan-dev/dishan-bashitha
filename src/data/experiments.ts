export interface Experiment {
  id: string;
  title: string;
  category: "AI prototype" | "Micro interaction" | "UI concept" | "Small application" | "Creative coding";
  year: string;
  previewImage: string;
}

export const experiments: readonly Experiment[] = [
  { id: "signal", title: "Signal Garden", category: "AI prototype", year: "2026", previewImage: "/images/project-luma.svg" },
  { id: "tide", title: "Tide Type", category: "Micro interaction", year: "2026", previewImage: "/images/project-field-notes.svg" },
  { id: "index", title: "Material Index", category: "UI concept", year: "2025", previewImage: "/images/project-common-ground.svg" },
  { id: "interval", title: "Interval", category: "Small application", year: "2025", previewImage: "/images/project-after-hours.svg" },
  { id: "echo", title: "Echo Chamber", category: "Creative coding", year: "2024", previewImage: "/images/project-luma.svg" },
];

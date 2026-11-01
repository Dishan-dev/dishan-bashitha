// Each project is lit in its own colour, in its panel and in its detail view.
export const projectTints: Record<string, string> = {
  learnix: "#6b3cf2",
  "primecore-bank": "#2f6fd6",
  "hotel-management-system": "#1f9d74",
  planitnow: "#d9772b",
};

export const tintFor = (slug: string) => projectTints[slug] ?? projectTints.learnix;

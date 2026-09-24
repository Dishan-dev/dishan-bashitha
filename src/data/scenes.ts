export const scenes = [
  { id: "intro", label: "Home", number: "01" },
  { id: "about", label: "About", number: "02" },
  { id: "work", label: "Projects", number: "03" },
  { id: "skills", label: "Skills", number: "04" },
  { id: "experience", label: "Experience", number: "05" },
  { id: "contact", label: "Contact", number: "06" },
] as const;

export type SceneId = (typeof scenes)[number]["id"];

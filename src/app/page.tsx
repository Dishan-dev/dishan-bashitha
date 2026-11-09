import { FlowExperience } from "@/components/flow/FlowExperience";
import { homeSchema, JsonLd } from "@/lib/structuredData";

export default function Home() {
  return (
    <>
      <JsonLd data={homeSchema()} />
      <FlowExperience />
    </>
  );
}

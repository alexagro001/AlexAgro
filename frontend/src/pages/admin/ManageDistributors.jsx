import ManageResource from "./ManageResource";
import { resourceConfigs } from "./resourceConfigs";

export default function ManageDistributors() {
  return <ManageResource config={resourceConfigs.distributors} />;
}

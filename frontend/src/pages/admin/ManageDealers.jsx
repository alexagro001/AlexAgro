import ManageResource from "./ManageResource";
import { resourceConfigs } from "./resourceConfigs";

export default function ManageDealers() {
  return <ManageResource config={resourceConfigs.dealers} />;
}

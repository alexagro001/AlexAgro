import ManageResource from "./ManageResource";
import { resourceConfigs } from "./resourceConfigs";

export default function ManageCareers() {
  return <ManageResource config={resourceConfigs.careers} />;
}

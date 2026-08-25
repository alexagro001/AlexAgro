import ManageResource from "./ManageResource";
import { resourceConfigs } from "./resourceConfigs";

export default function ManageGallery() {
  return <ManageResource config={resourceConfigs.gallery} />;
}

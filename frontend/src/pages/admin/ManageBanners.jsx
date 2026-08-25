import ManageResource from "./ManageResource";
import { resourceConfigs } from "./resourceConfigs";

export default function ManageBanners() {
  return <ManageResource config={resourceConfigs.banners} />;
}

import ManageResource from "./ManageResource";
import { resourceConfigs } from "./resourceConfigs";

export default function ManageProducts() {
  return <ManageResource config={resourceConfigs.products} />;
}

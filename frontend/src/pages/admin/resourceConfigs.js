import { bdDivisions, bdDistrictsByDivision, districtCentroids } from "../../bdData";
import { upazilasByDistrict } from "../../upazilas";

// Each config drives the generic ManageResource page: what fields the
// create/edit form shows, and which fields appear as table columns.
//
// `hasMap: true`        adds a click-to-pick map + "Locate on map" button.
// `type: "select"` with `dynamicOptions(form)` builds a dropdown whose
//                        options depend on another field's current value
//                        (used for District, which depends on Division).
// `type: "media"`        renders an upload-from-device field (with a URL
//                        fallback) instead of a plain text input.
// `onFieldChange`         lets a resource react to one field changing —
//                        used here to reset District when Division changes,
//                        and to auto-drop the map pin near the chosen
//                        district as a starting point.

// Shared by dealers & distributors: keep District in sync with Division,
// reset the Area/Upazila pick when District changes (it belongs to the old
// district), and give the map pin a sensible starting point the moment a
// district is picked (the admin can still fine-tune with "Locate on map"
// or a click).
function locationFieldChange(name, value, form, areaFieldName) {
  if (name === "division") {
    const stillValid = bdDistrictsByDivision[value]?.includes(form.district);
    return stillValid ? null : { district: "", [areaFieldName]: "" };
  }

  if (name === "district") {
    const updates = {};
    const centroid = districtCentroids[value];
    if (centroid && (form.lat === "" || form.lat === undefined)) {
      updates.lat = centroid[0];
      updates.lng = centroid[1];
    }
    const stillValidArea = (upazilasByDistrict[value] || []).includes(form[areaFieldName]);
    if (!stillValidArea) updates[areaFieldName] = "";
    return updates;
  }

  return null;
}

const locationFields = [
  { name: "division", label: "Division", type: "select", options: bdDivisions, required: true },
  {
    name: "district",
    label: "District",
    type: "select",
    dynamicOptions: (form) => bdDistrictsByDivision[form.division] || [],
    required: true,
  },
];

const dealerFieldChange = (name, value, form) => locationFieldChange(name, value, form, "area");
const distributorFieldChange = (name, value, form) => locationFieldChange(name, value, form, "territory");

export const resourceConfigs = {
  dealers: {
    key: "dealers",
    endpoint: "/dealers",
    title: "Dealers",
    singular: "Dealer",
    hasMap: true,
    onFieldChange: dealerFieldChange,
    columns: ["name", "division", "district", "phone", "isActive"],
    fields: [
      { name: "name", label: "Dealer / shop name", type: "text", required: true },
      ...locationFields,
      {
        name: "area",
        label: "Area / Upazila",
        type: "select",
        dynamicOptions: (form) => upazilasByDistrict[form.district] || [],
      },
      { name: "address", label: "Full address", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "lat", label: "Latitude", type: "number", required: true },
      { name: "lng", label: "Longitude", type: "number", required: true },
      { name: "link", label: "Redirect link (WhatsApp / Facebook / website / email)", type: "text" },
      { name: "photo", label: "Photo", type: "media", accept: "image/*" },
      { name: "isActive", label: "Visible on site", type: "checkbox", default: true },
    ],
  },

  distributors: {
    key: "distributors",
    endpoint: "/distributors",
    title: "Sales Officers",
    singular: "Sales Officer",
    hasMap: true,
    onFieldChange: distributorFieldChange,
    columns: ["name", "designation", "division", "territory", "isActive"],
    fields: [
      { name: "name", label: "Full name", type: "text", required: true },
      { name: "designation", label: "Designation", type: "text", default: "Sales Officer" },
      ...locationFields,
      {
        name: "territory",
        label: "Territory / Upazila",
        type: "select",
        dynamicOptions: (form) => upazilasByDistrict[form.district] || [],
      },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "lat", label: "Latitude", type: "number", required: true },
      { name: "lng", label: "Longitude", type: "number", required: true },
      { name: "link", label: "Redirect link (mailto / WhatsApp)", type: "text" },
      { name: "photo", label: "Photo", type: "media", accept: "image/*" },
      { name: "isActive", label: "Visible on site", type: "checkbox", default: true },
    ],
  },

  products: {
    key: "products",
    endpoint: "/products",
    title: "Products",
    singular: "Product",
    columns: ["name", "category", "isFeatured", "isActive"],
    fields: [
      { name: "name", label: "Product name (English)", type: "text", required: true },
      { name: "nameBn", label: "Product name (বাংলা) — optional", type: "text" },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["crop-health", "agro-processing"],
        required: true,
      },
      { name: "shortDescription", label: "Short description (English)", type: "text" },
      { name: "shortDescriptionBn", label: "Short description (বাংলা) — optional", type: "text" },
      { name: "description", label: "Full description (English)", type: "textarea" },
      { name: "descriptionBn", label: "Full description (বাংলা) — optional", type: "textarea" },
      { name: "image", label: "Image", type: "media", accept: "image/*" },
      { name: "detailsLink", label: "Details link (optional)", type: "text" },
      { name: "isFeatured", label: "Featured on homepage", type: "checkbox" },
      { name: "isActive", label: "Visible on site", type: "checkbox", default: true },
    ],
  },

  gallery: {
    key: "gallery",
    endpoint: "/gallery",
    title: "Gallery",
    singular: "Gallery item",
    columns: ["order", "title", "type", "isActive"],
    fields: [
      { name: "type", label: "Type", type: "select", options: ["photo", "video"], required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description (optional)", type: "textarea" },
      {
        name: "url",
        label: "Photo / video (upload, or paste a YouTube/Vimeo embed URL)",
        type: "media",
        accept: "image/*,video/*",
        required: true,
      },
      { name: "thumbnail", label: "Thumbnail (for embedded videos)", type: "media", accept: "image/*" },
      {
        name: "order",
        label: "Display order (0 = first; leave blank to add at the end)",
        type: "number",
      },
      { name: "isActive", label: "Visible on site", type: "checkbox", default: true },
    ],
  },

  banners: {
    key: "banners",
    endpoint: "/banners",
    title: "Homepage Banners",
    singular: "Banner",
    columns: ["order", "title", "isActive"],
    fields: [
      { name: "title", label: "Headline", type: "text" },
      { name: "subtitle", label: "Supporting text", type: "text" },
      { name: "image", label: "Banner image or video (wide, e.g. 1600x620px)", type: "media", accept: "image/*,video/*", required: true },
      { name: "link", label: "Link when clicked (optional)", type: "text" },
      { name: "order", label: "Slide order (0 = first)", type: "number" },
      { name: "isActive", label: "Visible on site", type: "checkbox", default: true },
    ],
  },

  careers: {
    key: "careers",
    endpoint: "/careers",
    title: "Career Posts",
    singular: "Career post",
    columns: ["title", "location", "employmentType", "isActive"],
    fields: [
      { name: "title", label: "Job title", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "employmentType", label: "Employment type", type: "text", default: "Full-time" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "deadline", label: "Application deadline", type: "date" },
      { name: "applyLink", label: "Apply link (email or URL — plain email works too)", type: "text" },
      { name: "isActive", label: "Visible on site", type: "checkbox", default: true },
    ],
  },
};

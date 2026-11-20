// Central place to edit brand name, navigation, and footer/contact details.
export { bdDivisions } from "./bdData";

export const site = {
  name: "Alex Agro",
  tagline: "Your Crops Friend",
  legalName: "Alex Agro",
  description:
    "ALEX AGRO is a premium agricultural conglomerate dedicated to restoring organic life to global crop soils.",
  address: "Baghabari Ghat, Shazadpur, Sirajganj",
  phone: "01522113291",
  email: "alexagro001@gmail.com",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61594359914569",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Baghabari%20Ghat%2C%20Shazadpur%2C%20Sirajganj",
};

export const navigation = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  {
    label: "Products",
    to: "/products",
    children: [
      { label: "Crop Health", to: "/products/crop-health" },
      { label: "Agro Processing", to: "/products/agro-processing" },
    ],
  },
  {
    label: "Distribution Network",
    to: "/network",
    children: [
      { label: "Dealer List", to: "/network/dealers" },
      { label: "Sales Officer", to: "/network/sales-officers" },
    ],
  },
  {
    label: "Gallery",
    to: "/gallery",
    children: [
      { label: "Photo", to: "/gallery/photos" },
      { label: "Videos", to: "/gallery/videos" },
    ],
  },
  { label: "Career", to: "/career" },
  { label: "Contact Us", to: "/contact" },
];

// Central place to edit brand name, navigation, and footer/contact details.
export { bdDivisions } from "./bdData";

export const site = {
  name: "Alex Agro",
  tagline: "Your Crops Friend",
  legalName: "Alex Agro Limited",
  description:
    "ALEX AGRO is a premium agricultural conglomerate dedicated to restoring organic life to global crop soils.",
  address: "Level 6, Agribari Bhaban, Tejgaon Industrial Area, Dhaka-1208",
  phone: "+880 9678 000000",
  email: "alexagro001@gmail.com",
  social: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
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

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
    facebook: "https://www.facebook.com/profile.php?id=61594359914569",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
  mapUrl:
    "https://www.google.com/maps/place/Alex+Agro/@24.1414137,89.5871417,17z/data=!4m14!1m7!3m6!1s0x39fe77d48a0011cb:0xaeef0b65d910059d!2sAlex+Agro!8m2!3d24.1414088!4d89.5873241!16s%2Fg%2F11ntksz2pq!3m5!1s0x39fe77d48a0011cb:0xaeef0b65d910059d!8m2!3d24.1414088!4d89.5873241!16s%2Fg%2F11ntksz2pq?entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D",
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

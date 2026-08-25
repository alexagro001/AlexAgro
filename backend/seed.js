// Populates the database with sample data so the site isn't empty on first run.
// Usage: npm run seed   (make sure backend/.env has a working MONGO_URI first)
require("dotenv").config();
const connectDB = require("./config/db");
const Dealer = require("./models/Dealer");
const Distributor = require("./models/Distributor");
const Product = require("./models/Product");
const GalleryItem = require("./models/GalleryItem");
const Career = require("./models/Career");
const Banner = require("./models/Banner");

const dealers = [
  { name: "Green Field Traders", division: "Dhaka", district: "Dhaka", area: "Savar", address: "Savar Bazar Road, Savar", phone: "01711000001", lat: 23.8583, lng: 90.2667, link: "https://wa.me/8801711000001" },
  { name: "Palli Krishi Bhandar", division: "Rajshahi", district: "Bogura", area: "Sherpur", address: "Sherpur Bazar, Bogura", phone: "01711000002", lat: 24.6636, lng: 89.4181, link: "https://wa.me/8801711000002" },
  { name: "Uttaran Agro House", division: "Rangpur", district: "Dinajpur", area: "Sadar", address: "Station Road, Dinajpur", phone: "01711000003", lat: 25.6279, lng: 88.6332, link: "https://wa.me/8801711000003" },
  { name: "Jashore Krishi Store", division: "Khulna", district: "Jashore", area: "Sadar", address: "Chachra Road, Jashore", phone: "01711000004", lat: 23.1667, lng: 89.2081, link: "https://wa.me/8801711000004" },
  { name: "Karim Agro Center", division: "Chattogram", district: "Cumilla", area: "Sadar", address: "Kandirpar, Cumilla", phone: "01711000005", lat: 23.4607, lng: 91.1809, link: "https://wa.me/8801711000005" },
  { name: "Ananta Bandhu Bhandar", division: "Barishal", district: "Barishal", area: "Sadar", address: "Band Road, Barishal", phone: "01711000006", lat: 22.7010, lng: 90.3535, link: "https://wa.me/8801711000006" },
  { name: "Mymensingh Agro Traders", division: "Mymensingh", district: "Mymensingh", area: "Sadar", address: "Ganginar Par, Mymensingh", phone: "01711000007", lat: 24.7471, lng: 90.4203, link: "https://wa.me/8801711000007" },
  { name: "Sylhet Green Agro", division: "Sylhet", district: "Sylhet", area: "Sadar", address: "Zindabazar, Sylhet", phone: "01711000008", lat: 24.8949, lng: 91.8687, link: "https://wa.me/8801711000008" },
];

const distributors = [
  { name: "Md. Kamal Hossain", designation: "Sales Officer", division: "Dhaka", district: "Dhaka", territory: "Dhaka North", phone: "01911000001", lat: 23.7639, lng: 90.3897, link: "mailto:kamal@example.com" },
  { name: "Rafiqul Islam", designation: "Sales Officer", division: "Chattogram", district: "Chattogram", territory: "Chattogram Metro", phone: "01911000002", lat: 22.3569, lng: 91.7832, link: "mailto:rafiqul@example.com" },
  { name: "Nasrin Akter", designation: "Regional Sales Officer", division: "Rajshahi", district: "Rajshahi", territory: "Rajshahi Division", phone: "01911000003", lat: 24.3745, lng: 88.6042, link: "mailto:nasrin@example.com" },
  { name: "Shahin Alam", designation: "Sales Officer", division: "Khulna", district: "Khulna", territory: "Khulna Metro", phone: "01911000004", lat: 22.8456, lng: 89.5403, link: "mailto:shahin@example.com" },
];

const products = [
  {
    name: "এলেক্স জিরেবেরিক",
    category: "crop-health",
    shortDescription: "Gibberellic Acid 20% — boosts flowering, fruit set and uniform growth",
    description: "A plant growth regulator (Gibberellic Acid 20%) that promotes flowering, improves fruit set, and encourages uniform crop growth across vegetables, fruits and cereals.",
    image: "/images/products/gibberellic-acid.png",
    isFeatured: true,
  },
  {
    name: "এটি-পিওর জিপ জিপসাম",
    category: "crop-health",
    shortDescription: "Gypsum — Calcium 20%, Sulphur 16% soil conditioner",
    description: "A soil-conditioning gypsum (Calcium 20%, Sulphur 16%) that improves soil structure and supplies essential calcium and sulphur for healthier root development and higher yields.",
    image: "/images/products/gypsum.png",
    isFeatured: true,
  },
  {
    name: "এলেক্স এস বোরন",
    category: "crop-health",
    shortDescription: "Solubor Boron 20% — corrects boron deficiency",
    description: "A fully water-soluble boron fertilizer (Boron 20%) that corrects boron deficiency, supporting flowering, fruit setting and overall plant vigor.",
    image: "/images/products/s-boron.png",
    isFeatured: true,
  },
  {
    name: "এলেক্স হিউস্টার",
    category: "crop-health",
    shortDescription: "Humic Acid 60% — root development and nutrient uptake",
    description: "A concentrated humic acid (60%) that strengthens root development, improves nutrient absorption, and revitalizes soil health for better and more consistent yields.",
    image: "/images/products/humic-acid.png",
  },
  {
    name: "এলেক্স জিংক (মনো)",
    category: "crop-health",
    shortDescription: "Zinc Sulphate Monohydrate — corrects zinc deficiency",
    description: "Zinc Sulphate Monohydrate fertilizer that corrects zinc deficiency in soil, essential for healthy leaf development and higher crop yield.",
    image: "/images/products/zinc-mono.png",
  },
  {
    name: "এলেক্স বরিক",
    category: "crop-health",
    shortDescription: "Boric Acid — Boron 17% micronutrient",
    description: "A boric acid based micronutrient fertilizer (Boron 17%) supporting flower and fruit development across a wide range of crops.",
    image: "/images/products/boric-acid.png",
  },
  {
    name: "এলেক্স চিলেটেড জিংক",
    category: "crop-health",
    shortDescription: "Chelated Zinc 10% — fast-absorbing micronutrient",
    description: "A chelated zinc formulation (10%) engineered for fast, efficient absorption, correcting zinc deficiency more effectively than conventional zinc sources.",
    image: "/images/products/chelated-zinc.png",
  },
];

const gallery = [
  { type: "photo", title: "Farmer training session", url: "", order: 0 },
  { type: "photo", title: "Field visit with dealers", url: "", order: 1 },
  { type: "video", title: "Company overview", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "", order: 0 },
];

const careers = [
  { title: "Territory Sales Officer", location: "Rangpur", employmentType: "Full-time", description: "Manage dealer relationships and drive sales growth across the assigned territory.", applyLink: "mailto:alexagro001@gmail.com" },
  { title: "Agronomist", location: "Dhaka (Head Office)", employmentType: "Full-time", description: "Provide technical crop advisory support to the sales and product teams.", applyLink: "mailto:alexagro001@gmail.com" },
];

const banners = [
  {
    title: "Your dedicated crops friend",
    subtitle: "Strength for every stage of growth — from seedling to harvest.",
    image: "/images/alex-agro-banner.png",
    link: "/about",
    order: 0,
  },
  {
    title: "Rooted in nature, backed by science",
    subtitle: "Bio-based crop health inputs formulated for safe food production.",
    image: "/images/leaves-falling.jpg",
    link: "/products/crop-health",
    order: 1,
  },
  {
    title: "Present in every district",
    subtitle: "A growing network of dealers and sales officers across Bangladesh.",
    image: "/images/floating-island-2.jpg",
    link: "/network/dealers",
    order: 2,
  },
];

async function run() {
  await connectDB();

  await Promise.all([
    Dealer.deleteMany({}),
    Distributor.deleteMany({}),
    Product.deleteMany({}),
    GalleryItem.deleteMany({}),
    Career.deleteMany({}),
    Banner.deleteMany({}),
  ]);

  await Dealer.insertMany(dealers);
  await Distributor.insertMany(distributors);
  await Product.insertMany(products);
  await GalleryItem.insertMany(gallery);
  await Career.insertMany(careers);
  await Banner.insertMany(banners);

  console.log("Seed data inserted successfully.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

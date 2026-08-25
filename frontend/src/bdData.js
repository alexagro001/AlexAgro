// Bangladesh's 8 divisions and their 64 districts, plus an approximate
// center coordinate for each district (its headquarters town). Used to:
//  1) power the cascading Division -> District dropdowns in the admin forms
//  2) auto-drop the map pin near the right place as soon as a district is
//     picked, before the admin fine-tunes it (by typing an area and using
//     "Locate on map", or by clicking directly on the map).
// These coordinates are convenient defaults, not survey-grade — always
// nudge the pin to the exact spot for a real address.

export const bdDivisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

export const bdDistrictsByDivision = {
  Dhaka: [
    "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur",
    "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
  ],
  Chattogram: [
    "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar",
    "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati",
  ],
  Rajshahi: [
    "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj",
  ],
  Khulna: [
    "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia",
    "Magura", "Meherpur", "Narail", "Satkhira",
  ],
  Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  Rangpur: [
    "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari",
    "Panchagarh", "Rangpur", "Thakurgaon",
  ],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
};

export const districtCentroids = {
  Dhaka: [23.8103, 90.4125],
  Faridpur: [23.607, 89.8429],
  Gazipur: [23.9999, 90.4203],
  Gopalganj: [23.005, 89.8266],
  Kishoreganj: [24.4449, 90.7766],
  Madaripur: [23.1641, 90.1897],
  Manikganj: [23.8644, 90.0047],
  Munshiganj: [23.5422, 90.5305],
  Narayanganj: [23.6238, 90.499],
  Narsingdi: [23.9322, 90.715],
  Rajbari: [23.7574, 89.6444],
  Shariatpur: [23.2423, 90.4348],
  Tangail: [24.2513, 89.9167],

  Bandarban: [22.1953, 92.2184],
  Brahmanbaria: [23.9571, 91.1119],
  Chandpur: [23.2331, 90.6712],
  Chattogram: [22.3569, 91.7832],
  Cumilla: [23.4607, 91.1809],
  "Cox's Bazar": [21.4272, 92.0058],
  Feni: [23.0159, 91.3976],
  Khagrachhari: [23.1193, 91.9847],
  Lakshmipur: [22.944, 90.8282],
  Noakhali: [22.8696, 91.0995],
  Rangamati: [22.6533, 92.1747],

  Bogura: [24.8465, 89.3773],
  Joypurhat: [25.0968, 89.0227],
  Naogaon: [24.7936, 88.9318],
  Natore: [24.4206, 88.9871],
  Chapainawabganj: [24.5965, 88.2775],
  Pabna: [24.0064, 89.2372],
  Rajshahi: [24.3745, 88.6042],
  Sirajganj: [24.4533, 89.7006],

  Bagerhat: [22.6602, 89.7895],
  Chuadanga: [23.6402, 88.841],
  Jashore: [23.1667, 89.2081],
  Jhenaidah: [23.5453, 89.1539],
  Khulna: [22.8456, 89.5403],
  Kushtia: [23.9013, 89.1206],
  Magura: [23.4873, 89.4198],
  Meherpur: [23.7622, 88.6318],
  Narail: [23.1725, 89.5126],
  Satkhira: [22.7185, 89.0705],

  Barguna: [22.0953, 90.1121],
  Barishal: [22.701, 90.3535],
  Bhola: [22.6859, 90.6482],
  Jhalokati: [22.6406, 90.1987],
  Patuakhali: [22.3596, 90.3299],
  Pirojpur: [22.5841, 89.972],

  Habiganj: [24.3745, 91.4155],
  Moulvibazar: [24.4829, 91.7774],
  Sunamganj: [25.0658, 91.395],
  Sylhet: [24.8949, 91.8687],

  Dinajpur: [25.6279, 88.6332],
  Gaibandha: [25.3288, 89.5285],
  Kurigram: [25.8054, 89.6362],
  Lalmonirhat: [25.9923, 89.2847],
  Nilphamari: [25.9317, 88.856],
  Panchagarh: [26.3411, 88.5541],
  Rangpur: [25.7439, 89.2752],
  Thakurgaon: [26.0336, 88.4616],

  Jamalpur: [24.9375, 89.9372],
  Mymensingh: [24.7471, 90.4203],
  Netrokona: [24.871, 90.7276],
  Sherpur: [25.0204, 90.0153],
};

# Alex Agro — Agro-Business Website

A full-stack website for an agricultural inputs business (crop health +
agro processing): a public site with a dealer/sales-officer map, an admin
panel backed by MongoDB Atlas that updates the site live, and a contact
form that emails you directly.

> **Bangla summary:** এই zip এ backend আর frontend দুই জায়গাতেই `.env`
> ফাইল আগে থেকেই বসানো আছে — আপনার MongoDB Atlas কানেকশন স্ট্রিং সহ। শুধু
> নিচের **Quick start** অংশের কমান্ডগুলো চালালেই সাইট চলে উঠবে। কোম্পানির
> নাম **Alex Agro**, ইমেইল **alexagro001@gmail.com** — `frontend/src/siteConfig.js`
> ফাইলে সেট করা আছে।

Structure (a competitor's public navigation) was used only as a
reference for information architecture — the brand name, logo, copy, and
colors here are Alex Agro's own.

---

## Quick start (already configured — just run these)

```bash
npm run install-all && npm run dev
```

That single command installs everything (root, backend, frontend) and then
starts both servers together:
- Public site → http://localhost:5173
- Admin panel → http://localhost:5173/admin/login
- API → http://localhost:5000

**Admin login:** username `admin`. The password is the same on localhost and
live; only its bcrypt hash is stored, in `backend/config/adminAccess.js` (ask
the site owner for it). Forgot it? Use **Forgot password?** on the login page
with the recovery key. To change it from code: `node backend/hashSecret.js
"new-password"`, paste the hash into `adminAccess.js` and bump
`passwordVersion`.

Want sample dealers/products so the site isn't empty while you explore?

```bash
npm run seed
```

---

## What's already set up for you — nothing left to configure

- **`backend/.env`** — `MONGO_URI` is filled in with your MongoDB Atlas
  cluster (`sabbithasan003_db_user`), pointing at a database named
  `alex-agro`. A random `JWT_SECRET` is already generated.
- **`frontend/.env`** — points at `http://localhost:5000/api`.
- **Brand** — `frontend/src/siteConfig.js` has the name (Alex Agro), tagline
  ("Your dedicated Crops Friend"), description, and public contact email
  (`alexagro001@gmail.com`) already set.
- **Email sending** — `SMTP_USER`/`SMTP_PASS` are filled in with
  `alexagro001@gmail.com` and its App Password. Every contact-form
  submission is saved to the database (**Messages** in the admin panel)
  *and* emailed straight to `alexagro001@gmail.com`.

If you ever need to rotate the Gmail App Password (Google → Security →
App Passwords) or move to a different SMTP provider, just update
`SMTP_USER` / `SMTP_PASS` / `SMTP_HOST` in `backend/.env` — nothing else
needs to change.

---

## What's included

- **Real interactive 3D map of Bangladesh** (Home page, Dealer/Sales Officer
  list, and detail pages): built with [Three.js](https://threejs.org) using
  actual district boundary geometry for all 64 districts (not an
  illustration) — colored by division, hover lifts a district in 3D with a
  tooltip, click selects it and filters the dealer/officer list, drag to
  rotate, scroll to zoom. Loads only on the pages that use it (code-split),
  so it doesn't slow down the rest of the site.

- **3D animated product showcase** (homepage + Products page): real product
  photos slide continuously with a floating "sitting on top of the screen"
  depth effect (built with [anime.js](https://animejs.com)), scroll-triggered
  entrance animation, and a fixed "View Details" button while products drift
  past it. Click any product to see it expanded full-size. Newest
  admin-added product leads automatically.
- **Real Bangladesh upazila data**: the Dealer/Sales Officer admin forms
  have a genuine Division → District → Upazila cascading dropdown (492 real
  upazila names, not placeholders) instead of free-text area fields.
- **Bangla/English product fields**: admin can optionally fill in a Bangla
  name/description for each product; the site shows it automatically when
  a visitor switches the language toggle, falling back to English if left
  blank.
- **Career applications**: the Career page is a direct CV drop (name,
  email, CV upload) rather than job postings — admin reviews submissions
  from **Admin → Career Applications**, and every submission also emails
  the team inbox.

- **Public site** (React + Vite): Home, About Us, Products (Crop Health,
  Agro Processing), Distribution Network (Dealer List, Sales Officer),
  Gallery (Photo, Videos), Career, Contact Us, plus a site-wide search icon
  that searches dealers and sales officers.
- **Interactive map**: every dealer/sales officer added in the admin panel
  appears as a pin (Leaflet + OpenStreetMap, no API key required). Clicking
  a pin opens a popup with a "Visit / Contact" link that redirects to
  whatever URL you set for that dealer (WhatsApp, Facebook, website, etc) —
  even if you paste a bare email or phone number, it's handled correctly.
- **Admin panel** (`/admin`): JWT-protected CRUD screens for Dealers, Sales
  Officers, Products, Gallery, and incoming Contact messages & Career applications.
  Every change saves to MongoDB Atlas and is reflected on the public site
  immediately — no redeploy needed.
  - **Division → District dropdowns**: pick a Division and the District list
    filters automatically; picking a District drops the map pin near that
    area right away.
  - **"Locate on map" button**: add an Area/Street and click it to fetch a
    precise point from the address (via OpenStreetMap), or just click
    anywhere on the mini-map to place the pin by hand.
  - **Upload photos/videos from your device**: every photo/image/video field
    has an "Upload from device" button — no need to host images elsewhere
    and paste a URL, though pasting a URL still works too.
- **Contact form → your inbox**: submissions are saved to the database *and*
  emailed straight to `alexagro001@gmail.com`.
- **Homepage banner slider**: an auto-advancing, admin-managed banner at the
  top of the homepage (arrows + dots, click-through link support). Manage
  slides from **Admin → Homepage Banners** — comes pre-loaded with 3
  illustrated placeholder banners so the page isn't empty on first run.
- **Bangladesh division map**: an illustrated, clickable map of the 8
  divisions (styled like a real map, not the precise Leaflet pin map) on the
  Dealer List / Sales Officer pages — click a division to filter the list
  and see how many dealers/officers are there.
- **Product carousel**: Crop Health and Agro Processing pages show products
  as an always-auto-sliding showcase (title, image, View Details) instead of
  a static grid.
- **English ⇄ Bangla language switch**: a toggle in the navbar (`EN` / `বাং`)
  translates the site's built-in text — navigation, headings, buttons,
  footer, form labels. Admin-entered content (product names, dealer info,
  descriptions typed into the admin panel) stays as typed either way, since
  translating arbitrary user content would need either a translation API or
  separate English/Bangla fields per record — ask if you'd like that added.
- **Distinct visual identity**: leaf-shaped buttons that sway gently, leaf
  icons and leaf-shaped hover states on every nav item, a bark-textured
  root-motif navbar/footer, and two custom leaf cursors (default + hover) —
  all built with plain CSS, no external theme.

---

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19 + Vite, React Router, Axios, Leaflet / React-Leaflet |
| Backend   | Node.js + Express, Mongoose (MongoDB), JWT auth, Nodemailer |
| Database  | MongoDB Atlas |
| Map tiles | OpenStreetMap (free, no API key) |

## Folder structure

```
alex-agro/
├── backend/          Express API (dealers, distributors, products, gallery,
│                      careers, contact, admin auth)
│   ├── models/         Mongoose schemas
│   ├── routes/         REST endpoints
│   ├── middleware/      JWT auth guard
│   ├── utils/            Email sending
│   ├── seed.js            Optional sample data
│   └── .env                Already filled in
└── frontend/         React app
    ├── src/pages/        Public pages
    ├── src/pages/admin/  Admin panel pages + CRUD config
    ├── src/components/   Navbar, Footer, Map, LeafButton, SearchOverlay...
    ├── src/styles/        Design tokens + component CSS
    ├── src/siteConfig.js  Brand name, tagline, nav menu, contact info
    └── .env                Already filled in
```

---

## Build for production

```bash
cd frontend && npm run build     # outputs static files to frontend/dist
cd backend  && npm start          # runs the API with Node directly
```

## Deploying (Render + Vercel)

This is a **monorepo** (`backend/` and `frontend/` in one repo), so both Render
and Vercel need to be told which subfolder to actually build — that's the
one setting that trips people up. Deploy the backend first, since the
frontend needs its live URL.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`.gitignore` already excludes both `.env` files, `node_modules/`, and
uploaded files — your real MongoDB password, JWT secret, and email
credentials will **not** be pushed. Only `.env.example` (the template,
with placeholder values) gets committed.

### 2. Backend → Render

1. [render.com](https://render.com) → **New** → **Web Service** → connect
   your GitHub repo.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment** → add every variable from `backend/.env.example` with
   your real values (`MONGO_URI`, `JWT_SECRET`, `SMTP_*`, etc.). Leave
   `CLIENT_URLS` as `http://localhost:5173` for now — you'll update it
   in step 4 once the frontend has a real URL. Render sets `PORT` itself,
   so you don't need to add it.
6. Deploy, then copy the live URL Render gives you (something like
   `https://alex-agro-backend.onrender.com`) — the frontend needs it next.

### 3. Frontend → Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → same repo.
2. **Root Directory**: `frontend`
3. Framework preset: **Vite** (Vercel usually detects this automatically).
   Build command `npm run build` and output directory `dist` are already
   the defaults, and `frontend/vercel.json` (already in the project)
   handles the routing so pages like `/about` or `/admin` don't 404 on a
   direct visit or refresh.
4. **Environment Variables** → add `VITE_API_URL` = your Render URL from
   step 2, with `/api` on the end, e.g.
   `https://alex-agro-backend.onrender.com/api`.
5. Deploy, then copy the live URL Vercel gives you (e.g.
   `https://alex-agro.vercel.app`).

### 4. Connect them

Go back to Render → your backend service → **Environment** → update
`CLIENT_URLS` to your real Vercel URL from step 3 (comma-separate if you
have more than one, e.g. a custom domain too) → save (Render redeploys
automatically). Without this step the browser will block the frontend's
requests to the backend (CORS).

### 5. MongoDB Atlas network access

Atlas → **Network Access** → make sure `0.0.0.0/0` (or Render's IP range)
is allowed, since Render's outbound IP isn't fixed on standard plans.

### ⚠️ A real limitation to know about: video & CV uploads

**Product/dealer/gallery photos and the "Our Products" showcase are fully
safe** — those are stored as self-contained data directly in MongoDB, so
they survive redeploys with no extra setup.

**Gallery/banner videos and submitted CVs are different** — those save to
a file on the server's disk (`backend/uploads/`), and most hosts including
Render's standard web service use a disk that resets on every redeploy or
restart. In practice: any video or CV uploaded through the live site could
disappear the next time you push a change or Render restarts the service.

If you plan to use video/CV uploads for real, the simplest fix is Render's
**persistent disk** add-on (Render dashboard → your service → **Disks** →
add one mounted at `/opt/render/project/src/backend/uploads`) — no code
changes needed. If that's not available on your plan, let me know and I
can switch video/CV storage over to a proper cloud storage service
instead.

### A note on the database password

`backend/.env` is listed in `.gitignore`, so `git push` will **not** upload
your MongoDB password to GitHub — that's intentional. If this credential
was ever shared anywhere public, rotate it in Atlas under **Database
Access** just to be safe.

---

## Customizing further

- **Brand / nav menu** → `frontend/src/siteConfig.js`
- **Colors / fonts** → CSS variables in `frontend/src/styles/theme.css`
  (`--canopy-green`, `--root-brown`, `--sprout-lime`, `--harvest-amber`...)
- **Logo** → `frontend/public/favicon.svg`
- **Bangla translations** → `frontend/src/i18n/bn.js`. It's a simple lookup:
  the key is the exact English text used in the UI, the value is the Bangla
  translation. Any English string not listed there just stays in English
  when Bangla is selected, so you can add coverage incrementally.

## Adding real photos & videos

Every Product/Dealer/Sales Officer/Gallery/Banner admin form has an "Upload
from device" button — pick a file straight from your computer and it fills
in the field automatically. Pasting a URL (e.g. a Cloudinary/S3 link, or a
YouTube/Vimeo embed for Gallery videos) still works too, side by side with
uploading.

**Images** (photos) are converted to a self-contained data URI and stored
directly in the database record — there's no separate file to serve
afterwards, so there's nothing that can go stale, get the wrong URL, or
fail to load later. Max size: **4MB per image**. **Videos** are saved to
`backend/uploads/` and served at `/uploads/<filename>`, since a multi-MB
video would be too large to store as an inline data URI.

## Notes on the map

The public map is locked to a Bangladesh view — visitors can't pan or zoom
out to see the rest of the world, keeping focus on your actual coverage
area. Dealers and sales officers each store a latitude/longitude. In the admin
form: pick a Division, then a District (the list filters automatically) —
the pin jumps to that district right away. Type an Area/Street and press
"Locate on map" for a more precise point, or just click anywhere on the
mini-map to place the pin by hand. The public map pulls every *active*
dealer/sales officer from the database and plots them automatically;
toggling "Visible on site" off hides an entry from the public map without
deleting it.

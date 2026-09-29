# 🛍️ EasyBuy – Fashion Marketplace for Bangladesh

[![Live Site](https://img.shields.io/badge/Live%20Site-Visit-blue?style=for-the-badge)](https://easy-buy-ruddy.vercel.app/)
[![Client Repo](https://img.shields.io/badge/Client-Repository-black?style=for-the-badge&logo=github)](https://github.com/OmitHasanAdor/EasyBuy)
[![Server Repo](https://img.shields.io/badge/Server-Repository-green?style=for-the-badge&logo=github)](https://github.com/OmitHasanAdor/easybuy-server)

### EasyBuy is a modern, two-sided fashion marketplace built for buyers and sellers in Bangladesh, focused on men's and women's clothing. The platform combines a clean, editorial-style shopping experience with a trust-first approach — vetted sellers, transparent pricing, role-based access, and an AI-powered Virtual Trial Room.

---

## Technologies Used

* **Frontend Framework:** Next.js 16 (App Router with Turbopack) & React 19, written in TypeScript
* **AI Virtual Try-On Engine:** Hugging Face Spaces via `@gradio/client`, utilizing category-specialized diffusion models:
  * **IDM-VTON** for high-fidelity Upper-body garments
  * **OOTDiffusion DressCode (`/process_dc`)** for Lower-body (pants, chinos, skirts) and Full-Body Dresses
* **Animation & Interactivity:** Framer Motion (page transitions, interactive comparison sliders, modal animations) & Swiper.js
* **Authentication:** Better-Auth, with role-based access control for buyers, sellers, and admins
* **Styling & UI Components:** Tailwind CSS v4, Lucide React & React Icons
* **Database Integration:** PostgreSQL (Neon / Docker local), managed with Prisma ORM 7
* **Deployment:** Vercel (client) & Render (server)
* **Workflow & Collaboration:** Jira for task tracking, GitHub for version control and code review

---

## Features

1. **AI Virtual Trial Room:**
   * **Category-Aware AI Engine Routing:** Automatically or manually routes garments between **Upper-body**, **Lower-body**, and **Dresses** to ensure accurate anatomical placement.
   * **Personal Model Photo Gallery:** Shoppers can save multiple poses (Front-facing, Studio, Casual), upload custom full-body photos, and switch active models effortlessly.
   * **Gallery Management & Accidental Delete Protection:** In-modal gallery manager and `/dashboard/buyer/looks` tab with an explicit confirmation dialog before removing personal photos, plus a 1-click **Restore Default Poses** button.
   * **Before / After Comparison Slider:** Interactive touch- and mouse-responsive split slider to compare original user photos with the AI-draped outfit.
   * **Save Look & Direct Add-to-Cart:** One-click saving to buyer's personal Lookbook (`/dashboard/buyer/looks`) and instant add-to-cart with chosen product variant.
2. **Split Hero Banner:** A distinctive men's/women's split hero section with a diagonal seam, reflecting the brand's dual-audience identity right on the homepage.
3. **Featured Categories & Try-On Discovery:** Quick-access category filters, catalog "Try-On Ready" apparel badges, and deep-link discovery CTAs.
4. **Trending & Best Sellers Products:** Responsive product grids with customer ratings, pricing in BDT (৳), and discount badges.
5. **Interactive Product Detail Experience:** Full multi-image Swiper gallery with synchronized thumbnail preview, size/color variant selector, stock counters, customer reviews, and recommended items.
6. **Checkout & Payments:** Cash on delivery or online payment through SSLCommerz, with server-side price and inventory verification.
7. **Role-Based Dashboards:**
   * **Buyers:** Order tracking, review management, and saved AI Lookbook & personal model photo gallery.
   * **Sellers:** Product creation with AI listing copilot, inventory management, and order processing.
   * **Admins:** Seller approvals, product and review moderation, and full platform oversight.
8. **Consistent Editorial Aesthetic:** Warm off-white & rust-orange visual identity, paired with Fraunces serif and Manrope typography.

---

## 👥 Demo User Accounts & Credentials

For testing and grading, the database comes pre-seeded with role-based demo accounts:

| Role | Name | Email | Password | Pre-configured Try-On Poses |
|---|---|---|---|---|
| **Buyer** | Sophia Vance | `sophia.vance@easybuy.com` | `EasyBuy123!` | Full-Body Front (Tank & Jeans), Slip Dress Pose |
| **Buyer** | Marcus Chen | `marcus.chen@easybuy.com` | `EasyBuy123!` | Athletic Front (Tank & Jeans), Denim Pose |
| **Buyer** | Elena Rostova | `elena.rostova@easybuy.com` | `EasyBuy123!` | Studio Front (Bobhair & Jeans) |
| **Buyer** | Eshams | `eshams05@gmail.com` | *(OAuth / Custom)* | Full-Body Front Model Pose |
| **Seller** | Shams Fashion | `shams05@gmail.com` | `password` | Verified store vendor with active catalog |
| **Admin** | EasyBuy Admin | `admin@easybuy.com` | *(Configured in `.env`)* | Platform administrator |

> **Tip:** Log in as **Sophia Vance** or **Marcus Chen** to test the AI Virtual Trial Room immediately with pre-loaded high-resolution full-body poses.

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/OmitHasanAdor/EasyBuy.git
cd EasyBuy

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 2. Database & Seeding

```bash
# Generate Prisma Client
npx prisma generate

# Seed admin and demo virtual try-on buyer accounts
npm run seed  # or: npx prisma db seed
```

### 3. Run Development Server

```bash
npm run dev   # Opens on http://localhost:3000
```

> **Note:** The backend API lives in the [easybuy-server](https://github.com/OmitHasanAdor/easybuy-server) repository and must be running (locally on port `5000` by default).

---

### Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection string (Neon or Docker) |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Better-Auth authentication configuration |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `HUGGINGFACE_TOKEN` | Hugging Face Access Token for AI Virtual Try-On spaces. Supports comma-separated tokens for load pooling (`hf_xxx,hf_yyy`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credentials used when running `prisma db seed` for the admin account |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public URL of this application, used by the client auth |
| `NEXT_PUBLIC_API_URL` | Base URL of `easybuy-server` (e.g. `http://localhost:5000`). Required for builds |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata and Open Graph links |

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Site | [easy-buy-ruddy.vercel.app](https://easy-buy-ruddy.vercel.app/) |
| 💻 Client Repository | [github.com/OmitHasanAdor/EasyBuy](https://github.com/OmitHasanAdor/EasyBuy) |
| 🖥️ Server Repository | [github.com/OmitHasanAdor/easybuy-server](https://github.com/OmitHasanAdor/easybuy-server) |
| ⚙️ Server API | [https://easybuy-server-kszk.onrender.com](https://easybuy-server-kszk.onrender.com) |

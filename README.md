# 🛍️ EasyBuy – Fashion Marketplace for Bangladesh

[![Live Site](https://img.shields.io/badge/Live%20Site-Visit-blue?style=for-the-badge)](https://easy-buy-ruddy.vercel.app/)
[![Client Repo](https://img.shields.io/badge/Client-Repository-black?style=for-the-badge&logo=github)](https://github.com/OmitHasanAdor/EasyBuy)
[![Server Repo](https://img.shields.io/badge/Server-Repository-green?style=for-the-badge&logo=github)](https://github.com/OmitHasanAdor/easybuy-server)

### EasyBuy is a modern, two-sided fashion marketplace built for buyers and sellers in Bangladesh, focused on men's and women's clothing. The platform combines a clean, editorial-style shopping experience with a trust-first approach — vetted sellers, transparent pricing, and role-based access for buyers, sellers, and admins.

---

## Technologies Used

* **Frontend Framework:** Next.js (App Router) & React.js, written in TypeScript
* **Authentication:** Better-Auth, with role-based access control for buyers, sellers, and admins
* **Styling & UI Components:** Tailwind CSS
* **Icons:** Lucide React & React Icons
* **Database Integration:** PostgreSQL, managed with Prisma ORM
* **Deployment:** Vercel (client) & Render (server)
* **Workflow & Collaboration:** Jira for task tracking, GitHub for version control and code review

---

## Features

1. **Split Hero Banner:** A distinctive men's/women's split hero section with a diagonal seam, reflecting the brand's dual-audience identity right on the homepage.
2. **Featured Categories:** Quick-access category browsing so shoppers can jump straight to what they're looking for.
3. **Trending Products:** A dedicated section highlighting what's popular on the platform right now.
4. **Best Sellers Grid:** A responsive product grid with ratings, pricing in BDT (৳), and discount badges.
5. **Why Choose Us:** A trust-building section covering fast delivery, secure payment, easy returns, and curated, vetted sellers.
6. **Consistent Design System:** A cohesive off-white & rust-orange visual identity, paired with Fraunces and Manrope typography, applied across every component.
7. **Fully Responsive UI:** A mobile-first layout built with Tailwind CSS, adapting cleanly across mobile, tablet, and desktop breakpoints.
8. **Checkout:** Cash on delivery or online payment through SSLCommerz, with prices and stock checked on the server.
9. **Seller & Admin Dashboards:** Sellers manage products, inventory and orders; admins approve sellers, moderate products and reviews, and move orders through their statuses.

---

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

The API lives in the [easybuy-server](https://github.com/OmitHasanAdor/easybuy-server) repository and must be running (locally on port 5000 by default).

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection used by Better-Auth and the dashboards |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Better-Auth configuration |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public URL of this app, used by the auth client |
| `NEXT_PUBLIC_API_URL` | Base URL of easybuy-server. **Required for `next build`** |
| `NEXT_PUBLIC_SITE_URL` | Public URL used for canonical and Open Graph links |

`NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them on Vercel.

---

## 🚧 In Progress

* **AI Chatbot:** Ai Chatbot will be help users to find their suitable product.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Site | [easy-buy-ruddy.vercel.app](https://easy-buy-ruddy.vercel.app/) |
| 💻 Client Repository | [github.com/OmitHasanAdor/EasyBuy](https://github.com/OmitHasanAdor/EasyBuy) |
| 🖥️ Server Repository | [github.com/OmitHasanAdor/easybuy-server](https://github.com/OmitHasanAdor/easybuy-server) |
| ⚙️ Server API | [https://easybuy-server-kszk.onrender.com](https://easybuy-server-kszk.onrender.com) |

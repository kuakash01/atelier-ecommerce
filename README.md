# Atelier & Co. — Full-Stack Luxury E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.7-764ABC?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)

**Atelier & Co.** is an enterprise-ready, full-stack luxury e-commerce application built with Next.js 15, React 19, TypeScript, Tailwind CSS v4, Express.js, and MongoDB. The system features a modern editorial storefront and an administration portal with segregated dual-token cookie authentication, OTP-based verification, catalog management, dynamic hero carousels, customizable multi-announcement banners, guest cart synchronization, and Razorpay payment integration.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Key Features](#key-features)
  - [Customer Storefront](#customer-storefront)
  - [Administration Portal](#administration-portal)
  - [Authentication & Security](#authentication--security)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Database Schema & Models](#database-schema--models)
- [API Route Reference](#api-route-reference)
- [Getting Started & Installation](#getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables Setup](#environment-variables-setup)
  - [Admin User Seeding](#admin-user-seeding)
  - [Running the Application](#running-the-application)
- [Scripts Reference](#scripts-reference)
- [License](#license)

---

## Architectural Overview

```
                        ┌────────────────────────────────────────────────────────┐
                        │                   CLIENT (BROWSER)                     │
                        └───────────────────────────┬────────────────────────────┘
                                                    │
                                      HTTP Requests & Cookies
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                                                                     │
                 ▼                                                                     ▼
    ┌─────────────────────────┐                                           ┌─────────────────────────┐
    │  STOREFRONT CLIENT      │                                           │  ADMINISTRATION PORTAL  │
    │  - App Router (SSR/CSR) │                                           │  - Next.js Middleware   │
    │  - Redux User State     │                                           │  - Admin Redux State    │
    │  - user_token Cookie    │                                           │  - admin_token Cookie   │
    │  - apiUser Axios Client │                                           │  - apiAdmin Axios Client│
    └────────────┬────────────┘                                           └────────────┬────────────┘
                 │                                                                     │
                 │         /api/... (Next.js API Handler: src/pages/api/[[...all]].js) │
                 └──────────────────────────────────┬──────────────────────────────────┘
                                                    │
                                                    ▼
                        ┌────────────────────────────────────────────────────────┐
                        │                  EXPRESS.JS ENGINE                     │
                        │                  (src/server/app.js)                   │
                        ├────────────────────────────────────────────────────────┤
                        │ • Cookie Parser & JWT Verification                     │
                        │ • Route-Aware Auth (admin_token vs user_token)         │
                        │ • Strict Role Enforcer (roleCheck("admin"))            │
                        │ • Brevo Emailer (OTP & Notifications)                  │
                        │ • Multer + Cloudinary Media Pipeline                   │
                        │ • Razorpay Payment Processor                           │
                        └───────────────────────────┬────────────────────────────┘
                                                    │
                                                    ▼
                        ┌────────────────────────────────────────────────────────┐
                        │                 MONGODB DATABASE                       │
                        │ • Users, Products, Variants, Carts, Orders,            │
                        │   Announcements, Carousels, Tax, Colors, Sizes         │
                        └────────────────────────────────────────────────────────┘
```

---

## Key Features

### Customer Storefront

- **Luxury Aesthetic**: Designed with an editorial typography hierarchy (*Plus Jakarta Sans* & *Outfit*), dark/light mode toggling, glassmorphism, and responsive micro-animations.
- **Dynamic Multi-Announcement Bar**:
  - Cycles through dynamic announcement messages retrieved from the database.
  - Links support both internal client navigation and external targets with visual CTA pills (*"Shop Now →"*).
  - Configurable rotation speeds, pause-on-hover, direct jump pagination dots, and dismiss persistence via `sessionStorage`.
  - Fallback luxury shimmer state for first-time visitors.
- **Hero Carousel Banner**: Dynamic hero slides with desktop & mobile media assets, title captions, subtitle badges, and redirect actions.
- **Product Catalog & Dynamic Filtering**:
  - Multi-attribute filtering by category hierarchy (Root & Sub-categories), color palettes, size options, and dual-thumb price range sliders.
  - Real-time search with debounce and popular suggestions.
  - Color-wise image gallery display with interactive thumbnail switching.
- **Cart Management**:
  - Local guest cart for unauthenticated visitors.
  - Automatic guest-to-account cart merging upon customer sign-in (`/api/cart/guest/sync`).
  - Real-time cart quantity controls, tax calculations, and promo code discounts.
- **Checkout & Payments**:
  - Multi-address selector and inline address creation.
  - **Razorpay Payment Gateway**: Seamless modal checkout with signature validation.
  - **Cash on Delivery (COD)** option with instant order confirmation.
- **Customer Account Suite**:
  - Active and historical orders with step-by-step shipment timeline tracking.
  - Branded printable/downloadable PDF tax invoices.
  - Multi-address book (default delivery tags, editing, deletion).

---

### Administration Portal

- **Executive Analytics Dashboard**:
  - KPI metric cards: Total Revenue, Gross Orders, Active Catalog Items, Total Customers.
  - Visual sales trend graphs powered by Recharts.
  - Recent order stream with immediate status modification actions.
- **Order Management**:
  - Paginated data tables with multi-field search, status filtering, and sorting.
  - Order status lifecycle transitions: `Placed` → `Confirmed` → `Shipped` → `Delivered` / `Cancelled`.
  - Order details slide-out drawer with tracking IDs, payment verification, and tax breakdown.
  - Branded admin invoice viewing.
- **Product & Inventory Catalog**:
  - Multi-variant product builder (SKU, price, stock, color, size).
  - Color-wise asset manager: Upload up to 10 high-resolution images per color variation directly to Cloudinary.
  - New Arrival toggles, active visibility switches, and instant catalog search.
- **Category Hierarchy**:
  - Nested parent-child category tree builder with thumbnail image uploads.
- **Content & Announcement Management**:
  - **Multi-Message Announcement Bar Manager**: Add, reorder (Move Up/Down), edit, and remove dynamic announcement messages.
  - Clickable destination link assigner with live test links.
  - Preset luxury color palettes (*Midnight Onyx*, *Royal Indigo*, *Forest Emerald*, *Deep Burgundy*) + native color picker.
  - Live interactive storefront preview in the admin panel with manual cycle controls and auto-cycle toggle.
  - **Hero Carousel Manager**: Manage banner ordering, redirect actions, and mobile/desktop image pairs.
- **Store Operations**:
  - Tax & GST rate administration with percentage calculation and status toggling.
  - Color palette definitions (Color Name + Hex code).
  - Size variant catalog (Standardized sizes, e.g., XS, S, M, L, XL, UK 8, UK 10).

---

### Authentication & Security

- **Isolated Dual-Token Architecture**:
  - **Admin Session**: Governed by the `admin_token` HTTP-only cookie and dedicated `adminToken` in `localStorage`.
  - **Storefront Customer Session**: Governed by the `user_token` HTTP-only cookie and `user_token` in `localStorage`.
  - **No Session Collision**: Signing into or logging out of a storefront account never affects an admin session, and vice versa.
- **OTP-Based Customer Registration**:
  - Two-step customer onboarding: The client inputs Name, Email, and Password, which triggers a 6-digit confirmation passcode dispatched to their inbox via Brevo.
  - Verification of the passcode creates the customer record and issues the session token.
- **Passwordless Sign-In**:
  - Customers can choose between password authentication or instant 6-digit email OTP login.
- **Multi-Tiered Admin Route Protection**:
  1. **Next.js Edge Middleware** ([`src/middleware.ts`](file:///c:/Users/kuaka/OneDrive/Documents/projects/Ecom/src/middleware.ts)): Validates the existence of `admin_token` before serving any `/admin/*` route; unauthorized requests redirect to `/admin/signin`.
  2. **Client-Side Admin Layout** ([`src/app/admin/layout.tsx`](file:///c:/Users/kuaka/OneDrive/Documents/projects/Ecom/src/app/admin/layout.tsx)): Verifies the token against the backend `/api/admin/auth/me` endpoint to ensure the account is active and role is `admin`, showing a loading barrier until authorized.
  3. **Backend Middleware** ([`verifyToken.js`](file:///c:/Users/kuaka/OneDrive/Documents/projects/Ecom/src/server/middlewares/verifyToken.js) & [`roleCheck.js`](file:///c:/Users/kuaka/OneDrive/Documents/projects/Ecom/src/server/middlewares/roleCheck.js)): Automatically checks for `admin_token` on `/api/admin/*` endpoints and rejects any non-admin token with `403 Forbidden`.

---

## Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | React framework for SSR, static generation, and edge routing |
| **Frontend Core** | React 19 & TypeScript | Declarative UI library with strict type-safety |
| **Styling** | Tailwind CSS v4 & Lucide | Modern utility-first CSS styling with custom theme tokens & icons |
| **State Management** | Redux Toolkit | Centralized state management for user sessions, cart, and theme |
| **UI Components** | Shadcn UI & Radix Primitives | Accessible UI primitives (Dialogs, Dropdowns, Sheets, Cards) |
| **Backend API** | Node.js & Express.js 5.1 | RESTful API server handling business logic and database queries |
| **Database** | MongoDB & Mongoose 8.13 | Document database with strongly typed schemas and relations |
| **Authentication** | JWT & HTTP-Only Cookies | Stateless session tokens with separate admin/storefront cookies |
| **Transactional Email** | Brevo (Sendinblue) API | Transactional SMTP engine for verification codes and notices |
| **Media Hosting** | Cloudinary & Multer | Cloud-based media storage, dynamic optimization, and transformations |
| **Payment Gateway** | Razorpay SDK | Secure online payment checkout with webhooks and signature checks |

---

## Project Directory Structure

```
Ecom/
├── public/                     # Static media, icons, and webmanifest
├── src/
│   ├── app/                    # Next.js 15 App Router pages & layouts
│   │   ├── [slug]/             # Category & Collection browsing
│   │   ├── admin/              # Admin Portal routes
│   │   │   ├── announcement/   # Announcement bar configuration
│   │   │   ├── carousel/       # Hero carousel slides manager
│   │   │   ├── category/       # Category hierarchy tree
│   │   │   ├── colors/         # Color palette master
│   │   │   ├── dashboard/      # Executive KPIs & analytics
│   │   │   ├── orders/         # Order processing & invoices
│   │   │   ├── products/       # Product & variant catalog
│   │   │   ├── signin/         # Admin login portal
│   │   │   ├── sizes/          # Size specifications
│   │   │   ├── tax/            # Tax & GST rates
│   │   │   └── layout.tsx      # Admin-level authentication gatekeeper
│   │   ├── cart/               # Shopping cart view
│   │   ├── checkout/           # Multi-step checkout & payment
│   │   ├── products/           # Product detail page ([productId])
│   │   ├── profile/            # Customer account, orders, addresses
│   │   ├── globals.css         # Global Tailwind CSS v4 styling & tokens
│   │   └── layout.tsx          # Storefront root layout
│   ├── components/             # Reusable UI & presentation components
│   │   ├── admin/              # Admin data tables, variation forms, product sheets
│   │   ├── common/             # Theme toggles, modal wrappers, search selects
│   │   ├── ui/                 # Shadcn UI primitives (Button, Card, Input, Sheet)
│   │   └── user/               # Storefront components
│   │       ├── Auth/           # AuthModal (OTP Registration, Password/OTP Login)
│   │       ├── header/         # Floating Header, AnnouncementBar, Searchbar
│   │       ├── home/           # Carousel, Categories, Featured Showcase
│   │       └── product/        # ProductGrid, VariantPicker, ImageGallery
│   ├── config/                 # Axios API clients
│   │   ├── apiAdmin.ts         # Admin client (uses admin_token)
│   │   └── apiUser.ts          # Storefront client (uses user_token)
│   ├── layouts/                # Structural layout frames
│   │   ├── admin/              # AppLayoutAdmin, HeaderLayoutAdmin, SidebarLayoutAdmin
│   │   └── user/               # AppLayout, AccountLayout, HeaderLayout, FooterLayout
│   ├── middleware.ts           # Next.js Edge route guard for /admin/*
│   ├── pages/                  # Next.js Pages API bridge
│   │   └── api/
│   │       └── [[...all]].js   # Catch-all API handler mounting Express app into Next.js
│   ├── redux/                  # Redux Toolkit slices (admin, user, theme, cart)
│   ├── server/                 # Express.js backend application
│   │   ├── app.js              # Express app setup, database connection & route mounting
│   │   ├── config/             # Database connection, Brevo mailer, Cloudinary
│   │   ├── conrollers/         # Route controllers (admin & storefront)
│   │   ├── middlewares/        # verifyToken (route-aware), roleCheck, multer
│   │   ├── models/             # Mongoose schemas (Product, Order, User, etc.)
│   │   ├── routes/             # Express API routing index
│   │   └── scripts/            # Database utility scripts (e.g. CreateAdmin.js)
│   ├── services/               # Frontend service layer (authService.ts)
│   ├── types/                  # Shared TypeScript interfaces & types
│   └── utils/                  # Helper utilities (Razorpay, formatting, routerCompat)
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## Database Schema & Models

| Model | File Location | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| **User** | `src/server/models/user.model.js` | `name`, `email`, `password`, `role`, `tokens` | System users (customers and administrators) |
| **Product** | `src/server/models/product.model.js` | `title`, `description`, `price`, `category`, `isNewArrival` | Master product catalog items |
| **ProductVariant** | `src/server/models/productVariant.model.js` | `product`, `color`, `size`, `sku`, `stock`, `price` | SKU-level product variations |
| **ColorWiseImage** | `src/server/models/colorWiseImages.model.js`| `product`, `color`, `images` | Color-specific media galleries on Cloudinary |
| **Order** | `src/server/models/order.model.js` | `user`, `items`, `totalAmount`, `paymentInfo`, `orderStatus` | Customer transactions and delivery tracking |
| **Cart / CartItem**| `src/server/models/cart.model.js` | `user`, `items`, `quantity`, `variant` | User shopping carts and persistent lines |
| **Category** | `src/server/models/category.model.js` | `name`, `slug`, `parentCategory`, `image` | Hierarchical category classification |
| **Announcement** | `src/server/models/announcement.model.js` | `items [{ text, link }]`, `backgroundColor`, `textColor`, `isActive`, `autoplaySpeed` | Storefront top announcement banner |
| **Carousel** | `src/server/models/carousel.model.js` | `desktopImage`, `mobileImage`, `redirectType`, `redirectValue`, `position` | Homepage hero carousel slides |
| **Address** | `src/server/models/address.model.js` | `user`, `fullName`, `street`, `city`, `state`, `postalCode`, `isDefault` | Customer shipping addresses |
| **Tax** | `src/server/models/tax.model.js` | `taxName`, `percentage`, `isActive` | Store tax and GST configuration |
| **Color / Size** | `src/server/models/color.model.js` | `name`, `hexCode` / `sizeName` | Standardized catalog attributes |

---

## API Route Reference

### Storefront Routes (`/api/...`)

- **Authentication** (`/api/auth`)
  - `POST /register-otp`: Dispatches a 6-digit confirmation passcode for account creation.
  - `POST /register`: Verifies OTP, hashes credentials, creates user, and sets `user_token`.
  - `POST /send-otp`: Sends passwordless login OTP to email.
  - `POST /verify-otp`: Validates login OTP and creates session.
  - `POST /login`: Validates email and password, returning user payload and cookies.
  - `GET /me`: Validates session and returns current user profile and cart count.
  - `GET /signout`: Clears `user_token` cookie and revokes session.
- **Catalog & Content**
  - `GET /api/products`: Lists published products with filtering, search, and pagination.
  - `GET /api/products/:id`: Fetches product details and color variations.
  - `GET /api/categories`: Lists root categories and sub-category trees.
  - `GET /api/announcement`: Fetches active dynamic announcement messages.
  - `GET /api/carousel`: Fetches active hero carousel slides.
- **Cart & Checkout**
  - `GET /api/cart`: Retrieves customer cart items.
  - `POST /api/cart/add`: Adds SKU item to cart.
  - `POST /api/cart/guest/sync`: Synchronizes local guest items into database cart on login.
  - `POST /api/checkout/create-razorpay-order`: Initiates a Razorpay payment order.
  - `POST /api/checkout/verify-payment`: Validates Razorpay signature and finalizes order.
  - `POST /api/checkout/cod`: Places a Cash on Delivery order.
- **Orders & Profile**
  - `GET /api/orders`: Retrieves customer order history.
  - `GET /api/orders/:id`: Fetches detailed order status and invoice data.
  - `GET /api/address`: Retrieves customer address book.
  - `POST /api/address`: Adds a new shipping address.

### Administration Routes (`/api/admin/...`)

*All admin endpoints are strictly protected by `verifyToken` checking `admin_token` and `roleCheck("admin")`.*

- **Admin Auth** (`/api/admin/auth`)
  - `POST /signin`: Authenticates admin credentials, saves token, and sets `admin_token` cookie.
  - `GET /me`: Returns authenticated admin profile.
  - `GET /signout`: Clears `admin_token` and revokes token in database.
- **Admin Orders** (`/api/admin/orders`)
  - `GET /`: Lists all orders with filters, search, and pagination.
  - `GET /dashboard/stats`: Returns aggregated financial metrics and monthly sales charts.
  - `GET /:id`: Retrieves complete order breakdown.
  - `PATCH /:orderId/status`: Updates fulfillment status (`Confirmed`, `Shipped`, `Delivered`, `Cancelled`).
- **Admin Products** (`/api/admin/products`)
  - `POST /`: Creates product item.
  - `PATCH /:id`: Updates product information.
  - `DELETE /:id`: Deletes product.
  - `POST /:productId/variants`: Adds variant combinations.
  - `PATCH /:productId/color-gallery/:colorId`: Uploads and updates Cloudinary color gallery.
- **Admin Announcements** (`/api/admin/announcement`)
  - `GET /`: Fetches announcement bar configuration.
  - `POST /save`: Saves dynamic messages array, destination links, colors, and rotation speed.
- **Admin Content & Masters**
  - `GET/POST/DELETE /api/admin/carousel`: Hero banner slide management.
  - `GET/POST/DELETE /api/admin/category`: Category tree hierarchy manager.
  - `GET/POST/DELETE /api/admin/tax`: Tax rates and status toggle.
  - `GET/POST/DELETE /api/admin/colors`: Master color definitions.
  - `GET/POST/DELETE /api/admin/sizes`: Master size definitions.

---

## Getting Started & Installation

### Prerequisites

- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
- **MongoDB**: A running local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.
- **Cloudinary Account**: Cloud name, API key, and secret for image uploads.
- **Brevo Account**: API Key and verified sender email for transactional OTP emails.
- **Razorpay Account**: Key ID and secret for test/production payments.

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ecom-fullstack.git
   cd ecom-fullstack
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

---

### Environment Variables Setup

Create a `.env` file in the root directory:

```env
# Mode
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecom?retryWrites=true&w=majority

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
BCRYPT_SALT_ROUNDS=10

# Brevo (Transactional Email for OTP)
BREVO_API_KEY=xkeysib-your_brevo_v3_api_key
EMAIL_ID=your_verified_sender_email@domain.com

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

> [!NOTE]
> **Unified Architecture**: The Express API is mounted directly inside Next.js via [`src/pages/api/[[...all]].js`](file:///c:/Users/kuaka/OneDrive/Documents/projects/Ecom/src/pages/api/[[...all]].js). Both frontend pages and backend routes run under the same origin (port 3000). Standalone server variables (`PORT`, `HOSTNAME`, `CORS_ORIGIN`) and client-side public URLs (`NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`) are no longer required.

---

### Admin User Seeding

To create an initial administrator account for accessing `/admin/signin`:

```bash
npm run seed:admin
```

This runs [`src/server/scripts/CreateAdmin.js`](file:///c:/Users/kuaka/OneDrive/Documents/projects/Ecom/src/server/scripts/CreateAdmin.js) to generate an admin user with role `admin`.

---

### Running the Application

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   - Storefront runs on: [http://localhost:3000](http://localhost:3000)
   - Admin Portal runs on: [http://localhost:3000/admin/signin](http://localhost:3000/admin/signin)
   - API endpoints run under: [http://localhost:3000/api](http://localhost:3000/api)

2. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches the Next.js development server on port 3000 (serving frontend & Express API) |
| `npm run build` | Compiles the production-ready Next.js bundle |
| `npm run start` | Starts the production Next.js server on port 3000 |
| `npm run seed:admin` | Seeds an initial administrator record into MongoDB |
| `npm run lint` | Runs ESLint analysis across the codebase |

---

## Security Best Practices Implemented

- **Segregated Cookies**: Dedicated `admin_token` cookie ensures admin sessions cannot be hijacked via storefront actions or third-party storefront plugins.
- **HTTP-Only & SameSite Protection**: Cookies are protected against XSS attacks via `httpOnly: true` and CSRF mitigated via `sameSite: 'lax'`.
- **Database Revocation Checking**: Tokens must match an active entry in the user's `tokens` array in MongoDB; logging out from any device revokes that token.
- **Password Hashing**: Passwords stored using bcrypt with 10 salt rounds.
- **Input Sanitization**: Express request bodies are trimmed, validated, and normalized before storage.

---

## License

This project is licensed under the [MIT License](LICENSE).

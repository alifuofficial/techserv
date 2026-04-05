# TechServ - Premium Tech Services Platform

A modern, full-featured web application for selling and managing tech services. Built with Next.js 16, Prisma, NextAuth, Tailwind CSS 4, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)

---

## Features

### Customer-Facing
- **Modern Homepage** — Animated hero, bento category grid, featured services, stats, and CTA sections
- **Service Catalog** — Searchable grid of all available services with pricing badges (One-Time / Recurring)
- **Service Detail Pages** — Dynamic pricing tiers, feature lists, and order forms
- **User Authentication** — Sign up, sign in with email/password
- **User Dashboard** — View order history, track order statuses
- **Order Placement** — Select service, choose pricing tier, submit payment proof

### Admin Dashboard
- **Overview** — Revenue stats, order analytics, recent activity with Recharts charts
- **Order Management** — View, approve, reject, and complete orders with admin notes
- **Service Management** — Create, edit, and deactivate services (CRUD)
- **Price Management** — Configure pricing tiers per service (subscription & one-time)
- **Customer Management** — View all users, their orders, and spending stats
- **System Settings** — Configure platform name, email, currency, and other settings

### Technical
- Two pricing models: **Subscription** (monthly) and **One-Time** payment
- Role-based access control (Admin / User)
- Responsive design — works on mobile, tablet, and desktop
- SQLite database with Prisma ORM
- RESTful API routes

---

## Tech Stack

| Category       | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript 5                        |
| Styling        | Tailwind CSS 4 + shadcn/ui          |
| Database       | SQLite via Prisma ORM               |
| Authentication | NextAuth.js v4 (Credentials)        |
| State          | Zustand + TanStack Query            |
| Animations     | Framer Motion                       |
| Charts         | Recharts                            |
| Icons          | Lucide React                        |
| Forms          | React Hook Form + Zod               |
| Runtime        | Bun                                 |

---

## Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Git**
- A terminal / command prompt

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/alifuofficial/techserv.git
cd techserv
```

### 2. Install Dependencies

Using **Bun** (recommended):
```bash
bun install
```

Using **npm**:
```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your preferred editor:

```env
# Database — SQLite file path (relative to project root)
DATABASE_URL="file:./db/custom.db"

# NextAuth — Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **Important:** Change `NEXTAUTH_SECRET` to a secure random string in production.

### 4. Set Up the Database

Generate Prisma client and push the schema:

```bash
bun run db:generate
bun run db:push
```

### 5. Seed the Database (Optional)

This creates sample services, an admin account, and a test user:

```bash
bun run db:seed
```

**Test Accounts after seeding:**

| Role  | Email                | Password |
|-------|----------------------|----------|
| Admin | admin@techserv.com   | admin123 |
| User  | user@test.com        | user123  |

### 6. Start the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
techserv/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── services/      # Service CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/route.ts
│   │   │   ├── orders/        # Order endpoints
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── admin/         # Admin endpoints
│   │   │       ├── stats/route.ts
│   │   │       ├── services/route.ts
│   │   │       ├── customers/route.ts
│   │   │       ├── orders/route.ts
│   │   │       └── settings/route.ts
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Overview
│   │   │   ├── orders/        # Order management
│   │   │   ├── services/      # Service management
│   │   │   ├── customers/     # Customer management
│   │   │   └── settings/      # System settings
│   │   ├── dashboard/         # User dashboard
│   │   ├── auth/              # Auth pages (signin, signup)
│   │   └── services/          # Public service pages
│   │       ├── page.tsx       # Service catalog
│   │       └── [slug]/page.tsx # Service detail
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── providers.tsx      # Client providers
│   │   ├── site-header.tsx    # Navigation header
│   │   └── site-footer.tsx    # Footer
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── db.ts              # Prisma client
│       └── utils.ts           # Utility functions
├── db/                        # SQLite database (auto-generated)
├── .env.example               # Environment template
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Available Scripts

| Command             | Description                        |
|---------------------|------------------------------------|
| `bun run dev`       | Start development server on :3000  |
| `bun run build`     | Build for production               |
| `bun run start`     | Start production server            |
| `bun run lint`      | Run ESLint                        |
| `bun run db:push`   | Push schema to database            |
| `bun run db:generate` | Generate Prisma client          |
| `bun run db:seed`   | Seed database with sample data     |

---

## Database Models

### User
- id, name, email, password, role (admin/user), phone, telegram

### Service
- id, title, slug, shortDescription, longDescription, features, icon
- **pricingType** — `subscription` or `one_time`
- **pricingTiers** — JSON array of `{label, duration, price, popular?}`

### Order
- id, userId, serviceId, status (pending/approved/rejected/completed)
- duration, amount, telegramUsername, screenshot, adminNote

### Setting
- id, key, value, label, type, group (system settings)

---

## Pricing Models

TechServ supports two pricing types per service:

**Subscription (Recurring)**
- Multiple duration tiers (1 month, 3 months, 6 months, etc.)
- Monthly price calculated automatically
- Example: Telegram Premium — $15.99/3mo, $28.99/6mo, $49.99/12mo

**One-Time Payment**
- Fixed price packages
- Example: Web Development — Landing Page $299, Business Site $799, Web App $2,499

---

## License

This project is private and proprietary. All rights reserved.

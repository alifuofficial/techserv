---
Task ID: 1
Agent: Main Orchestrator
Task: Build complete Tech Service Provider app

Work Log:
- Initialized fullstack dev environment
- Installed bcryptjs for password hashing
- Designed and pushed Prisma schema (User, Service, Order models)
- Configured NextAuth with credentials provider, JWT strategy, admin/user roles
- Built green tech color theme in globals.css (light + dark mode)
- Created Providers wrapper (NextThemes, SessionProvider, QueryClientProvider)
- Built SiteHeader with responsive nav, auth state, mobile drawer
- Built SiteFooter with 4-column layout
- Updated root layout with providers, header, footer
- Created 8 API routes (auth, services, orders, admin)
- Built landing page with hero, features, services, how-it-works, CTA sections
- Built services listing page with icon mapping and price calculation
- Built service detail page with pricing cards and order form
- Built auth sign-in and sign-up pages with validation
- Built user dashboard with stats, orders list, order detail
- Built admin dashboard with stats, orders management, approval workflow
- Seeded database with 4 services, admin user, test user, sample orders
- Fixed lint error (replaced useState+useEffect with useSyncExternalStore)
- All lint checks pass clean
- Dev server compiles and serves all routes with 200 status

Stage Summary:
- Complete multi-page Next.js 16 app with green tech theme
- Full auth flow (register, login, protected routes)
- Service catalog with dynamic pricing (3mo/6mo/12mo)
- Order placement with screenshot upload
- Admin panel with order management and approval
- Test accounts: admin@techserv.com/admin123, user@test.com/user123
- All 24 route files created successfully

---
## Task ID: 14 - admin-dashboard-page
### Work Task
Rebuild the admin dashboard overview page as a premium SaaS-style dashboard inside the existing SidebarInset layout.

### Work Summary
- Rewrote `/home/z/my-project/src/app/admin/page.tsx` as a "use client" component
- **Page Header**: Minimal "Dashboard" title + "Welcome back, Admin" subtitle
- **Stats Cards (4-card grid)**: Total Revenue (green, trending badge), Total Orders (primary), Pending Orders (amber, "Needs review" badge), Total Users (blue). Each card features a colored icon circle, large bold value, decorative gradient blob, and Framer Motion staggered entrance
- **Charts Section (2-col desktop, stacked mobile)**:
  - Bar Chart: Orders by Status using Recharts BarChart wrapped in ChartContainer with ChartConfig (green/yellow/blue/red per status), CartesianGrid, ChartTooltip, ChartLegend
  - Area Chart: Revenue Overview with 7-day mock data generated from actual revenue, monotone area with gradient fill using linearGradient, YAxis with $ formatter
- **Recent Orders Table**: Card with "View All" link to /admin/orders, clean Table component with columns (ID, Customer, Service, Amount, Status badge, Date, Actions), responsive mobile card view with status badges, empty state with icon
- **Quick Actions**: 3-card grid (Manage Orders → /admin/orders, View Services → /services, Back to Site → /) with hover arrow animations
- **Skeleton States**: Full skeleton loaders for stats cards, chart containers, and table rows during data fetch
- Uses Framer Motion container + fadeUp + scaleIn variants for smooth staggered animations
- All data fetched from /api/admin/stats and /api/admin/orders in parallel
- Lint passes clean, dev server compiles and serves /admin with 200 status
- Page renders inside SidebarInset — no min-h-screen wrapper or full-width header sections

---
## Task ID: 15 - admin-orders-page
### Work Task
Rebuild the admin orders management page as a modern SaaS-style orders table inside the existing SidebarInset layout.

### Work Summary
- Rewrote `/home/z/my-project/src/app/admin/orders/page.tsx` as a "use client" component
- **Page Header**: "Orders" title with dynamic count subtitle + search input (filters client-side by service title, user name, order ID, email) using shadcn Input with Search icon
- **Status Filter**: Desktop uses Tabs component (All, Pending, Approved, Completed, Rejected) with per-status counts; mobile uses Select dropdown. Tab change triggers API refetch via `/api/admin/orders?status=xxx`
- **Orders Table (Desktop)**: Clean table with Checkbox column (visual-only, supports select-all with indeterminate state), Order ID (mono font, truncated), Customer (name + email stacked), Service, Duration (formatted via helper), Amount (bold, green primary color), Status (colored badge with dot indicator), Date, Actions (View button → /admin/orders/[id]). Subtle hover states and `data-[state=selected]` styling
- **Mobile Cards**: Each order renders as a card with ID, status badge, service name, customer info, duration, date, amount, and arrow link — consistent with the dashboard's mobile card style
- **Empty State**: Clean dashed-border empty state with PackageSearch icon for filtered views, Package icon for all-orders view, with contextual messaging and descriptions
- **Skeleton Loading**: Full skeleton with header skeleton, tabs skeleton, and table skeleton (8 desktop rows, 5 mobile cards) with proper grid-column alignment matching the actual table layout
- **Status Badge Colors**: Consistent oklch-inspired theme colors: yellow (pending), blue (approved), green (completed), red (rejected) with both light and dark mode variants
- **Animations**: Framer Motion container with staggered children, fadeUp for header/tabs/table, rowVariants for mobile cards, AnimatePresence with fade transition on status filter change
- Uses `useMemo` for client-side search filtering, `useCallback` for checkbox handlers
- Proper cleanup with `cancelled` flag in useEffect fetch
- Lint passes clean, dev server compiles and serves /admin/orders with 200 status
- Page renders inside SidebarInset with p-4 md:p-6 — no min-h-screen, no full-width header sections

---
## Task ID: 16 - admin-order-detail-page
### Work Task
Rebuild the admin order detail page as a modern Stripe/Vercel-style detail page inside the existing SidebarInset layout.

### Work Summary
- Rewrote `/home/z/my-project/src/app/admin/orders/[id]/page.tsx` as a "use client" component
- **Breadcrumb Navigation**: Text breadcrumb (Admin > Orders > Order #XXXX) with ChevronRight separators + ghost Back button linking to /admin/orders
- **Order Header**: FileText icon in primary-colored box, Order ID in mono font, service name as subtitle, large StatusBadge (rounded pill with dot indicator), created date aligned right on desktop
- **Two Column Grid (lg:grid-cols-3)**:
  - **Left (col-span-2)**:
    - **Order Details Card**: Clean 2-column info grid with uppercase tracking-wider labels + medium values. Fields: Service Name, Duration (formatted), Amount (large bold green primary), Created, Last Updated
    - **Customer Information Card**: Avatar with initials at top (primary bg fallback) + name/email row with border separator. Below: 2-column info grid with Name, Email, Phone (or "Not provided" italic), Telegram (or "Not provided" italic), Order Telegram Username (conditional, only shown if different from user telegram)
  - **Right (col-span-1)**:
    - **Status Management Card** (primary/25 border + shadow-sm): Current status indicator in muted bg, 2x2 grid of status buttons (Pending/Clock yellow, Approved/CheckCircle blue, Completed/CheckCircle2 green, Rejected/XCircle red). Active state: filled bg + checkmark. Disabled when loading or already active. 44px min touch target. PATCH /api/orders/[id] with { status, adminNote }.
    - **Admin Notes Card**: Textarea with muted bg + border-border/60, Save Note button (full width). PATCH /api/orders/[id] with { adminNote }.
    - **Payment Proof Card**: If screenshot exists → green indicator "Payment proof received" + mono filename. If not → muted italic "No payment proof uploaded".
- **InfoField Component**: Reusable field with small uppercase label on top, medium value below. Supports mono, highlight, and children render props.
- **Toast Notifications**: Uses sonner `toast.success()` and `toast.error()` for status changes and note saves.
- **Skeleton Loader**: Full skeleton matching the page layout (breadcrumb, header, 3-column grid skeleton).
- **Not Found State**: Centered AlertCircle icon + message + Back to Orders button, no min-h-screen wrapper.
- **Animations**: Framer Motion container with staggered children (0.07s), fadeUp variant for each section.
- **Status Config**: Consistent statusConfig with badge classes, dot colors, icons, button classes, and active classes — matches the orders list page pattern exactly.
- **Dark Mode**: All cards, badges, and status buttons have proper dark mode variants using dark: prefix.
- Lint passes clean with 0 errors/0 warnings, dev server compiles and serves /admin/orders/[id] with 200 status
- Page renders inside SidebarInset with p-4 md:p-6 — no min-h-screen, no full-width header sections, no background wrappers

---
## Task ID: 18 - admin-api-routes
### Work Task
Create 5 admin API route files for services management, customers management, and settings management.

### Work Summary
Created 5 API route files with full TypeScript typing, auth + admin role checks, and proper error handling:

**1. `/api/admin/services/route.ts`**
- GET: Returns all services (including inactive) with `_count.orders`, ordered by `sortOrder asc` then `createdAt desc`
- POST: Creates a new service with validation (title, shortDescription, all 3 prices required). Auto-generates slug from title (lowercase, spaces→hyphens, stripped non-alphanumeric). Checks for duplicate slug (409). Returns 201 with created service.

**2. `/api/admin/services/[id]/route.ts`**
- GET: Returns service by ID with `_count.orders`. Returns 404 if not found.
- PATCH: Partial update of any service fields. Checks slug uniqueness on update (409). Returns updated service.
- DELETE: Checks order count before deletion. Returns 400 with descriptive error if orders exist. Returns 200 with success message.
- All handlers use `params: Promise<{ id: string }>` with `await params` (Next.js 16 pattern).

**3. `/api/admin/customers/route.ts`**
- GET: Returns all users excluding password, ordered by `createdAt desc`. Includes `_count.orders` and completed order amounts. Maps results to include computed `totalSpent` (sum of completed order amounts).

**4. `/api/admin/customers/[id]/route.ts`**
- GET: Returns user by ID with all their orders (including service data: id, title, slug, shortDescription, icon). Password excluded via `select`. Returns 404 if not found.

**5. `/api/admin/settings/route.ts`**
- GET: Returns all settings plus a `groups` object where settings are organized by their `group` field (e.g., `{ general: [...], system: [...], orders: [...] }`).
- PUT: Accepts `{ settings: [{ key, value }] }`. Validates array is non-empty. Uses `db.setting.upsert` for each setting — creates if key doesn't exist, updates value if it does. Returns array of updated settings.

All routes use consistent auth pattern: `getServerSession(authOptions)` → 401 if no session → 403 if role !== "admin". All errors caught with proper TypeScript typing (`error instanceof Error`). Lint passes clean with 0 errors. Dev server compiles without issues.

---
## Task ID: 20 - admin-services-pages
### Work Task
Create 3 admin services management pages: list page, create page, and edit page inside the existing SidebarInset layout.

### Work Summary
Created 3 complete admin services management pages with consistent design patterns matching the existing orders pages:

**1. `/admin/services/page.tsx` — Services List (751 lines)**
- **Page Header**: "Services" title with dynamic count subtitle + search input + "Add Service" primary button (with Plus icon) linking to /admin/services/new
- **Search**: Client-side filtering by title, slug, and short description using `useMemo`
- **Desktop Table**: Columns — Service (icon + title + slug), 3 Months Price, 6 Months Price, 12 Months Price (tabular-nums, primary color for 12mo), Orders (badge), Status (Active=green/Inactive=gray outline badge), Actions (Toggle active with Power/PowerOff icons, Edit→link, Delete with AlertDialog confirmation)
- **Mobile Cards**: Responsive card layout with icon+title+status, 3-column price boxes, order count + action buttons
- **Toggle Active**: PATCH to `/api/admin/services/[id]` with `{ isActive: !current }`, loading spinner, toast notifications
- **Delete**: AlertDialog confirmation, calls DELETE API, disabled when orders exist, shared dialog for mobile cards
- **Empty State**: Dashed border, PackageOpen icon for search, Package icon for empty, contextual messages
- **Skeleton**: Full skeleton matching table layout (6 desktop rows, 4 mobile cards)
- **Icon Mapping**: 16 Lucide icons mapped by name (Zap, Crown, Bot, TrendingUp, ShieldCheck, Code, Smartphone, Globe, MessageCircle, Package, Settings, Wrench, Layers, Cpu, Wifi, Rocket) — rendered via `React.createElement` to avoid lint errors with component creation during render

**2. `/admin/services/new/page.tsx` — Create Service (497 lines)**
- **Breadcrumb**: Services > New Service with ChevronRight separators + Back button
- **Card Form** with react-hook-form: Title (required), Slug (auto-generated from title via `generateSlug` helper, editable), Short Description (required), Long Description (textarea), Icon (8-column grid of clickable icon buttons with primary border for selected), Features (comma-separated textarea), Pricing (3-column grid with $ prefix inputs for 3mo/6mo/12mo, all required), Sort Order (number, default 0), Is Active (switch toggle, default true)
- **Sections**: Separated by dividers with section headers (Basic Info, Service Icon, Features, Pricing, Settings) and descriptive icons
- **Submit**: POST to /api/admin/services with proper type coercion, success toast + redirect, error handling with toast
- **Slug Generation**: `useEffect` watches title changes and auto-generates slug (lowercase, spaces→hyphens, strip special chars)

**3. `/admin/services/[id]/page.tsx` — Edit Service (660 lines)**
- **Same form structure** as create page, pre-filled via `reset()` after fetching from GET `/api/admin/services/[id]`
- **Loading skeleton** while fetching, **not found state** with AlertCircle icon + back button
- **Card description** shows order count warning (amber text) when orders exist
- **Delete section**: Red outlined delete button at bottom-left (disabled when orders > 0, shows order count), AlertDialog confirmation, DELETE API call, toast + redirect on success
- **Submit**: PATCH to `/api/admin/services/[id]`, success toast + redirect

**Design Consistency**: All 3 pages follow the same patterns as orders pages — Framer Motion container/staggered animations, `p-4 md:p-6 space-y-5/6` containers, consistent badge styling, shadcn/ui components throughout, dark mode support via `dark:` prefixes.
- Lint passes clean with 0 errors/0 warnings
- Dev server compiles without issues

---
## Task ID: 21 - admin-customers-pages
### Work Task
Create 2 admin customers management pages: customers list page and customer detail page inside the existing SidebarInset layout.

### Work Summary
Created 2 complete admin customers management pages with consistent design patterns matching the existing orders/services pages:

**1. `/admin/customers/page.tsx` — Customers List**
- **Page Header**: "Customers" title with dynamic count + subtitle "Manage your platform users" + search input (filters by name, email client-side using `useMemo`)
- **Stats Row (3-card grid)**: Total Customers (Users icon, primary color), Total Revenue (DollarSign icon, green), Average Order Value (TrendingUp icon, blue). All computed from fetched data via `useMemo`. Cards have hover border transitions.
- **Desktop Table**: Columns — Customer (Avatar with initials colored by role: admin=primary, user=muted + name + email stacked), Role badge (admin=default/primary, user=secondary), Phone (or "—"), Telegram (or "—"), Orders count (badge), Total Spent (green primary text, tabular-nums), Joined date, Actions (View button → /admin/customers/[id])
- **Mobile Cards**: Responsive card layout with avatar+name+email+role, meta row (phone, telegram, order count), bottom row with joined date + spent amount + arrow link
- **Empty State**: Dashed border, UserSearch icon for search, Users icon for empty, contextual messages
- **Skeleton Loading**: Full skeleton with header, stats (3 cards), and table skeleton (6 desktop rows, 4 mobile cards) matching exact grid column layout

**2. `/admin/customers/[id]/page.tsx` — Customer Detail**
- **Breadcrumb + Back**: Text breadcrumb (Admin > Customers > Customer Name) with ChevronRight + ghost Back button to /admin/customers
- **Two Column Grid (lg:grid-cols-3)**:
  - **Left (col-span-2)**:
    - **Card 1: Customer Profile**: Large avatar (14x, colored by role) + name + role badge + email. Below: 2-column info grid with Phone, Telegram (italic "Not provided" when null), Joined Date, Last Order Date (computed from orders, italic "No orders yet" when empty)
    - **Card 2: Customer Orders**: Full orders table with Order ID (truncated mono), Service, Duration, Amount (primary green), Status badge (same colors as orders page), Date, View action → /admin/orders/[id]. Empty state with PackageOpen icon when no orders. Responsive mobile cards for each order.
  - **Right (col-span-1)**:
    - **Card 3: Quick Stats**: 5 stat items in stacked layout — Total Orders (primary icon), Total Spent (green icon, computed from completed orders only), Pending Orders (yellow icon), Completed Orders (green icon), Avg Order Value (blue icon). Each uses a StatItem component with colored icon circle.
    - **Card 4: Contact Info**: Email (with copy button), Phone (if available, with copy button), Telegram (if available, with copy button). "No additional contact info" message when both null. CopyButton component with clipboard API + sonner toast.
- **Status Config**: Consistent with orders page — yellow (pending), blue (approved), green (completed), red (rejected) with light/dark mode variants.
- **InfoField + StatItem + CopyButton**: Reusable sub-components for consistent layout.
- **Not Found State**: AlertCircle icon + message + Back to Customers button.
- **Skeleton + Loading**: Full skeleton matching page layout.

**Design Consistency**: Both pages follow the exact same patterns as orders/services pages — Framer Motion container/staggered animations, `p-4 md:p-6 space-y-5` containers, consistent badge/icon colors, shadcn/ui components, dark mode support. Data fetched from GET /api/admin/customers and GET /api/admin/customers/[id]. Lint passes clean with 0 errors/0 warnings. Dev server compiles and serves /admin/customers with 200 status.

---
## Task ID: 22 - admin-settings-page
### Work Task
Create the admin system settings page for platform configuration management.

### Work Summary
Created `/home/z/my-project/src/app/admin/settings/page.tsx` as a "use client" component with full settings management UI:

- **Page Header**: Settings icon in primary-colored box + "Settings" title + "Manage your platform configuration" subtitle
- **Tabs Navigation**: Dynamic tabs generated from API response groups (General, Orders, System) with icons (Globe, ShoppingCart, ShieldCheck) and amber dot indicator for unsaved changes
- **Group Settings Card**: Each tab renders a card with:
  - CardHeader: Group icon in colored circle + group label + group description
  - CardContent: Settings organized by type with separators between toggle and field sections
  - CardFooter: Unsaved changes counter + Discard (ghost) and Save Changes (primary) buttons with loading state
- **Toggle Settings**: Horizontal layout with icon (AlertTriangle for dangerous maintenance_mode, Info for others), label, description, and Switch component. Maintenance mode shows yellow warning styling when enabled; auto_approve shows blue styling when enabled
- **Text/Textarea Settings**: Vertical layout with label + mono key badge + description + Input/Textarea field, displayed in responsive 2-column grid (md:grid-cols-2)
- **Change Tracking**: `formValues` state tracks all current values; `isGroupDirty` compares against original data per group; modified count shown in footer
- **Save**: PUT to `/api/admin/settings` with only the modified settings for the active group; updates original data on success; toast.success with modified count
- **Discard**: Resets group settings to original saved values; toast.info confirmation
- **Setting Descriptions**: 19 known settings with descriptive help text derived from `settingDescriptions` map, with fallback generator
- **Group Metadata**: Ordered display (general → orders → system → others) with icons, descriptions, and accent colors
- **Skeleton Loading**: Full page skeleton with header, tabs list, and settings card skeleton (4 rows with separators)
- **Empty State**: Centered Settings icon + message when no settings found
- **Animations**: Framer Motion container + fadeUp staggered entrance, animated tab content transitions
- **Dark Mode**: Full dark mode support with dark: prefixed classes on all interactive elements
- Lint passes clean with 0 errors/0 warnings, dev server compiles and serves /admin/settings with 200 status
- Page renders inside SidebarInset with p-4 md:p-6 space-y-6 container

---
## Task ID: 23 - flexible-pricing-forms
### Work Task
Update admin service create and edit forms to support the new flexible pricing model with `pricingType` (subscription/one_time) and dynamic `pricingTiers` JSON array.

### Work Summary
Updated 4 files to replace the old fixed 3-price model (price3m/price6m/price12m) with the new flexible pricing system:

**1. `/api/admin/services/route.ts` — Updated POST handler**
- Replaced price3m/price6m/price12m validation with pricingType + pricingTiers validation
- Validates pricingType is "subscription" or "one_time"
- Validates pricingTiers is a non-empty array with each tier having a label (string) and price (number >= 0)
- Stores pricingTiers as JSON.stringify() in the database
- Removed old price field references

**2. `/api/admin/services/[id]/route.ts` — Updated PATCH handler**
- Same pricingType/pricingTiers validation as POST
- Uses conditional spread for pricingType and pricingTiers (JSON.stringify) fields
- Removed old price field references

**3. `/admin/services/new/page.tsx` — Create Service (rewritten)**
- **PricingTier type**: `{ label, duration, price, popular?, description? }`
- **Pricing Type Toggle**: Two styled toggle buttons (not radio buttons) with Repeat icon for "Recurring Subscription" and CreditCard icon for "One-Time Payment". Active state uses primary color border + bg + text. Max-width constraint (max-w-md).
- **Dynamic Pricing Tiers Editor**: Interactive list of tier cards managed via useState (not react-hook-form since it's complex array state)
  - Each tier card has: Label input, Duration dropdown (Select from shadcn/ui with 5 predefined durations for subscription, disabled "One-Time" input for one_time), Price input with $ prefix, Popular toggle with amber Star icon, Description input
  - "+ Add Tier" button adds new empty tier
  - X delete button on each tier (disabled when only 1 tier remains)
  - Scrollable container (max-h-500px overflow-y-auto) for many tiers
  - Empty state with dashed border when all tiers removed
- **Pricing type change**: Resets all tiers to a single empty tier with appropriate default duration
- **Form submission**: Filters valid tiers (label + price > 0), serializes to JSON, sends pricingType + pricingTiers array to API
- All other sections preserved: Basic Info, Icon Selection, Features, Settings, breadcrumb, back button, cancel/submit

**4. `/admin/services/[id]/page.tsx` — Edit Service (rewritten)**
- Same pricing UI as create page
- **Pre-population**: Parses pricingTiers JSON string from API response into PricingTier[] array with safe try/catch fallback to single empty tier
- Preserves pricingType from API response
- All other features preserved: loading skeleton, not-found state, delete functionality with order count warning, breadcrumb, back button

**TierEditor Component**: Shared inline component in both pages with consistent props interface, renders a card-like row with responsive grid layout (sm:2-col, lg:4-col for main inputs + full-width description).

**Design**: Green/primary theme consistent with existing admin pages. shadcn/ui components (Card, Input, Button, Switch, Select, Label, Separator). Dark mode support via dark: prefixes. Framer Motion animations preserved.
- Lint passes clean with 0 errors/0 warnings
- Dev server compiles and serves /admin/services/new with 200 status

---
## Task ID: 24 - flexible-pricing-marketing-pages
### Work Task
Update the marketing (public-facing) service catalog and detail pages to support the new flexible pricing model with `pricingType` (subscription/one_time) and dynamic `pricingTiers` JSON data.

### Work Summary
Updated 2 marketing-facing service pages to replace the hardcoded 3-tier pricing model with dynamic flexible pricing:

**1. `/src/app/services/page.tsx` — Service Catalog**
- **Service interface**: Replaced `price3m`, `price6m`, `price12m` with `pricingType` (string) and `pricingTiers` (string). Added `orderCount`.
- **PricingTier interface + helper**: Added `PricingTier` type and `getParsedTiers()` helper function to safely parse JSON tiers.
- **Price display on cards**: 
  - Subscription services: Shows "From $X.XX/mo" using the cheapest computed monthly rate across all tiers
  - One-time services: Shows "From $X.XX" using the cheapest one-time price (no /mo suffix)
- **Pricing type badge**: Added a small `Badge` on each card below the description:
  - Subscription: primary-colored outline badge reading "Subscription"
  - One-time: amber-colored outline badge reading "One-Time"
- All existing patterns preserved: search, framer-motion animations, skeleton loading, empty state, grid layout

**2. `/src/app/services/[slug]/page.tsx` — Service Detail (biggest change)**
- **Service interface**: Replaced `price3m`, `price6m`, `price12m` with `pricingType` and `pricingTiers`
- **Removed all hardcoded pricing logic**: Removed `DurationKey` type, `pricingOptions` constant array, `getPrice()`, `getMonthlyPrice()`, `getSavings()` old functions
- **New pricing helpers**:
  - `getParsedTiers()`: Safe JSON parse with fallback to empty array
  - `getMonthlyPrice(tier)`: Extracts month count from duration regex, returns per-month price or null
  - `getSavings(tier, allTiers)`: Computes savings % by comparing monthly rate against cheapest across all tiers
- **State change**: `selectedDuration: DurationKey | null` → `selectedTier: PricingTier | null` (tier comparison by `duration` field)
- **Sidebar Pricing Summary**: 
  - Dynamic tier buttons from parsed data instead of hardcoded 3 options
  - Subscription tiers: shows label + monthly rate + savings percentage
  - One-time tiers: shows label + price + description (if any)
  - Added pricing type badge next to "Pricing" title
- **Pricing Section (cards)**:
  - Title: "Choose Your Plan" (subscription) / "Choose Your Package" (one-time)
  - Subtitle: "Select the subscription duration..." / "Select the package that fits your needs."
  - Responsive grid: 2 columns for ≤2 tiers, 3 columns for 3+ tiers
  - Each card: tier label, price with monthly breakdown (subscription), description (one-time), popular badge, feature hints with type-appropriate text, select button
- **Order Form**:
  - Duration label uses tier label (e.g. "Basic Bot" or "6 Months") instead of hardcoded "3 Months plan"
  - Total uses `selectedTier.price`
  - Everything else preserved (telegram username, screenshot upload, submit)
- **Features section**: CardDescription changes based on pricingType — "Everything included with your subscription" vs "Everything included with this service"
- All existing UI patterns preserved: framer-motion, shadcn/ui, breadcrumbs, skeletons, toast, AnimatePresence
- Lint passes clean with 0 errors/0 warnings
- Verified Prisma client has correct fields (pricingType, pricingTiers) via direct test
---
Task ID: 1
Agent: Main Agent
Task: Update pricing model to support both subscription and one-time payment services

Work Log:
- Updated Prisma schema: removed price3m/price6m/price12m, added pricingType (string) and pricingTiers (JSON string)
- Reset database and reseeded with 6 services: 2 subscription (Telegram Premium, Channel Promotion) and 4 one-time (Bot Dev, Web Dev, Account Services, Mobile App Dev)
- Updated all 5 API routes (admin services CRUD, public services, orders) to handle new pricing model
- Updated admin services list page: single pricing column with type badge + computed display price
- Updated admin service create/edit forms: pricing type toggle + dynamic tier editor with add/remove
- Updated marketing service catalog: pricing type badges + appropriate price display
- Updated marketing service detail: dynamic pricing cards, adaptive layout for subscription vs one-time
- Updated landing page: dynamic price calculation from parsed tiers

Stage Summary:
- Services now support two pricing types: "subscription" (recurring) and "one_time" (one-time payment)
- Admin can create services with custom pricing tiers via interactive tier editor
- Each tier has: label, duration, price, optional popular flag, optional description
- Subscription services show monthly rates; one-time services show flat prices
- All lint checks pass (0 errors)
- Dev server compiles and serves correctly


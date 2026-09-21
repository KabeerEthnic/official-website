# Kabeer — The Ethnic Store

A production ecommerce platform for a boutique selling handcrafted Indian ethnic
wear: suits, kurtis, cord sets and tote bags. Customers browse, search and filter
the catalogue, build a cart, check out and pay online; the owner runs the whole
shop — catalogue, stock, orders, customers, reviews, discounts and the words and
images on the site itself — from an admin area built into the same application.

The storefront's visual design was hand-built page by page and is preserved
exactly. This repository adds the backend, the data layer and the admin area
underneath it.

*Design and brand by **Amalin Lab**: each page was conceived as a room in a
family-owned heritage boutique rather than a generic shop — a warm homepage, a
shop that reads like a grand wardrobe, product pages that feel like an atelier
consultation, and a calm, trustworthy checkout.*

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Technology stack](#2-technology-stack)
3. [Project structure](#3-project-structure)
4. [System architecture](#4-system-architecture)
5. [Database architecture](#5-database-architecture)
6. [Frontend architecture](#6-frontend-architecture)
7. [Backend architecture](#7-backend-architecture)
8. [Authentication](#8-authentication)
9. [Ecommerce flow](#9-ecommerce-flow)
10. [Admin and CMS](#10-admin-and-cms)
11. [Environment variables](#11-environment-variables)
12. [Local development](#12-local-development)
13. [Database migrations](#13-database-migrations)
14. [Production deployment](#14-production-deployment)
15. [Security](#15-security)
16. [Performance](#16-performance)
17. [Testing](#17-testing)
18. [Troubleshooting](#18-troubleshooting)
19. [Development rules](#19-development-rules)
20. [Production checklist](#20-production-checklist)
21. [Known gaps](#21-known-gaps)

---

## 1. Project overview

**What it is.** A full-stack storefront and back office for one boutique. It is
built to be deployed publicly and used by real customers and a real owner, not as
a demo.

**What customers can do**

- Browse four collections, each with its own hand-built layout
- Search, filter by collection, colour and price, sort, and page through results
- Read product detail, specifications, stock availability and reviews
- Register, sign in, and stay signed in across visits
- Build a cart while signed out and keep it after signing in
- Save items to a wishlist
- Manage an address book and profile, and change their password
- Apply a coupon, check out, and pay by card, UPI, netbanking or wallet
- See order history and detail, and cancel an order that has not been paid
- Write a review (published after the owner approves it)

**What the owner can do**

- See revenue, open orders, low stock and pending moderation at a glance
- Create, edit, archive and delete products — pricing, sale pricing, SKU, stock,
  images, specifications, colour, badge, category and visibility
- Manage collections and their ordering
- Search and filter orders, open one, move it through fulfilment, record payment,
  or cancel it and return the stock
- View customers, their addresses and order history, and suspend or reactivate
  an account
- Approve, reject or delete reviews
- Create and manage coupons with validity windows, usage limits and minimums
- Edit the words and images on the homepage and each collection page

**What the platform guarantees**

- Prices, discounts, tax and totals are always computed on the server
- Stock cannot be oversold, even by two shoppers buying the last piece at once
- A payment is only trusted after it has been verified with the provider
- Every provider webhook is processed exactly once

---

## 2. Technology stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite 6, JavaScript | The existing storefront; Vite keeps builds and HMR fast |
| Styling | Tailwind CSS v4 | Already the design's styling system, preserved as-is |
| Animation | Motion (`motion/react`) | Drives the existing page transitions and lookbooks |
| Icons | lucide-react | Already used throughout the design |
| Routing | react-router 7 | Client routing with lazy route loading |
| Backend | Node.js 20.12+ and Fastify 5, JavaScript | Small, fast, first-party plugins for cookies, CORS, helmet, rate limiting, multipart, compression |
| ORM | Prisma 6 | Typed queries, interactive transactions, first-class migrations |
| Database | PostgreSQL via Supabase | Managed Postgres with pooling and backups |
| Validation | Zod 3 | One schema serves the route, the service and the seed |
| Payments | Razorpay | Used through its REST API; hosted checkout keeps card data off this system |
| Media | Supabase Storage | Used through its REST API; only URLs are stored in Postgres |
| Tests | `node:test` | Built in; no test framework dependency |
| Lint | ESLint 9 | Catches unused code and React hook mistakes |

**Dependencies that are deliberately absent.** Passwords use `node:crypto`
scrypt rather than bcrypt/argon2; Razorpay and Supabase Storage are called over
`fetch` rather than through their SDKs; sessions are opaque database rows rather
than JWTs. Each avoids a dependency without giving anything up.

---

## 3. Project structure

```
/
├── .git/
├── frontend/          React + Vite storefront and admin area
├── backend/           Fastify API, Prisma schema, migrations, seed
├── README.md          this file
└── task.txt           the original brief
```

### `frontend/`

```
frontend/
├── index.html
├── vite.config.js            build config, "@" alias, dev proxy to the API
├── wrangler.jsonc            Cloudflare Workers deploy: static dist/ + SPA fallback
├── eslint.config.js
├── public/
│   └── _headers              immutable caching for /assets, no cache for HTML
└── src/
    ├── main.jsx              React root
    ├── imports/              bundled brand artwork (logo, lookbook heroes)
    ├── styles/               fonts.css · tailwind.css · theme.css
    ├── lib/
    │   ├── api/client.js     fetch wrapper: cookies, errors, aborts
    │   ├── api/index.js      every endpoint, grouped by resource
    │   ├── format.js         ₹ and date formatting
    │   ├── product.js        API product → the shape the designed cards expect
    │   └── razorpay.js       loads the hosted checkout on demand
    └── app/
        ├── App.jsx           providers + routes (lazy-loaded)
        ├── context/          AuthContext · CartContext · WishlistContext
        ├── hooks/            useQuery · useDebouncedValue
        ├── layouts/Layout.jsx
        ├── components/       the designed sections, unchanged in appearance
        │   ├── account/      address book, profile
        │   ├── admin/        admin UI kit + CMS field renderer
        │   └── ui/           button, input, cn()
        └── pages/
            ├── Home · Shop · ProductDetails · Cart · Checkout
            ├── Login · Register · ForgotPassword · Account
            ├── Support · Policy · NotFound
            └── admin/        AdminLayout + eleven admin screens
```

### `backend/`

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/           20260920000000_init
│   │                         20260921000000_email_support_audit
│   ├── seed.js               idempotent seeding
│   └── seed.data.js          launch catalogue + page content
├── src/
│   ├── config/               env contract · CMS section registry
│   ├── emails/               HTML + plain-text templates
│   ├── controllers/          request handling (admin/ for the back office)
│   ├── lib/                  prisma · errors · password · session · money ·
│   │                         slug · serialize · razorpay · storage · email
│   ├── middleware/           auth · csrf · errorHandler · cartContext
│   ├── routes/               URL wiring, rate limits (admin/ nested)
│   ├── services/             business logic and transactions
│   ├── validators/           Zod schemas
│   ├── app.js                builds the Fastify instance
│   └── server.js             listen, maintenance loop, graceful shutdown
├── test/                     node:test suites
├── .env.example
└── README.md                 backend-focused documentation
```

There is deliberately no root-level `/api`, `/server`, `/database`, `/admin`,
`/shared` or `/uploads`. The admin area is a set of routes inside the frontend;
uploads live in object storage.

---

## 4. System architecture

```
                    ┌──────────────────────────────────────────┐
                    │              Customer / Owner            │
                    │                  (browser)               │
                    └───────────────────┬──────────────────────┘
                                        │ HTTPS
                    ┌───────────────────▼──────────────────────┐
                    │  frontend  ·  React + Vite (static host)  │
                    │  storefront routes  +  /admin routes      │
                    │  lib/api  ·  Auth/Cart/Wishlist contexts  │
                    └───────────────────┬──────────────────────┘
                                        │ fetch, credentials: include
                                        │ session cookie (httpOnly)
                    ┌───────────────────▼──────────────────────┐
                    │  backend  ·  Fastify                      │
                    │  helmet · CORS allowlist · Origin/CSRF     │
                    │  rate limit · body limits · Zod validation │
                    │  routes → controllers → services           │
                    └───┬───────────────┬──────────────────┬────┘
                        │ Prisma        │ REST             │ REST
            ┌───────────▼──────┐ ┌──────▼───────┐ ┌────────▼────────┐
            │   PostgreSQL     │ │   Razorpay   │ │ Supabase Storage│
            │   (Supabase)     │ │              │ │                 │
            └──────────────────┘ └──────┬───────┘ └─────────────────┘
                                        │ signed webhook
                                        └──────────► /api/webhooks/razorpay
```

**Request path.** A page calls a function in `lib/api`, which calls the API with
the session cookie attached. Fastify checks the origin, applies the rate limit,
resolves the session where the route asks for it, validates the body with Zod,
and hands a controller a clean input. The controller calls a service; the service
owns the rules and the transaction; the response goes out through a serializer.

**Media path.** The admin posts a file to `/api/admin/media`. The server checks
its real format from the bytes, generates the object key, uploads it to Supabase
Storage, and returns the public URL, which is what the database stores.

**Payment path.** The server creates the order and asks Razorpay to open a
payment for the order's own total. The browser completes payment in Razorpay's
hosted window. The server then verifies the result with Razorpay before treating
the order as paid — and the webhook does the same independently, so a closed
browser tab cannot lose a confirmed payment.

---

## 5. Database architecture

Schema: `backend/prisma/schema.prisma`.

### Entities

| Group | Models |
| --- | --- |
| Identity | `User`, `Session`, `Address` |
| Catalogue | `Category`, `Product`, `ProductImage`, `Inventory` |
| Shopping | `Cart`, `CartItem`, `WishlistItem` |
| Sales | `Order`, `OrderItem`, `Payment`, `WebhookEvent` |
| Marketing | `Coupon`, `CouponRedemption`, `Review`, `NewsletterSubscriber` |
| Content | `Page`, `PageSection` |
| Support | `SupportTicket`, `SupportMessage` |
| Governance | `EmailOtp`, `AuditLog` |

### Relationships

```
User ──< Session                     sessions are revoked, not deleted, on logout
User ──< Address
User ──1 Cart ──< CartItem >── Product
User ──< WishlistItem >── Product
User ──< Order ──< OrderItem >── Product (nullable)
                └──< Payment
User ──< Review >── Product
Category ──< Product ──1 Inventory
                    └──< ProductImage
Coupon ──< CouponRedemption >── Order
Page ──< PageSection
User ──< SupportTicket ──< SupportMessage    a ticket may reference one Order
User ──< AuditLog                            actorEmail is snapshotted, so the
                                             trail survives the account
EmailOtp                                     keyed by address, not by user
```

### Constraints and indexes

- Unique: `User.email`, `Product.slug`, `Product.sku`, `Category.slug`,
  `Order.orderNumber`, `Payment.providerPaymentId`, `Coupon.code`,
  `Session.tokenHash`, `Cart.userId`, `Cart.sessionToken`,
  `(cartId, productId)`, `(userId, productId)` on reviews and wishlist,
  `(pageId, key)`, `(provider, eventId)` on webhook events.
- Indexed for the queries that actually run: `(status, categoryId)`,
  `(status, createdAt)` and `(status, price)` on products; `(userId, createdAt)`
  and `(status, createdAt)` on orders; `(productId, position)` on images;
  `(productId, status)` on reviews.
- `Order.userId` is `onDelete: Restrict` — a customer with orders cannot be
  deleted out from under their history. `OrderItem.productId` is `SetNull`, so
  deleting a product leaves past orders readable through their snapshots.
- `Product.categoryId` is `onDelete: Restrict`; the API additionally refuses to
  delete a category that still holds products.

### Inventory

`Inventory` carries three numbers per product:

- `quantity` — what can still be sold
- `reserved` — what an unpaid order is currently holding
- `capacity` — the batch size behind the "AVAILABLE: n%" limited-edition
  indicator on the lookbook pages

Checkout decrements `quantity` and increments `reserved` in one conditional
update. Payment moves the reservation into a sale; cancellation or expiry moves
it back to `quantity`. `Order.inventorySettledAt` is claimed atomically so each
order settles exactly once no matter how many times a webhook is delivered.

### Orders

An order snapshots everything it needs to stay readable forever: product name,
SKU, slug, image and unit price per line, and the full shipping address. Later
edits to a product or an address never rewrite history. Totals are stored
decomposed — `subtotal`, `discount`, `shipping`, `tax`, `total` — so an invoice
can always be reconstructed.

### Payments

`Payment` records the provider, its order and payment ids, the amount and the
status. `WebhookEvent` records every delivery by `(provider, eventId)` with a
unique constraint, which is what makes webhook handling idempotent.

### CMS

A `Page` owns ordered `PageSection`s. Each section has a stable `key` the
frontend looks it up by, a `type` from the registry in
`backend/src/config/cmsSections.js`, a `visible` flag, and a JSONB `data`
document validated against that type on every write. JSONB is used here — and
only here — because section payloads genuinely differ in shape from one section
type to the next.

### Money

Every monetary column is an integer number of **paise** (₹1 = 100). Integer minor
units keep pricing exact and match what Razorpay expects. Formatting happens in
the browser.

---

## 6. Frontend architecture

### Routing

`src/app/App.jsx` holds the route table. `Home` is in the entry bundle; every
other route is `React.lazy`, so a shopper never downloads the admin area.

| Route | Page |
| --- | --- |
| `/` | Homepage, assembled from CMS sections |
| `/shop` | Collections; `?category=` picks the layout, plus `q`, `color`, `price`, `sort`, `page` |
| `/product/:slug` | Product detail, reviews, related items |
| `/cart` · `/checkout` | Cart and checkout (checkout requires a session) |
| `/login` · `/register` · `/forgot-password` | Sign in, sign up, reset — each with its emailed-code step |
| `/account` | Orders, wishlist, addresses, profile (requires a session) |
| `/support` | Raise an issue and follow the reply thread (requires a session) |
| `/policies/:slug` | `terms`, `privacy`, `refunds`, `shipping` — CMS-backed |
| `/admin/*` | Admin area (requires `role = ADMIN`) |
| `*` | Not found |

`ProtectedRoute` keeps the wrong people out of the wrong screens, but it is a
convenience only — the API enforces the same rules on every request.

### State

| Concern | Where it lives |
| --- | --- |
| Signed-in user | `AuthContext` — mirrors the cookie, clears itself on any 401 |
| Cart | `CartContext` — the server's cart is the source of truth |
| Wishlist | `WishlistContext` — an id `Set` for O(1) heart lookups, optimistic toggles |
| Filters, sort, paging | The URL, so views are shareable and Back works |
| Everything else | Local component state |

### Data access

No component calls `fetch`. `lib/api/client.js` is the only place that does: it
attaches credentials, turns error envelopes into an `ApiError` (with `status`,
`code` and per-field messages), converts network failures into a readable
message, and notifies `AuthContext` on a 401.

`lib/api/index.js` groups every endpoint by resource — `auth`, `catalog`, `cart`,
`orders`, `payments`, `users`, `reviews`, `content`, `newsletter`, `admin`.

`useQuery` runs a fetcher when its dependencies change, tracks loading and error
state, and aborts the in-flight request on unmount or change, so a slow response
can never overwrite a newer one. Loading, empty and error states use the shared
`Feedback` components, which come in a dark-green and an ivory tone to match
whichever page they appear on.

### Design preservation

The design is the product, so the integration was done underneath it:

- Page layouts, spacing, typography, colours, animations and responsive
  behaviour are untouched.
- `lib/product.js` adapts API products to the shape the existing cards and
  lookbooks already expected (formatted price string, plain image array, stock
  percentage), so the markup did not have to change.
- Content moved into the CMS field by field — the same heading in the same place,
  now sourced from the database.
- The four collection layouts (bags, suits lookbook, kurtis editorial, cord sets
  split hero) are selected by category slug and render exactly as designed. A
  collection the owner adds later falls back to the standard grid.
- Changes that *were* necessary: a phone field at checkout (deliveries need one),
  Razorpay's hosted window in place of the mock card form (card data must not
  touch this system), a search box and a sort control in the shop sidebar (both
  required functionality, styled to match), and a reviews section on the product
  page. Two missing icon imports that crashed the shop page were fixed, and the
  dead "Sarees"/"Lehengas" styling branches — unreachable, one of which mislabelled
  the Bags tab — were removed.

### Admin area

`src/app/pages/admin/` uses the storefront's palette — deep green, ivory type,
amber accent — with a shared UI kit in `components/admin/ui.jsx`. It collapses to
a single column with a slide-down menu on small screens; tables scroll
horizontally rather than being restyled into cards.

---

## 7. Backend architecture

Detailed in [`backend/README.md`](backend/README.md). In brief:

- **routes/** declare URLs, attach auth hooks and per-route rate limits.
- **controllers/** validate input with Zod, call a service, serialize the result.
- **services/** own every business rule and every transaction.
- **middleware/** provides `optionalAuth` / `requireAuth` / `requireAdmin`, the
  Origin-based CSRF guard, cart resolution and the single error handler.
- **lib/serialize.js** is the only path from a database row to JSON.
- **config/env.js** validates the environment at boot and exits on a bad config.

Errors are `AppError` instances with a status, a code and a safe message.
Anything else becomes a generic 500 — stack traces, SQL and paths stay in the log.

---

## 8. Authentication

**Customers and administrators use the same mechanism**; the only difference is
`User.role`. There is no separate admin login.

- **Registration / login** set an `httpOnly`, `Secure` (in production),
  `SameSite`-configurable cookie holding an opaque 32-byte token.
- **Storage.** Only `HMAC-SHA256(token, AUTH_SECRET)` is stored, so a database
  leak cannot be replayed as a login, and rotating `AUTH_SECRET` signs everyone
  out.
- **Passwords** are scrypt-hashed (N=2¹⁶, r=8) with per-password salts and
  self-describing parameters. Login costs one verification whether or not the
  email exists.
- **Expiry** is `SESSION_TTL_DAYS` (30 by default). Logout revokes the session
  server-side; changing a password revokes every other device; suspending an
  account revokes its sessions immediately.
- **Email verification is mandatory.** Registration creates the account but no
  session: a six-digit code is emailed, and `POST /api/auth/verify-email` is
  what actually signs the person in. Signing in before verifying returns
  `403 EMAIL_UNVERIFIED`, which the UI turns into the code step rather than a
  dead end. Accounts that predate the feature were backfilled as verified by
  the migration, so nobody was locked out.
- **Password reset** is the same mechanism with `purpose = PASSWORD_RESET`.
  `POST /api/auth/forgot-password` answers identically whether or not the
  address exists, so it cannot be used to enumerate customers; completing a
  reset revokes every existing session.
- **One-time codes** are six digits from `randomInt`, stored only as
  `HMAC-SHA256(email:purpose:code, AUTH_SECRET)` and compared in constant time.
  A code expires after `OTP_TTL_MINUTES`, dies after `OTP_MAX_ATTEMPTS` wrong
  guesses, is superseded by the next code issued, and cannot be resent within
  60 seconds.
- **Guest carts** use a separate long-lived cookie and are merged into the
  account cart on sign-in.
- **Authorization** is enforced per route on the server. Calling an admin
  endpoint directly without an admin session returns 401 or 403 — the browser's
  route guard is not part of the security boundary.

---

## 9. Ecommerce flow

```
Browse ──► Product ──► Cart ──► Checkout ──► Payment ──► Order ──► Fulfilment
```

1. **Browse.** `/api/products` with collection, colour, price, search, sort and
   paging. Search runs case-insensitively over name, subtitle, description and
   SKU.
2. **Product.** Detail, specifications, live stock, approved reviews and related
   items, in one round trip.
3. **Cart.** Server-side. Adding an item checks the product is active, that
   enough stock exists, and that the per-item limit is respected. Totals are
   recomputed server-side on every change.
4. **Checkout.** Shipping details, then an optional coupon previewed against the
   real cart, then payment. Placing the order runs the transaction described in
   [§5](#inventory) — validate, price, reserve, record.
5. **Payment.** Razorpay's hosted window. The browser callback is signature-checked
   and then re-verified against Razorpay before the order is marked paid. The
   webhook does the same independently and is deduplicated by event id.
6. **Order.** Snapshotted items and address; visible in the customer's account
   and in the admin.
7. **Inventory.** The reservation becomes a sale on payment, or returns to stock
   on cancellation or after `ORDER_RESERVATION_MINUTES` without payment.
8. **Fulfilment.** The owner moves the order forward — Confirmed → Processing →
   Shipped → Delivered — or cancels it, which returns the stock and releases the
   coupon use.

---

## 10. Admin and CMS

Sign in with an administrator account and open `/admin`.

| Screen | What it does |
| --- | --- |
| Overview | Paid revenue, open orders, catalogue size, customers, pending reviews, low stock, recent orders |
| Products | Search and filter; create, edit, archive or delete; pricing and sale pricing; SKU; stock and batch size; specifications; images; category; badge; colour; featured; status |
| Categories | Create, edit, delete, reorder, hide; set the longer label used on the shop switcher |
| Orders | Search and filter by status and payment; open an order; move it through fulfilment; record payment; cancel and return stock |
| Customers | Search; open an account to see addresses and orders; suspend or reactivate |
| Reviews | Approve, reject or delete; nothing reaches the storefront unapproved |
| Coupons | Percentage or fixed; minimum order; maximum discount; validity window; total and per-customer limits; active flag |
| Page content | Edit the homepage, each collection page and the policy pages |
| Governance | Issue desk, audit log, store policies, administrators |

### Content management

Content is edited section by section. Each section declares its shape in
`backend/src/config/cmsSections.js`; the admin renders a form from that
declaration, and every write is validated against it.

Editable today:

- **Homepage** — hero (heading, subtitle, tagline, background image); collections
  carousel (each tile's image, name, description and link); featured collection
  (headings, button, how many products); the about video slides (video, headings,
  copy, four stats each); the journey milestones (image, title, location, year,
  copy, motion style); the newsletter block.
- **Bags** — hero eyebrow, title, subtitle and background image; the "Our
  Craft" pull quote and its attribution; the customer testimonials, each with
  quote, name, location, photo and rating.
- **Suits lookbook** — hero eyebrow, title, subtitle, image.
- **Kurtis** — eyebrow, title, quote, the promotional panel and its code, and all
  three editorial panels.
- **Cord sets** — badge, titles, taglines, button, hero image, marquee words and
  the statistics row.

Sections can be hidden and reordered. Images are uploaded through the same
validated pipeline as product images.

### Governance

`/admin/governance` gathers the four things that are about running the store
rather than selling from it:

- **Issue desk.** Everything customers raise at `/support`, oldest-waiting
  first, filterable by status and searchable by subject or reference. Replying
  emails the customer and moves the ticket to *Answered*; statuses are Open,
  Answered, Resolved and Closed.
- **Audit log.** Who changed what, and when — products, prices, stock, orders,
  coupons, content, customers and administrators. It is append-only by
  construction: there is no write route, and the actor's email is stored as a
  snapshot so an entry still makes sense after the account is gone.
- **Store policies.** The four pages a storefront taking payments is expected to
  publish — terms, privacy, refunds, shipping — with their status and a link to
  edit each one under *Page content*. They render at `/policies/:slug` and are
  linked from the footer.
- **Administrators.** Who holds the keys, how many devices they are signed in on
  and how many logged actions they have. You can invite (an existing customer is
  promoted; a new address gets an emailed code to set a password), sign someone
  out of every device, revoke access, or delete the account outright. Three
  guards apply: you cannot act on yourself, the store always keeps at least one
  active administrator, and an account with orders cannot be deleted — revoke it
  instead, because a paid order must keep pointing at a real customer.

**What the CMS deliberately does not do** is let content change a page's shape.
The database supplies the words and pictures; the React component that owns the
layout decides how they are drawn. That is what keeps each page's design intact
while the owner edits it.

---

## 11. Environment variables

### Backend — `backend/.env`

Validated at boot by `src/config/env.js`; the process refuses to start on a bad
config. Template: `backend/.env.example`.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `production` hides debug detail from errors |
| `PORT` · `HOST` | no | `4000` · `0.0.0.0` | Where the API listens |
| `LOG_LEVEL` | no | `info` | Pino level |
| `DATABASE_URL` | **yes** | — | Postgres connection (pooled on Supabase) |
| `DIRECT_URL` | no | — | Non-pooled connection, needed for migrations |
| `CORS_ORIGINS` | no | `http://localhost:5173` | **Additional** browser origins beyond `FRONTEND_URL`, comma-separated; also the CSRF allowlist. Trailing slashes and paths are stripped; `www` and the apex are distinct origins |
| `FRONTEND_URL` | no | `http://localhost:5173` | Canonical storefront URL. Always trusted as an allowed origin |
| `AUTH_SECRET` | **yes** | — | ≥32 chars; keys session tokens. Rotating it logs everyone out |
| `SESSION_TTL_DAYS` | no | `30` | Session lifetime |
| `COOKIE_SAMESITE` | no | `lax` | `none` when the storefront is on another domain |
| `COOKIE_SECURE` | no | on in production | Forced `true` when SameSite is `none` |
| `COOKIE_DOMAIN` | no | — | Set when API and storefront share a parent domain |
| `TAX_PERCENT` | no | `5` | Applied after discount |
| `SHIPPING_FLAT` | no | `0` | Flat shipping, in paise |
| `FREE_SHIPPING_THRESHOLD` | no | `0` | Paise; `0` means no threshold |
| `ORDER_RESERVATION_MINUTES` | no | `30` | How long an unpaid order holds stock |
| `RAZORPAY_KEY_ID` · `RAZORPAY_KEY_SECRET` | for payments | — | Blank disables online payment with a clear message |
| `RAZORPAY_WEBHOOK_SECRET` | for webhooks | — | Signing secret from the Razorpay dashboard |
| `SUPABASE_URL` · `SUPABASE_SECRET_KEY` | for uploads | — | Secret key (`sb_secret_…`) from Project Settings → API Keys. **Server-only** — it bypasses row-level security and must never reach the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | no | — | Legacy `service_role` JWT, accepted as a fallback. Supabase is retiring these through 2026; the server warns at boot when only this is set |
| `SUPABASE_STORAGE_BUCKET` | no | `product-media` | Public bucket for media |
| `RESEND_API_KEY` | for email | — | Resend API key. Blank disables email: verification and reset refuse with a clear message, receipts are skipped |
| `EMAIL_FROM` | for email | — | Sender, e.g. `Kabeer <orders@your-domain.com>`. The domain must be verified in Resend |
| `EMAIL_REPLY_TO` | no | — | Where customer replies land |
| `OTP_TTL_MINUTES` | no | `10` | How long an emailed code stays valid |
| `OTP_MAX_ATTEMPTS` | no | `5` | Wrong guesses before a code is burned |
| `MAX_UPLOAD_BYTES` | no | `5242880` | Per-file upload cap |
| `MAX_BODY_BYTES` | no | `1048576` | JSON body cap |
| `SEED_ADMIN_EMAIL` · `SEED_ADMIN_PASSWORD` · `SEED_ADMIN_NAME` | no | — | Read only by `npm run db:seed` |

### Frontend — `frontend/.env`

Vite only exposes `VITE_`-prefixed variables to the browser, so **no secret ever
belongs here**.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | API base URL. Leave unset in development (Vite proxies `/api`); set it to the deployed API origin in production |
| `VITE_DEV_API_PROXY` | `http://localhost:4000` | Where the dev server proxies `/api` |

Razorpay's public key id is fetched from the API at checkout time, so it is not
configured here.

---

## 12. Local development

### Prerequisites

- Node.js 20.12 or newer (`node -v`) — the backend uses `process.loadEnvFile`
- npm 10 or newer
- A PostgreSQL database — a free Supabase project is the quickest route
- Optional: Razorpay test keys, and a Supabase Storage bucket for uploads

### Setup

```bash
git clone <this repository>
cd afro
```

**1. Database.** Create a Supabase project, then open *Connect* and copy two
strings:

| Variable | Which string | Port | Query string |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Session pooler** | 5432 | `?connection_limit=10&connect_timeout=30` |
| `DIRECT_URL` | **Session pooler** | 5432 | `?connect_timeout=30` |

Both use the *session* pooler because this API is one long-running process with
a stable pool. Supabase's transaction pooler (6543) is designed for serverless,
where clients are short-lived; it checks out a backend per transaction, which
measured **5x slower per query** (905ms vs 180ms) against a database in another
region. Use it only if you deploy to serverless, and then with
`?pgbouncer=true&connection_limit=1`.

**Choose a region close to your customers.** Every database round trip pays that
latency, so a distant project slows down every page. Measured TCP round trip
from India: `ap-south-1` 75ms, `ap-southeast-1` 119ms, `ap-northeast-1` 196ms.
A project's region **cannot be changed after creation**, so getting this right
at the start is worth the minute it takes.

**Do not use the "Direct connection" string** (`db.<project-ref>.supabase.co`).
Supabase serves that host over IPv6 only, so on any network without IPv6 - most
home and office connections - every command fails with
`P1001: Can't reach database server`. Both pooler hostnames are IPv4.

Two details that are easy to miss: the pooler username is
`postgres.<project-ref>`, not `postgres`; and a password containing any of
`@ : / ? # % &` must be percent-encoded.

**2. Storage** (optional, needed for image uploads). Create a **public** bucket
named `product-media`. From *Project Settings → API Keys*, copy the project URL
and a **secret key** (`sb_secret_…`) into `SUPABASE_SECRET_KEY` — not the
publishable key, which the server rejects at boot. Projects still on the old
`service_role` JWT can set `SUPABASE_SERVICE_ROLE_KEY` instead while they
migrate; Supabase is retiring those keys through 2026.

The storefront never talks to Supabase directly — media is uploaded through the
API — so no Supabase key belongs in the frontend build.

**3. Email** (needed to create an account). Registration emails a six-digit
code, and the new account cannot sign in until the code is entered — so without
this, sign-up does not complete on a fresh machine. Create a free account at
[resend.com](https://resend.com), verify a sending domain under *Domains*, then
put the API key in `RESEND_API_KEY` and an address on that domain in
`EMAIL_FROM`.

Until a domain is verified Resend only delivers to the address the account was
registered with, which is enough to develop against. With `RESEND_API_KEY`
unset the API still starts and everything else works; registration and password
reset answer `503 Email is not configured on this server`, and receipts are
skipped with a warning in the log. Existing accounts are unaffected — the
migration backfilled them as verified — so you can still sign in as the
administrator created by the seed.

**4. Backend.**

```bash
cd backend
cp .env.example .env
# fill in DATABASE_URL, DIRECT_URL and AUTH_SECRET at minimum
# generate a secret:  node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

npm install
npm run prisma:generate
npm run prisma:deploy
npm run db:seed          # catalogue, page content, and the first admin
npm run dev              # http://localhost:4000
```

To create the first administrator, set `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD` before seeding.

`db:seed` is **create-only**: re-running it creates anything missing and leaves
every existing record untouched, so it will not undo catalogue edits, uploaded
images or page content. That makes the chain above safe to repeat whenever you
restart. To deliberately reset the seeded records to their launch values on a
scratch database, use `npm run db:seed -- --force`.

**5. Frontend.**

```bash
cd ../frontend
npm install
npm run dev              # http://localhost:5173
```

The dev server proxies `/api` to `http://localhost:4000`, so the storefront and
API share an origin and session cookies work with no extra configuration.

**6. Check it.** Open http://localhost:5173 — the homepage should show the seeded
content. `/shop` should list products. Sign in with the seeded admin and open
`/admin`.

---

## 13. Database migrations

```bash
cd backend

npm run prisma:migrate -- --name add_something   # create and apply (development)
npm run prisma:deploy                            # apply pending (CI / production)
npm run prisma:generate                          # regenerate the client
npm run prisma:studio                            # browse the data
```

Migrations live in `backend/prisma/migrations/`. The baseline is
`20260920000000_init`, generated with `prisma migrate diff` from the schema.

**Adopting an existing database** that already matches the baseline:

```bash
npx prisma migrate resolve --applied 20260920000000_init
```

**Inspecting** the live schema: `npx prisma db pull --print`, or Supabase's SQL
editor.

Rules: every schema change ships with a migration in the same commit; migrations
are never edited after they have been applied anywhere; `prisma db push` is not
used outside throwaway databases.

**Resetting content** is a separate concern from migrations. `npm run db:seed`
never overwrites existing rows; `npm run db:seed -- --force` restores the seeded
catalogue and page content to their launch values, deleting uploaded images on
those products. Never run `--force` against a live store.

---

## 14. Production deployment

Platform-specific, step-by-step guides live beside this file:

| File | Covers |
| --- | --- |
| [`render_deployment.txt`](render_deployment.txt) | `/backend` on Render free tier — development / staging |
| [`railway_deployment.txt`](railway_deployment.txt) | `/backend` on Railway — production |
| [`cloudflare_deployment.txt`](cloudflare_deployment.txt) | `/frontend` on Cloudflare Pages |

The rest of this section is the platform-independent summary.

### Frontend

Any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront).

```bash
cd frontend
VITE_API_URL=https://api.your-domain.com/api npm run build
# deploy frontend/dist
```

The app is a single-page app: configure the host to rewrite unknown paths to
`/index.html`, or deep links such as `/shop` will 404.

### Backend

Any host that runs a long-lived Node process (Render, Railway, Fly.io, a VM).

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy     # release step
npm start
```

Set every variable from `.env.example`. In particular:

- `NODE_ENV=production`
- `CORS_ORIGINS=https://your-domain.com` — the storefront's exact origin
- If the storefront and API are on **different** sites:
  `COOKIE_SAMESITE=none` (which requires `COOKIE_SECURE=true`)
- If they share a parent domain, prefer `COOKIE_DOMAIN=.your-domain.com` with the
  default `SameSite=Lax`

### Database and storage

Supabase handles Postgres and Storage. Turn on point-in-time recovery or
scheduled backups for the database, and keep the media bucket public-read with
writes restricted to the secret key the API holds.

Secret keys can be rotated independently in the dashboard: create a second one,
deploy it, then revoke the old one — no downtime.

### Payments

In the Razorpay dashboard, add a webhook pointing at
`https://api.your-domain.com/api/webhooks/razorpay`, subscribe to
`payment.captured`, `payment.failed` and `order.paid`, and put the signing secret
in `RAZORPAY_WEBHOOK_SECRET`.

### HTTPS and proxying

Terminate TLS in front of the API. `trustProxy` is enabled, so `request.ip`
follows `X-Forwarded-For` — which matters because rate limiting keys on it.

---

## 15. Security

| Risk | Measure |
| --- | --- |
| SQL injection | Every query goes through Prisma's parameterised client; no string-built SQL |
| XSS | React escapes by default; no `dangerouslySetInnerHTML` anywhere; CMS content is typed and validated, never HTML |
| CSRF | Cookie auth plus an `Origin` allowlist on every state-changing request; webhooks are exempt and authenticate by signature |
| Session theft | `httpOnly` + `Secure` cookies; only an HMAC of the token is stored; logout, password change and suspension revoke server-side |
| Brute force | 10 attempts per 5 minutes on login, registration and password change; 300/minute globally, keyed by session or IP |
| Privilege escalation | Roles come from the database and are checked on the server for every admin route; the client cannot assert a role |
| Price manipulation | Unit prices, discounts, tax, shipping and totals are computed from database rows; a client-sent total is never read |
| Inventory manipulation | Stock moves only inside order transactions via conditional updates; quantities are validated against live stock |
| Overselling | `UPDATE … WHERE quantity >= n` re-checked by Postgres against the locked row |
| Duplicate payment processing | `WebhookEvent` unique on `(provider, eventId)`; `inventorySettledAt` claimed atomically |
| Forged payments | Checkout callbacks are HMAC-verified *and* re-read from Razorpay, with the amount compared to the order |
| Malicious uploads | Format confirmed from magic bytes, size capped, object key generated server-side, extension never taken from the client |
| Oversized requests | 1 MB JSON bodies, 5 MB uploads, one file per request |
| Malformed input | Zod on every write path; field-level errors returned without leaking internals |
| Information leakage | One error handler; stack traces, SQL and paths stay in the log; serializers whitelist response fields |
| Secret exposure | Server secrets live only in the backend environment; the frontend only ever receives `VITE_`-prefixed values; `.env` is git-ignored |
| Clickjacking / sniffing | `@fastify/helmet` security headers |

**Never commit a `.env` file.** If a secret is ever exposed: rotate
`AUTH_SECRET` (which signs everyone out), rotate the Razorpay keys, revoke and
replace the Supabase secret key, and rotate the database password.

---

## 16. Performance

**Frontend**

- The entry bundle is ~93 kB (27 kB gzipped); React, react-router and Motion are
  split into their own long-cached chunks, and every route below the homepage is
  lazy-loaded — the admin area is never downloaded by a shopper.
- Dependencies went from 50 packages to 8 by removing what the Figma export never
  used; the CSS bundle dropped from 147 kB to 86 kB.
- Bundled imagery went from **2,479 kB to 488 kB (-80%)**. The logo was a
  1080×1080 PNG weighing 734 kB rendered at 48 px; it is now a 256 px lossless
  WebP at 45 kB (SSIM 1.000000 against the source). The two lookbook heroes were
  JPEGs mis-named `.png`, encoded at ~1.09 bytes/pixel; re-encoded they are
  348 kB and 96 kB at SSIM 0.977 and 0.942.
- Four font families load instead of six — Cinzel and Cinzel Decorative were
  downloaded (10 weights) and never used — from a single `<link>` in the HTML
  rather than a render-blocking CSS `@import` that duplicated two families.
- `public/_headers` caches fingerprinted assets for a year and keeps
  `index.html` uncached, so a deploy reaches browsers immediately.
- Search input is debounced to 350 ms; every request is cancelled on unmount or
  dependency change, so nothing races.
- Product imagery is lazy-loaded below the fold; heroes are not.
- Cart, auth and wishlist state are fetched once into context rather than per
  component.

**Backend**

- Product listings load their category, images and inventory through a single
  `include`, so there is no N+1.
- Read-only count/page pairs run through `Promise.all`, not
  `prisma.$transaction([...])`. The array form of `$transaction` sends its
  queries *sequentially* inside `BEGIN`/`COMMIT`, so a two-query list endpoint
  costs four round trips instead of one. Only writes use a transaction, where
  atomicity is the point.
- Ratings are denormalised onto `Product` and recomputed when moderation changes,
  so listing pages never aggregate reviews.
- The dashboard's eight counters are one batched transaction of aggregates.
- Public catalogue routes attach no auth hook, so they never query for a session.
- Responses over 1 kB are compressed (brotli or gzip).
- CMS pages send a short `Cache-Control` window — they are identical for everyone
  and change rarely.

**Database** — indexes match the actual query shapes (see [§5](#constraints-and-indexes));
every list endpoint is paginated with a hard cap; serializers select only the
columns that are sent.

**Known limit.** Text search uses `ILIKE '%term%'`, which does not use an index.
At a boutique's catalogue size this is not measurable. If the catalogue grows
into the tens of thousands, add a `pg_trgm` GIN index or Postgres full-text
search — it is a migration, not a rewrite.

---

## 17. Testing

```bash
cd backend  && npm test && npm run lint
cd frontend && npm run lint && npm run build
```

**Backend tests** (`node:test`, 72 cases, no database required) cover pricing
arithmetic, discount-before-tax ordering, coupon caps, password hashing and
rejection, session token hashing, Razorpay checkout and webhook signature
verification, origin normalisation for CORS and CSRF, Supabase key selection,
the CMS registry and the seed's integrity, and the API surface — 404s, 401s on
every admin, customer and support route, CSRF rejection of a foreign origin,
field-level validation errors, body-size limits and webhook signature rejection.

One-time codes get their own suite, with Prisma swapped for an in-memory double:
six digits, never stored in plain text, single use, bound to both the address and
the purpose, expiring on time, burned at the attempt cap, superseded by the next
code, and rate-limited on resend. Alongside it, the sign-in gate is pinned down —
an unverified account gets `403 EMAIL_UNVERIFIED`, and the password is checked
*before* the gate, so the response cannot be used to discover which addresses are
registered.

**Lint** runs ESLint over both packages: unused imports and variables, React hook
dependency correctness, and missing keys.

**Build** compiles the frontend and fails on any unresolved import.

**What is not automated.** Flows that need real rows — a full checkout, two
concurrent purchases of the last item, webhook replay — were designed to be
verified against a database. Work through the checklist in [§20](#20-production-checklist)
against a staging database before going live.

---

## 18. Troubleshooting

**`Invalid environment configuration` on startup.** The message names the
variable. Most often `AUTH_SECRET` is shorter than 32 characters or
`DATABASE_URL` is not a URL.

**`Can't reach database server`.** Check `DATABASE_URL`, and that your IP is
allowed in Supabase. `/health` returns 500 while the database is unreachable,
which is the intended signal.

**`P1001: Can't reach database server`.** Two causes, in order of likelihood.

*The host is IPv6-only.* If it reads `db.<project-ref>.supabase.co`, that is the
"Direct connection" string. Supabase publishes only an AAAA record for it, so a
machine without IPv6 cannot reach it at all. Use the **Session pooler** string
for `DIRECT_URL` instead. To confirm:

```bash
nslookup -type=A db.<project-ref>.supabase.co          # no answer -> IPv6 only
nslookup -type=A aws-0-<region>.pooler.supabase.com    # answers   -> use this
```

*The connect timeout is too short.* Prisma defaults to 5 seconds, which is tight
when the database sits in a distant region. Add `?connect_timeout=30`. A telling
sign: if the error changes from `P1001` to `P1000` once the timeout is raised,
the network was fine all along and the real problem is the password.

**`P1000: Authentication failed`.** The database password is wrong. It is *not*
your Supabase account password. Reset it under *Project Settings → Database →
Database password*, then paste the new value into both `DATABASE_URL` and
`DIRECT_URL`, percent-encoding any of `@ : / ? # % &` it contains. Also check the
username reads `postgres.<project-ref>` on pooler connections, not `postgres`.

**Logged out immediately after signing in.** The cookie is not coming back.
In production across two domains you need `COOKIE_SAMESITE=none`,
`COOKIE_SECURE=true`, HTTPS on both sides, and the storefront's exact origin in
`CORS_ORIGINS`. In development, use the Vite proxy rather than pointing
`VITE_API_URL` at `http://localhost:4000`.

**`Request origin is not allowed` (403).** The browser's origin is not in
`CORS_ORIGINS`. Origins must match exactly — scheme, host and port, no trailing
slash.

**Empty homepage or shop.** The database has not been seeded, or the products are
still `DRAFT`. Run `npm run db:seed`, or set a product to Active in the admin.

**"Online payments are not configured".** `RAZORPAY_KEY_ID` /
`RAZORPAY_KEY_SECRET` are unset. This is deliberate — checkout says so rather
than pretending to succeed.

**Payment succeeded but the order still says pending.** The browser callback did
not complete. The webhook settles it within seconds; check that the webhook URL
is reachable and that `RAZORPAY_WEBHOOK_SECRET` matches the dashboard.

**"Media storage is not configured".** Set `SUPABASE_URL` and
`SUPABASE_SECRET_KEY`, and create the bucket.

**"The storage bucket ... does not exist".** Supabase projects start with no
buckets at all. Create one in *Storage* named to match `SUPABASE_STORAGE_BUCKET`
(default `product-media`), marked **public** so shoppers can load product
images, with a 5 MB size limit and JPEG/PNG/WebP/AVIF allowed.

**"This is the publishable key. Use the secret key".** The publishable key
(`sb_publishable_…`) was pasted into the server slot. Copy a secret key
(`sb_secret_…`) from *Project Settings → API Keys* instead.

**Upload rejected as "content does not match its declared type".** The file is
not really a JPEG/PNG/WebP/AVIF. The server checks the bytes, not the extension.

**Every request takes about a second.** Three causes, largest first.

*The database is far away.* Every round trip pays the network latency, and a
single endpoint makes several. Check it:

```bash
node -e "const n=require('net'),t=Date.now();n.connect({host:'aws-0-<region>.pooler.supabase.com',port:5432},function(){console.log(Date.now()-t+'ms');this.destroy()})"
```

Under ~50ms is comfortable; ~200ms means the project is on another continent
and no amount of tuning will hide it. The region cannot be changed after the
project is created - recreate it nearer your customers and re-run
`prisma:deploy` and `db:seed`.

*The wrong pooler.* `DATABASE_URL` on port 6543 (transaction pooler) costs about
five times more per query than port 5432 (session pooler) for a long-running
server. See [§12](#12-local-development).

*The pool is too small.* `connection_limit=1` serializes every concurrent
request behind one connection - six parallel requests then finish in a
staircase, each a second after the last. Use 10 or so.

Separately, expect **two** of every request in the development log: React
StrictMode deliberately double-invokes effects to surface missing cleanup. It
does not happen in a production build.

**Uploaded images or page edits reverted.** `db:seed` is create-only and leaves
existing records alone; only `npm run db:seed -- --force` overwrites, and it
warns before doing so. If a deploy script passes `--force`, remove it.

**Stock looks wrong after abandoned checkouts.** Unpaid orders hold stock for
`ORDER_RESERVATION_MINUTES`; the sweep runs every five minutes and returns it.

**`/shop` 404s in production.** The static host is not rewriting unknown paths to
`index.html`.

---

## 19. Development rules

1. **Do not redesign existing pages.** The design is the product. If a change is
   technically necessary, make the smallest one that works and say why in the
   commit message.
2. **Business rules live in the backend.** If the frontend and the backend both
   compute something that affects money or stock, the frontend is wrong.
3. **Never trust the client.** Prices, discounts, totals, stock and roles come
   from the database.
4. **Validate every write** with a Zod schema before it reaches a service.
5. **Never commit secrets.** `.env` is ignored; `.env.example` documents the
   shape, never the values.
6. **Add a dependency only with a reason.** State what it does that the platform
   or the existing dependencies cannot.
7. **Ship the migration with the schema change**, in the same commit.
8. **Add a test when you change money, stock, auth or payments.**
9. **Respond through a serializer.** New fields are added in `lib/serialize.js`.
10. **Seeds create, they do not overwrite.** Anything that re-runs against a real
    database must leave existing rows alone. Destructive behaviour goes behind an
    explicit flag that announces itself.
11. **Leave nothing dead.** `npm run lint` passes in both packages with no unused
    imports or variables.
12. **Both checks pass before merging**: `npm test && npm run lint` in the
    backend, `npm run lint && npm run build` in the frontend.

---

## 20. Production checklist

**Environment**
- [ ] Every backend variable set; `AUTH_SECRET` is a fresh 48-byte random value
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGINS` is the exact storefront origin, nothing else
- [ ] Cookie settings match the deployment topology (same site vs. cross site)
- [ ] `VITE_API_URL` baked into the frontend build
- [ ] No `.env` file is tracked by git

**Database**
- [ ] `npm run prisma:deploy` run as a release step
- [ ] Seeded, or the catalogue entered through the admin
- [ ] Deploy pipeline runs `db:seed` **without** `--force`
- [ ] Backups / point-in-time recovery enabled
- [ ] Connection pooling in use for the app, direct connection for migrations

**Authentication**
- [ ] The first administrator exists and its seeding password has been changed
- [ ] Registering, signing in, signing out and password change all work
- [ ] A new account receives its code and cannot sign in before entering it
- [ ] "Forgot password" delivers a code, and using it signs out the other devices
- [ ] An admin endpoint called without a session returns 401
- [ ] A customer session cannot reach `/api/admin/*`
- [ ] One customer cannot read another's order by id

**Payments**
- [ ] Live Razorpay keys set
- [ ] Webhook registered, signing secret configured, a test delivery accepted
- [ ] A real low-value order completes end to end
- [ ] A cancelled payment leaves the order unpaid and returns stock after the TTL
- [ ] A replayed webhook changes nothing

**Email**
- [ ] `RESEND_API_KEY` set and the `EMAIL_FROM` domain verified in Resend
- [ ] SPF, DKIM and DMARC records published, and not proxied through Cloudflare
- [ ] A verification code, an order confirmation and a payment confirmation all
      arrive, and land in the inbox rather than in spam
- [ ] `EMAIL_REPLY_TO` is a mailbox somebody reads

**Governance**
- [ ] More than one administrator, so nobody can lock the store out
- [ ] Every policy page reviewed against what the store actually does — the
      seeded wording is a placeholder and says so
- [ ] Policy links in the footer open the right pages
- [ ] Raising an issue from `/support` reaches the admin issue desk, and a reply
      reaches the customer's inbox

**Storage**
- [ ] Bucket created, public read, writes restricted to the API's secret key
- [ ] Using a current secret key (`sb_secret_…`), not a legacy `service_role` JWT
- [ ] An upload from the admin appears on the storefront
- [ ] A non-image file is rejected

**Inventory**
- [ ] Buying the last piece marks the product sold out
- [ ] Two simultaneous checkouts for one remaining piece: one succeeds, one is
      told it is gone
- [ ] Cancelling an order returns its stock exactly once

**Operations**
- [ ] HTTPS on both the storefront and the API
- [ ] SPA fallback configured on the static host
- [ ] `/health` monitored
- [ ] Logs collected; error rates alerting
- [ ] Both builds produced from a clean `npm ci`

**Content**
- [ ] Placeholder testimonials on the bags page replaced with real customer
      words, or the section hidden (*Page content → Tote Bags → Customer words*)
- [ ] Demo catalogue replaced with the real one, or the seeded products archived
- [ ] Homepage "Journey" milestones and About statistics checked for accuracy —
      they are marketing claims served from the CMS

**Quality**
- [ ] `npm test` and `npm run lint` pass in the backend
- [ ] `npm run lint` and `npm run build` pass in the frontend
- [ ] Every storefront page checked on mobile, tablet and desktop
- [ ] No console errors on the storefront or in the admin

---

## 21. Known gaps

Stated plainly so nobody discovers them in production:

- **Email needs a verified domain.** Verification codes, password resets, order
  and payment receipts and support replies all go through Resend. With
  `RESEND_API_KEY` unset, the code flows refuse with a clear message and
  receipts are skipped — so **nobody can register** until it is configured.
  `EMAIL_FROM` must be on a domain verified in Resend.
- **Shipping and dispatch emails are not sent.** Only order confirmation,
  payment confirmation and support replies are. Marking an order shipped
  updates the account page, not the inbox.
- **Cash on delivery is not supported.** Checkout requires Razorpay.
- **Refunds are recorded, not executed.** An administrator can mark a payment
  refunded; the money is moved in the Razorpay dashboard.
- **The bags page ships placeholder testimonials.** The three customer
  quotations are now CMS content (*Page content → Tote Bags → Customer words*),
  but the shipped values are invented, with stock-photo avatars. **Replace them
  with real customer words before launch** — publishing invented reviews as
  genuine is both misleading and, in many jurisdictions, unlawful. The headline
  rating and review count above them are computed from whatever testimonials are
  actually present, so they cannot drift from reality.
- **Newsletter subscribers are stored but not exported.** The count appears on
  the admin overview; the addresses live in the `NewsletterSubscriber` table.
- **Full-text search** is `ILIKE`-based — see the note in [§16](#16-performance).

---

*© Kabeer The Ethnic Store. Design and brand crafted by Amalin Lab.*

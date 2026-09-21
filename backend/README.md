# Kabeer — The Ethnic Store · Backend

The API behind the Kabeer storefront and its admin area. Node.js + Fastify +
Prisma against PostgreSQL (Supabase), written in plain JavaScript (ES modules).

For the whole-project picture — architecture diagram, deployment, production
checklist — see the [root README](../README.md). This document is for people
working on the API itself.

---

## 1. Architecture

```
src/
├── config/          environment contract + CMS section registry
├── controllers/     request → service → response (no business rules here)
│   └── admin/       the same, for /api/admin/*
├── lib/             prisma client, errors, password hashing, sessions,
│                    money, slugs, serializers, Razorpay, Supabase Storage
├── middleware/      auth, CSRF guard, error handler, cart resolution
├── routes/          URL wiring, per-route rate limits, auth hooks
│   └── admin/
├── services/        the business logic: catalogue, cart, orders, coupons,
│                    payments, reviews, content
├── validators/      Zod schemas shared by routes, services and the seed
├── app.js           builds the Fastify instance (plugins, hooks, routes)
└── server.js        listens, runs the maintenance loop, shuts down cleanly
```

The layering rule is simple:

- **Routes** declare URLs, attach `requireAuth` / `requireAdmin`, and set rate limits.
- **Controllers** parse input with a Zod schema, call a service, serialize the result.
- **Services** own every business rule and every database transaction.
- **lib/serialize.js** is the only place that turns a database row into JSON, so
  `passwordHash`, storage paths and provider payloads cannot leak by accident.

`app.js` is exported separately from `server.js` so tests can build the app and
drive it with `app.inject()` without opening a port.

---

## 2. Money

**Every monetary value in this codebase is an integer number of paise** (₹1 = 100).
Columns, request payloads and responses all use paise. Formatting to `₹14,999`
happens in the browser.

This removes floating-point rounding from pricing, discounts and tax entirely,
and it is what Razorpay expects on the wire. Admin forms accept rupees; the Zod
`rupees` helper in `validators/common.js` converts at the edge.

---

## 3. API surface

All responses share one envelope:

```jsonc
{ "data": { /* ... */ }, "meta": { "pagination": { "page": 1, "limit": 12, "total": 24, "totalPages": 2 } } }
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [ { "field": "email", "message": "…" } ] } }
```

### Public

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness + database reachability |
| `GET` | `/api/products` | List with `category`, `color`, `search`, `minPrice`, `maxPrice`, `sort`, `inStock`, `featured`, `page`, `limit` |
| `GET` | `/api/products/filters` | Category and colour facets for the shop sidebar |
| `GET` | `/api/products/:slug` | One product plus related items |
| `GET` | `/api/products/:slug/reviews` | Approved reviews, paginated |
| `GET` | `/api/categories` | Visible categories, ordered |
| `GET` | `/api/pages` · `/api/pages/:slug` | CMS page content |
| `GET` | `/api/payments/config` | Whether online payments are enabled |
| `POST` | `/api/newsletter` | Newsletter sign-up |

### Session-aware (works signed out)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/cart` | Current cart with server-computed totals |
| `GET` | `/api/cart/preview?code=` | Re-price the cart with a coupon (writes nothing) |
| `POST` | `/api/cart/items` | Add an item |
| `PATCH` | `/api/cart/items/:itemId` | Change quantity (`0` removes) |
| `DELETE` | `/api/cart/items/:itemId` | Remove an item |

### Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create the account and email a code — **no session yet** |
| `POST` | `/api/auth/verify-email` | Consume the code; this is what signs a new account in |
| `POST` | `/api/auth/resend-verification` | Another code, subject to the 60-second cooldown |
| `POST` | `/api/auth/login` | Create a session cookie; `403 EMAIL_UNVERIFIED` until verified |
| `POST` | `/api/auth/forgot-password` | Email a reset code. Same reply whether or not the account exists |
| `POST` | `/api/auth/reset-password` | Consume the code, set the password, revoke every session |
| `POST` | `/api/auth/logout` | Revoke the session |
| `GET` · `PATCH` | `/api/auth/me` | Read / update the profile |
| `POST` | `/api/auth/me/password` | Change password, sign out other devices |

### Customer (requires a session)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` · `POST` | `/api/orders` | Order history · checkout |
| `GET` | `/api/orders/:id` | Order detail |
| `POST` | `/api/orders/:id/cancel` | Cancel while unpaid; returns stock |
| `POST` | `/api/orders/:id/payment-session` | Open a Razorpay order |
| `POST` | `/api/orders/payments/verify` | Confirm the browser callback |
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/users/addresses…` | Address book |
| `GET`/`POST`/`DELETE` | `/api/users/wishlist…` | Wishlist |
| `POST`/`PATCH`/`DELETE` | `/api/reviews…` | Write / edit / delete own review |
| `GET` · `POST` | `/api/support/tickets` | Own issues · raise one (rate limited, sends mail) |
| `GET` | `/api/support/tickets/:id` | One thread — scoped to the owner |
| `POST` | `/api/support/tickets/:id/replies` | Reply on own thread |

### Admin (requires `role = ADMIN`)

`/api/admin/dashboard`, `/api/admin/products…`, `/api/admin/categories…`,
`/api/admin/orders…`, `/api/admin/customers…`, `/api/admin/reviews…`,
`/api/admin/coupons…`, `/api/admin/content/…`, `/api/admin/media`.

Governance sits under `/api/admin/governance`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/summary` | Counters for the landing page |
| `GET` | `/tickets` · `/tickets/:id` | Issue desk, oldest waiting first |
| `POST` | `/tickets/:id/replies` | Reply; emails the customer, marks it answered |
| `PATCH` | `/tickets/:id/status` | Open / Answered / Resolved / Closed |
| `GET` | `/audit` · `/audit/actions` | The trail, and the action names to filter by |
| `GET` · `POST` | `/admins` | List · invite (promote or create with an emailed code) |
| `POST` | `/admins/:id/sign-out` · `/admins/:id/revoke` | Drop their sessions · demote to customer |
| `DELETE` | `/admins/:id` | Delete outright; refused when the account has orders |

The audit log has no write route by design — entries are created as a side
effect of the actions they describe, and nothing can edit or remove them.

### Webhooks

`POST /api/webhooks/razorpay` — HMAC-verified over the raw body, deduplicated by
event id.

---

## 4. Database

Prisma schema: [`prisma/schema.prisma`](prisma/schema.prisma). Entities and
relationships are described in the [root README](../README.md#5-database-architecture).

Points worth knowing while working on the API:

- `Inventory.quantity` is *sellable* stock; `Inventory.reserved` is stock held by
  an unpaid order. Both move inside the same transaction.
- `Order.inventorySettledAt` is the idempotency marker that makes payment
  confirmation and cancellation safe to run twice.
- `Session.tokenHash` stores an HMAC of the cookie value, never the value itself.
- `PageSection.data` is JSONB validated against the section registry in
  `src/config/cmsSections.js` on every write.

### Migrations

```bash
npm run prisma:migrate -- --name what_changed   # create + apply in development
npm run prisma:deploy                           # apply in CI / production
npm run prisma:generate                         # regenerate the client
npm run prisma:studio                           # browse the data
```

`prisma/migrations/20260920000000_init` is the baseline migration, generated with
`prisma migrate diff`. On an existing database that already matches it, mark it
as applied instead of re-running it:

```bash
npx prisma migrate resolve --applied 20260920000000_init
```

### Seeding

```bash
npm run db:seed              # create anything missing, touch nothing else
npm run db:seed -- --force   # reset seeded records to their launch values
```

**Create-only by default.** A record that already exists is left completely
alone — edited prices, uploaded images, adjusted stock, renamed categories and
rewritten page content all survive. Only missing rows are created, which is what
makes it safe to leave in a deploy pipeline and safe to chain after
`prisma:deploy`.

It loads the launch catalogue and the page content the storefront was designed
around, and creates the first administrator when `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD` are set. An account that already exists is promoted to
admin, never given a new password.

`--force` rewrites every product, category, coupon and page section listed in
`seed.data.js` back to its shipped values and replaces the images on those
products, deleting the storage objects they referenced so nothing is orphaned.
It is for scratch databases. Running it on a live store discards the owner's
work, and the command says so before it starts.

---

## 5. Authentication and authorization

**Sessions.** Login mints 32 random bytes, stores `HMAC-SHA256(token, AUTH_SECRET)`
in `Session`, and returns the raw token in an `httpOnly` cookie (`kes_session`).
A database dump therefore cannot be replayed as a login, and rotating
`AUTH_SECRET` invalidates every outstanding session.

**Passwords** are hashed with scrypt (N=2¹⁶, r=8, 64-byte key) from `node:crypto`.
The stored string carries its own parameters — `scrypt$N$r$p$salt$hash` — so the
cost can be raised later without invalidating existing hashes. Login always runs
one verification, even for an unknown email, so timing does not reveal which
addresses are registered.

**Authorization** is opt-in per route:

- `optionalAuth` — resolves the user if there is one (cart, coupon preview).
- `requireAuth` — 401 without a session, 403 for a suspended account.
- `requireAdmin` — `requireAuth` plus a role check.

Public catalogue reads attach no auth hook at all, so they never pay for a
session lookup. Suspending an account revokes its sessions immediately rather
than waiting for the cookie to expire.

**Email verification.** `registerUser` creates the account with
`emailVerifiedAt = null` and no session; `authenticateUser` checks the password
first and only then refuses with `403 EMAIL_UNVERIFIED`, so the gate cannot be
used to discover which addresses are registered. Codes live in `EmailOtp`,
stored as `HMAC-SHA256(email:purpose:code, AUTH_SECRET)` and compared in
constant time — see `services/otp.service.js` for the full set of rules.

**CSRF.** The API is cookie-authenticated, so `middleware/csrf.js` rejects any
state-changing request whose `Origin` is not an allowed storefront. Browsers
always send `Origin` on cross-site mutations, which makes this effective even
when the cookie has to be `SameSite=None` (storefront and API on different
domains). Webhooks are exempt — they carry no cookies and authenticate by
signature.

---

## 6. Order and payment flow

```
POST /api/orders
  └─ one transaction:
     1. re-read the cart's products inside the transaction
     2. reject anything no longer ACTIVE
     3. price every line from the database (never from the request)
     4. validate and apply the coupon
     5. compute discount → tax → shipping → total
     6. reserve stock with a conditional decrement
     7. create Order + OrderItems (name/SKU/price snapshots)
     8. create the Payment row
     9. record the coupon redemption
    10. empty the cart
```

Step 6 is the one that prevents overselling:

```js
await tx.inventory.updateMany({
  where: { productId, quantity: { gte: qty } },
  data: { quantity: { decrement: qty }, reserved: { increment: qty } },
});
// count !== 1 → someone else took the last piece → abort the transaction
```

PostgreSQL re-evaluates the `WHERE` against the locked row, so two concurrent
checkouts for the last item cannot both succeed.

Then:

1. `POST /api/orders/:id/payment-session` creates (or reuses) a Razorpay order
   for **the amount on the order row** and returns the public key id.
2. The browser opens Razorpay's hosted checkout. Card details never touch this
   server.
3. `POST /api/orders/payments/verify` checks the HMAC on the callback, confirms
   the Razorpay order id matches the one stored, re-reads the payment from
   Razorpay, checks the captured amount equals the order total, then marks the
   order paid and converts the reservation into a sale.
4. `POST /api/webhooks/razorpay` does the same from the provider side. Every
   delivery is recorded in `WebhookEvent` first, so retries are no-ops.
5. Orders that are never paid are swept every five minutes
   (`ORDER_RESERVATION_MINUTES`), cancelled, and their stock returned.

If Razorpay is not configured the payment endpoints return `503` with a clear
message; nothing is faked.

---

## 7. Media uploads

`POST /api/admin/media` accepts one image, reads it into memory (capped by
`MAX_UPLOAD_BYTES`), confirms the real format from its magic bytes — the declared
`Content-Type` is attacker-controlled — generates the object key itself, and
stores it in Supabase Storage. PostgreSQL only holds the public URL and the
object path, so the file can be deleted later.

Allowed: JPEG, PNG, WebP, AVIF.

Storage is reached with `SUPABASE_SECRET_KEY` (`sb_secret_…`), sent as both
`apikey` and a bearer token. The legacy `service_role` JWT still works through
`SUPABASE_SERVICE_ROLE_KEY` — Supabase is retiring those through 2026, so the
server logs a deprecation warning at boot when that is the only key set. A
publishable key in either slot is refused at boot rather than failing on the
first upload. The browser never holds a Supabase key: uploads go through this
endpoint.

---

## 8. Local development

```bash
cp .env.example .env     # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm install
npm run prisma:generate
npm run prisma:deploy    # or prisma:migrate in development
npm run db:seed
npm run dev              # http://localhost:4000
```

`npm run dev` uses `node --watch`; the Prisma client is cached on `globalThis`
so reloads do not exhaust the connection pool.

`src/config/env.js` loads `backend/.env` itself (via `process.loadEnvFile`,
hence the Node 20.12 floor) rather than relying on each npm script, so
`node src/server.js` and `node prisma/seed.js` see the same configuration the
Prisma CLI does. Variables already present in the real environment are never
overwritten, so a hosting platform's config always wins.

---

## 9. Testing and checks

```bash
npm test     # node:test — pricing, hashing, signatures, CMS, API surface
npm run lint # eslint
```

The suite deliberately needs no database. It covers the parts where a bug is
expensive:

- **pricing** — subtotal, discount-before-tax ordering, totals that never go
  negative, coupon caps.
- **security** — password hashing and rejection, session token hashing, Razorpay
  checkout and webhook signature verification.
- **cms** — every section type is editable, the seed's content validates, seeded
  products have unique SKUs, images, and stock within their batch size.
- **api** — routing, 401 on every admin, customer and support route, CSRF
  rejection of a foreign origin, field-level validation errors, body-size
  limits, webhook signature rejection.
- **otp** — six digits, hashed at rest, single use, bound to address and
  purpose, expiry, attempt cap, supersession, resend cooldown; plus the
  sign-in gate for an unverified account. Prisma is swapped for an in-memory
  double, so this still needs no database.

Anything that needs real rows (checkout, inventory races, webhook replay) is
exercised against a database — see the root README's production checklist.

---

## 10. Environment variables

Documented inline in [`.env.example`](.env.example) and validated by
`src/config/env.js` at boot. The process exits with a readable message rather
than starting half-configured. The full table is in the
[root README](../README.md#11-environment-variables).

---

## 11. Deployment

The backend is a single long-running Node process (`npm start`).

1. Set every variable from `.env.example`. In production set
   `CORS_ORIGINS` to the storefront's exact origin, and — if the storefront is on
   a different domain — `COOKIE_SAMESITE=none` (which forces `COOKIE_SECURE=true`).
2. Run `npm run prisma:deploy` as a release step.
3. Point `/api/webhooks/razorpay` at the deployment and paste the signing secret
   into `RAZORPAY_WEBHOOK_SECRET`.
4. Terminate TLS in front of the process; `trustProxy` is on, so `request.ip`
   follows `X-Forwarded-For`.

The maintenance sweep runs inside the process. If the API is ever scaled to more
than one instance, move `releaseExpiredReservations` and `purgeExpiredSessions`
to a single scheduled job instead — running them on every instance is harmless
but wasteful.

---

## 12. Conventions

- Business rules live in `services/`, never in controllers and never in the
  frontend.
- Anything a client sends is validated by a Zod schema before it reaches a
  service.
- Prices, discounts, tax, totals, stock and roles are computed from the database.
  A value that arrives in a request body is treated as a suggestion at best.
- Throw an `AppError` for anything a client should see; anything else becomes a
  generic 500 with the detail in the log only.
- New response fields go through `lib/serialize.js`.
- A schema change means a migration in the same commit.

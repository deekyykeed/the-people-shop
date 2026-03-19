# The People — Live Brain

> This file is the single source of truth for AI agents and developers catching up on this project.
> Keep it updated as the app evolves.

---

## What This App Is

**The People** is a grocery ecommerce app built with Expo (React Native) + Supabase.

Core user flow:
1. Browse grocery products by category
2. Add items to cart (session-based, no auth required)
3. Checkout and place orders

Admin flow (in progress):
1. Upload multiple product images (different angles of a physical product)
2. Images pass through an AI pipeline ("nano banan" — TBD) to generate clean product images
3. Processed images are saved to Supabase Storage and linked to a product record

---

## Tech Stack

| Layer | Tech |
|---|---|
| Mobile app | Expo SDK 51, React Native 0.74, Expo Router v3 |
| Backend / DB | Supabase (PostgreSQL 17, eu-west-1) |
| Storage | Supabase Storage (planned: `product-images` bucket) |
| Image AI | nano banan (TBD — pending clarification) |
| State | React Context (cart in `lib/cart.ts`, session in `lib/session.ts`) |
| Language | TypeScript |

---

## Project Structure

```
app/
  (tabs)/         — tab navigator screens
  _layout.tsx     — root layout
lib/
  supabase.ts     — Supabase client + all TypeScript types
  cart.ts         — cart state/context
  session.ts      — anonymous session management
CLAUDE.md         — this file (live brain)
```

---

## Supabase Project

- **Project ID:** `jqzpskhfssxasrlnffhb`
- **URL:** `https://jqzpskhfssxasrlnffhb.supabase.co`
- **Region:** eu-west-1

### Database Schema

**`categories`** — 6 rows
- `id` (uuid), `name` (text), `icon` (text), `created_at`

**`products`** — 8 rows
- `id`, `name`, `description`, `price`, `image_url` (single, legacy), `category_id`, `stock`, `created_at`

**`cart_items`**
- `id`, `session_id` (text, anonymous), `product_id`, `quantity`, `created_at`

**`orders`** + **`order_items`**
- Standard order/line-item structure, session-based

### Planned Schema Additions

**`product_images`** — multiple images per product
- `id`, `product_id` (fk → products), `url`, `angle` (e.g. front/back/side), `is_primary`, `created_at`

---

## Current Status

- [x] Supabase project live and connected
- [x] Core DB schema (categories, products, cart, orders)
- [x] Expo app scaffolded with Supabase client
- [x] MCP server configured (claude.ai Supabase)
- [ ] Product image upload screen
- [ ] Supabase Storage bucket (`product-images`)
- [ ] `product_images` table
- [ ] AI image pipeline (nano banan — TBD)
- [ ] Admin UI for product management

---

## Key Decisions & Context

- **Session-based cart** — no user auth required to shop. Sessions stored in AsyncStorage.
- **Single `image_url` on products** — legacy field, will be replaced by `product_images` table for multi-angle support.
- **Image AI pipeline** — user uploads raw product photos → processed by "nano banan" → clean product images returned → saved to Supabase Storage.
- **Supabase anon key is in `lib/supabase.ts`** — this is intentional for a React Native app (public key). RLS is enabled on all tables.

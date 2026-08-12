# Dinora Shirinliklari E-Commerce Backend & Telegram Bot

Enterprise-grade TypeScript REST API Backend & GramMY Telegram Bot for **Dinora Shirinliklari**.

## Tech Stack
- **Language**: TypeScript (Strict mode enabled)
- **Framework**: Express.js
- **Telegram Bot**: `grammy` with `@grammyjs/storage-file` session storage
- **ORM / Database**: Prisma ORM with PostgreSQL database
- **Validation**: Zod (for environment variables, REST DTOs, and Bot input)
- **Logger**: Winston

---

## Features
1. **Product Catalog Module**:
   - CRUD API for Admin Mini App / Web Portal.
   - Categorized product listings ("Tortlar", "Pirojniylar", "Dessertlar", etc.).
   - Product availability toggle and image URL / Base64 support.
2. **Custom Cake Module ("✨ O'zim xohlaganimdek")**:
   - Telegram bot flow for reference photo uploads, custom text description, and delivery/pickup selection.
   - Instant notification to Admin IDs for manual price quoting.
3. **Order & Checkout Flow**:
   - Session-based Telegram bot shopping cart (+ / - quantity control, clear cart).
   - Delivery options: Location geolocation sharing or self-pickup.
   - Payment options: Card transfer (with payment receipt screenshot upload & admin verification) or Cash.
4. **Admin Verification & Controls**:
   - Order receipt notification with inline verification buttons (`✅ Tasdiqlash` / `❌ Rad etish`).
   - Automated notification broadcast to user upon order status changes.

---

## Quick Start Guide

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Set your Telegram Bot Token and Admin IDs in `.env`:
```env
PORT=3000
NODE_ENV=development
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
ADMIN_IDS=123456789,987654321
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dinora_db?schema=public"
```

### 3. Database Generation & Seed
Generate Prisma client and run seed script:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 4. Running the Project
- **Development mode** (with auto-reload):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm run build
  npm start
  ```

---

## REST API Documentation

### Products API
- `GET /api/products` - List products (query params: `categoryId`, `isAvailable`, `search`).
- `GET /api/products/categories` - List active categories.
- `GET /api/products/:id` - Get product details.
- `POST /api/products` - Create new product (Admin).
- `PUT /api/products/:id` - Update product details (Admin).
- `DELETE /api/products/:id` - Delete product (Admin).

### Orders API
- `GET /api/orders` - List orders (query params: `telegramId`, `status`).
- `GET /api/orders/:id` - Get order details.
- `POST /api/orders` - Create order (Mini App / API integration).
- `PATCH /api/orders/:id/status` - Update order status (Admin).

### Custom Cake Requests API
- `GET /api/custom-cakes` - List custom cake requests.
- `GET /api/custom-cakes/:id` - Get request details.
- `POST /api/custom-cakes` - Submit custom cake request.
- `PATCH /api/custom-cakes/:id/status` - Update request status and set estimated price (Admin).

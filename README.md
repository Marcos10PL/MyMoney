# MyMoney

A personal finance management application for tracking bank accounts, transactions, expense categories, loans, and financial analytics. Built as a personal project tailored to my own needs.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| Framework   | Nuxt 4 (Vue 3 + Nitro)                        |
| UI          | Nuxt UI 4, Tailwind CSS 4                      |
| State       | Pinia                                          |
| Tables      | TanStack Vue Table                             |
| Auth        | nuxt-auth-utils (server-side sessions)         |
| Database    | PostgreSQL (recommended: Neon)                 |
| ORM         | Drizzle ORM                                    |
| Validation  | Zod                                            |
| Language    | TypeScript 6                                   |
| Package mgr | pnpm 11                                        |

---

## Prerequisites

- **Node.js** 18 or higher
- **pnpm** 11 — `npm install -g pnpm`
- **PostgreSQL** — local install or a cloud service (e.g. [Neon](https://neon.tech))

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd MyMoney
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
NUXT_SESSION_PASSWORD=a-very-secret-random-string-at-least-32-chars
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

- `NUXT_SESSION_PASSWORD` — any random string, minimum 32 characters. Generate one with `openssl rand -base64 32`.
- `DATABASE_URL` — PostgreSQL connection string. For Neon, copy it from your project dashboard.

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Create an admin user

```bash
pnpm script:create-admin
```

An interactive CLI will prompt for a login and password.

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable                | Required | Description                                    |
| ----------------------- | -------- | ---------------------------------------------- |
| `NUXT_SESSION_PASSWORD` | Yes      | Session encryption key, minimum 32 characters |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string                   |

### Connection string examples

**Neon (cloud):**
```
postgresql://username:password@ep-name.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Local PostgreSQL:**
```
postgresql://postgres:postgres@localhost:5432/mymoney
```

---

## Available Scripts

| Command                    | Description                              |
| -------------------------- | ---------------------------------------- |
| `pnpm dev`                 | Start development server                 |
| `pnpm build`               | Production build                         |
| `pnpm preview`             | Preview production build                 |
| `pnpm lint`                | Run ESLint + Prettier                    |
| `pnpm typecheck`           | TypeScript type checking                 |
| `pnpm db:generate`         | Generate Drizzle migration files         |
| `pnpm db:migrate`          | Apply pending migrations                 |
| `pnpm db:studio`           | Open Drizzle Studio (database GUI)       |
| `pnpm script:create-admin` | Create an admin user interactively       |

---

## Architecture

### Directory structure

```
├── app/
│   ├── components/          # Vue components
│   │   ├── accounts/        # Account forms and modals
│   │   ├── banks/           # Bank forms and modals
│   │   ├── categories/      # Category forms and modals
│   │   ├── transactions/    # Transaction table and forms
│   │   ├── dashboard/       # Dashboard widgets
│   │   └── ui/              # Generic UI (DateInput, InputNumber, ...)
│   ├── middleware/
│   │   └── auth.global.ts   # Route guard (redirects to /login)
│   ├── pages/
│   │   ├── index.vue        # Dashboard
│   │   ├── accounts.vue     # Account management
│   │   ├── banks.vue        # Bank management
│   │   ├── categories.vue   # Category management
│   │   ├── transactions.vue # Transaction list with filters and pagination
│   │   └── (auth)/login.vue # Login page
│   └── stores/
│       ├── accounts.ts      # Pinia store for accounts
│       ├── banks.ts
│       └── categories.ts
├── server/
│   ├── api/                 # Nitro API endpoints
│   │   ├── auth/            # Login, logout
│   │   ├── accounts/        # CRUD
│   │   ├── banks/           # CRUD
│   │   ├── categories/      # CRUD
│   │   ├── transactions/    # CRUD + loans
│   │   └── stats/           # Dashboard data
│   ├── db/
│   │   ├── conn.ts          # Drizzle connection
│   │   ├── migrations/      # SQL migration files
│   │   └── schema/          # Drizzle table definitions
│   ├── middleware/
│   │   └── auth.ts          # Session verification for all API routes
│   └── schema/
│       └── body.ts          # Zod request validation schemas
├── shared/
│   ├── types/               # Shared TypeScript types
│   └── utils/
│       └── const.ts         # Validation constants and enums
└── public/                  # Static assets
```

### Authentication flow

1. User submits `POST /api/auth/login` with login and password
2. Server verifies the password (bcrypt) and creates a session via `nuxt-auth-utils`
3. `server/middleware/auth.ts` protects every `/api/**` route except `/api/auth/**`
4. `app/middleware/auth.global.ts` redirects unauthenticated users to `/login`

### Balance calculation

Account balances are calculated dynamically in `GET /api/stats` by summing all transactions. No balance column is stored in the database.

Rules:
- **income** → `+amount`
- **expense** → `-amount`
- **transfer** with `toAccountId` set → `-amount` from the source account
- **transfer** without `toAccountId` → `+amount` on the destination account
- **loan_given** → `-amount`
- **loan_returned** → `+amount`

Every internal transfer creates **2 rows** in the `transactions` table:
- Outgoing leg: `accountId=from`, `toAccountId=to`
- Incoming leg: `accountId=to`, `toAccountId=null`

---

## Database Schema

### `users`

| Column    | Type      | Notes              |
| --------- | --------- | ------------------ |
| id        | UUID (PK) |                    |
| login     | TEXT      | Unique             |
| password  | TEXT      | bcrypt hash        |
| role      | ENUM      | `admin`            |
| createdAt | TIMESTAMP |                    |
| deletedAt | TIMESTAMP | Soft delete        |

### `banks`

| Column | Type      | Notes                    |
| ------ | --------- | ------------------------ |
| id     | UUID (PK) |                          |
| userId | UUID (FK) | → users (cascade delete) |
| name   | TEXT      | Unique per user          |

### `accounts`

| Column          | Type      | Notes                                                                     |
| --------------- | --------- | ------------------------------------------------------------------------- |
| id              | UUID (PK) |                                                                           |
| userId          | UUID (FK) | → users                                                                   |
| bankId          | UUID (FK) | → banks (nullable)                                                        |
| name            | TEXT      |                                                                           |
| type            | ENUM      | `checking`, `savings`, `deposit`, `investment`, `wallet`, `home`, `other` |
| percentage      | NUMERIC   | Interest rate (for deposits/savings)                                      |
| duration        | ENUM      | `indefinite`, `fixed`                                                     |
| durationEndDate | TIMESTAMP | End date for fixed-term accounts                                          |
| isActive        | BOOLEAN   |                                                                           |

### `categories`

| Column | Type      | Notes               |
| ------ | --------- | ------------------- |
| id     | UUID (PK) |                     |
| userId | UUID (FK) | → users             |
| name   | TEXT      | Unique per user     |
| type   | ENUM      | `income`, `expense` |

### `transactions`

| Column        | Type      | Notes                                                          |
| ------------- | --------- | -------------------------------------------------------------- |
| id            | UUID (PK) |                                                                |
| userId        | UUID (FK) | → users                                                        |
| accountId     | UUID (FK) | → accounts (cascade delete)                                    |
| toAccountId   | UUID (FK) | → accounts (nullable, transfers only)                          |
| categoryId    | UUID (FK) | → categories (nullable, set null on delete)                    |
| transactionId | UUID (FK) | → transactions (nullable, for `loan_returned`)                 |
| type          | ENUM      | `income`, `expense`, `transfer`, `loan_given`, `loan_returned` |
| name          | TEXT      |                                                                |
| amount        | NUMERIC   | Absolute value (12,2)                                          |
| date          | TIMESTAMP |                                                                |
| counterparty  | TEXT      | Nullable, used for loans                                       |
| description   | TEXT      | Nullable                                                       |

---

## API Reference

All endpoints require an active session. Responses follow this structure:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Paginated responses include an additional `pagination` object:

```json
{
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

### Auth

| Method | Path               | Description |
| ------ | ------------------ | ----------- |
| POST   | `/api/auth/login`  | Log in      |
| POST   | `/api/auth/logout` | Log out     |

### Accounts

| Method | Path                 | Description    |
| ------ | -------------------- | -------------- |
| GET    | `/api/accounts`      | List accounts  |
| POST   | `/api/accounts`      | Create account |
| PUT    | `/api/accounts/[id]` | Update account |
| DELETE | `/api/accounts/[id]` | Delete account |

### Banks

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| GET    | `/api/banks`      | List banks  |
| POST   | `/api/banks`      | Create bank |
| PUT    | `/api/banks/[id]` | Update bank |
| DELETE | `/api/banks/[id]` | Delete bank |

### Categories

| Method | Path                   | Description      |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/categories`      | List categories  |
| POST   | `/api/categories`      | Create category  |
| PUT    | `/api/categories/[id]` | Update category  |
| DELETE | `/api/categories/[id]` | Delete category  |

### Transactions

| Method | Path                             | Description                          |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/api/transactions`              | Paginated list with filters          |
| POST   | `/api/transactions`              | Create transaction                   |
| PUT    | `/api/transactions/[id]`         | Update transaction                   |
| DELETE | `/api/transactions/[id]`         | Delete transaction                   |
| GET    | `/api/transactions/loans-unpaid` | Unpaid loans with remaining balances |

**Query parameters for `GET /api/transactions`:**

| Parameter     | Type     | Description                          |
| ------------- | -------- | ------------------------------------ |
| `page`        | number   | Page number (default: 1)             |
| `limit`       | number   | Results per page (default: 10)       |
| `accountIds`  | string[] | Filter by account IDs                |
| `categoryIds` | string[] | Filter by category IDs               |
| `type`        | string   | Filter by transaction type           |
| `dateFrom`    | string   | Start date (ISO 8601)                |
| `dateTo`      | string   | End date (ISO 8601)                  |
| `search`      | string   | Search in transaction name           |
| `sortBy`      | string   | `date`, `amount`, or `name`          |
| `sortOrder`   | string   | `asc` or `desc`                      |

### Stats

| Method | Path         | Description                                                        |
| ------ | ------------ | ------------------------------------------------------------------ |
| GET    | `/api/stats` | Dashboard data: account balances, totals, top categories, debtors |

---

## Troubleshooting

### Database connection error

```
Error: Connection refused
Error: SSL required
```

- Check that `DATABASE_URL` is correct
- For Neon, append `?sslmode=require` to the connection string
- Verify the database server is running

### Session errors / constant redirects to login

```
Error: Session decryption failed
```

- `NUXT_SESSION_PASSWORD` must be at least 32 characters
- Changing this value invalidates all existing sessions — log in again

### Pending migrations

```bash
pnpm db:generate   # generate new migrations after schema changes
pnpm db:migrate    # apply them
```

### Browse the database

```bash
pnpm db:studio
```

Opens a graphical database browser at `https://local.drizzle.studio`.

### TypeScript errors after schema changes

Restart the dev server after modifying any file under `server/db/schema/`:

```bash
pnpm dev
```

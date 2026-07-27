# Admin dashboard (Vercel) → live storefront (https://hatikvahcare.com)

## How product sync works

This admin app writes products straight into Postgres with Prisma.

If `DATABASE_URL` is the **same database** the live site uses, products you add here show on https://hatikvahcare.com — no storefront code changes.

## Setup (local + Vercel)

1. Copy env from the production server that hosts hatikvahcare.com into `.env` and Vercel:

```env
DATABASE_URL=...
DIRECT_URL=...
VITE_STORE_URL=https://hatikvahcare.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=...
S3_REGION=...
S3_BUCKET_NAME=...
STORE_LOGIN_EMAIL=...
STORE_LOGIN_PASSWORD=...
```

2. Run:

```bash
npm install
npm run dev
```

Admin: http://localhost:8080/login

## Important

Use the production `DATABASE_URL` from the server that hosts https://hatikvahcare.com. A different database will not update the live site.

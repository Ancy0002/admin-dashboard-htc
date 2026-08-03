# Admin dashboard (Vercel) → live storefront (https://hatikvahcare.com)

## How product sync works

1. Admin saves a product into **Postgres** (Supabase) with Prisma.
2. [hatikvahcare.com](https://hatikvahcare.com/) reads the **same** Postgres database.
3. Live product URL format (same as existing catalog items):

```text
https://hatikvahcare.com/product/<product-id>
```

Example that already works:

```text
https://hatikvahcare.com/product/cmq9hy336000l04ldf2qmr2e2
```

If admin and the live Linux app use different `DATABASE_URL` values (or the Linux process was not restarted after env change), new products save in admin but show **Product Not Found** on the live site.

## Required configuration (must match everywhere)

Set these in:

- local `.env`
- **Vercel** project env (Production + redeploy)
- **Linux main app** env that serves hatikvahcare.com (then restart)

```env
# SAME database the live site uses
DATABASE_URL="postgresql://...@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

VITE_STORE_URL="https://hatikvahcare.com"

# Same Supabase storage the live catalog uses
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_ENDPOINT="https://tdonwvbgqyyfkatrdxsx.storage.supabase.co/storage/v1/s3"
S3_REGION="ap-south-1"
S3_BUCKET_NAME="Products"

STORE_LOGIN_EMAIL="..."
STORE_LOGIN_PASSWORD="..."
```

### Linux restart (critical)

After updating `.env` on the server:

```bash
pm2 restart <app-name> --update-env
```

2. Run:

```bash
npm install
npm run dev
```

Admin login: http://localhost:8080/login

# Admin dashboard → live storefront (https://hatikvahcare.com)

## How product sync works

1. Admin saves a product into **Postgres** with Prisma.
2. [hatikvahcare.com](https://hatikvahcare.com/) reads the **same** Postgres database.
3. Live product URL format:

```text
https://hatikvahcare.com/product/<product-id>
```

If admin and the live Linux app use different `DATABASE_URL` values (or the Linux process was not restarted after env change), new products save in admin but show **Product Not Found** on the live site.

## Required configuration

Copy values into local `.env`, Vercel, and the Linux main-app env (then restart).

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

VITE_STORE_URL="https://hatikvahcare.com"

S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_ENDPOINT="https://storage.hatikvahcare.com"
S3_REGION="us-east-1"
S3_BUCKET_NAME="hatikvahstorage"
# Optional if public URL differs from S3_ENDPOINT:
# S3_PUBLIC_URL="http://HOST:9000"

STORE_LOGIN_EMAIL="..."
STORE_LOGIN_PASSWORD="..."
```

### Linux restart (critical)

```bash
pm2 restart <app-name> --update-env
```

### Local

```bash
npm install
npm run dev
```

Admin login: http://localhost:8080/login

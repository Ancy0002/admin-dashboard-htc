# admin-dashboard-htc

HaTikvah admin dashboard (TanStack Start + Prisma + Supabase).

## Local development

```bash
npm install
cp .env.example .env
# Fill DATABASE_URL and DIRECT_URL from Supabase
npm run dev
```

Admin: http://localhost:8080/admin

## Deploy on Vercel

The storefront works without a database. **Admin routes require PostgreSQL.**

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase **pooler** URL (port `6543`, include `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **direct** URL (port `5432`) |
| `VITE_STORE_URL` | Optional — customer site for "View on website" links |

Use the same values as your local `.env` from the Hatikvah/Supabase project.

After saving env vars, **redeploy** the project (Deployments → Redeploy).

Build command (default): `npm run build`  
Includes `prisma generate` automatically.

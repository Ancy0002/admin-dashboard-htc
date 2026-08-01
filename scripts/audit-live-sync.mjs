import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const listed = await prisma.product.findMany({
  where: { isListed: true },
  orderBy: { updatedAt: "desc" },
  select: { id: true, name: true, updatedAt: true },
});

const sitemap = await fetch("https://hatikvahcare.com/sitemap.xml").then((r) => r.text());
const liveIds = [...sitemap.matchAll(/\/product\/([a-z0-9]+)/gi)].map((m) => m[1]);
const liveSet = new Set(liveIds);

const onlyAdmin = listed.filter((p) => !liveSet.has(p.id));
const onlyLive = liveIds.filter((id) => !listed.some((p) => p.id === id));

console.log(
  JSON.stringify(
    {
      adminListed: listed.length,
      liveSitemap: liveSet.size,
      onlyInAdminNotLive: onlyAdmin,
      onlyInLiveNotAdminCount: onlyLive.length,
      proof:
        onlyAdmin.length > 0
          ? "Live site is NOT reading the same DB contents as this admin DATABASE_URL."
          : "IDs match between admin DB and live sitemap.",
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
await pool.end();

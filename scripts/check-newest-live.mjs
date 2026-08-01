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

const newest = await prisma.product.findMany({
  orderBy: { updatedAt: "desc" },
  take: 5,
  select: {
    id: true,
    name: true,
    isListed: true,
    isBestSeller: true,
    salesCount: true,
    category: true,
    updatedAt: true,
  },
});

for (const p of newest) {
  const page = await fetch(`https://hatikvahcare.com/product/${p.id}`).then((r) => r.text());
  const notFound = /Product Not Found/i.test(page);
  const title = (page.match(/<title>([^<]+)<\/title>/) || [])[1] || "?";
  console.log(
    JSON.stringify({
      id: p.id,
      name: p.name,
      isListed: p.isListed,
      isBestSeller: p.isBestSeller,
      salesCount: p.salesCount,
      category: p.category,
      liveNotFound: notFound,
      liveTitle: title,
    }),
  );
}

await prisma.$disconnect();
await pool.end();

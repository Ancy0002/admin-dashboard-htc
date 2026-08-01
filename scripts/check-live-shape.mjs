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

const newest = await prisma.product.findFirst({
  orderBy: { updatedAt: "desc" },
  include: { sizes: true, quantityVariants: true },
});

if (!newest) {
  console.log("no products");
} else {
  const okHost = (newest.image || "").includes("tdonwvbgqyyfkatrdxsx.storage.supabase.co");
  const okBucket = (newest.image || "").includes("/Products/");
  const okUploads = (newest.image || "").includes("/uploads/");
  console.log(
    JSON.stringify({
      id: newest.id,
      name: newest.name,
      isListed: newest.isListed,
      sizes: newest.sizes.length,
      image: newest.image,
      matchesMainAppUrlShape: okHost && okBucket && okUploads,
    }),
  );

  try {
    const r = await fetch(`https://hatikvahcare.com/product/${newest.id}`);
    const html = await r.text();
    const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || "?";
    console.log(JSON.stringify({ liveTitle: title, notFound: /Product Not Found/i.test(html) }));
  } catch (e) {
    console.log(JSON.stringify({ liveError: String(e) }));
  }
}

await prisma.$disconnect();
await pool.end();

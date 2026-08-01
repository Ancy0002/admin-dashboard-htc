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

const id = "cms3mlqgt000004l350py0ajt";
const p = await prisma.product.findUnique({
  where: { id },
  include: { sizes: true, reviews: true, quantityVariants: true },
});

console.log(
  JSON.stringify(
    {
      found: !!p,
      name: p?.name,
      isListed: p?.isListed,
      image: p?.image,
      gallery: p?.gallery,
      galleryType: Array.isArray(p?.gallery) ? "array" : typeof p?.gallery,
      brandImage: p?.brandImage,
      sizes: p?.sizes,
      quantityVariants: p?.quantityVariants,
      keyIngredients: p?.keyIngredients,
      skinType: p?.skinType,
      benefit: p?.benefit,
      features: p?.features,
      additionalInfo: p?.additionalInfo,
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
await pool.end();

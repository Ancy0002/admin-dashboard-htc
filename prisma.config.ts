import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use direct Postgres for schema changes; pooler URLs can hang on db push.
    url: process.env.DIRECT_URL || env("DATABASE_URL"),
  },
});
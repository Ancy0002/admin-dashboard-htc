import { createServerFn } from "@tanstack/react-start";
import { MAX_PDF_BYTES } from "@/lib/file-utils";
import { CATALOGUE_CATEGORIES } from "@/lib/catalogue-categories";
import prisma from "@/lib/prisma";
import { deleteCataloguePdfFile, uploadCataloguePdfFile } from "@/lib/storage";

export type Catalogue = {
  id: string;
  name: string;
  pdfUrl: string | null;
  fileName: string | null;
};

async function ensureDefaultCatalogues() {
  const existing = await prisma.cataloguePdf.findMany({ select: { name: true } });
  const names = new Set(existing.map((row) => row.name));

  for (let i = 0; i < CATALOGUE_CATEGORIES.length; i++) {
    const name = CATALOGUE_CATEGORIES[i];
    if (names.has(name)) continue;
    await prisma.cataloguePdf.create({ data: { name, position: i } });
  }
}

function mapRow(row: {
  id: string;
  name: string;
  pdfUrl: string | null;
  fileName: string | null;
}): Catalogue {
  return {
    id: row.id,
    name: row.name,
    pdfUrl: row.pdfUrl,
    fileName: row.fileName,
  };
}

export const getStoreCatalogues = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDefaultCatalogues();

  const rows = await prisma.cataloguePdf.findMany({
    where: { pdfUrl: { not: null } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return rows
    .filter((row) => row.pdfUrl)
    .map((row) => ({
      id: row.id,
      name: row.name,
      pdfUrl: row.pdfUrl!,
      fileName: row.fileName,
    }));
});

export const getAdminCatalogues = createServerFn({ method: "GET" }).handler(async () => {
  await ensureDefaultCatalogues();

  const rows = await prisma.cataloguePdf.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return rows.map(mapRow);
});

export const createCatalogue = createServerFn({ method: "POST" })
  .validator((data: { name?: string }) => data)
  .handler(async ({ data }) => {
    const name = data.name?.trim() || "New catalogue";
    const count = await prisma.cataloguePdf.count();
    const row = await prisma.cataloguePdf.create({
      data: { name, position: 1000 + count },
    });

    return mapRow(row);
  });

export const saveCatalogue = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; name?: string; fileName?: string; contentBase64?: string }) => data,
  )
  .handler(async ({ data }) => {
    const row = await prisma.cataloguePdf.findUnique({ where: { id: data.id } });
    if (!row) throw new Error("Catalogue not found.");

    let pdfUrl = row.pdfUrl;
    let fileName = row.fileName;

    if (data.contentBase64 && data.fileName) {
      const content = Buffer.from(data.contentBase64, "base64");
      if (content.length === 0) throw new Error("The uploaded file is empty.");
      if (content.length > MAX_PDF_BYTES) throw new Error("PDF must be under 10MB.");
      if (content.subarray(0, 4).toString() !== "%PDF") {
        throw new Error("Only PDF files are allowed.");
      }

      if (row.pdfUrl) {
        try {
          await deleteCataloguePdfFile(row.pdfUrl);
        } catch {
          // ignore cleanup errors
        }
      }

      const uploaded = await uploadCataloguePdfFile(data.id, data.fileName, content);
      pdfUrl = uploaded.url;
      fileName = data.fileName;
    }

    const updated = await prisma.cataloguePdf.update({
      where: { id: data.id },
      data: {
        name: data.name?.trim() || row.name,
        pdfUrl,
        fileName,
      },
    });

    return mapRow(updated);
  });

export const deleteCatalogue = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const row = await prisma.cataloguePdf.findUnique({ where: { id } });
    if (!row) throw new Error("Catalogue not found.");

    if (row.pdfUrl) {
      try {
        await deleteCataloguePdfFile(row.pdfUrl);
      } catch {
        // ignore cleanup errors
      }
    }

    await prisma.cataloguePdf.delete({ where: { id } });
    return { ok: true };
  });

export const clearCataloguePdf = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const row = await prisma.cataloguePdf.findUnique({ where: { id } });
    if (!row) throw new Error("Catalogue not found.");

    if (row.pdfUrl) {
      try {
        await deleteCataloguePdfFile(row.pdfUrl);
      } catch {
        // ignore cleanup errors
      }
    }

    const updated = await prisma.cataloguePdf.update({
      where: { id },
      data: { pdfUrl: null, fileName: null },
    });

    return mapRow(updated);
  });

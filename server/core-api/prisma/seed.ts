import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: "u-client-001",
        name: "Aigerim K.",
        role: "client",
        loyaltyProgress: 72,
      },
      {
        id: "u-franchisee-001",
        name: "Madina S.",
        role: "franchisee",
        loyaltyProgress: 100,
      },
      {
        id: "u-production-001",
        name: "Gulmira T.",
        role: "production",
        loyaltyProgress: 100,
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        id: "p-001",
        sku: "AV-COAT-01",
        name: "Architect Coat",
        price: "189 000 KZT",
        availability: "in_stock",
        style: ["office", "sharp"],
        description: "Structured coat with clean shoulders and a strict editorial silhouette.",
      },
      {
        id: "p-002",
        sku: "AV-DRESS-02",
        name: "Gallery Dress",
        price: "124 000 KZT",
        availability: "preorder",
        style: ["editorial", "evening"],
        description: "Long-form dress with gallery-grade proportions and soft movement.",
      },
      {
        id: "p-003",
        sku: "AV-SUIT-03",
        name: "Noir Suit",
        price: "211 000 KZT",
        availability: "in_stock",
        style: ["tailoring", "formal"],
        description: "Brutalist suit built around sharp lapels and a minimal line break.",
      },
      {
        id: "p-004",
        sku: "AV-SHIRT-04",
        name: "Studio Shirt",
        price: "69 000 KZT",
        availability: "preorder",
        style: ["casual", "soft"],
        description: "Layer-friendly shirt for calm monochrome looks and relaxed structure.",
      },
    ],
  });

  await prisma.order.createMany({
    data: [
      {
        id: "o-001",
        number: "AV-260327-001",
        productId: "p-003",
        customerId: "u-client-001",
        status: "in_production",
        notes: "PRIORITY / FIT CHECKED",
        createdAt: new Date("2026-03-27T12:30:00.000Z"),
      },
      {
        id: "o-002",
        number: "AV-260327-002",
        productId: "p-002",
        customerId: "u-client-001",
        status: "pending_franchisee",
        notes: "PREORDER / DATE REQUIRED",
        scheduledDate: new Date("2026-04-05T00:00:00.000Z"),
        createdAt: new Date("2026-03-27T13:00:00.000Z"),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

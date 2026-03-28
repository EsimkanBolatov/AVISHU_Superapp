import { createHash } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  await prisma.orderAttachment.deleteMany();
  await prisma.orderComment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tryOnSession.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: "u-client-001",
        email: "client@avishu.kz",
        passwordHash: hashPassword("Client123!"),
        name: "Aigerim K.",
        role: "client",
        phone: "+7 777 555 21 10",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 72,
      },
      {
        id: "u-franchisee-001",
        email: "franchisee@avishu.kz",
        passwordHash: hashPassword("Franchisee123!"),
        name: "Madina S.",
        role: "franchisee",
        phone: "+7 777 100 88 40",
        avatarUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 100,
      },
      {
        id: "u-production-001",
        email: "production@avishu.kz",
        passwordHash: hashPassword("Production123!"),
        name: "Gulmira T.",
        role: "production",
        phone: "+7 701 320 19 90",
        avatarUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 100,
      },
    ],
  });

  await prisma.category.createMany({
    data: [
      {
        id: "c-outerwear",
        slug: "outerwear",
        name: "Outerwear",
        description: "Technical shells, storm jackets and weather-proof silhouettes.",
      },
      {
        id: "c-tailoring",
        slug: "tailoring",
        name: "Tailoring",
        description: "Architectural tailoring for sharp everyday styling.",
      },
      {
        id: "c-softwear",
        slug: "softwear",
        name: "Softwear",
        description: "Layering pieces with softer drape and calmer structure.",
      },
    ],
  });

  await prisma.product.createMany({
    data: [
      {
        id: "p-001",
        slug: "storm-shell-geim",
        sku: "AV-OUT-001",
        name: "Storm Shell GEIM",
        subtitle: "Weatherproof outer layer with strict technical attitude.",
        priceAmount: 219000,
        availability: "in_stock",
        style: ["technical", "outerwear", "monochrome"],
        description:
          "Premium storm shell with clean cutlines, oversized protection collar and advanced urban silhouette.",
        composition: "100% laminated nylon shell / breathable lining",
        fittingNotes: "Structured shoulder line with relaxed torso volume.",
        deliveryEstimate: "Ships in 1-2 days.",
        featured: true,
        categoryId: "c-outerwear",
      },
      {
        id: "p-002",
        slug: "vector-trench",
        sku: "AV-OUT-002",
        name: "Vector Trench",
        subtitle: "Long-line city trench with colder luxury proportions.",
        priceAmount: 249000,
        availability: "preorder",
        style: ["tailored", "outerwear", "city"],
        description:
          "A longer silhouette trench with minimal hardware, hidden closure and sharpened front balance.",
        composition: "Coated cotton blend / technical viscose lining",
        fittingNotes: "Elongated body with cleaner vertical fall.",
        deliveryEstimate: "Preorder dispatch in 10 days.",
        featured: true,
        categoryId: "c-outerwear",
      },
      {
        id: "p-003",
        slug: "axis-blazer",
        sku: "AV-TLR-003",
        name: "Axis Blazer",
        subtitle: "Softly armored blazer for precise day-to-night dressing.",
        priceAmount: 189000,
        availability: "in_stock",
        style: ["tailoring", "formal", "minimal"],
        description:
          "Single-breasted blazer with tuned lapel geometry and premium matte finish for monochrome dressing.",
        composition: "Virgin wool blend / cupro lining",
        fittingNotes: "Sharp shoulder with straight hem balance.",
        deliveryEstimate: "Ships in 2-3 days.",
        featured: false,
        categoryId: "c-tailoring",
      },
      {
        id: "p-004",
        slug: "soft-structure-shirt",
        sku: "AV-SFT-004",
        name: "Soft Structure Shirt",
        subtitle: "Fluid shirt for layered monochrome wardrobes.",
        priceAmount: 82000,
        availability: "preorder",
        style: ["softwear", "layering", "minimal"],
        description:
          "Relaxed shirt with cleaner seam map, extended cuff and understated premium drape.",
        composition: "Brushed cotton / lyocell blend",
        fittingNotes: "Relaxed body with lighter shoulder structure.",
        deliveryEstimate: "Preorder dispatch in 7 days.",
        featured: false,
        categoryId: "c-softwear",
      },
    ],
  });

  await prisma.productMedia.createMany({
    data: [
      {
        id: "pm-001",
        productId: "p-001",
        url: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
        alt: "Storm Shell GEIM front look",
        kind: "cover",
        sortOrder: 0,
      },
      {
        id: "pm-002",
        productId: "p-001",
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        alt: "Storm Shell GEIM editorial look",
        kind: "gallery",
        sortOrder: 1,
      },
      {
        id: "pm-003",
        productId: "p-001",
        url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
        alt: "Storm Shell GEIM detail look",
        kind: "detail",
        sortOrder: 2,
      },
      {
        id: "pm-004",
        productId: "p-002",
        url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        alt: "Vector Trench cover",
        kind: "cover",
        sortOrder: 0,
      },
      {
        id: "pm-005",
        productId: "p-002",
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
        alt: "Vector Trench gallery",
        kind: "gallery",
        sortOrder: 1,
      },
      {
        id: "pm-006",
        productId: "p-003",
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
        alt: "Axis Blazer cover",
        kind: "cover",
        sortOrder: 0,
      },
      {
        id: "pm-007",
        productId: "p-003",
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
        alt: "Axis Blazer gallery",
        kind: "gallery",
        sortOrder: 1,
      },
      {
        id: "pm-008",
        productId: "p-004",
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        alt: "Soft Structure Shirt cover",
        kind: "cover",
        sortOrder: 0,
      },
      {
        id: "pm-009",
        productId: "p-004",
        url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
        alt: "Soft Structure Shirt gallery",
        kind: "gallery",
        sortOrder: 1,
      },
    ],
  });

  await prisma.productVariant.createMany({
    data: [
      { id: "pv-001", productId: "p-001", sizeLabel: "XS", stock: 2 },
      { id: "pv-002", productId: "p-001", sizeLabel: "S", stock: 4 },
      { id: "pv-003", productId: "p-001", sizeLabel: "M", stock: 6 },
      { id: "pv-004", productId: "p-001", sizeLabel: "L", stock: 3 },
      { id: "pv-005", productId: "p-002", sizeLabel: "S", stock: 0 },
      { id: "pv-006", productId: "p-002", sizeLabel: "M", stock: 0 },
      { id: "pv-007", productId: "p-002", sizeLabel: "L", stock: 0 },
      { id: "pv-008", productId: "p-003", sizeLabel: "S", stock: 5 },
      { id: "pv-009", productId: "p-003", sizeLabel: "M", stock: 5 },
      { id: "pv-010", productId: "p-003", sizeLabel: "L", stock: 2 },
      { id: "pv-011", productId: "p-004", sizeLabel: "M", stock: 0 },
      { id: "pv-012", productId: "p-004", sizeLabel: "L", stock: 0 },
      { id: "pv-013", productId: "p-004", sizeLabel: "XL", stock: 0 },
    ],
  });

  await prisma.tryOnSession.createMany({
    data: [
      {
        id: "to-001",
        userId: "u-client-001",
        productId: "p-001",
        sourceImageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        resultImageUrl:
          "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
        status: "ready",
        notes: "First AI fit preview approved by client.",
      },
    ],
  });

  await prisma.order.createMany({
    data: [
      {
        id: "o-001",
        number: "AV-260327-001",
        productId: "p-001",
        variantId: "pv-003",
        customerId: "u-client-001",
        tryOnId: "to-001",
        status: "in_production",
        paymentStatus: "paid",
        deliveryMethod: "courier",
        paymentMethod: "kaspi",
        notes: "Priority client. Confirm monochrome packaging.",
        shippingAddress: "Almaty, Al-Farabi avenue 19, apt 120",
        contactPhone: "+7 777 555 21 10",
        totalAmount: 219000,
        createdAt: new Date("2026-03-27T12:30:00.000Z"),
      },
      {
        id: "o-002",
        number: "AV-260327-002",
        productId: "p-002",
        variantId: "pv-006",
        customerId: "u-client-001",
        status: "pending_franchisee",
        paymentStatus: "paid",
        deliveryMethod: "pickup",
        paymentMethod: "card",
        notes: "Preorder client requested SMS once atelier confirms slot.",
        shippingAddress: "Almaty flagship pickup point",
        contactPhone: "+7 777 555 21 10",
        scheduledDate: new Date("2026-04-05T00:00:00.000Z"),
        totalAmount: 249000,
        createdAt: new Date("2026-03-27T13:00:00.000Z"),
      },
    ],
  });

  await prisma.orderComment.createMany({
    data: [
      {
        id: "oc-001",
        orderId: "o-001",
        authorId: "u-franchisee-001",
        message: "Order approved and handed to production queue.",
      },
      {
        id: "oc-002",
        orderId: "o-001",
        authorId: "u-production-001",
        message: "Main shell cut complete. Waiting for QC review.",
      },
    ],
  });

  await prisma.orderAttachment.createMany({
    data: [
      {
        id: "oa-001",
        orderId: "o-001",
        authorId: "u-production-001",
        label: "QC Sheet",
        url: "https://example.com/files/avishu-qc-sheet.pdf",
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

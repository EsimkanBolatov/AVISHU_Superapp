import { createHash } from "node:crypto";

import { PrismaClient, ProductAvailability } from "@prisma/client";

const prisma = new PrismaClient();

type SizeSeed = {
  sizeLabel: string;
  stock: number;
};

type ProductSeed = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  subtitle: string;
  priceAmount: number;
  availability: ProductAvailability;
  style: string[];
  description: string;
  composition: string;
  fittingNotes: string;
  deliveryEstimate: string;
  featured: boolean;
  categoryId: string;
  media: string[];
  sizes: SizeSeed[];
};

const categoryConfig: Record<
  string,
  {
    brandName: string;
    collectionName: string;
    dropName: string;
    seasonLabel: string;
    colors: string[];
    materials: string[];
    fitProfile: string;
    careInstructions: string;
    sizeGuide: string;
  }
> = {
  "c-outerwear": {
    brandName: "AVISHU Atelier",
    collectionName: "Storm Capsule",
    dropName: "Drop 01",
    seasonLabel: "FW26",
    colors: ["Graphite", "Bone White", "Obsidian"],
    materials: ["Laminated nylon", "Bonded membrane", "Storm shell"],
    fitProfile: "Protective oversized shell",
    careInstructions: "Spot clean, cold machine wash on technical cycle, no tumble dry.",
    sizeGuide: "Choose your regular size for architectural volume. Size down for cleaner tailoring.",
  },
  "c-tailoring": {
    brandName: "AVISHU Tailor Lab",
    collectionName: "Line Architecture",
    dropName: "Drop 02",
    seasonLabel: "SS26",
    colors: ["Anthracite", "Midnight Navy", "Stone"],
    materials: ["Virgin wool", "Cupro", "Viscose suiting"],
    fitProfile: "Structured tailored profile",
    careInstructions: "Dry clean only. Steam lightly and store on wide shoulder hanger.",
    sizeGuide: "Take your regular tailoring size. If between sizes, size up for softer drape.",
  },
  "c-softwear": {
    brandName: "AVISHU Core",
    collectionName: "Layer System",
    dropName: "Drop 03",
    seasonLabel: "SS26",
    colors: ["Ink", "Cloud", "Taupe"],
    materials: ["Heavy jersey", "Brushed cotton", "Stretch viscose"],
    fitProfile: "Relaxed premium layering",
    careInstructions: "Cold wash with similar colors. Dry flat to preserve body structure.",
    sizeGuide: "Designed to layer. Stay true to size for relaxed fit.",
  },
  "c-knitwear": {
    brandName: "AVISHU Studio",
    collectionName: "Quiet Winter",
    dropName: "Drop 04",
    seasonLabel: "FW26",
    colors: ["Ash", "Black", "Milk"],
    materials: ["Merino", "Cashmere", "Silk blend"],
    fitProfile: "Close to body luxury knit",
    careInstructions: "Hand wash cold or dry clean. Dry flat and avoid direct heat.",
    sizeGuide: "Fits close on shoulders with gentle ease in body. Stay true to size.",
  },
  "c-bottoms": {
    brandName: "AVISHU Motion",
    collectionName: "Volume Program",
    dropName: "Drop 05",
    seasonLabel: "FW26",
    colors: ["Black", "Graphite", "Sand"],
    materials: ["Technical cotton", "Wool suiting", "Dense jersey"],
    fitProfile: "Controlled volume lower body",
    careInstructions: "Cold wash or dry clean depending on fabrication. Hang dry only.",
    sizeGuide: "Choose your usual waist. Volume is built into the silhouette.",
  },
  "c-essentials": {
    brandName: "AVISHU Essentials",
    collectionName: "Core Uniform",
    dropName: "Drop 06",
    seasonLabel: "SS26",
    colors: ["White", "Black", "Heather Grey"],
    materials: ["Compact cotton", "Stretch jersey", "Lyocell poplin"],
    fitProfile: "Clean everyday base",
    careInstructions: "Cold wash, reshape while damp, no aggressive tumble dry.",
    sizeGuide: "Slim to regular depending on item. Stay true to size for intended base-layer fit.",
  },
};

function buildEditorialStory(product: ProductSeed, index: number) {
  return `${product.name} sits inside ${categoryConfig[product.categoryId].collectionName} as a premium ${
    product.availability === "preorder" ? "limited request piece" : "ready-position"
  } with stronger product storytelling for AVISHU season ${categoryConfig[product.categoryId].seasonLabel}. Editorial focus ${index + 1} builds on ${product.subtitle.toLowerCase()}.`;
}

function enrichProducts() {
  return products.map((product, index, list) => {
    const config = categoryConfig[product.categoryId];
    const relatedProductIds = list
      .filter((candidate) => candidate.categoryId === product.categoryId && candidate.id !== product.id)
      .slice(0, 2)
      .map((candidate) => candidate.id);
    const crossSellProductIds = list
      .filter((candidate) => candidate.categoryId !== product.categoryId)
      .slice(index % 3, index % 3 + 2)
      .map((candidate) => candidate.id);

    return {
      ...product,
      brandName: config.brandName,
      collectionName: config.collectionName,
      dropName: config.dropName,
      seasonLabel: config.seasonLabel,
      limitedEdition: index % 4 === 0 || product.availability === "preorder",
      limitedQuantity: index % 4 === 0 ? 24 + index : null,
      colors: config.colors.slice(0, 2 + (index % 2)),
      materials: config.materials.slice(0, 2),
      fitProfile: config.fitProfile,
      careInstructions: config.careInstructions,
      sizeGuide: config.sizeGuide,
      editorialStory: buildEditorialStory(product, index),
      relatedProductIds,
      crossSellProductIds,
    };
  });
}

function addHours(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 60 * 60 * 1000);
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

const monochromeParams = "auto=format&fit=crop&w=1200&q=80&exp=6";

const imagePools = {
  outerwear: [
    `https://images.unsplash.com/photo-1523398002811-999ca8dec234?${monochromeParams}`,
    `https://images.unsplash.com/photo-1529139574466-a303027c1d8b?${monochromeParams}`,
    `https://images.unsplash.com/photo-1509631179647-0177331693ae?${monochromeParams}`,
    `https://images.unsplash.com/photo-1541099649105-f69ad21f3246?${monochromeParams}`,
    `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?${monochromeParams}`,
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?${monochromeParams}`,
  ],
  tailoring: [
    `https://images.unsplash.com/photo-1483985988355-763728e1935b?${monochromeParams}`,
    `https://images.unsplash.com/photo-1496747611176-843222e1e57c?${monochromeParams}`,
    `https://images.unsplash.com/photo-1495385794356-15371f348c31?${monochromeParams}`,
    `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?${monochromeParams}`,
    `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?${monochromeParams}`,
    `https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?${monochromeParams}`,
  ],
  softwear: [
    `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?${monochromeParams}`,
    `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?${monochromeParams}`,
    `https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?${monochromeParams}`,
    `https://images.unsplash.com/photo-1521572267360-ee0c2909d518?${monochromeParams}`,
    `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?${monochromeParams}`,
    `https://images.unsplash.com/photo-1496747611176-843222e1e57c?${monochromeParams}`,
  ],
  knitwear: [
    `https://images.unsplash.com/photo-1495385794356-15371f348c31?${monochromeParams}`,
    `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?${monochromeParams}`,
    `https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?${monochromeParams}`,
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?${monochromeParams}`,
    `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?${monochromeParams}`,
    `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?${monochromeParams}`,
  ],
  bottoms: [
    `https://images.unsplash.com/photo-1483985988355-763728e1935b?${monochromeParams}`,
    `https://images.unsplash.com/photo-1496747611176-843222e1e57c?${monochromeParams}`,
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?${monochromeParams}`,
    `https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?${monochromeParams}`,
    `https://images.unsplash.com/photo-1495385794356-15371f348c31?${monochromeParams}`,
    `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?${monochromeParams}`,
  ],
  essentials: [
    `https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?${monochromeParams}`,
    `https://images.unsplash.com/photo-1521572267360-ee0c2909d518?${monochromeParams}`,
    `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?${monochromeParams}`,
    `https://images.unsplash.com/photo-1512436991641-6745cdb1723f?${monochromeParams}`,
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?${monochromeParams}`,
    `https://images.unsplash.com/photo-1509631179647-0177331693ae?${monochromeParams}`,
  ],
} as const;

const categories = [
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
  {
    id: "c-knitwear",
    slug: "knitwear",
    name: "Knitwear",
    description: "Refined knit layers built for quieter premium wardrobes.",
  },
  {
    id: "c-bottoms",
    slug: "bottoms",
    name: "Bottoms",
    description: "Pants and trousers with technical volume and precise balance.",
  },
  {
    id: "c-essentials",
    slug: "essentials",
    name: "Essentials",
    description: "Quiet everyday layers and premium basics for the core wardrobe.",
  },
];

const products: ProductSeed[] = [
  {
    id: "p-001",
    slug: "storm-shell-geim",
    sku: "AV-OUT-001",
    name: "Storm Shell GEIM",
    subtitle: "Weatherproof outer layer with strict technical attitude.",
    priceAmount: 219000,
    availability: "in_stock",
    style: ["technical", "outerwear", "monochrome"],
    description: "Premium storm shell with clean cutlines, oversized protection collar and advanced urban silhouette.",
    composition: "100% laminated nylon shell / breathable lining",
    fittingNotes: "Structured shoulder line with relaxed torso volume.",
    deliveryEstimate: "Ships in 1-2 days.",
    featured: true,
    categoryId: "c-outerwear",
    media: [imagePools.outerwear[0], imagePools.outerwear[1]],
    sizes: [{ sizeLabel: "XS", stock: 2 }, { sizeLabel: "S", stock: 4 }, { sizeLabel: "M", stock: 6 }, { sizeLabel: "L", stock: 3 }],
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
    description: "A longer silhouette trench with minimal hardware, hidden closure and sharpened front balance.",
    composition: "Coated cotton blend / technical viscose lining",
    fittingNotes: "Elongated body with cleaner vertical fall.",
    deliveryEstimate: "Preorder dispatch in 10 days.",
    featured: true,
    categoryId: "c-outerwear",
    media: [imagePools.outerwear[1], imagePools.outerwear[2]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }, { sizeLabel: "XL", stock: 0 }],
  },
  {
    id: "p-003",
    slug: "obsidian-field-parka",
    sku: "AV-OUT-003",
    name: "Obsidian Field Parka",
    subtitle: "Modular parka cut for wet weather and urban layering.",
    priceAmount: 268000,
    availability: "in_stock",
    style: ["technical", "layering", "city"],
    description: "A modular field parka with internal storm adjusters and a more armored front stance.",
    composition: "Structured nylon ripstop / bonded membrane",
    fittingNotes: "Relaxed body with room for mid-layers and a high collar stance.",
    deliveryEstimate: "Ships in 2 days.",
    featured: false,
    categoryId: "c-outerwear",
    media: [imagePools.outerwear[2], imagePools.outerwear[3]],
    sizes: [{ sizeLabel: "S", stock: 3 }, { sizeLabel: "M", stock: 5 }, { sizeLabel: "L", stock: 4 }, { sizeLabel: "XL", stock: 2 }],
  },
  {
    id: "p-004",
    slug: "cipher-down-module",
    sku: "AV-OUT-004",
    name: "Cipher Down Module",
    subtitle: "Insulated shell with an engineered cold-weather profile.",
    priceAmount: 289000,
    availability: "preorder",
    style: ["technical", "monochrome", "layering"],
    description: "Insulated premium outerwear piece with quieter matte texture and deeper winter volume.",
    composition: "Technical shell / recycled down fill",
    fittingNotes: "Oversized protective silhouette with cleaner sleeve taper.",
    deliveryEstimate: "Preorder dispatch in 14 days.",
    featured: false,
    categoryId: "c-outerwear",
    media: [imagePools.outerwear[4], imagePools.outerwear[5]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }, { sizeLabel: "XL", stock: 0 }],
  },
  {
    id: "p-005",
    slug: "axis-blazer",
    sku: "AV-TLR-005",
    name: "Axis Blazer",
    subtitle: "Softly armored blazer for precise day-to-night dressing.",
    priceAmount: 189000,
    availability: "in_stock",
    style: ["tailoring", "formal", "minimal"],
    description: "Single-breasted blazer with tuned lapel geometry and premium matte finish for monochrome dressing.",
    composition: "Virgin wool blend / cupro lining",
    fittingNotes: "Sharp shoulder with straight hem balance.",
    deliveryEstimate: "Ships in 2-3 days.",
    featured: true,
    categoryId: "c-tailoring",
    media: [imagePools.tailoring[0], imagePools.tailoring[1]],
    sizes: [{ sizeLabel: "S", stock: 5 }, { sizeLabel: "M", stock: 5 }, { sizeLabel: "L", stock: 2 }],
  },
  {
    id: "p-006",
    slug: "meridian-suit-jacket",
    sku: "AV-TLR-006",
    name: "Meridian Suit Jacket",
    subtitle: "Structured jacket with a more fluid luxury profile.",
    priceAmount: 214000,
    availability: "in_stock",
    style: ["tailored", "formal", "city"],
    description: "Premium suit jacket with softened suppression, controlled length and quieter shoulder geometry.",
    composition: "Super 120 wool / cupro lining",
    fittingNotes: "Balanced waist suppression with a longer front line.",
    deliveryEstimate: "Ships in 3 days.",
    featured: false,
    categoryId: "c-tailoring",
    media: [imagePools.tailoring[1], imagePools.tailoring[2]],
    sizes: [{ sizeLabel: "S", stock: 3 }, { sizeLabel: "M", stock: 4 }, { sizeLabel: "L", stock: 3 }],
  },
  {
    id: "p-007",
    slug: "zero-lapel-coat",
    sku: "AV-TLR-007",
    name: "Zero Lapel Coat",
    subtitle: "Tailored coat with a reduced front and colder geometry.",
    priceAmount: 259000,
    availability: "preorder",
    style: ["tailored", "minimal", "outerwear"],
    description: "Long tailored coat stripped back to a reduced, sharp front with cleaner seam discipline.",
    composition: "Double-faced wool blend",
    fittingNotes: "Long clean line with architectural shoulder definition.",
    deliveryEstimate: "Preorder dispatch in 9 days.",
    featured: false,
    categoryId: "c-tailoring",
    media: [imagePools.tailoring[2], imagePools.tailoring[3]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }],
  },
  {
    id: "p-008",
    slug: "draft-trousers",
    sku: "AV-TLR-008",
    name: "Draft Trousers",
    subtitle: "Pleated tailoring trouser with premium daywear volume.",
    priceAmount: 126000,
    availability: "in_stock",
    style: ["tailoring", "minimal", "city"],
    description: "Soft pleated trouser with deeper rise and straighter premium line through the leg.",
    composition: "Wool-viscose blend",
    fittingNotes: "Relaxed top block with clean vertical drop.",
    deliveryEstimate: "Ships in 2 days.",
    featured: false,
    categoryId: "c-tailoring",
    media: [imagePools.tailoring[4], imagePools.tailoring[5]],
    sizes: [{ sizeLabel: "S", stock: 5 }, { sizeLabel: "M", stock: 6 }, { sizeLabel: "L", stock: 4 }],
  },
  {
    id: "p-009",
    slug: "soft-structure-shirt",
    sku: "AV-SFT-009",
    name: "Soft Structure Shirt",
    subtitle: "Fluid shirt for layered monochrome wardrobes.",
    priceAmount: 82000,
    availability: "preorder",
    style: ["softwear", "layering", "minimal"],
    description: "Relaxed shirt with cleaner seam map, extended cuff and understated premium drape.",
    composition: "Brushed cotton / lyocell blend",
    fittingNotes: "Relaxed body with lighter shoulder structure.",
    deliveryEstimate: "Preorder dispatch in 7 days.",
    featured: false,
    categoryId: "c-softwear",
    media: [imagePools.softwear[0], imagePools.softwear[1]],
    sizes: [{ sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }, { sizeLabel: "XL", stock: 0 }],
  },
  {
    id: "p-010",
    slug: "layer-tee-studio",
    sku: "AV-SFT-010",
    name: "Layer Tee Studio",
    subtitle: "Premium jersey tee built for precise layering.",
    priceAmount: 46000,
    availability: "in_stock",
    style: ["softwear", "minimal", "layering"],
    description: "A premium studio tee with denser jersey weight, sharper collar and restrained line finish.",
    composition: "Heavyweight cotton jersey",
    fittingNotes: "Straight body with a measured relaxed shoulder.",
    deliveryEstimate: "Ships in 1 day.",
    featured: false,
    categoryId: "c-softwear",
    media: [imagePools.softwear[1], imagePools.softwear[2]],
    sizes: [{ sizeLabel: "S", stock: 8 }, { sizeLabel: "M", stock: 10 }, { sizeLabel: "L", stock: 9 }, { sizeLabel: "XL", stock: 5 }],
  },
  {
    id: "p-011",
    slug: "quiet-jersey-top",
    sku: "AV-SFT-011",
    name: "Quiet Jersey Top",
    subtitle: "Second-skin layer with clean premium restraint.",
    priceAmount: 59000,
    availability: "in_stock",
    style: ["softwear", "minimal", "monochrome"],
    description: "Closer-to-body jersey base layer with elongated sleeve and crisp tonal finishing.",
    composition: "Stretch viscose jersey",
    fittingNotes: "Slim line intended for layered tailoring and outerwear.",
    deliveryEstimate: "Ships in 2 days.",
    featured: false,
    categoryId: "c-softwear",
    media: [imagePools.softwear[2], imagePools.softwear[3]],
    sizes: [{ sizeLabel: "XS", stock: 4 }, { sizeLabel: "S", stock: 6 }, { sizeLabel: "M", stock: 6 }, { sizeLabel: "L", stock: 4 }],
  },
  {
    id: "p-012",
    slug: "tone-zip-hoodie",
    sku: "AV-SFT-012",
    name: "Tone Zip Hoodie",
    subtitle: "Quiet premium hoodie with sharper body balance.",
    priceAmount: 98000,
    availability: "preorder",
    style: ["softwear", "city", "layering"],
    description: "A refined hoodie with denser fleece interior, hidden details and cleaner premium proportions.",
    composition: "Double-knit cotton fleece",
    fittingNotes: "Relaxed body with firm hem structure and shorter front volume.",
    deliveryEstimate: "Preorder dispatch in 6 days.",
    featured: false,
    categoryId: "c-softwear",
    media: [imagePools.softwear[4], imagePools.softwear[5]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }, { sizeLabel: "XL", stock: 0 }],
  },
  {
    id: "p-013",
    slug: "frame-merino-knit",
    sku: "AV-KNT-013",
    name: "Frame Merino Knit",
    subtitle: "Merino layer with a tighter premium silhouette.",
    priceAmount: 109000,
    availability: "in_stock",
    style: ["minimal", "layering", "knitwear"],
    description: "Fine-gauge merino knit built for premium layering under tailoring and outerwear.",
    composition: "100% extra fine merino wool",
    fittingNotes: "Closer body line with clean shoulder transition.",
    deliveryEstimate: "Ships in 2 days.",
    featured: true,
    categoryId: "c-knitwear",
    media: [imagePools.knitwear[0], imagePools.knitwear[1]],
    sizes: [{ sizeLabel: "S", stock: 5 }, { sizeLabel: "M", stock: 7 }, { sizeLabel: "L", stock: 6 }],
  },
  {
    id: "p-014",
    slug: "outline-wool-polo",
    sku: "AV-KNT-014",
    name: "Outline Wool Polo",
    subtitle: "Fine polo knit with colder premium sharpness.",
    priceAmount: 114000,
    availability: "in_stock",
    style: ["minimal", "city", "knitwear"],
    description: "Buttonless premium polo knit with refined collar line and quieter fashion-tech posture.",
    composition: "Merino wool / silk blend",
    fittingNotes: "Straight torso with gentle drape through the sleeve.",
    deliveryEstimate: "Ships in 2-3 days.",
    featured: false,
    categoryId: "c-knitwear",
    media: [imagePools.knitwear[1], imagePools.knitwear[2]],
    sizes: [{ sizeLabel: "S", stock: 4 }, { sizeLabel: "M", stock: 5 }, { sizeLabel: "L", stock: 4 }],
  },
  {
    id: "p-015",
    slug: "drift-cashmere-crew",
    sku: "AV-KNT-015",
    name: "Drift Cashmere Crew",
    subtitle: "Cashmere crew neck with soft premium gravity.",
    priceAmount: 149000,
    availability: "preorder",
    style: ["minimal", "monochrome", "knitwear"],
    description: "Cashmere crew built for quiet luxury tone, cleaner hem finish and slower seasonal layering.",
    composition: "100% cashmere",
    fittingNotes: "Relaxed drape with softer shoulder line.",
    deliveryEstimate: "Preorder dispatch in 8 days.",
    featured: false,
    categoryId: "c-knitwear",
    media: [imagePools.knitwear[2], imagePools.knitwear[3]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }],
  },
  {
    id: "p-016",
    slug: "grid-rib-cardigan",
    sku: "AV-KNT-016",
    name: "Grid Rib Cardigan",
    subtitle: "Rib cardigan with architectural placket restraint.",
    priceAmount: 129000,
    availability: "in_stock",
    style: ["layering", "city", "knitwear"],
    description: "Premium rib cardigan with sharp placket geometry and a straighter luxury line.",
    composition: "Merino rib knit",
    fittingNotes: "Slimmed front line with slightly roomier sleeve volume.",
    deliveryEstimate: "Ships in 2 days.",
    featured: false,
    categoryId: "c-knitwear",
    media: [imagePools.knitwear[4], imagePools.knitwear[5]],
    sizes: [{ sizeLabel: "S", stock: 3 }, { sizeLabel: "M", stock: 5 }, { sizeLabel: "L", stock: 3 }],
  },
  {
    id: "p-017",
    slug: "monolith-cargo-trouser",
    sku: "AV-BTM-017",
    name: "Monolith Cargo Trouser",
    subtitle: "Technical cargo with premium controlled volume.",
    priceAmount: 118000,
    availability: "in_stock",
    style: ["technical", "city", "bottoms"],
    description: "Cargo trouser stripped back to cleaner pocket architecture and a more premium leg line.",
    composition: "Technical cotton blend",
    fittingNotes: "Relaxed upper leg with tapered ankle balance.",
    deliveryEstimate: "Ships in 2 days.",
    featured: true,
    categoryId: "c-bottoms",
    media: [imagePools.bottoms[0], imagePools.bottoms[1]],
    sizes: [{ sizeLabel: "S", stock: 7 }, { sizeLabel: "M", stock: 8 }, { sizeLabel: "L", stock: 6 }],
  },
  {
    id: "p-018",
    slug: "vector-wide-pant",
    sku: "AV-BTM-018",
    name: "Vector Wide Pant",
    subtitle: "Wide-leg trouser with colder premium floor line.",
    priceAmount: 124000,
    availability: "in_stock",
    style: ["minimal", "city", "bottoms"],
    description: "Wide pant with cleaner break, tailored waistband and precise vertical fall.",
    composition: "Viscose wool suiting",
    fittingNotes: "Wide-leg volume with sharp waist placement.",
    deliveryEstimate: "Ships in 1-2 days.",
    featured: false,
    categoryId: "c-bottoms",
    media: [imagePools.bottoms[1], imagePools.bottoms[2]],
    sizes: [{ sizeLabel: "S", stock: 5 }, { sizeLabel: "M", stock: 6 }, { sizeLabel: "L", stock: 5 }],
  },
  {
    id: "p-019",
    slug: "clean-track-trouser",
    sku: "AV-BTM-019",
    name: "Clean Track Trouser",
    subtitle: "Refined track pant without athletic noise.",
    priceAmount: 97000,
    availability: "preorder",
    style: ["city", "layering", "bottoms"],
    description: "Track-inspired trouser refined into a quieter premium everyday silhouette.",
    composition: "Dense technical jersey",
    fittingNotes: "Relaxed body with controlled taper through the calf.",
    deliveryEstimate: "Preorder dispatch in 5 days.",
    featured: false,
    categoryId: "c-bottoms",
    media: [imagePools.bottoms[2], imagePools.bottoms[3]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }, { sizeLabel: "XL", stock: 0 }],
  },
  {
    id: "p-020",
    slug: "atelier-pleated-pant",
    sku: "AV-BTM-020",
    name: "Atelier Pleated Pant",
    subtitle: "Pleated trouser built for soft luxury balance.",
    priceAmount: 132000,
    availability: "in_stock",
    style: ["tailoring", "minimal", "bottoms"],
    description: "Premium pleated pant with reduced waistband details and a quieter drape through the leg.",
    composition: "Wool blend tailoring cloth",
    fittingNotes: "Pleated front with straighter premium line below the knee.",
    deliveryEstimate: "Ships in 3 days.",
    featured: false,
    categoryId: "c-bottoms",
    media: [imagePools.bottoms[4], imagePools.bottoms[5]],
    sizes: [{ sizeLabel: "S", stock: 5 }, { sizeLabel: "M", stock: 6 }, { sizeLabel: "L", stock: 4 }],
  },
  {
    id: "p-021",
    slug: "core-long-sleeve",
    sku: "AV-ESS-021",
    name: "Core Long Sleeve",
    subtitle: "Premium essential top with a cold minimalist attitude.",
    priceAmount: 52000,
    availability: "in_stock",
    style: ["essentials", "minimal", "monochrome"],
    description: "Long sleeve base layer with dense handfeel and clean premium neck finish.",
    composition: "Compact cotton jersey",
    fittingNotes: "Straight body with a close shoulder line.",
    deliveryEstimate: "Ships in 1 day.",
    featured: true,
    categoryId: "c-essentials",
    media: [imagePools.essentials[0], imagePools.essentials[1]],
    sizes: [{ sizeLabel: "S", stock: 8 }, { sizeLabel: "M", stock: 9 }, { sizeLabel: "L", stock: 8 }, { sizeLabel: "XL", stock: 6 }],
  },
  {
    id: "p-022",
    slug: "studio-jersey-tank",
    sku: "AV-ESS-022",
    name: "Studio Jersey Tank",
    subtitle: "Quiet underlayer for tailored and technical wardrobes.",
    priceAmount: 34000,
    availability: "in_stock",
    style: ["essentials", "layering", "minimal"],
    description: "Premium tank layer built for warmer climates and cleaner core wardrobe stacking.",
    composition: "Stretch cotton jersey",
    fittingNotes: "Closer fit intended for use under shirts, knits and tailoring.",
    deliveryEstimate: "Ships in 1 day.",
    featured: false,
    categoryId: "c-essentials",
    media: [imagePools.essentials[1], imagePools.essentials[2]],
    sizes: [{ sizeLabel: "XS", stock: 6 }, { sizeLabel: "S", stock: 8 }, { sizeLabel: "M", stock: 8 }, { sizeLabel: "L", stock: 5 }],
  },
  {
    id: "p-023",
    slug: "soft-base-shirt",
    sku: "AV-ESS-023",
    name: "Soft Base Shirt",
    subtitle: "Premium everyday shirt for quieter polished dressing.",
    priceAmount: 76000,
    availability: "preorder",
    style: ["essentials", "city", "minimal"],
    description: "An everyday premium shirt reduced to a cleaner collar line and calmer drape.",
    composition: "Cotton poplin / lyocell",
    fittingNotes: "Straight silhouette with a slightly dropped shoulder.",
    deliveryEstimate: "Preorder dispatch in 6 days.",
    featured: false,
    categoryId: "c-essentials",
    media: [imagePools.essentials[2], imagePools.essentials[3]],
    sizes: [{ sizeLabel: "S", stock: 0 }, { sizeLabel: "M", stock: 0 }, { sizeLabel: "L", stock: 0 }, { sizeLabel: "XL", stock: 0 }],
  },
  {
    id: "p-024",
    slug: "uniform-zip-layer",
    sku: "AV-ESS-024",
    name: "Uniform Zip Layer",
    subtitle: "Essential zip layer with sharper premium finish.",
    priceAmount: 89000,
    availability: "in_stock",
    style: ["essentials", "city", "layering"],
    description: "A premium zip layer with quieter hardware and more disciplined body proportions.",
    composition: "Double-knit cotton / technical trim",
    fittingNotes: "Relaxed mid-layer with controlled hem line.",
    deliveryEstimate: "Ships in 2 days.",
    featured: false,
    categoryId: "c-essentials",
    media: [imagePools.essentials[4], imagePools.essentials[5]],
    sizes: [{ sizeLabel: "S", stock: 4 }, { sizeLabel: "M", stock: 6 }, { sizeLabel: "L", stock: 6 }, { sizeLabel: "XL", stock: 4 }],
  },
];

async function main() {
  const enrichedProducts = enrichProducts();

  await prisma.notification.deleteMany();
  await prisma.orderTag.deleteMany();
  await prisma.orderAuditLog.deleteMany();
  await prisma.orderAttachment.deleteMany();
  await prisma.orderComment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contentEntry.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.savedPaymentCard.deleteMany();
  await prisma.savedAddress.deleteMany();
  await prisma.productView.deleteMany();
  await prisma.productFavorite.deleteMany();
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
        defaultShippingAddress: "Almaty, Al-Farabi avenue 19, apt 120",
        paymentCardBrand: "VISA",
        paymentCardLast4: "4472",
        paymentCardHolder: "Aigerim K.",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 72,
        loyaltyPoints: 1840,
        loyaltyTier: "gold",
        segment: "vip_repeat",
      },
      {
        id: "u-admin-001",
        email: "admin@avishu.kz",
        passwordHash: hashPassword("Admin123!"),
        name: "Aruzhan D.",
        role: "admin",
        phone: "+7 701 900 44 11",
        avatarUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 100,
        loyaltyPoints: 0,
        loyaltyTier: "black",
        segment: "staff_admin",
      },
      {
        id: "u-franchisee-001",
        email: "franchisee@avishu.kz",
        passwordHash: hashPassword("Franchisee123!"),
        name: "Madina S.",
        role: "franchisee",
        phone: "+7 777 100 88 40",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 100,
        loyaltyPoints: 0,
        loyaltyTier: "black",
        segment: "staff_franchisee",
      },
      {
        id: "u-production-001",
        email: "production@avishu.kz",
        passwordHash: hashPassword("Production123!"),
        name: "Gulmira T.",
        role: "production",
        phone: "+7 701 320 19 90",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 100,
        loyaltyPoints: 0,
        loyaltyTier: "black",
        segment: "staff_production",
      },
      {
        id: "u-support-001",
        email: "support@avishu.kz",
        passwordHash: hashPassword("Support123!"),
        name: "Dana R.",
        role: "support",
        phone: "+7 707 222 11 44",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        loyaltyProgress: 100,
        loyaltyPoints: 0,
        loyaltyTier: "black",
        segment: "staff_support",
      },
    ],
  });

  await prisma.category.createMany({ data: categories });
  await prisma.product.createMany({
    data: enrichedProducts.map(({ media, sizes, ...product }) => product),
  });

  const productMediaRows = enrichedProducts.flatMap((product) =>
    product.media.map((url, index) => {
      const mediaKind = (index === 0 ? "cover" : index === 1 ? "detail" : "gallery") as
        | "cover"
        | "detail"
        | "gallery";

      return {
        id: `pm-${product.id.replace("p-", "")}-${index + 1}`,
        productId: product.id,
        url,
        alt: `${product.name} ${mediaKind} image`,
        kind: mediaKind, 
        sortOrder: index,
      };
    })
  );

  const productVariantRows = enrichedProducts.flatMap((product, productIndex) =>
    product.sizes.map((variant, variantIndex) => ({
      id: `pv-${String(productIndex * 10 + variantIndex + 1).padStart(3, "0")}`,
      productId: product.id,
      sizeLabel: variant.sizeLabel,
      colorLabel: product.colors[variantIndex % product.colors.length],
      stock: variant.stock,
    })),
  );

  const variantLookup = new Map(
    productVariantRows.map((variant) => [`${variant.productId}:${variant.sizeLabel}`, variant.id]),
  );

  await prisma.productMedia.createMany({ data: productMediaRows });
  await prisma.productVariant.createMany({ data: productVariantRows });

  await prisma.savedAddress.createMany({
    data: [
      {
        id: "addr-001",
        userId: "u-client-001",
        label: "Home",
        city: "Almaty",
        line1: "Al-Farabi avenue 19, apt 120",
        line2: "Tower A",
        isDefault: true,
      },
      {
        id: "addr-002",
        userId: "u-client-001",
        label: "Office",
        city: "Almaty",
        line1: "Nazarbayev avenue 120",
        line2: "7th floor reception",
        isDefault: false,
      },
    ],
  });

  await prisma.savedPaymentCard.createMany({
    data: [
      {
        id: "card-001",
        userId: "u-client-001",
        brand: "VISA",
        holderName: "Aigerim K.",
        last4: "4472",
        isDefault: true,
      },
      {
        id: "card-002",
        userId: "u-client-001",
        brand: "KASPI",
        holderName: "Aigerim K.",
        last4: "9812",
        isDefault: false,
      },
    ],
  });

  await prisma.tryOnSession.createMany({
    data: [
      {
        id: "to-001",
        userId: "u-client-001",
        productId: "p-001",
        sourceImageUrl: imagePools.outerwear[4],
        resultImageUrl: imagePools.outerwear[0],
        status: "ready",
        notes: "First AI fit preview approved by client.",
      },
      {
        id: "to-002",
        userId: "u-client-001",
        productId: "p-013",
        sourceImageUrl: imagePools.knitwear[2],
        resultImageUrl: imagePools.knitwear[0],
        status: "ready",
        notes: "Merino knit preview saved for winter capsule checkout.",
      },
      {
        id: "to-003",
        userId: "u-client-001",
        productId: "p-017",
        sourceImageUrl: imagePools.bottoms[1],
        resultImageUrl: imagePools.bottoms[0],
        status: "ready",
        notes: "Cargo trouser silhouette approved after second pass.",
      },
    ],
  });

  await prisma.order.createMany({
    data: [
      {
        id: "o-001",
        number: "AV-260327-001",
        productId: "p-001",
        variantId: variantLookup.get("p-001:M")!,
        customerId: "u-client-001",
        tryOnId: "to-001",
        status: "in_production",
        paymentStatus: "paid",
        deliveryMethod: "courier",
        paymentMethod: "kaspi",
        priority: "vip",
        notes: "Priority client. Confirm monochrome packaging.",
        shippingAddress: "Almaty, Al-Farabi avenue 19, apt 120",
        contactPhone: "+7 777 555 21 10",
        dueAt: addHours(new Date("2026-03-27T12:30:00.000Z"), 36),
        slaHours: 36,
        qcChecklist: "Shell sealed; seam tape review pending.",
        totalAmount: 219000,
        createdAt: new Date("2026-03-27T12:30:00.000Z"),
      },
      {
        id: "o-002",
        number: "AV-260327-002",
        productId: "p-007",
        variantId: variantLookup.get("p-007:M")!,
        customerId: "u-client-001",
        status: "pending_franchisee",
        paymentStatus: "paid",
        deliveryMethod: "pickup",
        paymentMethod: "card",
        priority: "standard",
        notes: "Preorder client requested SMS once atelier confirms slot.",
        shippingAddress: "Almaty flagship pickup point",
        contactPhone: "+7 777 555 21 10",
        scheduledDate: new Date("2026-04-05T00:00:00.000Z"),
        dueAt: addHours(new Date("2026-03-27T13:00:00.000Z"), 72),
        slaHours: 72,
        totalAmount: 259000,
        createdAt: new Date("2026-03-27T13:00:00.000Z"),
      },
      {
        id: "o-003",
        number: "AV-260328-003",
        productId: "p-013",
        variantId: variantLookup.get("p-013:M")!,
        customerId: "u-client-001",
        tryOnId: "to-002",
        status: "ready",
        paymentStatus: "paid",
        deliveryMethod: "courier",
        paymentMethod: "transfer",
        priority: "high",
        notes: "Gift wrap the knitwear order and include atelier care card.",
        shippingAddress: "Almaty, Al-Farabi avenue 19, apt 120",
        contactPhone: "+7 777 555 21 10",
        dueAt: addHours(new Date("2026-03-28T09:20:00.000Z"), 24),
        slaHours: 24,
        qcChecklist: "Final hand finish approved.",
        totalAmount: 109000,
        createdAt: new Date("2026-03-28T09:20:00.000Z"),
      },
      {
        id: "o-004",
        number: "AV-260326-004",
        productId: "p-021",
        variantId: variantLookup.get("p-021:M")!,
        customerId: "u-client-001",
        status: "delivered",
        paymentStatus: "paid",
        deliveryMethod: "courier",
        paymentMethod: "card",
        priority: "standard",
        notes: "Delivered successfully. Candidate for repeat purchase flow.",
        shippingAddress: "Almaty, Al-Farabi avenue 19, apt 120",
        contactPhone: "+7 777 555 21 10",
        dueAt: addHours(new Date("2026-03-26T08:00:00.000Z"), 24),
        slaHours: 24,
        totalAmount: 52000,
        createdAt: new Date("2026-03-26T08:00:00.000Z"),
      },
    ],
  });

  await prisma.orderComment.createMany({
    data: [
      {
        id: "oc-001",
        orderId: "o-001",
        authorId: "u-admin-001",
        message: "Catalog card verified and client order packaged into the premium flow.",
      },
      {
        id: "oc-002",
        orderId: "o-001",
        authorId: "u-franchisee-001",
        message: "Order approved and handed to production queue.",
      },
      {
        id: "oc-003",
        orderId: "o-001",
        authorId: "u-production-001",
        message: "Main shell cut complete. Waiting for QC review.",
      },
      {
        id: "oc-004",
        orderId: "o-003",
        authorId: "u-production-001",
        message: "Knitwear QC cleared. Ready for dispatch.",
      },
      {
        id: "oc-005",
        orderId: "o-004",
        authorId: "u-support-001",
        message: "Client received courier handoff and rated service highly.",
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
      {
        id: "oa-002",
        orderId: "o-003",
        authorId: "u-franchisee-001",
        label: "Care Card",
        url: "https://example.com/files/avishu-care-card.pdf",
      },
      {
        id: "oa-003",
        orderId: "o-001",
        authorId: "u-production-001",
        label: "Construction Note",
        url: "https://example.com/files/avishu-construction-note.pdf",
      },
    ],
  });

  await prisma.orderAuditLog.createMany({
    data: [
      {
        id: "audit-001",
        orderId: "o-001",
        actorId: "u-client-001",
        actorName: "Aigerim K.",
        actorRole: "client",
        action: "order_created",
        message: "Client created the order from premium catalog checkout.",
      },
      {
        id: "audit-002",
        orderId: "o-001",
        actorId: "u-franchisee-001",
        actorName: "Madina S.",
        actorRole: "franchisee",
        action: "status_changed",
        message: "franchisee moved the order from pending_franchisee to in_production.",
      },
      {
        id: "audit-003",
        orderId: "o-003",
        actorId: "u-production-001",
        actorName: "Gulmira T.",
        actorRole: "production",
        action: "status_changed",
        message: "production moved the order from quality_check to ready.",
      },
      {
        id: "audit-004",
        orderId: "o-004",
        actorId: "u-support-001",
        actorName: "Dana R.",
        actorRole: "support",
        action: "status_changed",
        message: "support moved the order from ready to delivered.",
      },
    ],
  });

  await prisma.orderTag.createMany({
    data: [
      { id: "tag-001", orderId: "o-001", label: "vip" },
      { id: "tag-002", orderId: "o-001", label: "qc-watch" },
      { id: "tag-003", orderId: "o-002", label: "preorder" },
      { id: "tag-004", orderId: "o-003", label: "gift-wrap" },
      { id: "tag-005", orderId: "o-004", label: "repeat-order" },
    ],
  });

  await prisma.productFavorite.createMany({
    data: [
      { id: "fav-001", userId: "u-client-001", productId: "p-001" },
      { id: "fav-002", userId: "u-client-001", productId: "p-013" },
      { id: "fav-003", userId: "u-client-001", productId: "p-021" },
    ],
  });

  await prisma.productView.createMany({
    data: [
      { id: "view-001", userId: "u-client-001", productId: "p-001", createdAt: new Date("2026-03-27T10:00:00.000Z") },
      { id: "view-002", userId: "u-client-001", productId: "p-017", createdAt: new Date("2026-03-27T10:15:00.000Z") },
      { id: "view-003", userId: "u-client-001", productId: "p-013", createdAt: new Date("2026-03-27T11:00:00.000Z") },
      { id: "view-004", userId: "u-client-001", productId: "p-021", createdAt: new Date("2026-03-28T08:10:00.000Z") },
      { id: "view-005", userId: "u-client-001", productId: "p-005", createdAt: new Date("2026-03-28T08:18:00.000Z") },
    ],
  });

  await prisma.reward.createMany({
    data: [
      {
        id: "reward-001",
        title: "Private fitting appointment",
        description: "Redeem for a one-on-one showroom styling session.",
        pointsRequired: 1200,
        tier: "gold",
      },
      {
        id: "reward-002",
        title: "Priority atelier slot",
        description: "Reserve a faster production and QC window.",
        pointsRequired: 2200,
        tier: "black",
      },
      {
        id: "reward-003",
        title: "Editorial gift packaging",
        description: "Premium packaging and handwritten note.",
        pointsRequired: 700,
        tier: "silver",
      },
    ],
  });

  await prisma.recommendation.createMany({
    data: [
      {
        id: "rec-001",
        userId: "u-client-001",
        productId: "p-017",
        label: "Complete the look",
        reason: "Pairs with your saved Storm Capsule outerwear.",
      },
      {
        id: "rec-002",
        userId: "u-client-001",
        productId: "p-013",
        label: "Client repeat signal",
        reason: "You engaged with merino knitwear twice this week.",
      },
      {
        id: "rec-003",
        userId: "u-client-001",
        productId: "p-021",
        label: "Abandoned cart recovery",
        reason: "You viewed this essential multiple times without checkout.",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        id: "note-001",
        userId: "u-client-001",
        orderId: "o-001",
        type: "order_status",
        title: "Order entered production",
        body: "AV-260327-001 is now in the atelier queue.",
      },
      {
        id: "note-002",
        userId: "u-client-001",
        orderId: "o-003",
        type: "order_status",
        title: "Order ready for dispatch",
        body: "AV-260328-003 passed QC and is ready.",
      },
      {
        id: "note-003",
        roleTarget: "franchisee",
        orderId: "o-002",
        type: "staff_action",
        title: "New preorder intake",
        body: "AV-260327-002 requires franchisee routing.",
      },
      {
        id: "note-004",
        roleTarget: "support",
        orderId: "o-003",
        type: "staff_action",
        title: "Client handoff pending",
        body: "Coordinate dispatch communication for AV-260328-003.",
      },
      {
        id: "note-005",
        userId: "u-client-001",
        type: "reward",
        title: "Gold tier reward unlocked",
        body: "You can now redeem a private fitting appointment.",
      },
    ],
  });

  await prisma.contentEntry.createMany({
    data: [
      {
        id: "content-ru-journal",
        kind: "journal",
        slug: "quiet-future-outerwear",
        locale: "ru",
        title: "Тихая архитектура premium outerwear",
        summary: "Как AVISHU строит холодный digital-бутік вокруг product story и fit-tech.",
        body: "AVISHU рассматривает outerwear как систему: предмет, контекст, операция и повторная покупка. Журнал раскрывает, почему quiet premium требует дисциплины в материале, посадке и сервисе.",
        coverUrl: imagePools.outerwear[0],
        eyebrow: "Journal / Brand narrative",
        featured: true,
      },
      {
        id: "content-en-journal",
        kind: "journal",
        slug: "quiet-future-outerwear",
        locale: "en",
        title: "Quiet architecture for future outerwear",
        summary: "How AVISHU frames premium outerwear around product story, fit tech and retention.",
        body: "AVISHU treats outerwear as a connected system: product, context, service and repeat purchase. The journal layer explains why quiet premium depends on discipline across fabric, fit and operations.",
        coverUrl: imagePools.outerwear[1],
        eyebrow: "Journal / Brand narrative",
        featured: true,
      },
      {
        id: "content-kk-journal",
        kind: "journal",
        slug: "quiet-future-outerwear",
        locale: "kk",
        title: "Болашақ outerwear үшін тыныш архитектура",
        summary: "AVISHU product story, fit tech және retention негізінде premium outerwear құрады.",
        body: "AVISHU outerwear-ді байланысқан жүйе ретінде қарастырады: өнім, контекст, сервис және repeat purchase. Журнал қабаты quiet premium үшін материал, fit және операциялық тәртіп неге маңызды екенін ашады.",
        coverUrl: imagePools.outerwear[2],
        eyebrow: "Journal / Brand narrative",
        featured: true,
      },
      {
        id: "content-ru-lookbook",
        kind: "lookbook",
        slug: "storm-capsule-01",
        locale: "ru",
        title: "Storm Capsule / Lookbook 01",
        summary: "Подборка внешних слоев, мягких базовых слоев и knitwear для цельного city wardrobe.",
        body: "Lookbook собирает outerwear, knitwear и bottoms в готовые premium-образы и связывает их с live operations и loyalty rewards.",
        coverUrl: imagePools.bottoms[0],
        eyebrow: "Lookbook / Season 01",
        featured: true,
      },
      {
        id: "content-en-campaign",
        kind: "campaign",
        slug: "drop-01-live-atelier",
        locale: "en",
        title: "Drop 01 / Live atelier loop",
        summary: "Campaign layer for the launch of a trilingual premium commerce system.",
        body: "This campaign connects storefront, try-on, order workflow and client support into one visible premium journey.",
        coverUrl: imagePools.tailoring[0],
        eyebrow: "Campaign / Live launch",
        featured: false,
      },
      {
        id: "content-ru-collection",
        kind: "collection_story",
        slug: "line-architecture",
        locale: "ru",
        title: "Line Architecture / История коллекции",
        summary: "Тейлоринг как строгий контрапункт техническим оболочкам и мягкому layering.",
        body: "Коллекция Line Architecture собирает тейлоринг, essentials и knitwear в более зрелый premium-ритм. История коллекции помогает продавать не только вещь, но и систему образа.",
        coverUrl: imagePools.tailoring[2],
        eyebrow: "Collection story / Tailoring",
        featured: false,
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

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing data (optional, but good for local dev)
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Categories
  const catTra = await prisma.category.create({
    data: {
      name: 'Trà Olong & Trà Trái Cây',
      slug: 'tra-olong-trai-cay',
    },
  });

  const catFood = await prisma.category.create({
    data: {
      name: 'Đồ Ăn (Pasta, Bánh)',
      slug: 'do-an',
    },
  });

  const catCoffee = await prisma.category.create({
    data: {
      name: 'Cà Phê & Coldbrew',
      slug: 'ca-phe',
    },
  });

  // 3. Create Products based on the provided images
  const products = [
    {
      name: 'Wafu Pasta Heo Nướng Xốt Shoyu Butter',
      slug: 'wafu-pasta-heo-nuong',
      basePrice: 75000,
      image: '/images/wafu-pasta.png',
      categoryId: catFood.id,
      sizes: [],
    },
    {
      name: 'Trà Olong Ổi Hồng',
      slug: 'tra-olong-oi-hong',
      basePrice: 65000,
      image: '/images/tra-olong-oi-hong.png',
      categoryId: catTra.id,
      sizes: [
        { name: 'Vừa', extraPrice: 0 },
        { name: 'Lớn', extraPrice: 10000 },
      ],
    },
    {
      name: 'Trà Đá Xay Ổi Hồng Kem Phô Mai',
      slug: 'tra-da-xay-oi-hong',
      basePrice: 75000,
      image: '/images/tra-da-xay-oi-hong.png',
      categoryId: catTra.id,
      sizes: [
        { name: 'Vừa', extraPrice: 0 },
        { name: 'Lớn', extraPrice: 10000 },
      ],
    },
    {
      name: 'Ổi Hồng Latte Kem Matcha Phô Mai',
      slug: 'oi-hong-latte-matcha',
      basePrice: 75000,
      image: '/images/oi-hong-latte-matcha.png',
      categoryId: catTra.id,
      sizes: [
        { name: 'Vừa', extraPrice: 0 },
        { name: 'Lớn', extraPrice: 10000 },
      ],
    },
    {
      name: 'Coldbrew Ổi Hồng',
      slug: 'coldbrew-oi-hong',
      basePrice: 65000,
      image: '/images/coldbrew-oi-hong.png',
      categoryId: catCoffee.id,
      sizes: [
        { name: 'Vừa', extraPrice: 0 },
        { name: 'Lớn', extraPrice: 10000 },
      ],
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        basePrice: p.basePrice,
        image: p.image,
        categoryId: p.categoryId,
        sizes: {
          create: p.sizes,
        },
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

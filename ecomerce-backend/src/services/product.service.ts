import prisma from '../utils/prisma.js';

export async function fetchAllProductsFromDb() {
  return await prisma.product.findMany({
    include: { sizes: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProductInDb(data: { name: string; basePrice: number; image?: string }) {
  const category = await prisma.category.findFirst();
  if (!category) {
    throw new Error('Chưa có danh mục sản phẩm nào trong DB.');
  }

  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${Date.now()}`;

  return await prisma.product.create({
    data: {
      name: data.name,
      slug,
      basePrice: Number(data.basePrice),
      image: data.image || '/images/tra-olong-oi-hong.png',
      categoryId: category.id,
      sizes: {
        create: [
          { name: 'Vừa', extraPrice: 0 },
          { name: 'Lớn', extraPrice: 10000 },
        ],
      },
    },
    include: { sizes: true },
  });
}

export async function toggleProductAvailabilityInDb(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error('Sản phẩm không tồn tại.');
  }

  return await prisma.product.update({
    where: { id },
    data: { isAvailable: !product.isAvailable },
  });
}

export async function deleteProductFromDb(id: string) {
  return await prisma.product.delete({ where: { id } });
}

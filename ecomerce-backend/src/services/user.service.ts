import prisma from '../utils/prisma.js';

export async function getAllUsersFromDb() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

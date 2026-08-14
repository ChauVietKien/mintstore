import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        sizes: true,
      },
    });
    res.json({ status: 'success', data: products });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

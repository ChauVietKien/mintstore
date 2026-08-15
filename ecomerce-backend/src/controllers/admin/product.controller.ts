import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';
import prisma from '../../utils/prisma.js';

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, basePrice, image, sizes } = req.body;

    if (!name || !basePrice) {
      return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp tên món và giá tiền.' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') + '-' + Date.now();

    // Lấy hoặc tạo danh mục mặc định
    let defaultCategory = await prisma.category.findFirst();
    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          name: 'Trà Sữa & Nước Ép',
          slug: 'tra-sua-nuoc-ep',
        },
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        basePrice: parseFloat(basePrice),
        image: image || '/images/tra-olong-oi-hong.png',
        categoryId: defaultCategory.id,
        isAvailable: true,
        sizes: {
          create: sizes || [
            { name: 'Vừa', extraPrice: 0 },
            { name: 'Lớn', extraPrice: 10000 },
          ],
        },
      },
      include: {
        sizes: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Thêm món mới vào Database thành công!',
      data: newProduct,
    });
  } catch (error: any) {
    console.error('Lỗi khi tạo sản phẩm mới trong DB:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function toggleProductAvailability(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy sản phẩm' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isAvailable: !product.isAvailable,
      },
    });

    res.status(200).json({
      status: 'success',
      data: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    res.status(200).json({
      status: 'success',
      message: 'Đã xóa sản phẩm khỏi Database',
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

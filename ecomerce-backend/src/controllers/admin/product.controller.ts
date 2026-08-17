import { Request, Response } from 'express';
import {
  createProductInDb,
  toggleProductAvailabilityInDb,
  deleteProductFromDb,
} from '../../services/product.service.js';

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, basePrice, image } = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ status: 'error', message: 'Vui lòng điền tên và giá sản phẩm.' });
    }

    const newProduct = await createProductInDb({ name, basePrice, image });
    res.status(201).json({ status: 'success', message: 'Thêm món nước thành công!', data: newProduct });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function toggleProductAvailability(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await toggleProductAvailabilityInDb(id);
    res.status(200).json({ status: 'success', message: 'Đã cập nhật trạng thái còn/hết hàng.', data: updated });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteProductFromDb(id);
    res.status(200).json({ status: 'success', message: 'Xóa món nước thành công.' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

import axios from 'axios';

// Cấu hình Cloudinary từ chuỗi URL chuẩn của bạn
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "h40n7LG4wDvQ6A22x83u4qgKquo";
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "diyvzyawq";

/**
 * Tải ảnh trực tiếp lên Cloudinary từ máy tính cá nhân.
 * @param file File ảnh được chọn từ input file
 * @returns Đường dẫn URL ảnh an toàn (secure_url) từ Cloudinary
 */
export async function uploadImageToCloudinary(file: File, cloudName?: string): Promise<string> {
  const targetCloudName = cloudName || CLOUDINARY_CLOUD_NAME;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'mintshop');

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${targetCloudName}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error: any) {
    console.error('Lỗi Upload ảnh lên Cloudinary:', error?.response?.data || error.message);
    throw new Error('Upload ảnh thất bại: ' + (error?.response?.data?.error?.message || error.message));
  }
}

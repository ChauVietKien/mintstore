export const mockProducts = [
  {
    id: "p1",
    name: "Wafu Pasta Heo Nướng Xốt Shoyu Butter",
    basePrice: 75000,
    image: "/images/wafu-pasta.png", // Bạn cần tự chuẩn bị ảnh vào thư mục public/images
    categoryId: "c2",
    sizes: [],
  },
  {
    id: "p2",
    name: "Trà Olong Ổi Hồng",
    basePrice: 65000,
    image: "/images/tra-olong-oi-hong.png",
    categoryId: "c1",
    sizes: [
      { id: "s1", name: "Vừa", extraPrice: 0 },
      { id: "s2", name: "Lớn", extraPrice: 10000 },
    ],
  },
  {
    id: "p3",
    name: "Trà Đá Xay Ổi Hồng Kem Phô Mai",
    basePrice: 75000,
    image: "/images/tra-da-xay-oi-hong.png",
    categoryId: "c1",
    sizes: [
      { id: "s1", name: "Vừa", extraPrice: 0 },
      { id: "s2", name: "Lớn", extraPrice: 10000 },
    ],
  },
  {
    id: "p4",
    name: "Ổi Hồng Latte Kem Matcha Phô Mai",
    basePrice: 75000,
    image: "/images/oi-hong-latte-matcha.png",
    categoryId: "c1",
    sizes: [
      { id: "s1", name: "Vừa", extraPrice: 0 },
      { id: "s2", name: "Lớn", extraPrice: 10000 },
    ],
  },
  {
    id: "p5",
    name: "Coldbrew Ổi Hồng",
    basePrice: 65000,
    image: "/images/coldbrew-oi-hong.png",
    categoryId: "c1",
    sizes: [
      { id: "s1", name: "Vừa", extraPrice: 0 },
      { id: "s2", name: "Lớn", extraPrice: 10000 },
    ],
  },
];

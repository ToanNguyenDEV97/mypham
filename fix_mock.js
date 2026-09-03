import fs from 'fs';

let code = fs.readFileSync('src/data/mockData.ts', 'utf-8');

const newProducts = `
export const products = [
  { 
    id: 1, name: 'Nước tẩy trang 2 Lớp Luminous...', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', oldPrice: '50.000đ', newPrice: '35.000đ', discount: '-30%', rating: 5, category: 'Làm sạch', sold: 1200, brand: 'Luminous',
    description: 'Nước tẩy trang dịu nhẹ...', ingredients: 'Nước khoáng thiên nhiên...'
  },
  { 
    id: 2, name: 'Phim Thấm Dầu Acnes Oil Remover Film 50 Tờ', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400', oldPrice: '75.000đ', newPrice: '46.000đ', discount: '-39%', rating: 5, category: 'Chăm sóc da', sold: 850, brand: 'Rohto',
    description: 'Phim thấm dầu...', ingredients: 'Sợi Cellulose tổng hợp...'
  },
  { 
    id: 3, name: 'Kem Chống Nắng Skin Aqua Tone Up UV', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400', oldPrice: '185.000đ', newPrice: '145.000đ', discount: '-22%', rating: 5, category: 'Chăm sóc da', sold: 2100, brand: 'Rohto',
    description: 'Kem chống nắng nâng tone...', ingredients: 'Zinc Oxide...'
  },
  { 
    id: 4, name: 'Son Kem Lì Romand Zero Velvet Tint', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400', oldPrice: '150.000đ', newPrice: '119.000đ', discount: '-21%', rating: 4, category: 'Trang điểm', sold: 3400, brand: 'Romand',
    description: 'Son kem lì...', ingredients: 'Dimethicone...'
  },
];

export const bodyCareProducts = [
  { 
    id: 5, name: 'Sữa Tắm Dưỡng Ẩm Chuyên Sâu', image: 'https://images.unsplash.com/photo-1608248593802-3ac67e3ba701?auto=format&fit=crop&q=80&w=400', oldPrice: '120.000đ', newPrice: '95.000đ', discount: '-20%', rating: 5, category: 'Chăm sóc cơ thể', sold: 500, brand: 'DS Tiên',
    description: 'Sữa tắm...', ingredients: 'Chiết xuất nha đam...'
  },
  { 
    id: 6, name: 'Tẩy Tế Bào Chết Toàn Thân', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400', oldPrice: '150.000đ', newPrice: '115.000đ', discount: '-23%', rating: 4, category: 'Chăm sóc cơ thể', sold: 320, brand: 'DS Tiên',
    description: 'Hỗn hợp tẩy tế bào chết...', ingredients: 'Hạt cà phê xay nhuyễn...'
  },
  { 
    id: 7, name: 'Dưỡng Thể Sáng Da Ban Đêm', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', oldPrice: '210.000đ', newPrice: '175.000đ', discount: '-16%', rating: 5, category: 'Chăm sóc cơ thể', sold: 1800, brand: 'DS Tiên',
    description: 'Sữa dưỡng thể...', ingredients: 'Niacinamide...'
  },
  { 
    id: 8, name: 'Xịt Thơm Body Mist Hương Hoa', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400', oldPrice: '180.000đ', newPrice: '145.000đ', discount: '-19%', rating: 4, category: 'Chăm sóc cơ thể', sold: 900, brand: 'DS Tiên',
    description: 'Xịt thơm toàn thân...', ingredients: 'Cồn tinh chế y tế...'
  },
];
`;

const restOfCode = code.substring(code.indexOf('export const reviews = ['));

fs.writeFileSync('src/data/mockData.ts', newProducts + restOfCode);

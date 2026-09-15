const fs = require('fs');
let code = fs.readFileSync('src/components/views/ProductsView.tsx', 'utf8');

const target = `  const pageDesc = isPromo 
    ? 'Khám phá các ưu đãi và khuyến mãi hấp dẫn nhất từ DS Tiên Cosmetics. Đừng bỏ lỡ cơ hội sở hữu sản phẩm làm đẹp với giá tốt nhất.' 
    : 'Khám phá bộ sưu tập các sản phẩm làm đẹp an toàn, tự nhiên và hiệu quả. Chọn lựa sản phẩm phù hợp với làn da của bạn.';

  return (`;

const replacement = `  const pageDesc = isPromo 
    ? 'Khám phá các ưu đãi và khuyến mãi hấp dẫn nhất từ DS Tiên Cosmetics. Đừng bỏ lỡ cơ hội sở hữu sản phẩm làm đẹp với giá tốt nhất.' 
    : 'Khám phá bộ sưu tập các sản phẩm làm đẹp an toàn, tự nhiên và hiệu quả. Chọn lựa sản phẩm phù hợp với làn da của bạn.';

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/views/ProductsView.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Target not found!");
}

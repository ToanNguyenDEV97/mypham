const fs = require('fs');
let code = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const dateTarget = `<div className="text-xs text-gray-400 mb-2">{post.date}</div>`;
const dateReplacement = `<div className="text-xs text-gray-400 mb-2">{
  (() => {
    const d = post.createdAt || post.date;
    if (!d) return 'Đang cập nhật';
    if (typeof d === 'string') {
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : d;
    }
    if (d.toDate) return d.toDate().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return 'Đang cập nhật';
  })()
}</div>`;

code = code.replace(dateTarget, dateReplacement);

fs.writeFileSync('src/components/views/HomeView.tsx', code);

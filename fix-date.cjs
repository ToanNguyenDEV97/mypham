const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminReviews.tsx', 'utf8');

code = code.replace("import { format } from 'date-fns';", "");

const targetDate = `  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd/MM/yyyy HH:mm');
  };`;
const replaceDate = `  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };`;

code = code.replace(targetDate, replaceDate);

fs.writeFileSync('src/components/admin/AdminReviews.tsx', code);

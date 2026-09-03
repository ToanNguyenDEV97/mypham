const fs = require('fs');

let adminOrders = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const regex = /const maskName[\s\S]*?const maskAddress[\s\S]*?};\n/;
adminOrders = adminOrders.replace(regex, '');

// Also add import if missing
if (!adminOrders.includes('maskName')) {
  // It might be used inside AdminOrders? Wait, I saw maskName being used in AdminOrders.tsx lines 187 and 288 in previous grep
}

fs.writeFileSync('src/components/admin/AdminOrders.tsx', adminOrders);

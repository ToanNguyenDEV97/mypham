const fs = require('fs');
let code = fs.readFileSync('src/components/views/AdminView.tsx', 'utf8');

if (!code.includes("AdminPolicies")) {
  code = code.replace(
    "import { AdminBlog } from '../admin/AdminBlog';",
    "import { AdminBlog } from '../admin/AdminBlog';\nimport { AdminPolicies } from '../admin/AdminPolicies';"
  );
}

const targetTab = `{ id: 'vouchers', label: 'Mã giảm giá', icon: Ticket },`;
const replaceTab = `{ id: 'vouchers', label: 'Mã giảm giá', icon: Ticket },
  { id: 'policies', label: 'Chính sách', icon: ShieldCheck },`;
if (code.includes(targetTab)) {
  code = code.replace(targetTab, replaceTab);
} else {
  // Try another approach
  const altTarget = `  { id: 'settings', label: 'Cài đặt', icon: SettingsIcon }`;
  const altReplace = `  { id: 'policies', label: 'Chính sách', icon: ShieldCheck },\n  { id: 'settings', label: 'Cài đặt', icon: SettingsIcon }`;
  code = code.replace(altTarget, altReplace);
}

const targetRender = `      {activeTab === 'blog' && <AdminBlog />}`;
const replaceRender = `      {activeTab === 'blog' && <AdminBlog />}
      {activeTab === 'policies' && <AdminPolicies />}`;
if (code.includes(targetRender)) {
  code = code.replace(targetRender, replaceRender);
}

fs.writeFileSync('src/components/views/AdminView.tsx', code);

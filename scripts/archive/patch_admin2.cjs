const fs = require('fs');
let code = fs.readFileSync('src/components/views/AdminView.tsx', 'utf8');

const targetImport = "import { Package, Users, ShoppingBag, Settings as SettingsIcon, MessageSquare, Ticket, FileText, LayoutDashboard, LogOut } from 'lucide-react';";
const replaceImport = "import { Package, Users, ShoppingBag, Settings as SettingsIcon, MessageSquare, Ticket, FileText, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';";
if (code.includes(targetImport)) {
  code = code.replace(targetImport, replaceImport);
} else {
  // Try another approach
  code = code.replace("Settings as SettingsIcon,", "Settings as SettingsIcon, ShieldCheck,");
}
fs.writeFileSync('src/components/views/AdminView.tsx', code);

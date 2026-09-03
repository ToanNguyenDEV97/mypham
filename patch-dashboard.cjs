const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

const importTarget = `import { AdminSettings } from './AdminSettings';
import { AdminVouchers } from './AdminVouchers';
import { AdminBanners } from './AdminBanners';`;
const importReplacement = `import { AdminSettings } from './AdminSettings';
import { AdminVouchers } from './AdminVouchers';
import { AdminBanners } from './AdminBanners';
import { AdminReviews } from './AdminReviews';`;
code = code.replace(importTarget, importReplacement);

const stateTarget = `const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'posts' | 'settings' | 'banners' | 'vouchers'>('overview');`;
const stateReplacement = `const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'posts' | 'settings' | 'banners' | 'vouchers' | 'reviews'>('overview');`;
code = code.replace(stateTarget, stateReplacement);

const lucideImportTarget = `import { LayoutDashboard, ShoppingBag, ShoppingCart, FileText, Settings, Image, Loader2, Tag } from 'lucide-react';`;
const lucideImportReplacement = `import { LayoutDashboard, ShoppingBag, ShoppingCart, FileText, Settings, Image, Loader2, Tag, Star } from 'lucide-react';`;
code = code.replace(lucideImportTarget, lucideImportReplacement);

const tabsTarget = `{ id: 'posts', name: 'Bài viết', icon: FileText },`;
const tabsReplacement = `{ id: 'posts', name: 'Bài viết', icon: FileText },
    { id: 'reviews', name: 'Đánh giá', icon: Star },`;
code = code.replace(tabsTarget, tabsReplacement);

const contentTarget = `{activeTab === 'posts' && <AdminPosts />}`;
const contentReplacement = `{activeTab === 'posts' && <AdminPosts />}
        {activeTab === 'reviews' && <AdminReviews />}`;
code = code.replace(contentTarget, contentReplacement);

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', code);

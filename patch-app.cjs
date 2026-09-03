const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
const importTarget = `import { ProfileView } from './components/views/ProfileView';
import { OrderTrackingView } from './components/views/OrderTrackingView';`;
const importReplacement = `import { ProfileView } from './components/views/ProfileView';
import { OrderTrackingView } from './components/views/OrderTrackingView';
import { BlogView } from './components/views/BlogView';
import { PostDetailView } from './components/views/PostDetailView';`;
code = code.replace(importTarget, importReplacement);

// State
const stateTarget = `const [currentView, setCurrentView] = useState<'home' | 'products' | 'checkout' | 'product_detail' | 'admin' | 'profile' | 'order_tracking'>('home');`;
const stateReplacement = `const [currentView, setCurrentView] = useState<'home' | 'products' | 'checkout' | 'product_detail' | 'admin' | 'profile' | 'order_tracking' | 'blog' | 'post_detail'>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);`;
code = code.replace(stateTarget, stateReplacement);

// Menu item desktop
const menuTarget = `<a href="#" className="hover:text-[#F4B5C6] transition-colors py-2" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>`;
const menuReplacement = `<a href="#" className="hover:text-[#F4B5C6] transition-colors py-2" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>
            <a href="#" className={\`hover:text-[#F4B5C6] transition-colors py-2 \${currentView === 'blog' || currentView === 'post_detail' ? 'text-[#F4B5C6]' : ''}\`} onClick={(e) => { e.preventDefault(); setCurrentView('blog'); }}>Góc Làm Đẹp</a>`;
code = code.replace(menuTarget, menuReplacement);

// Menu item mobile
const mobileMenuTarget = `<li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo dõi đơn hàng</a></li>`;
const mobileMenuReplacement = `<li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo dõi đơn hàng</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('blog'); setIsMenuOpen(false); }}>Góc làm đẹp</a></li>`;
code = code.replace(mobileMenuTarget, mobileMenuReplacement);

// Mobile sticky menu
const mobileStickyTarget = `<a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>`;
const mobileStickyReplacement = `<a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('order_tracking'); }}>Theo Dõi Đơn</a>
                <a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setCurrentView('blog'); }}>Góc Làm Đẹp</a>`;
code = code.replace(mobileStickyTarget, mobileStickyReplacement);

// Views switch
const viewSwitchTarget = `) : currentView === 'profile' ? (
            <ProfileView onLogout={() => { auth.signOut(); setCurrentView('home'); }} onAdminClick={() => setCurrentView('admin')} />
          ) : (`;
const viewSwitchReplacement = `) : currentView === 'profile' ? (
            <ProfileView onLogout={() => { auth.signOut(); setCurrentView('home'); }} onAdminClick={() => setCurrentView('admin')} />
          ) : currentView === 'blog' ? (
            <BlogView onPostClick={(post) => { setSelectedPost(post); setCurrentView('post_detail'); }} onBack={() => setCurrentView('home')} />
          ) : currentView === 'post_detail' && selectedPost ? (
            <PostDetailView post={selectedPost} onBack={() => setCurrentView('blog')} />
          ) : (`;
code = code.replace(viewSwitchTarget, viewSwitchReplacement);

fs.writeFileSync('src/App.tsx', code);

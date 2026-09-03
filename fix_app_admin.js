import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
code = code.replace(
  "import { ProductDetailView } from './components/views/ProductDetailView';",
  "import { ProductDetailView } from './components/views/ProductDetailView';\nimport { AdminView } from './components/views/AdminView';"
);

// Add currentView type
code = code.replace(
  "const [currentView, setCurrentView] = useState<'home' | 'products' | 'checkout' | 'product_detail'>('home');",
  "const [currentView, setCurrentView] = useState<'home' | 'products' | 'checkout' | 'product_detail' | 'admin'>('home');"
);

// We need to return early if currentView === 'admin'
code = code.replace(
  "const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);\n\n  return (",
  "const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);\n\n  if (currentView === 'admin') return <AdminView />;\n\n  return ("
);

// Add admin link to footer
code = code.replace(
  "<li><a href=\"#\" className=\"hover:text-white transition-colors\">Liên Hệ</a></li>",
  "<li><a href=\"#\" className=\"hover:text-white transition-colors\">Liên Hệ</a></li>\n              <li><a href=\"#\" className=\"hover:text-[#F4B5C6] transition-colors font-bold\" onClick={(e) => { e.preventDefault(); setCurrentView('admin'); }}>Quản Trị Viên</a></li>"
);

fs.writeFileSync('src/App.tsx', code);

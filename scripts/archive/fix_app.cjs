const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const headerRegex = /\{\/\* Top Bar \*\/\}([\s\S]*?)<\/nav>/;
const headerMatch = appTsx.match(headerRegex);

if (headerMatch) {
  const headerContent = headerMatch[0];
  const headerComponent = `import { Search, ShoppingCart, Heart, User, Menu, Phone, Mail, Sparkles, ChevronDown } from 'lucide-react';
import { Settings, UserData } from '../../types';

interface HeaderProps {
  settings: Settings;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentView: (view: any) => void;
  setIsCartOpen: (open: boolean) => void;
  cartItemsCount: number;
  setIsWishlistOpen: (open: boolean) => void;
  wishlistCount: number;
  user: UserData | null;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsMenuOpen: (open: boolean) => void;
  currentView: string;
  setProductsKey: (cb: (k: number) => number) => void;
}

export const Header = ({
  settings, searchQuery, setSearchQuery, setCurrentView, setIsCartOpen,
  cartItemsCount, setIsWishlistOpen, wishlistCount, user, setIsAuthModalOpen, setIsMenuOpen, currentView, setProductsKey
}: HeaderProps) => {
  return (
    <>
      ${headerContent.replace(/wishlist\.length/g, 'wishlistCount')}
    </>
  );
};
`;

  fs.writeFileSync('src/components/layout/Header.tsx', headerComponent);
  
  appTsx = appTsx.replace(headerRegex, `<Header \n        settings={settings}\n        searchQuery={searchQuery}\n        setSearchQuery={setSearchQuery}\n        setCurrentView={setCurrentView}\n        setIsCartOpen={setIsCartOpen}\n        cartItemsCount={cartItemsCount}\n        setIsWishlistOpen={setIsWishlistOpen}\n        wishlistCount={wishlist.length}\n        user={user as unknown as UserData}\n        setIsAuthModalOpen={setIsAuthModalOpen}\n        setIsMenuOpen={setIsMenuOpen}\n        currentView={currentView}\n        setProductsKey={setProductsKey}\n      />`);
}

// Add imports
if (!appTsx.includes("import { Header }")) {
  appTsx = appTsx.replace("import { CartDrawer } from './components/layout/CartDrawer';", "import { CartDrawer } from './components/layout/CartDrawer';\nimport { Header } from './components/layout/Header';\nimport { Footer } from './components/layout/Footer';\nimport { MobileMenu } from './components/layout/MobileMenu';");
}

fs.writeFileSync('src/App.tsx', appTsx);

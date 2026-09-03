const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const headerRegex = /\{\/\* Top Bar \*\/\}([\s\S]*?)\{\/\* Main Content \*\/\}/;
appTsx = appTsx.replace(headerRegex, `<Header \n        settings={settings}\n        searchQuery={searchQuery}\n        setSearchQuery={setSearchQuery}\n        setCurrentView={setCurrentView}\n        setIsCartOpen={setIsCartOpen}\n        cartItemsCount={cartItemsCount}\n        setIsWishlistOpen={setIsWishlistOpen}\n        wishlistCount={wishlist.length}\n        user={user}\n        setIsAuthModalOpen={setIsAuthModalOpen}\n        setIsMenuOpen={setIsMenuOpen}\n      />\n      {/* Main Content */}`);

const footerRegex = /<footer className="bg-\[\#FDF2F5\] pt-16 pb-8 border-t border-\[\#FCE8ED\] mt-auto">([\s\S]*?)<\/footer>/;
appTsx = appTsx.replace(footerRegex, `<Footer \n        settings={settings}\n        setCurrentView={setCurrentView}\n        setSearchQuery={setSearchQuery}\n        setProductsKey={setProductsKey}\n        setIsMenuOpen={setIsMenuOpen}\n      />`);

const mobileMenuRegex = /\{\/\* Mobile Menu Overlay \*\/\}\s*\{isMenuOpen && \([\s\S]*?\}\s*\{\/\* Floating Contact Buttons \*\/\}/;
appTsx = appTsx.replace(mobileMenuRegex, `{isMenuOpen && (\n        <MobileMenu \n          settings={settings}\n          setCurrentView={setCurrentView}\n          setSearchQuery={setSearchQuery}\n          setProductsKey={setProductsKey}\n          setIsMenuOpen={setIsMenuOpen}\n        />\n      )}\n\n      {/* Floating Contact Buttons */}`);

// Add imports
appTsx = appTsx.replace("import { CartDrawer } from './components/layout/CartDrawer';", "import { CartDrawer } from './components/layout/CartDrawer';\nimport { Header } from './components/layout/Header';\nimport { Footer } from './components/layout/Footer';\nimport { MobileMenu } from './components/layout/MobileMenu';");

fs.writeFileSync('src/App.tsx', appTsx);

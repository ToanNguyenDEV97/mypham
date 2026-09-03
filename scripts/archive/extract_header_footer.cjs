const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Header
const headerRegex = /\{\/\* Top Bar \*\/\}([\s\S]*?)\{\/\* Main Content \*\/\}/;
const headerMatch = appTsx.match(headerRegex);

if (headerMatch) {
  const headerContent = headerMatch[1];
  const headerComponent = `import { Search, ShoppingCart, Heart, User, Menu, Phone, Mail, Sparkles } from 'lucide-react';
import { Settings, UserData } from '../../types';

interface HeaderProps {
  settings: any;
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
}

export const Header = ({
  settings, searchQuery, setSearchQuery, setCurrentView, setIsCartOpen,
  cartItemsCount, setIsWishlistOpen, wishlistCount, user, setIsAuthModalOpen, setIsMenuOpen
}: HeaderProps) => {
  return (
    <>
      {/* Top Bar */}
${headerContent}
    </>
  );
};
`;

  // Fix wishlist.length -> wishlistCount in Header
  let finalHeader = headerComponent.replace(/wishlist\.length/g, 'wishlistCount');
  
  fs.writeFileSync('src/components/layout/Header.tsx', finalHeader);
}

// Footer
const footerRegex = /<footer className="bg-\[\#FDF2F5\] pt-16 pb-8 border-t border-\[\#FCE8ED\] mt-auto">([\s\S]*?)<\/footer>/;
const footerMatch = appTsx.match(footerRegex);
if (footerMatch) {
  const footerContent = footerMatch[0];
  const footerComponent = `import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Settings } from '../../types';

interface FooterProps {
  settings: any;
  setCurrentView: (view: any) => void;
  setSearchQuery: (q: string) => void;
  setProductsKey: (cb: (k: number) => number) => void;
  setIsMenuOpen: (open: boolean) => void;
}

export const Footer = ({
  settings, setCurrentView, setSearchQuery, setProductsKey, setIsMenuOpen
}: FooterProps) => {
  return (
    ${footerContent}
  );
};
`;
  fs.writeFileSync('src/components/layout/Footer.tsx', footerComponent);
}

// MobileMenu
const mobileMenuRegex = /\{\/\* Mobile Menu Overlay \*\/\}\s*\{isMenuOpen && \([\s\S]*?\}\s*\{\/\* Floating Contact Buttons \*\/\}/;
const mobileMenuMatch = appTsx.match(mobileMenuRegex);
if (mobileMenuMatch) {
  let mobileMenuContent = mobileMenuMatch[0];
  // Remove {isMenuOpen && ( and )} at the end
  mobileMenuContent = mobileMenuContent.replace(/\{\/\* Mobile Menu Overlay \*\/\}\s*\{isMenuOpen && \(/, '');
  mobileMenuContent = mobileMenuContent.replace(/\)\}\s*\{\/\* Floating Contact Buttons \*\/\}/, '');

  const mobileMenuComponent = `import { X, ChevronDown } from 'lucide-react';
import { Settings } from '../../types';

interface MobileMenuProps {
  settings: any;
  setCurrentView: (view: any) => void;
  setSearchQuery: (q: string) => void;
  setProductsKey: (cb: (k: number) => number) => void;
  setIsMenuOpen: (open: boolean) => void;
}

export const MobileMenu = ({
  settings, setCurrentView, setSearchQuery, setProductsKey, setIsMenuOpen
}: MobileMenuProps) => {
  return (
    ${mobileMenuContent}
  );
};
`;
  fs.writeFileSync('src/components/layout/MobileMenu.tsx', mobileMenuComponent);
}


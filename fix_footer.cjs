const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const footerRegex = /<footer className="bg-white pt-16 pb-8 px-4 md:px-8 border-t border-gray-100">([\s\S]*?)<\/footer>/;
const footerMatch = appTsx.match(footerRegex);
if (footerMatch) {
  const footerContent = footerMatch[0];
  const footerComponent = `import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Settings } from '../../types';

interface FooterProps {
  settings: Settings;
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
  
  appTsx = appTsx.replace(footerRegex, `<Footer \n        settings={settings}\n        setCurrentView={setCurrentView}\n        setSearchQuery={setSearchQuery}\n        setProductsKey={setProductsKey}\n        setIsMenuOpen={setIsMenuOpen}\n      />`);
}
fs.writeFileSync('src/App.tsx', appTsx);

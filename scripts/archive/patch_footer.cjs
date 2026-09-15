const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

const target1 = `  setIsMenuOpen: (open: boolean) => void;
}`;
const replace1 = `  setIsMenuOpen: (open: boolean) => void;
  setSelectedPolicySlug?: (slug: string) => void;
}`;
code = code.replace(target1, replace1);

const target2 = `  settings, setCurrentView, setSearchQuery, setProductsKey, setIsMenuOpen
}: FooterProps) => {`;
const replace2 = `  settings, setCurrentView, setSearchQuery, setProductsKey, setIsMenuOpen, setSelectedPolicySlug
}: FooterProps) => {`;
code = code.replace(target2, replace2);

const target3 = `            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chính sách vận chuyển</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Hình thức thanh toán</a></li>
            </ul>`;

const replace3 = `            <ul className="space-y-4 text-sm text-gray-500">
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('chinh-sach-bao-mat'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Chính sách bảo mật</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('chinh-sach-van-chuyen'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Chính sách vận chuyển</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('chinh-sach-doi-tra'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Chính sách đổi trả</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('dieu-khoan-dich-vu'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Điều khoản dịch vụ</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('hinh-thuc-thanh-toan'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Hình thức thanh toán</button></li>
            </ul>`;

code = code.replace(target3, replace3);

fs.writeFileSync('src/components/layout/Footer.tsx', code);

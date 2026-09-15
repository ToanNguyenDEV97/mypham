import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Sparkles } from 'lucide-react';
import { Settings, ViewType } from '../../types';

interface FooterProps {
  settings: Settings;
  setCurrentView: (view: ViewType) => void;
  setSearchQuery: (q: string) => void;
  setProductsKey: (cb: (k: number) => number) => void;
  setIsMenuOpen: (open: boolean) => void;
  setSelectedPolicySlug?: (slug: string) => void;
}

export const Footer = ({
  settings, setCurrentView, setSearchQuery, setProductsKey, setIsMenuOpen, setSelectedPolicySlug
}: FooterProps) => {
  return (
    <footer className="bg-white pt-16 pb-8 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 border-2 border-[#F4B5C6] rounded-full flex items-center justify-center p-0.5">
                <div className="w-full h-full border border-[#4A2C2C] rounded-full flex items-center justify-center bg-[#FCE8ED]">
                  <Sparkles className="w-4 h-4 text-[#4A2C2C]" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-lg font-bold tracking-[0.1em] text-[#4A2C2C] uppercase font-serif">{settings.storeName}</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {settings.description}
            </p>
            <div className="flex gap-3">
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#4A2C2C] text-white flex items-center justify-center hover:bg-[#F4B5C6] transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#4A2C2C] text-white flex items-center justify-center hover:bg-[#F4B5C6] transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#4A2C2C] text-white flex items-center justify-center hover:bg-[#F4B5C6] transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Công ty</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Trang chủ</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Sản phẩm</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Hỏi đáp</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('order_tracking'); }}>Theo dõi đơn hàng</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setCurrentView('blog'); setIsMenuOpen(false); }}>Góc làm đẹp</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Về chúng tôi</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Chính sách</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('chinh-sach-bao-mat'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Chính sách bảo mật</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('chinh-sach-van-chuyen'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Chính sách vận chuyển</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('chinh-sach-doi-tra'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Chính sách đổi trả</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('dieu-khoan-dich-vu'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Điều khoản dịch vụ</button></li>
              <li><button onClick={(e) => { e.preventDefault(); if (setSelectedPolicySlug) setSelectedPolicySlug('hinh-thuc-thanh-toan'); setCurrentView('policy_page'); window.scrollTo(0,0); }} className="hover:text-[#F4B5C6] transition-colors">Hình thức thanh toán</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Danh mục nổi bật</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Chăm sóc cơ thể</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Sản phẩm nhập khẩu</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors">Bán chạy nhất</a></li>
              <li><a href="#" className="hover:text-[#F4B5C6] transition-colors" onClick={(e) => { e.preventDefault(); setSearchQuery('Khuyến mãi'); setCurrentView('products'); setProductsKey(k => k + 1); }}>Khuyến mãi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#4A2C2C] mb-6 uppercase text-sm">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#F4B5C6] shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 text-[#F4B5C6] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#F4B5C6] transition-colors">{settings.email}</a>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-[#F4B5C6] shrink-0" />
                <span>{settings.phone}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>Copyright © {new Date().getFullYear()} {settings.storeName} | All rights reserved</p>
          <div className="flex gap-4">
             <span className="font-bold text-gray-500">VISA</span>
             <span className="font-bold text-gray-500">MasterCard</span>
             <span className="font-bold text-gray-500">PayPal</span>
             <span className="font-bold text-gray-500">MoMo</span>
          </div>
        </div>
      </footer>
  );
};

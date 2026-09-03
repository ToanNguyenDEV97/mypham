import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';
import { auth, db, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in firestore, if not create them
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          displayName: user.displayName,
          isAdmin: user.email === 'toannt1202@gmail.com',
          wishlist: [],
          shippingProfile: {}
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          displayName: name,
          isAdmin: email === 'toannt1202@gmail.com',
          wishlist: [],
          shippingProfile: {}
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative p-8 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#4A2C2C] p-2 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#4A2C2C] mb-2">
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Đăng nhập để quản lý đơn hàng và danh sách yêu thích' : 'Đăng ký để nhận nhiều ưu đãi hấp dẫn'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none transition-all"
                />
              </div>
            </div>
          )}
          
          <div>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4B5C6] focus:border-[#F4B5C6] outline-none transition-all"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#F4B5C6] text-white font-bold py-3 rounded-xl hover:bg-[#4A2C2C] transition-colors shadow-md disabled:opacity-70"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
          </button>
        </form>

        <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-200 after:mt-0.5 after:flex-1 after:border-t after:border-gray-200">
          <p className="mx-4 mb-0 text-center text-sm text-gray-500 font-medium">hoặc</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Tiếp tục với Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="font-bold text-[#F4B5C6] hover:text-[#4A2C2C] transition-colors"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};

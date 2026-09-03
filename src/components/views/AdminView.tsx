import { UserData} from '../../types';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AdminDashboard } from '../admin/AdminDashboard';
import { EditHeaderSettingsModal } from '../admin/EditHeaderSettingsModal';
import { Lock, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { SEO } from '../ui/SEO';

export const AdminView = ({ onBackToStore }: { onBackToStore: () => void }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error(err);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#FCE8ED]">
              <Lock className="h-6 w-6 text-[#F4B5C6]" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#4A2C2C]">Quản Trị Viên</h2>
            <button onClick={onBackToStore} className="w-full mt-4 text-sm text-gray-500 hover:text-[#4A2C2C] text-center block">Trở về cửa hàng</button>
            {user && !isAdmin && (
              <p className="mt-2 text-center text-sm text-red-600">
                Tài khoản của bạn không có quyền truy cập trang quản trị.
                <button onClick={handleLogout} className="ml-2 font-medium text-[#F4B5C6] hover:text-[#4A2C2C]">Đăng xuất</button>
              </p>
            )}
          </div>
          {(!user) && (
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label className="sr-only">Email address</label>
                  <input
                    type="email"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#F4B5C6] focus:border-[#F4B5C6] sm:text-sm"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="sr-only">Password</label>
                  <input
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#F4B5C6] focus:border-[#F4B5C6] sm:text-sm"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="text-red-500 text-sm text-center">{error}</div>}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-[#F4B5C6] hover:bg-[#4A2C2C] focus:outline-none transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Quản Trị Viên - DS Tiên Cosmetics" />
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
              <span className="font-serif font-bold text-2xl text-[#4A2C2C]">Lumière Admin</span>
              <button onClick={onBackToStore} className="ml-6 text-sm text-gray-500 hover:text-[#4A2C2C]">Trở về cửa hàng</button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsHeaderModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-[#4A2C2C] bg-[#FCE8ED] hover:bg-[#F4B5C6] px-3 py-1.5 rounded-full transition-colors"
              >
                <SettingsIcon className="w-4 h-4" /> Sửa Header
              </button>
              <span className="text-sm text-gray-600 ml-2">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#4A2C2C] transition-colors"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AdminDashboard />
      </main>

      <EditHeaderSettingsModal 
        isOpen={isHeaderModalOpen} 
        onClose={() => setIsHeaderModalOpen(false)} 
      />
    </div>
    </>
  );
};

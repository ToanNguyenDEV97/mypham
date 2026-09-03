const fs = require('fs');
let code = fs.readFileSync('src/components/views/OrderTrackingView.tsx', 'utf8');

// Update imports
if (!code.includes('httpsCallable')) {
  code = code.replace("import { auth, db } from '../../lib/firebase';", "import { auth, db, functions } from '../../lib/firebase';\nimport { httpsCallable } from 'firebase/functions';");
  // Also handle if auth was not imported with db in the same line
  if (code.includes("import { db } from '../../lib/firebase';")) {
     code = code.replace("import { db } from '../../lib/firebase';", "import { auth, db, functions } from '../../lib/firebase';\nimport { httpsCallable } from 'firebase/functions';");
  }
}

const handleSearchOld = `
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    if (!auth.currentUser) {
      setError('Vui lòng đăng nhập để tra cứu đơn hàng của bạn nhằm bảo mật thông tin.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      const docRef = doc(db, 'orders', orderId.trim());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi tìm kiếm đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
`;

const handleSearchNew = `
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      // Gọi Cloud Function thay vì truy vấn trực tiếp Firestore
      // Function sẽ chạy ngầm qua Admin SDK và CHỈ trả về dữ liệu đã được che (masked)
      const trackOrderFunction = httpsCallable(functions, 'trackOrder');
      const result = await trackOrderFunction({ orderId: orderId.trim() });
      
      if (result.data) {
        setOrder(result.data);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'not-found') {
        setError('Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.');
      } else {
        setError('Đã xảy ra lỗi khi tìm kiếm đơn hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };
`;

// Remove the client side masking functions since they are not needed if we pre-mask, OR keep them but they just mask the already masked data (which is fine, or we can just render the raw string because it's masked).
// Actually, it's safer to just render the data from the order since it's masked.
const maskNameOld = /const maskName = \([\s\S]*?\};\n/;
const maskPhoneOld = /const maskPhone = \([\s\S]*?\};\n/;
const maskAddressOld = /const maskAddress = \([\s\S]*?\};\n/;

code = code.replace(handleSearchOld, handleSearchNew);

// We can just keep the mask functions in the UI, they'll act as a no-op if the text is already masked (like "***"), but wait, maskName("T***") might become "T***". Let's just remove them.
code = code.replace(maskNameOld, '');
code = code.replace(maskPhoneOld, '');
code = code.replace(maskAddressOld, '');

// Update JSX to not call mask functions
code = code.replace(/\{maskName\((.*?)\)\}/g, '{$1}');
code = code.replace(/\{maskPhone\((.*?)\)\}/g, '{$1}');
code = code.replace(/\{maskAddress\((.*?)\)\}/g, '{$1}');

fs.writeFileSync('src/components/views/OrderTrackingView.tsx', code);

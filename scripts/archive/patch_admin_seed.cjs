const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminPolicies.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    fetchPolicies();
  }, []);`;

const newEffect = `  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      for (const p of POLICY_SLUGS) {
        if (!policies[p.slug]) {
          const docRef = doc(collection(db, 'policies'));
          await setDoc(docRef, {
            slug: p.slug,
            title: p.title,
            content: '<p>Nội dung đang được cập nhật...</p>',
            updatedAt: Timestamp.now()
          });
        }
      }
      await fetchPolicies();
    } catch (error) {
      console.error(error);
    }
  };`;

if (!code.includes("handleSeed")) {
  code = code.replace(targetEffect, newEffect);
}

const targetButton = `      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý Chính sách</h2>
      </div>`;

const newButton = `      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý Chính sách</h2>
        <button 
          onClick={handleSeed}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Tạo trang chưa có
        </button>
      </div>`;

if (!code.includes("Tạo trang chưa có")) {
  code = code.replace(targetButton, newButton);
}

fs.writeFileSync('src/components/admin/AdminPolicies.tsx', code);

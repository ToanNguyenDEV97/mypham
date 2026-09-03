import fs from 'fs';

let code = fs.readFileSync('src/components/views/AdminView.tsx', 'utf-8');

code = code.replace(
  "export const AdminView = () => {",
  "export const AdminView = ({ onBackToStore }: { onBackToStore: () => void }) => {"
);

code = code.replace(
  "<span className=\"font-serif font-bold text-2xl text-[#4A2C2C]\">Lumière Admin</span>",
  "<span className=\"font-serif font-bold text-2xl text-[#4A2C2C]\">Lumière Admin</span>\n              <button onClick={onBackToStore} className=\"ml-6 text-sm text-gray-500 hover:text-[#4A2C2C]\">Trở về cửa hàng</button>"
);

code = code.replace(
  "<h2 className=\"mt-6 text-center text-3xl font-extrabold text-[#4A2C2C]\">Quản Trị Viên</h2>",
  "<h2 className=\"mt-6 text-center text-3xl font-extrabold text-[#4A2C2C]\">Quản Trị Viên</h2>\n            <button onClick={onBackToStore} className=\"w-full mt-4 text-sm text-gray-500 hover:text-[#4A2C2C] text-center block\">Trở về cửa hàng</button>"
);

fs.writeFileSync('src/components/views/AdminView.tsx', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(
  "if (currentView === 'admin') return <AdminView />;",
  "if (currentView === 'admin') return <AdminView onBackToStore={() => setCurrentView('home')} />;"
);
fs.writeFileSync('src/App.tsx', appCode);

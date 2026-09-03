import fs from 'fs';

let code = fs.readFileSync('src/components/ui/AuthModal.tsx', 'utf-8');

code = code.replace(
  "isAdmin: false,",
  "isAdmin: email === 'toannt1202@gmail.com',"
);

fs.writeFileSync('src/components/ui/AuthModal.tsx', code);

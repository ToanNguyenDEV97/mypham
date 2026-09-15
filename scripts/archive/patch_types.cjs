const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  'export type ViewType = "home" | "products" | "checkout" | "product_detail" | "admin" | "profile" | "order_tracking" | "blog" | "post_detail";',
  'export type ViewType = "home" | "products" | "checkout" | "product_detail" | "admin" | "profile" | "order_tracking" | "blog" | "post_detail" | "policy_page";'
);

if (!code.includes("export interface Policy")) {
  code += `\n\nexport interface Policy {\n  id: string;\n  slug: string;\n  title: string;\n  content: string;\n  updatedAt: any;\n}`;
}

fs.writeFileSync('src/types/index.ts', code);

const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace('export interface Settings {', 'export interface Settings {\n  description?: string;\n  topBarText?: string;');
fs.writeFileSync('src/types/index.ts', types);

let footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
footer = footer.replace('Facebook, Instagram, Twitter } from \'lucide-react\'', 'Facebook, Instagram, Twitter, Sparkles } from \'lucide-react\'');
fs.writeFileSync('src/components/layout/Footer.tsx', footer);


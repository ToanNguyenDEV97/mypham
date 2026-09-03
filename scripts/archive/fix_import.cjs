const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

// Fix the bad import if it exists
code = code.replace(/import \{ formatPrice, parsePrice \} from '\.\.\/\.\.\/utils\/format', maskName, maskPhone, maskAddress;/, "import { formatPrice, parsePrice, maskName, maskPhone, maskAddress } from '../../utils/format';");

// Check if maskName is imported at all
if (!code.includes('maskName, maskPhone, maskAddress }')) {
  code = code.replace(/import \{ formatPrice, parsePrice \} from '\.\.\/\.\.\/utils\/format';/, "import { formatPrice, parsePrice, maskName, maskPhone, maskAddress } from '../../utils/format';");
}
fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);

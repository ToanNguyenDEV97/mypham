const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  "            </tbody>\n          </table>\n        )}\n        \n        {/* Pagination */",
  "            </tbody>\n          </table>\n          </>\n        )}\n        \n        {/* Pagination */"
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);

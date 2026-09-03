const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

const target = `        ) : (
            
              {selectedOrderIds.length > 0 && (`;
const replace = `        ) : (
          <>
              {selectedOrderIds.length > 0 && (`;

code = code.replace(target, replace);
code = code.replace(`              ) : (\n            \n              {selectedOrderIds.length > 0 && (`, `              ) : (\n          <>\n              {selectedOrderIds.length > 0 && (`);
code = code.replace(`        ) : (\n            {selectedOrderIds.length > 0 && (`, `        ) : (\n          <>\n            {selectedOrderIds.length > 0 && (`);

// Also need to add </> at the end of the table
const endTableTarget = `          </table>
        )}
      </div>`;
const endTableReplace = `          </table>
          </>
        )}
      </div>`;
code = code.replace(endTableTarget, endTableReplace);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);

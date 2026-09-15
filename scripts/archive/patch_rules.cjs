const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

if (!rules.includes("/policies/{policyId}")) {
  rules = rules.replace(
    "  }\n}",
    "  }\n\n    match /policies/{policyId} {\n      allow read: if true;\n      allow write: if isAdmin();\n    }\n  }\n}"
  );
  fs.writeFileSync('firestore.rules', rules);
}

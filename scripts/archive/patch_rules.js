const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newUsersRule = `
    function isAdmin() {
      return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId && (!('isAdmin' in request.resource.data) || request.resource.data.isAdmin == false);
      allow update: if request.auth != null && request.auth.uid == userId && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['isAdmin'])) || isAdmin();
      allow delete: if isAdmin();
    }
`;

const newOrdersRule = `
    match /orders/{orderId} {
      allow create: if 
        // Must contain basic fields
        request.resource.data.keys().hasAll(['items', 'totalPrice', 'status'])
        // Total price must be non-negative
        && request.resource.data.totalPrice >= 0
        // Final total must be non-negative if provided
        && (!('finalTotal' in request.resource.data) || request.resource.data.finalTotal >= 0)
        // Status must be pending for new orders
        && request.resource.data.status == 'pending';

      allow get: if request.auth != null && (isAdmin() || request.auth.uid == resource.data.userId);
      allow list, update: if request.auth != null && (isAdmin() || request.auth.uid == resource.data.userId);
      allow delete: if isAdmin();
    }
`;

code = code.replace(/match \/users\/\{userId\} \{[\s\S]*?\}/, newUsersRule);
code = code.replace(/match \/orders\/\{orderId\} \{[\s\S]*?\}/, newOrdersRule);

fs.writeFileSync('firestore.rules', code);

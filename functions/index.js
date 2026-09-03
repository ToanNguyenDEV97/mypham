const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/\./g, '').replace('đ', ''), 10);
};

exports.createOrder = functions.https.onCall(async (data, context) => {
  // Yêu cầu đăng nhập
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vui lòng đăng nhập để đặt hàng.'
    );
  }

  const { items, profile, paymentMethod, voucherCode } = data;
  if (!items || !items.length) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Giỏ hàng trống.'
    );
  }

  try {
    let totalPrice = 0;
    const orderItems = [];
    const productUpdates = [];

    // Lặp qua từng sản phẩm để lấy giá thật từ Firestore
    for (const item of items) {
      const productRef = db.collection('products').doc(item.id);
      const productSnap = await productRef.get();
      if (!productSnap.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          `Không tìm thấy sản phẩm: ${item.id}`
        );
      }
      
      const productData = productSnap.data();
      
      if (productData.stock !== undefined && productData.stock < item.quantity) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          `Sản phẩm "${productData.name || item.id}" không đủ số lượng trong kho (còn ${productData.stock}).`
        );
      }
      
      const realPrice = parsePrice(productData.newPrice || productData.price);
      
      totalPrice += realPrice * item.quantity;
      
      orderItems.push({
        id: item.id,
        name: productData.name,
        quantity: item.quantity,
        price: productData.price,
        newPrice: productData.newPrice,
        image: productData.image || null
      });
      
      if (productData.stock !== undefined) {
        productUpdates.push({ ref: productRef, quantity: item.quantity });
      }
    }

    // Tính phí ship
    const shippingFee = totalPrice > 500000 ? 0 : 30000;
    
    // Tính giảm giá (Nếu có voucher)
    let discountAmount = 0;
    let appliedVoucher = null;
    let voucherDocRef = null;
    
    if (voucherCode) {
      const voucherSnap = await db.collection('vouchers').where('code', '==', voucherCode.toUpperCase()).get();
      if (!voucherSnap.empty) {
        const docSnap = voucherSnap.docs[0];
        const vData = docSnap.data();
        
        // Validate voucher
        if (!vData.isActive) {
          throw new functions.https.HttpsError('failed-precondition', 'Mã giảm giá không hoạt động');
        }
        
        if (vData.expiresAt) {
          const expiry = vData.expiresAt.toDate ? vData.expiresAt.toDate() : new Date(vData.expiresAt);
          if (expiry < new Date()) {
            throw new functions.https.HttpsError('failed-precondition', 'Mã giảm giá đã hết hạn');
          }
        }
        
        if (vData.usageLimit > 0 && (vData.usedCount || 0) >= vData.usageLimit) {
          throw new functions.https.HttpsError('failed-precondition', 'Mã giảm giá đã hết lượt sử dụng');
        }
        
        if (vData.minOrderValue > totalPrice) {
          throw new functions.https.HttpsError('failed-precondition', `Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này`);
        }

        if (vData.discountType === 'percentage') {
          discountAmount = (totalPrice * vData.discountValue) / 100;
        } else {
          discountAmount = vData.discountValue;
        }
        if (discountAmount > totalPrice) discountAmount = totalPrice;
        
        appliedVoucher = {
          code: vData.code,
          discountValue: vData.discountValue,
          discountType: vData.discountType
        };
        
        voucherDocRef = docSnap.ref;
      } else {
        throw new functions.https.HttpsError('not-found', 'Mã giảm giá không tồn tại');
      }
    }

    const finalTotal = totalPrice + shippingFee - discountAmount;

    // Tạo mã đơn hàng random (VD: 8xA9)
    const generateOrderId = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrderId = generateOrderId();

    const orderData = {
      userId: context.auth.uid,
      items: orderItems,
      totalPrice,
      shippingFee,
      discountAmount,
      finalTotal,
      appliedVoucher,
      shippingProfile: profile,
      paymentMethod,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Run order creation, voucher count increment, and product stock decrement in a batch
    const batch = db.batch();
    batch.set(db.collection('orders').doc(newOrderId), orderData);
    
    if (voucherDocRef) {
      batch.update(voucherDocRef, {
        usedCount: admin.firestore.FieldValue.increment(1)
      });
    }
    
    for (const update of productUpdates) {
      batch.update(update.ref, {
        stock: admin.firestore.FieldValue.increment(-update.quantity)
      });
    }
    
    await batch.commit();

    return { success: true, orderId: newOrderId };

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Đã xảy ra lỗi hệ thống khi xử lý đơn hàng.');
  }
});

const maskName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length <= 1) return name.charAt(0) + '***';
  return parts[0].charAt(0) + '*** ' + parts[parts.length - 1];
};

const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
};

const maskAddress = (address) => {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length > 1) {
    return '***, ' + parts.slice(1).join(',').trim();
  }
  return '***' + address.substring(Math.floor(address.length / 2));
};

exports.trackOrder = functions.https.onCall(async (data, context) => {
  const { orderId } = data;
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Mã đơn hàng không hợp lệ.');
  }

  try {
    const docSnap = await db.collection('orders').doc(orderId).get();
    
    if (!docSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Không tìm thấy đơn hàng.');
    }

    const orderData = docSnap.data();
    
    // Nếu là admin hoặc chính chủ thì có thể trả full data (tùy chọn)
    // Nhưng để an toàn 100% cho màn tracking, ta luôn mask dữ liệu trả về cho client ở màn này.
    
    let maskedCustomerInfo = null;
    if (orderData.customerInfo) {
      maskedCustomerInfo = {
        name: maskName(orderData.customerInfo.name),
        phone: maskPhone(orderData.customerInfo.phone),
        address: maskAddress(orderData.customerInfo.address),
        note: orderData.customerInfo.note ? '***' : ''
      };
    } else if (orderData.shippingProfile) {
      maskedCustomerInfo = {
        name: maskName(orderData.shippingProfile.name),
        phone: maskPhone(orderData.shippingProfile.phone),
        address: maskAddress(orderData.shippingProfile.address),
        note: '***'
      };
    }

    return {
      id: docSnap.id,
      status: orderData.status,
      items: orderData.items || [],
      totalPrice: orderData.totalPrice,
      finalTotal: orderData.finalTotal,
      shippingFee: orderData.shippingFee,
      discountAmount: orderData.discountAmount,
      paymentMethod: orderData.paymentMethod,
      createdAt: orderData.createdAt ? orderData.createdAt.toDate().toISOString() : null,
      customerInfo: maskedCustomerInfo
    };

  } catch (error) {
    console.error('Lỗi khi tra cứu đơn hàng:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Đã xảy ra lỗi hệ thống khi tra cứu đơn hàng.');
  }
});

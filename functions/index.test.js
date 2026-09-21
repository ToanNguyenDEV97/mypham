const test = require('firebase-functions-test')();
const admin = require('firebase-admin');

// Khởi tạo mock cho Firestore
const mockGet = jest.fn().mockResolvedValue({ exists: false, data: () => ({}) });
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockCommit = jest.fn().mockResolvedValue(true);
const mockBatch = jest.fn(() => ({
  set: mockSet,
  update: mockUpdate,
  commit: mockCommit,
}));

const mockDoc = jest.fn(() => ({
  get: mockGet,
}));

const mockWhere = jest.fn(() => ({
  get: mockGet,
}));

const mockCollection = jest.fn(() => ({
  doc: mockDoc,
  where: mockWhere,
}));

// Mock firebase-admin trước khi require functions/index.js
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    firestore: Object.assign(jest.fn(() => ({
      collection: mockCollection,
      batch: mockBatch,
    })), {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'mock-timestamp'),
        increment: jest.fn((val) => `mock-increment(${val})`)
      }
    })
  };
});

jest.mock('firebase-admin/firestore', () => {
  return {
    getFirestore: jest.fn(() => ({
      collection: mockCollection,
      batch: mockBatch,
    })),
    FieldValue: {
      serverTimestamp: jest.fn(() => 'mock-timestamp'),
      increment: jest.fn((val) => `mock-increment(${val})`)
    }
  };
});

const myFunctions = require('./index');

describe('Test Cloud Functions (Offline/Emulator mode)', () => {
  afterAll(() => {
    test.cleanup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder function', () => {
    it('nên báo lỗi nếu chưa đăng nhập', async () => {
      const wrapped = test.wrap(myFunctions.createOrder);
      await expect(wrapped({}, {})).rejects.toThrow('Vui lòng đăng nhập để đặt hàng.');
    });

    it('nên báo lỗi nếu giỏ hàng trống', async () => {
      const wrapped = test.wrap(myFunctions.createOrder);
      const data = { items: [] };
      const context = { auth: { uid: 'user123' } };
      await expect(wrapped(data, context)).rejects.toThrow('Giỏ hàng trống.');
    });

    it('nên tạo đơn hàng thành công khi dữ liệu hợp lệ', async () => {
      // Giả lập sản phẩm tồn tại và đủ hàng
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          name: 'Sản phẩm test',
          price: 100000,
          stock: 10
        }),
        ref: {}
      });

      const wrapped = test.wrap(myFunctions.createOrder);
      const data = {
        items: [{ id: 'prod1', quantity: 1 }],
        profile: { name: 'Toan', phone: '0901234567', address: 'HCM' },
        paymentMethod: 'cod'
      };
      const context = { auth: { uid: 'user123' } };

      const result = await wrapped(data, context);

      // Kỳ vọng batch operations được gọi
      expect(mockBatch).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
    });
    
    it('nên báo lỗi nếu sản phẩm hết hàng hoặc không đủ stock', async () => {
      // Giả lập tồn kho = 1
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          name: 'Sản phẩm test',
          price: 100000,
          stock: 1
        })
      });

      const wrapped = test.wrap(myFunctions.createOrder);
      // Mua 2 sản phẩm (vượt tồn kho)
      const data = {
        items: [{ id: 'prod1', quantity: 2 }]
      };
      const context = { auth: { uid: 'user123' } };

      await expect(wrapped(data, context)).rejects.toThrow(/không đủ số lượng trong kho/);
    });
  });

  describe('trackOrder function', () => {
    it('nên báo lỗi nếu không truyền orderId', async () => {
      const wrapped = test.wrap(myFunctions.trackOrder);
      await expect(wrapped({}, {})).rejects.toThrow('Mã đơn hàng không hợp lệ.');
    });

    it('nên báo lỗi nếu đơn hàng không tồn tại', async () => {
      mockGet.mockResolvedValueOnce({
        exists: false
      });

      const wrapped = test.wrap(myFunctions.trackOrder);
      await expect(wrapped({ orderId: 'invalid-id' }, {})).rejects.toThrow('Không tìm thấy đơn hàng.');
    });

    it('nên trả về dữ liệu đơn hàng và mask thông tin nhạy cảm', async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: 'mock-order-id',
        data: () => ({
          status: 'pending',
          totalPrice: 100000,
          customerInfo: {
            name: 'Nguyen Van Toan',
            phone: '0901234567',
            address: '123 Đường ABC, Phường X, Quận Y, TP HCM',
            note: 'Giao giờ hành chính'
          }
        })
      });

      const wrapped = test.wrap(myFunctions.trackOrder);
      const result = await wrapped({ orderId: 'mock-order-id' }, {});

      expect(result.id).toBe('mock-order-id');
      expect(result.status).toBe('pending');
      // Kiểm tra mask tên: N*** Toan
      expect(result.customerInfo.name).toBe('N*** Toan');
      // Kiểm tra mask sđt: 090****567
      expect(result.customerInfo.phone).toBe('090****567');
      // Kiểm tra mask địa chỉ
      expect(result.customerInfo.address).toContain('***');
    });
  });
});

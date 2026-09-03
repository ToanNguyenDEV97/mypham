const fs = require('fs');
let code = fs.readFileSync('src/components/views/CheckoutView.tsx', 'utf8');

const target = `            </div>
   
            <div className="space-y-3 pt-6 border-t border-gray-200 text-sm">`;

const replacement = `            </div>

            <div className="mb-6 pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={!!appliedVoucher || isApplyingVoucher}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4B5C6] uppercase text-sm"
                />
                {!appliedVoucher ? (
                  <button 
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                    className="px-4 py-2 bg-[#4A2C2C] text-white rounded-xl text-sm font-bold hover:bg-[#3A2222] transition-colors disabled:opacity-50"
                  >
                    {isApplyingVoucher ? 'Đang...' : 'Áp dụng'}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
              {voucherError && <p className="text-red-500 text-xs mt-2">{voucherError}</p>}
              {appliedVoucher && (
                <p className="text-green-600 text-xs mt-2">
                  Đã áp dụng mã <strong>{appliedVoucher.code}</strong> (Giảm {appliedVoucher.discountType === 'percentage' ? \`\${appliedVoucher.discountValue}%\` : formatPrice(appliedVoucher.discountValue)})
                </p>
              )}
            </div>
   
            <div className="space-y-3 pt-6 border-t border-gray-200 text-sm">`;

code = code.replace(target, replacement);

const target2 = `              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-[#4A2C2C]">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              {shippingFee > 0 && (`;

const replacement2 = `              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-[#4A2C2C]">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-semibold">- {formatPrice(discountAmount)}</span>
                </div>
              )}
              {shippingFee > 0 && (`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/components/views/CheckoutView.tsx', code);

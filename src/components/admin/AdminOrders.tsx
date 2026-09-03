import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { formatPrice, parsePrice } from '../../utils/format';
import { Eye, X, Package, Clock, Truck, CheckCircle2, XCircle, MapPin, Phone, User, FileText, Printer, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';


const maskName = (str: any) => {
  if (!str) return '';
  const words = str.trim().split(' ');
  if (words.length <= 1) return str.substring(0, 1) + '***';
  return words[0] + ' *** ' + words[words.length - 1];
};

const maskPhone = (str: any) => {
  if (!str) return '';
  return str.length >= 8 ? str.substring(0, 3) + '****' + str.substring(str.length - 3) : '***';
};

const maskAddress = (str: any) => {
  if (!str) return '';
  if (str.length < 15) return '***' + str.substring(Math.floor(str.length / 2));
  return str.substring(0, 5) + '***' + str.substring(str.length - 15);
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isBulkCancel, setIsBulkCancel] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  const handleCancelInitiate = (orderId: string, isBulk: boolean = false) => {
    setCancellingOrderId(orderId);
    setIsBulkCancel(isBulk);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      return;
    }
    setUpdating(true);
    try {
      if (isBulkCancel) {
        await Promise.all(
          selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { 
            status: 'cancelled', 
            cancelReason: cancelReason.trim(),
            cancelledAt: new Date()
          }))
        );
        setSelectedOrderIds([]);
      } else if (cancellingOrderId) {
        await updateDoc(doc(db, 'orders', cancellingOrderId), { 
          status: 'cancelled',
          cancelReason: cancelReason.trim(),
          cancelledAt: new Date()
        });
        if (selectedOrder && selectedOrder.id === cancellingOrderId) {
          setSelectedOrder({ 
            ...selectedOrder, 
            status: 'cancelled', 
            cancelReason: cancelReason.trim()
          });
        }
      }
      await fetchOrders();
      setCancelModalOpen(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
    } finally {
      setUpdating(false);
    }
  };
  const handleBulkApprove = async () => {
    
    setUpdating(true);
    try {
      await Promise.all(
        selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { status: 'processing' }))
      );
      await fetchOrders();
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Error bulk updating:", error);
      console.error("Có lỗi xảy ra khi cập nhật hàng loạt.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkCancel = () => {
    handleCancelInitiate('', true);
  };


  const handleBulkComplete = async () => {
    
    setUpdating(true);
    try {
      await Promise.all(
        selectedOrderIds.map(id => updateDoc(doc(db, 'orders', id), { status: 'completed' }))
      );
      await fetchOrders();
      setSelectedOrderIds([]);
    } catch (error) {
      console.error("Error bulk updating:", error);
      console.error("Có lỗi xảy ra khi cập nhật hàng loạt.");
    } finally {
      setUpdating(false);
    }
  };

  const generateWaybillHtml = (ordersToPrint: any[]) => {
    return `
      <html>
        <head>
          <title>In Vận Đơn (${ordersToPrint.length} đơn)</title>
          <style>
            @page { size: 100mm 150mm; margin: 0; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
            .page { width: 100mm; height: 150mm; padding: 5mm; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; }
            .waybill { width: 100%; height: 100%; border: 2px dashed #000; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; }
            .waybill-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
            .logo { font-size: 20px; font-weight: bold; }
            .barcode { font-size: 36px; font-family: 'Libre Barcode 39 Text', monospace; letter-spacing: 2px; text-align: center; margin: 5px 0; }
            .section { border-bottom: 1px dashed #ccc; padding-bottom: 5px; margin-bottom: 5px; flex-shrink: 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .address-box { padding: 5px; background: #f9f9f9; border: 1px solid #ddd; font-size: 11px; }
            .address-title { font-weight: bold; font-size: 12px; margin-bottom: 2px; }
            h4 { margin: 0 0 3px 0; font-size: 12px; }
            p { margin: 0 0 3px 0; font-size: 11px; line-height: 1.3; }
            .cod-box { text-align: center; border: 2px solid #000; padding: 5px; margin: 5px 0; }
            .cod-amount { font-size: 20px; font-weight: bold; }
            .table-items { width: 100%; font-size: 10px; margin-top: 5px; border-collapse: collapse; }
            .table-items th, .table-items td { border: 1px solid #ddd; padding: 3px; text-align: left; }
            .footer-note { text-align: center; font-size: 10px; font-style: italic; margin-top: auto; }
            @media print {
              body { padding: 0; }
              .page { margin: 0; border: none; }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
        </head>
        <body>
          ${ordersToPrint.map(order => `
          <div class="page">
            <div class="waybill">
              <div class="waybill-header">
                <div class="logo">DS TIEN</div>
                <div>Giao Hàng Nhanh</div>
              </div>
              
              <div class="barcode">
                *${order.id.substring(0, 8).toUpperCase()}*
              </div>
              <div style="text-align: center; font-size: 11px; margin-top: -5px; margin-bottom: 5px; font-weight: bold;">
                Mã ĐH: ${order.id.toUpperCase()}
              </div>

              <div class="row">
                <div style="width: 48%;" class="address-box">
                  <div class="address-title">Từ: DS Tiên Cosmetics</div>
                  <p>123 Đường Mỹ Phẩm, Quận 1, TP. HCM</p>
                  <p>SĐT: 0901 234 567</p>
                </div>
                <div style="width: 48%;" class="address-box">
                  <div class="address-title">Đến: ${maskName(order.customerInfo?.name) || 'Khách hàng'}</div>
                  <p>${maskAddress(order.customerInfo?.address) || 'Không có địa chỉ'}</p>
                  <p>SĐT: ${maskPhone(order.customerInfo?.phone) || 'Không có SĐT'}</p>
                </div>
              </div>

              <div class="cod-box">
                <p style="font-size: 12px; margin-bottom: 2px;">Tiền thu người nhận (COD)</p>
                <div class="cod-amount">
                  ${order.paymentMethod === 'bank' ? '0 ₫' : formatPrice(parsePrice(order.finalTotal || order.totalAmount || order.totalPrice || 0))}
                </div>
                <p style="font-size: 10px; margin-top: 2px;">${order.paymentMethod === 'bank' ? '(Khách đã thanh toán)' : '(Bao gồm phí GH)'}</p>
              </div>

              <div class="section" style="flex-grow: 1; overflow: hidden;">
                <h4>Nội dung (SL: ${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0})</h4>
                <table class="table-items">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style="text-align: center; width: 30px;">SL</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(order.items || []).map((item) => `
                      <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="row" style="margin-top: 5px;">
                <div style="width: 65%; font-size: 10px;">
                  <p><strong>Ghi chú:</strong> ${order.customerInfo?.note || 'Không'}</p>
                </div>
                <div style="width: 30%; text-align: right; font-size: 10px;">
                  <p><strong>KL:</strong> 500g</p>
                </div>
              </div>

              <div class="footer-note">
                ** Chỉ dẫn giao hàng: Cho xem hàng, không thử. Quay video khi mở kiện. **
              </div>
            </div>
          </div>
          `).join('')}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
  };

  const generateInvoiceHtml = (ordersToPrint: any[]) => {
    return `
      <html>
        <head>
          <title>In Hóa Đơn (${ordersToPrint.length} đơn)</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; width: 80mm; }
            .page { width: 80mm; padding: 5mm; box-sizing: border-box; page-break-after: always; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .header h1 { font-size: 16px; margin: 0 0 5px 0; }
            .header p { margin: 0; font-size: 12px; }
            .info-section { font-size: 12px; margin-bottom: 10px; }
            .info-box { margin-bottom: 8px; }
            h3 { font-size: 13px; margin: 0 0 3px 0; border-bottom: 1px solid #eee; padding-bottom: 2px; }
            p { margin: 0 0 3px 0; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
            th { border-bottom: 1px solid #000; padding: 4px 0; text-align: left; }
            td { padding: 4px 0; border-bottom: 1px dashed #eee; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary { border-top: 1px solid #000; padding-top: 5px; font-size: 12px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .total { font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; }
            .footer { text-align: center; font-size: 11px; margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          ${ordersToPrint.map(order => `
          <div class="page">
            <div class="header">
              <h1>DS TIÊN COSMETICS</h1>
              <p>HÓA ĐƠN MUA HÀNG</p>
              <p>Mã đơn: #${order.id.toUpperCase()}</p>
            </div>
            
            <div class="info-section">
              <div class="info-box">
                <h3>Khách hàng</h3>
                <p><strong>Tên:</strong> ${maskName(order.customerInfo?.name) || ''}</p>
                <p><strong>ĐT:</strong> ${maskPhone(order.customerInfo?.phone) || ''}</p>
                <p><strong>Đ/c:</strong> ${maskAddress(order.customerInfo?.address) || ''}</p>
              </div>
              <div class="info-box">
                <p><strong>Ngày:</strong> ${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('vi-VN') : ''}</p>
                <p><strong>TT:</strong> ${order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>SP</th>
                  <th class="text-center">SL</th>
                  <th class="text-right">Đ.Giá</th>
                  <th class="text-right">T.Tiền</th>
                </tr>
              </thead>
              <tbody>
                ${(order.items || []).map((item) => `
                  <tr>
                    <td>${item.name.substring(0, 15)}${item.name.length > 15 ? '...' : ''}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatPrice(parsePrice(item.newPrice || item.price || 0))}</td>
                    <td class="text-right">${formatPrice(parsePrice(item.newPrice || item.price || 0) * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            
            <div class="summary">
              <div class="summary-row">
                <span>Tạm tính:</span>
                <span>${formatPrice(parsePrice(order.totalAmount || order.totalPrice || 0))}</span>
              </div>
              ${parsePrice(order.shippingFee || 0) > 0 ? `
              <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <span>${formatPrice(parsePrice(order.shippingFee))}</span>
              </div>
              ` : ''}
              ${parsePrice(order.discount || order.discountAmount || 0) > 0 ? `
              <div class="summary-row">
                <span>Giảm giá:</span>
                <span>-${formatPrice(parsePrice(order.discount || order.discountAmount || 0))}</span>
              </div>
              ` : ''}
              <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span>${formatPrice(parsePrice(order.finalTotal || order.totalAmount || order.totalPrice || 0))}</span>
              </div>
            </div>
            <div class="footer">
              Cảm ơn quý khách!<br/>Chúc quý khách một ngày tốt lành.
            </div>
          </div>
          `).join('')}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
  };

  const handlePrintBulkWaybills = () => {
    const ordersToPrint = orders.filter(o => selectedOrderIds.includes(o.id));
    if (ordersToPrint.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return console.error("Trình duyệt chặn popup.");
    printWindow.document.write(generateWaybillHtml(ordersToPrint));
    printWindow.document.close();
  };

  const handlePrintBulkInvoices = () => {
    const ordersToPrint = orders.filter(o => selectedOrderIds.includes(o.id));
    if (ordersToPrint.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return console.error("Trình duyệt chặn popup.");
    printWindow.document.write(generateInvoiceHtml(ordersToPrint));
    printWindow.document.close();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ords);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return;
    
    const statusLabels: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang giao hàng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };



    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      await fetchOrders();
      
      // Update selectedOrder if modal is open
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      console.error("Có lỗi xảy ra khi cập nhật đơn hàng.");
    } finally {
      setUpdating(false);
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không rõ';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'processing': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const handlePrintWaybill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return console.error("Trình duyệt chặn popup.");
    printWindow.document.write(generateWaybillHtml([selectedOrder]));
    printWindow.document.close();
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return console.error("Trình duyệt chặn popup.");
    printWindow.document.write(generateInvoiceHtml([selectedOrder]));
    printWindow.document.close();
  };

  // Filter and pagination logic
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchId = order.id?.toLowerCase().includes(query);
      const matchName = order.customerInfo?.name?.toLowerCase().includes(query);
      const matchPhone = order.customerInfo?.phone?.includes(query);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    
    // Date filter
    if (dateFilter !== 'all' && order.createdAt) {
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'this_week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        if (orderDate < startOfWeek) return false;
      } else if (dateFilter === 'this_month') {
        if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchQuery]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#4A2C2C]">Quản lý đơn hàng</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên, sđt..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4B5C6]"
            >
              <option value="all">Mọi thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="this_week">Tuần này</option>
              <option value="this_month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          
            <>
            {selectedOrderIds.length > 0 && (
              <div className="bg-[#FCE8ED] p-3 md:p-4 mb-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-[#F4B5C6]/30">
                <div className="text-sm font-bold text-[#4A2C2C]">
                  Đã chọn {selectedOrderIds.length} đơn hàng
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleBulkApprove} className="px-4 py-2 bg-white text-gray-700 hover:text-blue-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Xác nhận
                  </button>
                  <button onClick={handleBulkComplete} className="px-4 py-2 bg-white text-gray-700 hover:text-green-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Hoàn thành
                  </button>
                  <button onClick={handleBulkCancel} className="px-4 py-2 bg-white text-gray-700 hover:text-red-600 font-medium text-sm rounded-lg shadow-sm border border-gray-200 transition-colors">
                    <X className="w-4 h-4 inline-block mr-1" /> Hủy
                  </button>
                  <button onClick={handlePrintBulkWaybills} className="px-4 py-2 bg-[#F4B5C6] text-white hover:bg-[#4A2C2C] font-medium text-sm rounded-lg shadow-sm transition-colors">
                    <Package className="w-4 h-4 inline-block mr-1" /> In Vận đơn (A6)
                  </button>
                  <button onClick={handlePrintBulkInvoices} className="px-4 py-2 bg-white text-gray-700 font-medium text-sm rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Printer className="w-4 h-4 inline-block mr-1" /> In Hóa đơn (80mm)
                  </button>
                </div>
              </div>
            )}
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-sm font-medium text-gray-500 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#F4B5C6] rounded border-gray-300 focus:ring-[#F4B5C6]"
                    checked={currentOrders.length > 0 && selectedOrderIds.length === currentOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrderIds(currentOrders.map(o => o.id));
                      else setSelectedOrderIds([]);
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Mã đơn hàng</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Thanh toán</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Ngày đặt</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500">Chưa có đơn hàng nào</td></tr>
              ) : (
                currentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`border-b border-gray-100 transition-colors cursor-pointer ${selectedOrderIds.includes(order.id) ? 'bg-[#FCE8ED]/30' : 'hover:bg-gray-50'}`}
                    onClick={() => openOrderDetails(order)}
                  >
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#F4B5C6] rounded border-gray-300 focus:ring-[#F4B5C6]"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                          else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#4A2C2C]" title={order.id}>
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{order.customerInfo?.name || 'Khách vãng lai'}</div>
                      <div className="text-xs text-gray-500">{order.customerInfo?.phone || ''}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentMethod === 'bank' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-[#F4B5C6]">{formatPrice(order.finalTotal || order.totalAmount || 0)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border inline-block ${getStatusBadge(order.status || 'pending')}`}>
                        {getStatusLabel(order.status || 'pending')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(order);
                          }}
                          className="p-2 text-gray-400 hover:text-[#F4B5C6] bg-white hover:bg-[#FCE8ED] rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> trong số <span className="font-medium">{filteredOrders.length}</span> đơn hàng
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page 
                      ? 'bg-[#F4B5C6] text-[#4A2C2C]' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-xl font-bold text-[#4A2C2C]">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500">#{selectedOrder.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Items & Summary */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Status Card */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {getStatusIcon(selectedOrder.status || 'pending')}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trạng thái hiện tại</p>
                        <p className="font-bold text-lg text-[#4A2C2C]">{getStatusLabel(selectedOrder.status || 'pending')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {(!selectedOrder.status || selectedOrder.status === 'pending') ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                          Xác nhận đơn trước khi in
                        </span>
                      ) : (
                        <>
                          <button 
                            onClick={handlePrintWaybill}
                            className="flex items-center justify-center gap-2 bg-[#F4B5C6] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#4A2C2C] transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            In vận đơn
                          </button>
                          <button 
                            onClick={handlePrintInvoice}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                            In hóa đơn
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                      <p className="text-sm font-bold text-red-800 mb-1">Lý do hủy đơn:</p>
                      <p className="text-sm text-red-600">{selectedOrder.cancelReason}</p>
                    </div>
                  )}
                  {/* Action Steps */}
                  <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                    {(!selectedOrder.status || selectedOrder.status === 'pending') && (
                      <>
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'processing', 'pending')}
                          disabled={updating}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Xác nhận & Giao hàng
                        </button>
                        <button 
                          onClick={() => handleCancelInitiate(selectedOrder.id)}
                          disabled={updating}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <>
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'completed', 'processing')}
                          disabled={updating}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Hoàn thành đơn
                        </button>
                        <button 
                          onClick={() => handleCancelInitiate(selectedOrder.id)}
                          disabled={updating}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                      <p className="text-sm text-gray-500 italic">Đơn hàng đã kết thúc quy trình xử lý.</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h4 className="font-bold text-[#4A2C2C] flex items-center gap-2">
                      <Package className="w-4 h-4" /> Sản phẩm ({selectedOrder.items?.length || 0})
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 flex gap-4 items-center">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 line-clamp-2 text-sm">{item.name}</h5>
                          <p className="text-gray-500 text-sm mt-1">{formatPrice(parsePrice(item.newPrice || item.price))} x {item.quantity}</p>
                        </div>
                        <div className="font-bold text-[#4A2C2C]">
                          {formatPrice(parsePrice(item.newPrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tạm tính</span>
                    <span>{formatPrice((selectedOrder.totalAmount || selectedOrder.totalPrice) || 0)}</span>
                  </div>
                  {(selectedOrder.discount || selectedOrder.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Giảm giá</span>
                      <span>-{formatPrice((selectedOrder.discount || selectedOrder.discountAmount || 0))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg">
                    <span className="text-[#4A2C2C]">Tổng cộng</span>
                    <span className="text-[#F4B5C6]">{formatPrice(selectedOrder.finalTotal || (selectedOrder.totalAmount || selectedOrder.totalPrice) || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Info */}
              <div className="space-y-6">
                
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h4 className="font-bold text-[#4A2C2C] flex items-center gap-2">
                      <User className="w-4 h-4" /> Khách hàng
                    </h4>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedOrder.customerInfo?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-700">{selectedOrder.customerInfo?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-700 leading-relaxed">{selectedOrder.customerInfo?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h4 className="font-bold text-[#4A2C2C] flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Thông tin bổ sung
                    </h4>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {selectedOrder.paymentMethod === 'bank' ? (
                          <><span className="w-2 h-2 rounded-full bg-blue-500"></span> Chuyển khoản ngân hàng</>
                        ) : (
                          <><span className="w-2 h-2 rounded-full bg-gray-500"></span> Thanh toán khi nhận hàng (COD)</>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày đặt hàng</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleString('vi-VN') : 'Không rõ'}
                      </p>
                    </div>
                    {selectedOrder.customerInfo?.note && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ghi chú của khách</p>
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm border border-yellow-100">
                          {selectedOrder.customerInfo.note}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-red-600">Lý do hủy đơn</h3>
              <button onClick={() => setCancelModalOpen(false)} className="text-gray-400 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Vui lòng cung cấp lý do hủy {isBulkCancel ? `${selectedOrderIds.length} đơn hàng` : 'đơn hàng này'}. 
                Điều này giúp lưu trữ lịch sử xử lý tốt hơn.
              </p>
              <textarea
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4B5C6] focus:border-transparent resize-none text-sm"
                rows={4}
                placeholder="Ví dụ: Khách đổi ý, Hết hàng, Sai thông tin..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={confirmCancel}
                disabled={!cancelReason.trim() || updating}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? 'Đang xử lý...' : 'Xác nhận Hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

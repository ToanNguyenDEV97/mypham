import { Clock, Truck, CheckCircle2, XCircle, Package } from 'lucide-react';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'processing': return 'Đang giao';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return 'Không rõ';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
    case 'processing': return <Truck className="w-5 h-5 text-blue-500" />;
    case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <Package className="w-5 h-5 text-gray-500" />;
  }
};

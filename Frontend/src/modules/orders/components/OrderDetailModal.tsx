import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Order, OrderStatus } from '../../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Phone, MapPin, CreditCard, ShoppingBag, Eye, User, Calendar } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onOpenReceipt: (url: string) => void;
  isPending?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onOpenReceipt,
  isPending = false,
}) => {
  if (!order) return null;

  const formatMoney = (amount: number | string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(amount)) + " so'm";
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Buyurtma #${order.orderNumber}`}
      subtitle={`Yaratilgan sana: ${formatDate(order.createdAt)}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Status & Customer Overview Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-dinora-bg rounded-2xl border border-dinora-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-dinora-gold/20 text-dinora-chocolate font-bold flex items-center justify-center border border-dinora-gold/40">
              <User className="w-5 h-5 text-dinora-chocolate" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dinora-chocolate">
                {order.user?.firstName} {order.user?.lastName || ''}
              </h4>
              <a
                href={`tel:${order.user?.phone}`}
                className="text-xs font-semibold text-dinora-gold hover:underline flex items-center gap-1 mt-0.5"
              >
                <Phone className="w-3 h-3" />
                <span>{order.user?.phone || 'Telefon biriktirilmagan'}</span>
              </a>
            </div>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* Address & Payment Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-dinora-border bg-white space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-dinora-gold" />
              <span>Yetkazib berish manzili</span>
            </span>
            <p className="text-xs font-semibold text-dinora-chocolate">
              {order.deliveryAddress || 'O\'zi olib ketadi (Pickup)'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-dinora-border bg-white space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-dinora-gold" />
              <span>To'lov usuli va chek</span>
            </span>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-dinora-chocolate">
                {order.paymentMode === 'CARD_TRANSFER' ? 'Karta orqali' : 'Naqd pul'}
              </p>

              {order.paymentReceiptUrl && (
                <button
                  onClick={() => onOpenReceipt(order.paymentReceiptUrl!)}
                  className="text-xs font-bold text-dinora-gold hover:text-dinora-chocolate flex items-center gap-1 underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chekni ko'rish</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-dinora-chocolate flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-dinora-gold" />
            <span>Buyurtma qilingan shirinliklar</span>
          </h5>

          <div className="rounded-xl border border-dinora-border overflow-hidden">
            <table className="w-full text-left text-xs text-dinora-chocolate">
              <thead className="bg-dinora-bg font-semibold uppercase tracking-wider border-b border-dinora-border">
                <tr>
                  <th className="px-4 py-2.5">Mahsulot</th>
                  <th className="px-4 py-2.5 text-center">Soni</th>
                  <th className="px-4 py-2.5 text-right">Narxi</th>
                  <th className="px-4 py-2.5 text-right">Jami</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dinora-border/60">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold">{item.productName}</td>
                    <td className="px-4 py-3 text-center font-bold">{item.quantity}x</td>
                    <td className="px-4 py-3 text-right">{formatMoney(item.price)}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatMoney(Number(item.price) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-dinora-bg/80 font-bold border-t border-dinora-border">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-serif text-sm">
                    Umumiy Summa:
                  </td>
                  <td className="px-4 py-3 text-right font-serif text-base text-dinora-chocolate">
                    {formatMoney(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Customer Notes */}
        {order.notes && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong className="block font-bold">Mijoz izohi:</strong>
            <span>"{order.notes}"</span>
          </div>
        )}

        {/* Action Controls for Status Updating */}
        <div className="pt-4 border-t border-dinora-border flex flex-wrap items-center justify-end gap-2">
          {(order.status === OrderStatus.PENDING_APPROVAL ||
            (order.status as any) === 'AWAITING_RECEIPT' ||
            (order.status as any) === 'RECEIPT_SUBMITTED') && (
            <>
              <Button
                variant="danger"
                size="sm"
                isLoading={isPending}
                onClick={() => onUpdateStatus(order.id, OrderStatus.REJECTED)}
              >
                ❌ Rad etish
              </Button>
              <Button
                variant="gold"
                size="sm"
                isLoading={isPending}
                onClick={() => onUpdateStatus(order.id, OrderStatus.APPROVED)}
              >
                ✅ Tasdiqlash
              </Button>
            </>
          )}

          {order.status === OrderStatus.APPROVED && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isPending}
              onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERING)}
            >
              🚚 Yetkazishga berish
            </Button>
          )}

          {order.status === OrderStatus.DELIVERING && (
            <Button
              variant="gold"
              size="sm"
              isLoading={isPending}
              onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
            >
              🎉 Yetkazib berildi
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
    </Modal>
  );
};

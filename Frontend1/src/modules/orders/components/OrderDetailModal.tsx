import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Order, OrderStatus } from '../../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Phone, MapPin, CreditCard, ShoppingBag, Eye, User, Calendar, Archive } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onToggleArchive?: (id: string, isArchived: boolean) => void;
  onOpenReceipt: (url: string) => void;
  isPending?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onToggleArchive,
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
          <div className="p-4 rounded-xl border border-dinora-border bg-white space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-dinora-gold" />
              <span>Yetkazib berish manzili</span>
            </span>
            <p className="text-xs font-semibold text-dinora-chocolate">
              {order.deliveryAddress || 'O\'zi olib ketadi (Pickup)'}
            </p>

            {order.latitude && order.longitude && (
              <div className="pt-2 border-t border-dinora-border/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700">
                  📍 GPS: {order.latitude.toFixed(4)}, {order.longitude.toFixed(4)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Xaritada ochish</span>
                </a>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-dinora-border bg-white space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dinora-gray flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-dinora-gold" />
              <span>To'lov usuli va chek</span>
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-dinora-chocolate">
                  {order.paymentMode === 'CARD_TRANSFER' ? 'Karta o\'tkazmasi (To\'lov cheki yuklangan)' : 'Naqd pul'}
                </p>

                {order.paymentReceiptUrl && (
                  <button
                    onClick={() => onOpenReceipt(order.paymentReceiptUrl!)}
                    className="text-xs font-bold text-dinora-gold hover:text-dinora-chocolate flex items-center gap-1 underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Kattalashtirish</span>
                  </button>
                )}
              </div>

              {order.paymentReceiptUrl && (
                <div
                  onClick={() => onOpenReceipt(order.paymentReceiptUrl!)}
                  className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dinora-gold/40 hover:border-dinora-gold transition-all max-h-48 bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src={getImageUrl(order.paymentReceiptUrl)}
                    alt="To'lov cheki"
                    className="w-full object-cover max-h-48 rounded-lg group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>Chekni to'liq ko'rish</span>
                  </div>
                </div>
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
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl((item as any).imageUrl || (item as any).product?.imageUrl)}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-xl border border-dinora-border/60 bg-gray-50 shrink-0 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-cake.png';
                          }}
                        />
                        <span className="truncate">{item.productName}</span>
                      </div>
                    </td>
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

        {/* Customer Rating & Feedback */}
        {(order as any).rating && (
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <span>⭐ Mijoz bahosi:</span>
                <span className="text-amber-600 font-extrabold text-sm">
                  {'⭐'.repeat((order as any).rating)} ({(order as any).rating}/5)
                </span>
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Mijoz tomonidan baholandi
              </span>
            </div>
            {(order as any).review && (
              <p className="text-[11px] text-amber-900 italic pt-1 border-t border-amber-200">
                💬 "{(order as any).review}"
              </p>
            )}
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

          {order.status === OrderStatus.APPROVED && (order.deliveryType as any) === 'PICKUP' && (
            <Button
              variant="gold"
              size="sm"
              isLoading={isPending}
              onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
            >
              🎉 Bajarildi (Olib ketishga tayyor)
            </Button>
          )}

          {order.status === OrderStatus.APPROVED && (order.deliveryType as any) !== 'PICKUP' && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isPending}
              onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERING)}
            >
              🚚 Yo'lga chiqarish
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
          
          {onToggleArchive && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isPending}
              onClick={() => onToggleArchive(order.id, !order.isArchived)}
            >
              <Archive className="w-4 h-4 mr-1" />
              {order.isArchived ? "Arxivdan chiqarish" : "Arxivlash"}
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

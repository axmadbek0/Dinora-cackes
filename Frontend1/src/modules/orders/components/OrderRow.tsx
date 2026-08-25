import React from 'react';
import { TableRow, TableCell } from '../../../components/ui/Table';
import { Order, OrderStatus } from '../../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Button } from '../../../components/ui/Button';
import { Eye, Phone, MapPin, Archive, ArchiveRestore } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';

interface OrderRowProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onToggleArchive?: (id: string, isArchived: boolean) => void;
  isPendingStatus?: boolean;
  mobileOnlyBadge?: boolean;
  mobileOnlyActions?: boolean;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onViewDetails,
  onUpdateStatus,
  onToggleArchive,
  isPendingStatus = false,
  mobileOnlyBadge = false,
  mobileOnlyActions = false,
}) => {
  const formatMoney = (amount: number | string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(amount)) + " so'm";
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (mobileOnlyBadge) {
    return <OrderStatusBadge status={order.status} />;
  }

  const isPickup = (order.deliveryType as any) === 'PICKUP';
  const firstItemImg = order.items?.[0]?.imageUrl || order.items?.[0]?.product?.imageUrl;

  const actionButtons = (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {(order.status === OrderStatus.PENDING_APPROVAL ||
        (order.status as any) === 'AWAITING_RECEIPT' ||
        (order.status as any) === 'RECEIPT_SUBMITTED') && (
        <>
          <Button
            variant="gold"
            size="sm"
            isLoading={isPendingStatus}
            onClick={() => onUpdateStatus(order.id, OrderStatus.APPROVED)}
          >
            ✅ Tasdiqlash
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isPendingStatus}
            onClick={() => onUpdateStatus(order.id, OrderStatus.REJECTED)}
          >
            ❌ Rad etish
          </Button>
        </>
      )}

      {order.status === OrderStatus.APPROVED && isPickup && (
        <Button
          variant="gold"
          size="sm"
          isLoading={isPendingStatus}
          onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
        >
          🎉 Bajarildi
        </Button>
      )}

      {order.status === OrderStatus.APPROVED && !isPickup && (
        <Button
          variant="secondary"
          size="sm"
          isLoading={isPendingStatus}
          onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERING)}
        >
          🚚 Yo'lga chiqarish
        </Button>
      )}

      {order.status === OrderStatus.DELIVERING && (
        <Button
          variant="gold"
          size="sm"
          isLoading={isPendingStatus}
          onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
        >
          🎉 Bajarildi
        </Button>
      )}

      {/* Archive / Unarchive Button */}
      {onToggleArchive && (
        <Button
          variant="ghost"
          size="sm"
          className="text-dinora-gray hover:text-dinora-chocolate hover:bg-dinora-gold-light/40"
          onClick={() => onToggleArchive(order.id, !order.isArchived)}
          title={order.isArchived ? "Arxivdan chiqarish" : "Arxivga o'tkazish"}
        >
          {order.isArchived ? (
            <>
              <ArchiveRestore className="w-3.5 h-3.5 mr-1 text-dinora-gold" />
              <span>Chiqarish</span>
            </>
          ) : (
            <>
              <Archive className="w-3.5 h-3.5 mr-1" />
              <span>Arxiv</span>
            </>
          )}
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        icon={<Eye className="w-4 h-4" />}
        onClick={() => onViewDetails(order)}
      >
        Batafsil
      </Button>
    </div>
  );

  if (mobileOnlyActions) {
    return actionButtons;
  }

  return (
    <TableRow>
      {/* Order Number & Time */}
      <TableCell className="font-bold text-dinora-chocolate">
        <div>
          <span className="text-sm font-serif">#{order.orderNumber}</span>
          <span className="block text-[10px] text-dinora-gray font-sans font-normal">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </TableCell>

      {/* Customer Info */}
      <TableCell>
        <div>
          <span className="font-bold block text-sm text-dinora-chocolate">
            {order.user?.firstName} {order.user?.lastName || ''}
          </span>
          <a
            href={`tel:${order.user?.phone}`}
            className="text-xs text-dinora-gold font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
          >
            <Phone className="w-3 h-3" />
            <span>{order.user?.phone || 'Biriktirilmagan'}</span>
          </a>
        </div>
      </TableCell>

      {/* Items Summary with Product Thumbnail */}
      <TableCell>
        <div className="flex items-center gap-2.5 max-w-xs">
          <img
            src={getImageUrl(firstItemImg)}
            alt="Mahsulot rasmi"
            className="w-10 h-10 object-cover rounded-xl border border-dinora-border/60 bg-gray-50 shrink-0 shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-cake.png';
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate text-dinora-chocolate">
              {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
            </p>
            <div className="text-[10px] text-dinora-gray flex items-center justify-between gap-1 mt-0.5">
              <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-dinora-gold shrink-0" />
                <span className="truncate">{order.deliveryAddress || "O'zi olib ketadi"}</span>
              </div>
              {order.latitude && order.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:underline shrink-0"
                  title="GPS Lokatsiyani xaritada ochish"
                  onClick={(e) => e.stopPropagation()}
                >
                  📍 GPS
                </a>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Total Amount */}
      <TableCell className="font-serif font-extrabold text-base text-dinora-chocolate">
        {formatMoney(order.totalAmount)}
      </TableCell>

      {/* Status Badge */}
      <TableCell>
        <div className="space-y-1">
          <OrderStatusBadge status={order.status} />
          {order.isArchived && (
            <span className="inline-block text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300 font-bold">
              📁 Arxivlangan
            </span>
          )}
        </div>
      </TableCell>

      {/* Action Buttons */}
      <TableCell>{actionButtons}</TableCell>
    </TableRow>
  );
};


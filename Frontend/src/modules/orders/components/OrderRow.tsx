import React from 'react';
import { TableRow, TableCell } from '../../../components/ui/Table';
import { Order, OrderStatus } from '../../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Button } from '../../../components/ui/Button';
import { Eye, Phone, MapPin } from 'lucide-react';

interface OrderRowProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  isPendingStatus?: boolean;
  mobileOnlyBadge?: boolean;
  mobileOnlyActions?: boolean;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onViewDetails,
  onUpdateStatus,
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

  const actionButtons = (
    <div className="flex items-center gap-2">
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
          🎉 Bajarildi (Olib ketishga tayyor)
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

      {/* Items Summary */}
      <TableCell>
        <div className="max-w-xs">
          <p className="text-xs font-semibold truncate text-dinora-chocolate">
            {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
          </p>
          <p className="text-[10px] text-dinora-gray flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-dinora-gold shrink-0" />
            <span className="truncate">{order.deliveryAddress || "O'zi olib ketadi"}</span>
          </p>
        </div>
      </TableCell>

      {/* Total Amount */}
      <TableCell className="font-serif font-extrabold text-base text-dinora-chocolate">
        {formatMoney(order.totalAmount)}
      </TableCell>

      {/* Status Badge */}
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>

      {/* Action Buttons */}
      <TableCell>{actionButtons}</TableCell>
    </TableRow>
  );
};


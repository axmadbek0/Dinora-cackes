import React from 'react';
import { OrderStatus } from '../../../types/order.types';
import { Badge } from '../../../components/ui/Badge';
import { Clock, CheckCircle2, Truck, CheckCheck, XCircle, UtensilsCrossed } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<
    OrderStatus,
    { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'gold' | 'default'; icon: React.ReactNode }
  > = {
    [OrderStatus.PENDING_APPROVAL]: {
      label: 'Kutilmoqda',
      variant: 'warning',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    [OrderStatus.APPROVED]: {
      label: 'Tasdiqlandi',
      variant: 'info',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    [OrderStatus.PREPARING]: {
      label: 'Tayyorlanmoqda',
      variant: 'gold',
      icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
    },
    [OrderStatus.DELIVERING]: {
      label: 'Yo\'lda (Yetkazilmoqda)',
      variant: 'info',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    [OrderStatus.COMPLETED]: {
      label: 'Bajarildi',
      variant: 'success',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
    },
    [OrderStatus.REJECTED]: {
      label: 'Rad etildi',
      variant: 'danger',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    [OrderStatus.CANCELLED]: {
      label: 'Bekor qilindi',
      variant: 'danger',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: 'default',
    icon: <Clock className="w-3.5 h-3.5" />,
  };

  return (
    <Badge variant={config.variant} icon={config.icon}>
      {config.label}
    </Badge>
  );
};

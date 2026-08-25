import React, { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from './hooks/useOrders';
import { OrderRow } from './components/OrderRow';
import { OrderDetailModal } from './components/OrderDetailModal';
import { LightboxModal } from '../../components/ui/LightboxModal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Order, OrderStatus } from '../../types/order.types';
import { Search, Loader2, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';

export const OrdersPage: React.FC = () => {
  const [activeTabStatus, setActiveTabStatus] = useState<OrderStatus | 'ALL' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useOrders({
    status: activeTabStatus === 'ALL' ? undefined : (activeTabStatus as any),
    search: search || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ id, dto: { status } });
  };

  const handleToggleArchive = (id: string, isArchived: boolean) => {
    updateStatusMutation.mutate({ id, dto: { isArchived } });
  };

  const tabs: { id: OrderStatus | 'ALL' | 'ARCHIVED'; label: string }[] = [
    { id: 'ALL', label: 'Barchasi' },
    { id: OrderStatus.PENDING_APPROVAL, label: '⏳ Kutilayotgan' },
    { id: OrderStatus.APPROVED, label: '✅ Tasdiqlangan' },
    { id: OrderStatus.DELIVERING, label: '🚚 Yo\'lda' },
    { id: OrderStatus.COMPLETED, label: '🎉 Bajarilgan' },
    { id: OrderStatus.CANCELLED, label: '❌ Bekor qilingan' },
    { id: 'ARCHIVED', label: '📁 Arxiv' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-dinora-border shadow-dinora flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <Input
            placeholder="Buyurtma raqami, mijoz ismi yoki telefon bo'yicha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTabStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabStatus(tab.id)}
              className={clsx(
                'px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shadow-sm',
                isActive
                  ? 'bg-dinora-chocolate text-white shadow-md'
                  : 'bg-white text-dinora-chocolate border border-dinora-border hover:bg-dinora-gold-light/40'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
          <p className="text-sm font-medium text-dinora-chocolate">Buyurtmalar ro'yxati yuklanmoqda...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-dinora-border shadow-dinora max-w-md mx-auto my-8">
          <ShoppingBag className="w-16 h-16 text-dinora-gray/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dinora-chocolate font-serif">Buyurtmalar topilmadi</h3>
          <p className="text-xs text-dinora-gray mt-1">
            Ushbu bo'limda mos keluvchi buyurtma mavjud emas.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards View (Visible on Mobile/Tablet < md) */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-2xl border border-dinora-border shadow-dinora space-y-3 transition-all hover:shadow-md"
              >
                {/* Header: Order Number, Time & Status Badge */}
                <div className="flex items-center justify-between border-b border-dinora-border/60 pb-2.5">
                  <div>
                    <span className="text-base font-bold font-serif text-dinora-chocolate">
                      #{order.orderNumber}
                    </span>
                    <span className="block text-[10px] text-dinora-gray">
                      {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="scale-90 origin-right">
                    {/* Badge */}
                    <OrderRow
                      order={order}
                      onViewDetails={setSelectedOrder}
                      onUpdateStatus={handleUpdateStatus}
                      isPendingStatus={updateStatusMutation.isPending}
                      mobileOnlyBadge
                    />
                  </div>
                </div>

                {/* Body: Customer Name, Phone & Address */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-dinora-chocolate">
                      {order.user?.firstName} {order.user?.lastName || ''}
                    </span>
                    {order.user?.phone && (
                      <a
                        href={`tel:${order.user.phone}`}
                        className="text-dinora-gold font-semibold hover:underline"
                      >
                        {order.user.phone}
                      </a>
                    )}
                  </div>
                  <p className="text-dinora-gray line-clamp-1 text-[11px]">
                    {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-dinora-gray">Jami Summa:</span>
                    <span className="font-serif font-extrabold text-sm text-dinora-chocolate">
                      {new Intl.NumberFormat('uz-UZ').format(Number(order.totalAmount))} so'm
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-dinora-border/60 flex items-center justify-end gap-2">
                  <OrderRow
                    order={order}
                    onViewDetails={setSelectedOrder}
                    onUpdateStatus={handleUpdateStatus}
                    onToggleArchive={handleToggleArchive}
                    isPendingStatus={updateStatusMutation.isPending}
                    mobileOnlyActions
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop Table View (Visible on Desktop >= md) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raqam & Vaqt</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Tarkib & Manzil</TableHead>
                  <TableHead>Jami Summa</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onViewDetails={setSelectedOrder}
                    onUpdateStatus={handleUpdateStatus}
                    onToggleArchive={handleToggleArchive}
                    isPendingStatus={updateStatusMutation.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateStatus={(id, status) => {
          handleUpdateStatus(id, status);
          setSelectedOrder(null);
        }}
        onToggleArchive={(id, isArchived) => {
          handleToggleArchive(id, isArchived);
          setSelectedOrder(null);
        }}
        onOpenReceipt={(url) => setLightboxImage(url)}
        isPending={updateStatusMutation.isPending}
      />

      {/* Payment Receipt Lightbox */}
      <LightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage}
        title="To'lov Cheki / Kvitansiya"
      />
    </div>
  );
};


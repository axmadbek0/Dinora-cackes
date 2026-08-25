import React, { useState } from 'react';
import { useUsers, useUpdateUserRole, useDeleteUser, UserItem } from './hooks/useUsers';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Search, Loader2, Users, Trash2, Phone, ShoppingBag, Send } from 'lucide-react';
import { clsx } from 'clsx';

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useUsers({
    search: search || undefined,
  });

  const deleteUserMutation = useDeleteUser();

  const handleDeleteUser = (user: UserItem) => {
    if (confirm(`${user.firstName} mijozini va uning barcha tarixiy ma'lumotlarini ro'yxatdan o'chirmoqchimisiz?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('uz-UZ').format(num) + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-dinora-border shadow-dinora flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-dinora-gold-light text-dinora-chocolate border border-dinora-gold/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-dinora-chocolate">
              👥 Mijozlar Boshqaruvi
            </h3>
            <p className="text-xs text-dinora-gray mt-0.5">
              Do'kon mijozlari ro'yxati, ularning buyurtmalari soni va jami xaridlari statistikasi.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <Input
            placeholder="Ism, tel yoki username bo'yicha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* User Table / Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
          <p className="text-sm font-medium text-dinora-chocolate">Mijozlar ro'yxati yuklanmoqda...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dinora-border shadow-dinora max-w-md mx-auto my-8 space-y-2">
          <Users className="w-12 h-12 text-dinora-gray/40 mx-auto" />
          <h4 className="text-base font-bold text-dinora-chocolate">Mijozlar topilmadi</h4>
          <p className="text-xs text-dinora-gray">
            Ushbu qidiruv bo'yicha hech qanday mijoz mavjud emas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dinora-border shadow-dinora overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mijoz</TableHead>
                <TableHead>Telefon & Telegram</TableHead>
                <TableHead className="text-center">Buyurtmalar Soni</TableHead>
                <TableHead className="text-right">Jami Xarid Summasi</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  {/* User Avatar & Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dinora-gold/20 text-dinora-chocolate font-bold text-base flex items-center justify-center border border-dinora-gold/40 shrink-0">
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-dinora-chocolate block">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-[11px] text-dinora-gray block">
                          Ro'yxatdan o'tdi: {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Phone & Telegram */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <a
                        href={`tel:${user.phone}`}
                        className="text-xs font-bold text-dinora-gold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{user.phone}</span>
                      </a>
                      {user.username && (
                        <a
                          href={`https://t.me/${user.username.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-dinora-gray hover:text-dinora-pink flex items-center gap-1"
                        >
                          <Send className="w-3 h-3 text-sky-500" />
                          <span>@{user.username.replace('@', '')}</span>
                        </a>
                      )}
                    </div>
                  </TableCell>

                  {/* Orders Count */}
                  <TableCell className="text-center font-extrabold text-dinora-chocolate">
                    <div className="inline-flex items-center gap-1 bg-dinora-bg px-2.5 py-1 rounded-xl border border-dinora-border">
                      <ShoppingBag className="w-3.5 h-3.5 text-dinora-gold" />
                      <span>{user.ordersCount} ta</span>
                    </div>
                  </TableCell>

                  {/* Total Spent */}
                  <TableCell className="text-right font-serif font-extrabold text-sm text-dinora-chocolate">
                    {formatMoney(user.totalSpent)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        isLoading={deleteUserMutation.isPending}
                        onClick={() => handleDeleteUser(user)}
                        title="Mijozni o'chirish"
                      >
                        <Trash2 className="w-4 h-4 mr-1 text-red-500" />
                        <span>O'chirish</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

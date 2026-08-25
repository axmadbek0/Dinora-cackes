import React, { useState } from 'react';
import { useBlockedDates, useBlockDate, useUnblockDate } from '../hooks/useBlockedDates';
import { VisualMonthCalendar } from './VisualMonthCalendar';
import { Calendar as CalendarIcon, Lock, Unlock, Trash2, Plus, Info, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const BlockedDatesCalendar: React.FC = () => {
  const { data: blockedDates = [], isLoading } = useBlockedDates();
  const blockMutation = useBlockDate();
  const unblockMutation = useUnblockDate();

  const [mode, setMode] = useState<'SINGLE' | 'RANGE'>('SINGLE');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');

  const blockedSet = new Set(blockedDates.map((b) => b.date));

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'SINGLE') {
      if (!selectedDate) return;
      await blockMutation.mutateAsync({
        date: selectedDate,
        reason: reason.trim() || 'Admin tomonidan band qilindi',
      });
    } else {
      if (!startDate || !endDate) return;
      await blockMutation.mutateAsync({
        startDate,
        endDate,
        reason: reason.trim() || 'Admin tomonidan band qilindi',
      });
    }
    setReason('');
  };

  const handleToggleDate = async (dateStr: string) => {
    if (blockedSet.has(dateStr)) {
      await unblockMutation.mutateAsync(dateStr);
    } else {
      await blockMutation.mutateAsync({
        date: dateStr,
        reason: 'Kalendardan tanlab band qilindi',
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-dinora-border shadow-dinora space-y-6">
      {/* Header */}
      <div className="border-b border-dinora-border/60 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-dinora-pink-light text-dinora-pink">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-dinora-chocolate font-serif">
              📅 Band Kunlar Kalendari va Boshqaruvi
            </h4>
            <p className="text-xs text-dinora-gray mt-0.5">
              Admin tomonidan band qilingan kunlarga web-sayt va botdan buyurtma berish taqiqlanadi.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-dinora-bg p-1 rounded-xl border border-dinora-border">
          <button
            type="button"
            onClick={() => setMode('SINGLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'SINGLE'
                ? 'bg-dinora-chocolate text-white shadow-sm'
                : 'text-dinora-chocolate hover:bg-white'
            }`}
          >
            Bitta Kun
          </button>
          <button
            type="button"
            onClick={() => setMode('RANGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'RANGE'
                ? 'bg-dinora-chocolate text-white shadow-sm'
                : 'text-dinora-chocolate hover:bg-white'
            }`}
          >
            Kunlar Oralig'i
          </button>
        </div>
      </div>

      {/* Visual Month Grid Calendar Picker */}
      <div className="flex justify-center my-4">
        <VisualMonthCalendar
          blockedDates={blockedDates}
          selectedDate={selectedDate}
          startDate={startDate}
          endDate={endDate}
          mode={mode}
          onSelectSingleDate={(d) => setSelectedDate(d)}
          onSelectDateRange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          onToggleBlockDate={handleToggleDate}
        />
      </div>

      {/* Active Blocked Dates List */}
      <div className="space-y-3">
        <h5 className="text-xs font-extrabold uppercase tracking-wider text-dinora-chocolate flex items-center gap-2">
          <span>Hozirda Band Qilingan Kunlar Ro'yxati</span>
          <span className="px-2 py-0.5 rounded-full bg-dinora-pink/10 text-dinora-pink text-[11px]">
            {blockedDates.length} ta
          </span>
        </h5>

        {isLoading ? (
          <p className="text-xs text-dinora-gray">Yuklanmoqda...</p>
        ) : blockedDates.length === 0 ? (
          <div className="p-6 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200/60">
            <Unlock className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-emerald-800">
              Hozircha hech qaysi sana band qilinmagan. Barcha kunlar ochiq!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {blockedDates.map((item) => (
              <div
                key={item.id || item.date}
                className="p-3 bg-[#FFF5F5] rounded-xl border border-dinora-pink/30 flex items-center justify-between shadow-sm group hover:border-dinora-pink transition-all"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-dinora-pink animate-pulse" />
                    <span className="font-mono font-extrabold text-sm text-dinora-chocolate">
                      {item.date}
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-[11px] text-dinora-gray truncate" title={item.reason}>
                      {item.reason}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleDate(item.date)}
                  disabled={unblockMutation.isPending}
                  title="Bandlikni bekor qilish (Unblock)"
                  className="p-2 text-dinora-gray hover:text-dinora-pink hover:bg-dinora-pink/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

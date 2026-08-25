import React, { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings, useClearAllData } from './hooks/useSettings';
import { BlockedDatesCalendar } from './components/BlockedDatesCalendar';
import { Button } from '../../components/ui/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import {
  Store,
  Loader2,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const clearAllDataMutation = useClearAllData();

  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_KEYWORD = 'TOZALASH';

  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    if (settings) {
      setIsStoreOpen(settings.isStoreOpen ?? true);
    }
  }, [settings]);

  const handleToggleStoreOpen = (open: boolean) => {
    setIsStoreOpen(open);
    updateSettingsMutation.mutate({
      isStoreOpen: open,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
        <p className="text-sm font-medium text-dinora-chocolate">Tizim sozlamalari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-8">
      {/* Top Banner Status Overview */}
      <div className="p-6 rounded-2xl bg-white border border-dinora-border shadow-dinora flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              isStoreOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-dinora-pink-light text-dinora-pink'
            }`}
          >
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-dinora-chocolate font-serif">
              Do'kon Ish Rejimi va Holati
            </h3>
            <p className="text-xs text-dinora-gray mt-0.5">
              {isStoreOpen
                ? "Do'kon ishlamoqda. Veb-sayt va Telegram bot orqali buyurtmalar qabul qilinmoqda."
                : "Do'kon vaqtincha yopiq. Yangi buyurtmalar qabul qilinmaydi."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch
            enabled={isStoreOpen}
            onChange={handleToggleStoreOpen}
            label={isStoreOpen ? "Do'kon Ochiq" : "Do'kon Yopiq"}
          />
        </div>
      </div>

      {/* Blocked Dates Calendar Management Section */}
      <BlockedDatesCalendar />

      {/* ========== XAVFLI ZONA: Ma'lumotlarni Tozalash ========== */}
      <div className="rounded-2xl border-2 border-dinora-pink/40 bg-dinora-pink-light/20 shadow-dinora overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-dinora-pink/10 border-b border-dinora-pink/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-dinora-pink/20 text-dinora-pink">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-dinora-pink uppercase tracking-wider">Xavfli Zona</h4>
            <p className="text-[11px] text-dinora-gray mt-0.5">Bu bo'limdagi amallar qaytarib bo'lmaydi</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-bold text-dinora-chocolate flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-dinora-pink" />
              Barcha Ma'lumotlarni Tozalash
            </h5>
            <p className="text-xs text-dinora-gray mt-1 max-w-md">
              Barcha buyurtmalar, maxsus tort so'rovlari va mijozlar ma'lumotlar bazasidan va tizimdan butunlay o'chirib tashlanadi.
              Hisoblagich 0 ga tushadi va yangi buyurtmalar yana #1 dan boshlanadi.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmText('');
              setShowClearModal(true);
            }}
          >
            Ma'lumotlarni Tozalash
          </Button>
        </div>
      </div>
    </div>

    {/* ========== CONFIRMATION MODAL ========== */}
    {showClearModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-dinora-pink/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-dinora-pink/20 to-dinora-pink-light border-b border-dinora-pink/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-dinora-pink/20">
                <AlertTriangle className="w-6 h-6 text-dinora-pink" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dinora-chocolate font-serif">Tasdiqlash Talab Etiladi</h3>
                <p className="text-[11px] text-dinora-gray">Bu amal qaytarib bo'lmaydi!</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowClearModal(false);
              }}
              className="p-2 rounded-xl text-dinora-gray hover:text-dinora-pink hover:bg-dinora-pink-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {/* Warning Items */}
            <div className="space-y-2">
              {[
                "Barcha buyurtmalar (Orders) o'chiriladi",
                "Barcha maxsus tort so'rovlari o'chiriladi",
                "Buyurtma tafsilotlari va to'lov ma'lumotlari o'chiriladi",
                "Bu amal qaytarib bo'lmaydi!",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-dinora-chocolate">
                  <span className="text-dinora-pink font-bold mt-0.5">⚠</span>
                  <span className={i === 3 ? 'font-bold text-dinora-pink' : ''}>{item}</span>
                </div>
              ))}
            </div>

            {/* Confirm Input */}
            <div className="p-4 bg-dinora-bg rounded-2xl border border-dinora-border space-y-2">
              <p className="text-xs font-semibold text-dinora-chocolate">
                Davom etish uchun quyidagi so'zni kiriting:
              </p>
              <div className="px-3 py-2 bg-white rounded-xl border border-dinora-pink/40 text-center">
                <span className="font-mono font-extrabold text-dinora-pink tracking-widest text-sm select-all">
                  {CONFIRM_KEYWORD}
                </span>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`"${CONFIRM_KEYWORD}" deb yozing...`}
                className="w-full rounded-xl border border-dinora-border bg-white px-3.5 py-2.5 text-sm text-dinora-chocolate text-center font-mono tracking-wider uppercase focus:border-dinora-pink focus:outline-none focus:ring-2 focus:ring-dinora-pink/30 transition-all"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                setShowClearModal(false);
                setConfirmText('');
              }}
            >
              Bekor Qilish
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              isLoading={clearAllDataMutation.isPending}
              disabled={confirmText.trim().toUpperCase() !== CONFIRM_KEYWORD}
              icon={<Trash2 className="w-4 h-4" />}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirmText.trim().toUpperCase() !== CONFIRM_KEYWORD) return;
                try {
                  await clearAllDataMutation.mutateAsync();
                } catch (err) {
                  console.error('Clear error:', err);
                } finally {
                  setShowClearModal(false);
                  setConfirmText('');
                }
              }}
            >
              Ha, Tozalash
            </Button>
          </div>
        </div>
      </div>
    )}
  </>);
};

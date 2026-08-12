import React, { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings, useClearAllData } from './hooks/useSettings';
import { BlockedDatesCalendar } from './components/BlockedDatesCalendar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import {
  Store,
  Clock,
  Phone,
  Instagram,
  Truck,
  DollarSign,
  ShieldAlert,
  Loader2,
  Save,
  Wrench,
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
  const [deliveryFee, setDeliveryFee] = useState('10000');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('21:00');
  const [workingDays, setWorkingDays] = useState('Dushanba - Yakshanba');
  const [deliveryAddressText, setDeliveryAddressText] = useState("Sirdaryo tumani bo'ylab yetkazib berish");
  const [adminPhonePrimary, setAdminPhonePrimary] = useState('+998 99 495 78 06');
  const [adminPhoneSecondary, setAdminPhoneSecondary] = useState('+998 91 023 15 24');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/dinora_shirinliklari/');
  const [instagramUsername, setInstagramUsername] = useState('@dinora_shirinliklari');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (settings) {
      setIsStoreOpen(settings.isStoreOpen ?? true);
      setDeliveryFee(String(settings.deliveryFee ?? 10000));
      setMinOrderAmount(String(settings.minOrderAmount ?? 0));
      setWorkingHoursStart(settings.workingHoursStart || '09:00');
      setWorkingHoursEnd(settings.workingHoursEnd || '21:00');
      setWorkingDays(settings.workingDays || 'Dushanba - Yakshanba');
      setDeliveryAddressText(settings.deliveryAddressText || "Sirdaryo tumani bo'ylab yetkazib berish");
      setAdminPhonePrimary(settings.adminPhonePrimary || '+998 99 495 78 06');
      setAdminPhoneSecondary(settings.adminPhoneSecondary || '+998 91 023 15 24');
      setInstagramUrl(settings.instagramUrl || 'https://www.instagram.com/dinora_shirinliklari/');
      setInstagramUsername(settings.instagramUsername || '@dinora_shirinliklari');
      setAutoAcceptOrders(settings.autoAcceptOrders ?? false);
      setMaintenanceMode(settings.maintenanceMode ?? false);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      isStoreOpen,
      deliveryFee: Number(deliveryFee),
      minOrderAmount: Number(minOrderAmount),
      workingHoursStart,
      workingHoursEnd,
      workingDays,
      deliveryAddressText,
      adminPhonePrimary,
      adminPhoneSecondary,
      instagramUrl,
      instagramUsername,
      autoAcceptOrders,
      maintenanceMode,
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
    <form onSubmit={handleSubmit} className="space-y-8">
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
                ? "Do'kon ishlamoqda. Telegram bot orqali buyurtmalar qabul qilinmoqda."
                : "Do'kon vaqtincha yopiq. Yangi buyurtmalar qabul qilinmaydi."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch
            enabled={isStoreOpen}
            onChange={setIsStoreOpen}
            label={isStoreOpen ? "Do'kon Ochiq" : "Do'kon Yopiq"}
          />
        </div>
      </div>

      {/* Blocked Dates Calendar Management Section */}
      <BlockedDatesCalendar />

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Delivery & Order Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-dinora-border shadow-dinora space-y-5">
          <div className="border-b border-dinora-border/60 pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-dinora-gold" />
            <h4 className="text-sm font-bold text-dinora-chocolate font-serif uppercase tracking-wider">
              Yetkazib Berish va Minimum Buyurtma
            </h4>
          </div>

          <Input
            label="Yetkazib Berish Narxi (so'm)"
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            helperText="Shahardan tashqariga alohida hisoblanadi"
          />

          <Input
            label="Eng Kam Buyurtma Summasi (so'm)"
            type="number"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            helperText="Savatcha ushbu summadan kam bo'lsa buyurtma qabul qilinmaydi"
          />

          <Input
            label="Ish Kunlari Matni"
            placeholder="Dushanba - Yakshanba"
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
            helperText="Masalan: Dushanba - Yakshanba yoki Har kuni"
          />

          <div className="grid grid-cols-2 gap-4 pt-1">
            <Input
              label="Ish Vaqti (Boshlanishi)"
              type="time"
              value={workingHoursStart}
              onChange={(e) => setWorkingHoursStart(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />
            <Input
              label="Ish Vaqti (Tugashi)"
              type="time"
              value={workingHoursEnd}
              onChange={(e) => setWorkingHoursEnd(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Yetkazib Berish Hududi / Manzil Matni"
            placeholder="Sirdaryo tumani bo'ylab yetkazib berish"
            value={deliveryAddressText}
            onChange={(e) => setDeliveryAddressText(e.target.value)}
            leftIcon={<Truck className="w-4 h-4" />}
            helperText="Veb-sayt va botda yetkazib berish hududi sifatida ko'rsatiladi"
          />
        </div>

        {/* Card 2: Contact & Social Media */}
        <div className="bg-white p-6 rounded-2xl border border-dinora-border shadow-dinora space-y-5">
          <div className="border-b border-dinora-border/60 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-dinora-gold" />
            <h4 className="text-sm font-bold text-dinora-chocolate font-serif uppercase tracking-wider">
              Aloqa va Ijtimoiy Tarmoqlar
            </h4>
          </div>

          <Input
            label="Asosiy Admin Telefoni"
            placeholder="+998 99 495 78 06"
            value={adminPhonePrimary}
            onChange={(e) => setAdminPhonePrimary(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Qo'shimcha Admin Telefoni"
            placeholder="+998 91 023 15 24"
            value={adminPhoneSecondary}
            onChange={(e) => setAdminPhoneSecondary(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Instagram Username (@nik)"
            placeholder="@dinora_shirinliklari"
            value={instagramUsername}
            onChange={(e) => setInstagramUsername(e.target.value)}
            leftIcon={<Instagram className="w-4 h-4" />}
          />

          <Input
            label="Instagram Sahifa Havolasi"
            placeholder="https://www.instagram.com/dinora_shirinliklari/"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            leftIcon={<Instagram className="w-4 h-4" />}
          />
        </div>
      </div>

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
              Barcha buyurtmalar, maxsus tort so'rovlari va ularning tafsilotlari ma'lumotlar bazasidan va tizimdan butunlay o'chirib tashlanadi.
              Bu amal qaytarib bo'lmaydi!
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

      {/* Bottom Save Bar */}
      <div className="p-4 bg-white rounded-2xl border border-dinora-border shadow-dinora flex items-center justify-end gap-3 sticky bottom-4 z-20">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          isLoading={updateSettingsMutation.isPending}
          icon={<Save className="w-5 h-5" />}
        >
          Sozlamalarni Saqlash
        </Button>
      </div>
    </form>

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

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { triggerHaptic, triggerSelectionHaptic } from '../../utils/haptics';

interface DeliveryDatePickerProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  selectedTimeSlot?: string;
  onSelectTimeSlot?: (timeSlot: string) => void;
  deliveryType?: 'DELIVERY' | 'PICKUP';
}

const TIME_SLOTS = [
  { id: '09:00 - 12:00', label: '09:00 - 12:00', icon: '🌅' },
  { id: '12:00 - 15:00', label: '12:00 - 15:00', icon: '☀️' },
  { id: '15:00 - 18:00', label: '15:00 - 18:00', icon: '🌇' },
  { id: '18:00 - 21:00', label: '18:00 - 21:00', icon: '🌙' },
];

const WEEK_DAYS_DICT: Record<string, string[]> = {
  uz: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'],
  'uz-Cyrl': ['Душ', 'Сеш', 'Чор', 'Пай', 'Жума', 'Шан', 'Як'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

const MONTH_NAMES_DICT: Record<string, string[]> = {
  uz: [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ],
  'uz-Cyrl': [
    'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
    'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'
  ],
  ru: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ],
};

export const DeliveryDatePicker: React.FC<DeliveryDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  selectedTimeSlot = '12:00 - 15:00',
  onSelectTimeSlot,
  deliveryType = 'DELIVERY',
}) => {
  const { t, i18n } = useTranslation();
  const isPickup = deliveryType === 'PICKUP';
  const today = useMemo(() => new Date(), []);
  
  const currentLang = i18n.language || 'uz';
  const weekDays = WEEK_DAYS_DICT[currentLang] || WEEK_DAYS_DICT.uz;
  const monthNames = MONTH_NAMES_DICT[currentLang] || MONTH_NAMES_DICT.uz;

  // Year & month navigation state
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    let dayOfWeek = firstDayOfMonth.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    // Empty padding slots before first day
    for (let i = 0; i < dayOfWeek; i++) {
      days.push(null);
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const isPast =
        dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const isToday =
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear();

      const yearStr = currentYear;
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const hash = (d * 7 + currentMonth * 13) % 10;
      const remainingSlots = isPast ? 0 : hash > 2 ? hash : 4;

      days.push({
        day: d,
        dateStr,
        isPast,
        isToday,
        remainingSlots,
      });
    }

    return days;
  }, [currentYear, currentMonth, today]);

  const handlePrevMonth = () => {
    triggerHaptic('light');
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div className="bg-[#FAF6F0] p-4 sm:p-5 rounded-3xl border border-[#2B1810]/10 space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-white text-[#D65B78] flex items-center justify-center border border-[#2B1810]/10 shadow-sm shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-serif text-[#2B1810]">
              {isPickup ? t('cart.pickup_date_title') : t('cart.delivery_date_title')}
            </h4>
            <p className="text-[10px] text-[#6B5B52]">
              {isPickup ? t('cart.pickup_hint') : t('cart.delivery_hint')}
            </p>
          </div>
        </div>

        {/* Month Selector Navigation */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-[#2B1810]/10 shadow-sm shrink-0">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-[#2B1810] hover:bg-[#FAF6F0] transition-colors touch-manipulation"
            title="Oldingi oy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#2B1810] px-2 min-w-[90px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-[#2B1810] hover:bg-[#FAF6F0] transition-colors touch-manipulation"
            title="Keyingi oy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#2B1810]/10 shadow-sm">
        {/* Week Days Row */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-[#6B5B52] pb-2 border-b border-[#2B1810]/5">
          {weekDays.map((day, idx) => (
            <span
              key={day}
              className={idx >= 5 ? 'text-[#D65B78]' : 'text-[#6B5B52]'}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Date Cells Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
          {calendarDays.map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} className="h-11 sm:h-12" />;
            }

            const isSelected = selectedDate === item.dateStr;

            return (
              <button
                key={item.dateStr}
                type="button"
                disabled={item.isPast}
                onClick={() => {
                  triggerSelectionHaptic();
                  onSelectDate(item.dateStr);
                }}
                className={`min-h-[44px] h-11 sm:h-12 rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition-all duration-150 group touch-manipulation ${
                  item.isPast
                    ? 'text-gray-300 bg-gray-50/50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#2B1810] text-[#FAF6F0] shadow-md border-2 border-[#D4AF37] scale-105 z-10'
                    : 'text-[#2B1810] bg-[#FAF6F0]/60 hover:bg-[#F8E7EA] hover:text-[#D65B78] border border-[#2B1810]/5'
                }`}
              >
                <span>{item.day}</span>

                {item.isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#D65B78] absolute bottom-1" />
                )}

                {!item.isPast && (
                  <span
                    className={`text-[8px] leading-none mt-0.5 hidden sm:block ${
                      isSelected ? 'text-[#D4AF37]' : 'text-[#6B5B52]'
                    }`}
                  >
                    {item.remainingSlots} slot
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery / Pickup Time Window Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#2B1810] uppercase tracking-wider flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D65B78]" />
          <span>{isPickup ? t('cart.pickup_time_slot') : t('cart.delivery_time_slot')}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TIME_SLOTS.map((slot) => {
            const isSlotSelected = selectedTimeSlot === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  if (onSelectTimeSlot) onSelectTimeSlot(slot.id);
                }}
                className={`min-h-[44px] p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-0.5 touch-manipulation ${
                  isSlotSelected
                    ? 'bg-[#2B1810] text-[#FAF6F0] border-[#D4AF37] shadow-sm'
                    : 'bg-white text-[#6B5B52] border-[#2B1810]/10 hover:bg-[#F8E7EA] hover:text-[#2B1810]'
                }`}
              >
                <span className="text-sm">{slot.icon}</span>
                <span className="text-[11px] truncate">{slot.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Schedule Summary Badge */}
      {selectedDate && (
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#2B1810]/10 text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#6B5B52]">
              {isPickup ? t('cart.pickup_date_title').replace(' *', ':') : t('cart.delivery_date_title').replace(' *', ':')}
            </span>
            <strong className="text-[#2B1810]">{selectedDate}</strong>
          </div>
          <span className="bg-[#F8E7EA] text-[#D65B78] font-bold px-2.5 py-0.5 rounded-lg text-[11px]">
            {selectedTimeSlot}
          </span>
        </div>
      )}
    </div>
  );
};

export default DeliveryDatePicker;

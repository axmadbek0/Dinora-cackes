import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { BlockedDateItem } from '../hooks/useBlockedDates';

interface VisualMonthCalendarProps {
  blockedDates: BlockedDateItem[];
  selectedDate: string; // YYYY-MM-DD
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
  mode: 'SINGLE' | 'RANGE';
  onSelectSingleDate: (date: string) => void;
  onSelectDateRange: (start: string, end: string) => void;
  onToggleBlockDate: (date: string) => void;
}

const MONTH_NAMES_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const WEEKDAY_NAMES_UZ = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export const VisualMonthCalendar: React.FC<VisualMonthCalendarProps> = ({
  blockedDates,
  selectedDate,
  startDate,
  endDate,
  mode,
  onSelectSingleDate,
  onSelectDateRange,
  onToggleBlockDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0 - 11

  const blockedMap = new Map<string, string>();
  blockedDates.forEach((b) => blockedMap.set(b.date, b.reason || 'Band'));

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar Math
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  // Get day of week of the 1st of month (0 = Sunday, 1 = Monday...)
  const firstDayObj = new Date(currentYear, currentMonth, 1);
  let firstDayOfWeek = firstDayObj.getDay(); // 0 (Sun) - 6 (Sat)
  // Convert Sunday=0 to Monday=0 indexing: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Range selection temp state
  const [rangeSelectingStart, setRangeSelectingStart] = useState<string | null>(null);

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleDayClick = (dateStr: string) => {
    onSelectSingleDate(dateStr);
    onToggleBlockDate(dateStr);
  };

  const isDateInRange = (dateStr: string) => {
    if (mode !== 'RANGE' || !startDate || !endDate) return false;
    return dateStr >= startDate && dateStr <= endDate;
  };

  // Generate Grid Items (42 items for 6 weeks x 7 days)
  const gridCells = [];

  // 1. Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = formatDateStr(prevYear, prevMonthIdx, dayNum);

    gridCells.push({
      dayNum,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = formatDateStr(currentYear, currentMonth, d);
    gridCells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // 3. Next month leading days to complete grid (42 cells)
  const remainingCells = 42 - gridCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = formatDateStr(nextYear, nextMonthIdx, d);

    gridCells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="bg-[#EDEDED] p-6 rounded-2xl border border-gray-300 shadow-md max-w-md mx-auto select-none font-sans">
      {/* Month & Year Header Navigation */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl hover:bg-gray-300/60 text-gray-700 transition-colors"
          title="Oldingi oy"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-gray-800 tracking-wide font-serif">
          {MONTH_NAMES_UZ[currentMonth]} {currentYear}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-xl hover:bg-gray-300/60 text-gray-700 transition-colors"
          title="Keyingi oy"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers: Du, Se, Ch, Pa, Ju, Sh, Ya */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {WEEKDAY_NAMES_UZ.map((day) => (
          <div
            key={day}
            className="text-xs font-bold text-gray-800 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days 7x6 Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center items-center">
        {gridCells.map((cell, idx) => {
          const isBlocked = blockedMap.has(cell.dateStr);
          const isToday = cell.dateStr === todayStr;
          const isSelectedSingle = mode === 'SINGLE' && cell.dateStr === selectedDate;
          const inRange = isDateInRange(cell.dateStr);
          const reason = blockedMap.get(cell.dateStr);

          let cellStyle = "w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm transition-all duration-150 relative cursor-pointer ";

          if (!cell.isCurrentMonth) {
            cellStyle += "text-gray-400 font-normal hover:bg-gray-300/40 ";
          } else {
            cellStyle += "text-gray-800 font-medium hover:bg-gray-300/60 ";
          }

          if (isBlocked) {
            cellStyle += "bg-[#FEE2E2] text-red-700 font-extrabold border-2 border-red-400 shadow-sm ";
          } else if (isSelectedSingle) {
            cellStyle += "bg-[#4A5568] text-white font-bold shadow-md scale-105 ring-2 ring-[#4A5568]/30 ";
          } else if (inRange) {
            cellStyle += "bg-[#2B1810] text-[#D4AF37] font-bold shadow-md scale-105 ";
          } else if (isToday) {
            cellStyle += "ring-2 ring-dinora-gold font-bold ";
          }

          return (
            <div key={idx} className="flex justify-center items-center py-1">
              <button
                type="button"
                onClick={() => handleDayClick(cell.dateStr)}
                onDoubleClick={() => onToggleBlockDate(cell.dateStr)}
                title={
                  isBlocked
                    ? `🔒 BAND: ${reason}\n(Ikki marta bossangiz bekor qilinadi)`
                    : `${cell.dateStr}\n(Bir marta tanlash, ikki marta - band qilish)`
                }
                className={cellStyle}
              >
                <span>{cell.dayNum}</span>

                {/* Small indicator dot for blocked dates */}
                {isBlocked && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="w-1 h-1 bg-white rounded-full" />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend & Help Footer */}
      <div className="mt-6 pt-4 border-t border-gray-300 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#4A5568]" />
          <span>Tanlangan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FEE2E2] border border-red-400" />
          <span>Band qilingan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border border-gray-400" />
          <span>Ochiq kun</span>
        </div>
      </div>
    </div>
  );
};

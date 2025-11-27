// src/components/CalendarStrip.tsx
import { addDays, isSameDay, format } from "date-fns";
import { useTranslation } from "../hooks/useTranslation";
import { getDateLocale } from "../i18n/dateLocale";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarStrip({
  selectedDate,
  onSelectDate,
}: CalendarStripProps) {
  const { language } = useTranslation();
  const locale = getDateLocale(language);

  // On affiche 5 jours : J-2, J-1, J, J+1, J+2
  const days: Date[] = [];
  for (let offset = -2; offset <= 2; offset++) {
    days.push(addDays(selectedDate, offset));
  }

  return (
    <div className="flex justify-between items-center gap-2 pt-2">
      {days.map((day) => {
        const isActive = isSameDay(day, selectedDate);

        const dayNumber = format(day, "d", { locale });
        const weekdayRaw = format(day, "EEE", { locale });
        // date-fns FR donne "lun." -> on enlève le point et on met en MAJ
        const weekday = weekdayRaw.replace(".", "").toUpperCase();

        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onSelectDate(day)}
            className={
              "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all " +
              (isActive
                ? "bg-[#52b788] text-[#050d0a] shadow-lg shadow-[#52b788]/30 scale-105"
                : "bg-[#1b4332]/30 text-[#74c69d] border-transparent hover:bg-[#1b4332]/60")
            }
          >
            <span className="text-xs font-medium">{dayNumber}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-60">
              {weekday}
            </span>
          </button>
        );
      })}
    </div>
  );
}

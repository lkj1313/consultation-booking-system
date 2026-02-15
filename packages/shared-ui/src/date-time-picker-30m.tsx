import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { cn } from './cn';
import 'react-day-picker/style.css';

const pad = (value: number) => String(value).padStart(2, '0');

const toDateTimeLocal = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const parseDateTimeLocal = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    fallback.setSeconds(0, 0);
    fallback.setMinutes(fallback.getMinutes() >= 30 ? 30 : 0, 0, 0);
    return fallback;
  }
  return parsed;
};

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? 0 : 30;
  const label = `${pad(hour)}:${pad(minute)}`;
  return { label, value: label };
});

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export interface DateTimePicker30mProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
}

export const DateTimePicker30m = ({
  value,
  onChange,
  disabled,
  className,
}: DateTimePicker30mProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const current = parseDateTimeLocal(value);
  const now = new Date();
  const selectedDate = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
    0,
    0,
    0,
    0,
  );
  const selectedTime = `${pad(current.getHours())}:${pad(current.getMinutes())}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isTodaySelected = isSameDate(selectedDate, now);

  const summaryLabel = useMemo(
    () => `${pad(current.getMonth() + 1)}.${pad(current.getDate())} ${pad(current.getHours())}:${pad(current.getMinutes())}`,
    [current],
  );

  const commit = (date: Date, time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const next = new Date(date);
    next.setHours(hour, minute, 0, 0);
    onChange(toDateTimeLocal(next));
  };

  const isPastTimeOption = (date: Date, time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const candidate = new Date(date);
    candidate.setHours(hour, minute, 0, 0);
    return candidate.getTime() < now.getTime();
  };

  const getFirstAvailableTime = (date: Date) => {
    const first = TIME_OPTIONS.find((option) => !isPastTimeOption(date, option.value));
    return first?.value ?? '23:30';
  };
  const visibleTimeOptions = isTodaySelected
    ? TIME_OPTIONS.filter((option) => !isPastTimeOption(selectedDate, option.value))
    : TIME_OPTIONS;
  const effectiveSelectedTime = visibleTimeOptions.some((option) => option.value === selectedTime)
    ? selectedTime
    : (visibleTimeOptions[0]?.value ?? '23:30');

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        className={cn(
          'flex h-11 w-full items-center rounded-lg border border-slate-300 bg-white px-4 text-left text-sm text-slate-900 shadow-sm',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={disabled}
      >
        {summaryLabel}
      </button>
      {!disabled && open && (
        <div className="absolute z-30 mt-2 w-[340px] rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <DayPicker
            mode="single"
            locale={ko}
            selected={selectedDate}
            disabled={{ before: today }}
            onSelect={(date) => {
              if (!date) {
                return;
              }
              const nextTime = isPastTimeOption(date, selectedTime)
                ? getFirstAvailableTime(date)
                : selectedTime;
              commit(date, nextTime);
            }}
            className="mx-auto text-sm [&_.rdp-button]:h-10 [&_.rdp-button]:w-10 [&_.rdp-caption_label]:text-base [&_.rdp-weekday]:text-xs"
          />
          <select
            className="mt-3 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
            value={effectiveSelectedTime}
            onChange={(event) => {
              if (isPastTimeOption(selectedDate, event.target.value)) {
                return;
              }
              commit(selectedDate, event.target.value);
            }}
          >
            {visibleTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

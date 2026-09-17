import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

export interface DatePickerProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } } | string) => void;
  minDate?: string; // "YYYY-MM-DD"
  maxDate?: string; // "YYYY-MM-DD"
  placeholder?: string;
  required?: boolean;
  error?: string | string[];
  touched?: boolean;
  containerClassName?: string;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement | HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'up' | 'down' | 'auto';
  align?: 'left' | 'right' | 'auto';
}

const padZero = (n: number) => String(n).padStart(2, '0');

const formatIso = (year: number, month: number, day: number) =>
  `${year}-${padZero(month + 1)}-${padZero(day)}`;

const getLocalizedMonths = (locale: string): string[] => {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 15);
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(d);
  });
};

const getLocalizedDays = (locale: string): string[] => {
  // Sunday = 2026-01-04
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 0, 4 + i);
    return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(d);
  });
};

const formatDisplay = (isoStr: string, locale: string): string => {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-').map(Number);
  if (!y || !m || !d) return isoStr;
  const dateObj = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(dateObj);
};

const DatePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
  required = false,
  error,
  touched,
  containerClassName,
  name = '',
  onBlur,
  disabled = false,
  className,
  style,
  direction = 'auto',
  align = 'auto',
}: DatePickerProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = t('locale') || i18n.language || 'en-IN';
  const effectivePlaceholder = placeholder || t('common.select_date');

  const months = useMemo(() => getLocalizedMonths(currentLocale), [currentLocale]);
  const days = useMemo(() => getLocalizedDays(currentLocale), [currentLocale]);

  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [prevValue, setPrevValue] = useState(value);
  const [currentYear, setCurrentYear] = useState<number>(() => parsedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => parsedDate.getMonth());

  if (value !== prevValue) {
    setPrevValue(value);
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }
  }

  const errorMessage = Array.isArray(error) ? error[0] : error;
  const showError = Boolean(touched && errorMessage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      // Vertical auto-placement
      if (direction === 'down') {
        setOpenUp(false);
      } else if (direction === 'up') {
        setOpenUp(true);
      } else {
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUp(spaceBelow < 280 && spaceAbove > spaceBelow);
      }

      // Horizontal auto-placement
      if (align === 'right') {
        setAlignRight(true);
      } else if (align === 'left') {
        setAlignRight(false);
      } else {
        const spaceRight = window.innerWidth - rect.left;
        setAlignRight(spaceRight < 310);
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelectDate = (dateStr: string) => {
    const synthetic = {
      target: { name, value: dateStr },
    } as React.ChangeEvent<HTMLInputElement>;

    if (typeof onChange === 'function') {
      // Handles both direct string handler and event-based handler (Formik)
      (onChange as (arg: unknown) => void)(synthetic);
    }
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const todayStr = formatIso(today.getFullYear(), today.getMonth(), today.getDate());
    if (minDate && todayStr < minDate) return;
    if (maxDate && todayStr > maxDate) return;
    handleSelectDate(todayStr);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectDate('');
  };

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const todayStr = useMemo(() => {
    const t = new Date();
    return formatIso(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  return (
    <div className={containerClassName} style={{ position: 'relative' }}>
      {label && (
        <label className="form-label fw-medium text-secondary small mb-1">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}

      <div className="position-relative w-100" ref={containerRef}>
        {/* ── Trigger Input Button ── */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          onBlur={(e) => onBlur?.(e)}
          className={`form-control bg-white d-flex align-items-center justify-content-between text-start ${
            showError ? 'border-danger is-invalid' : 'border-light-subtle'
          } ${className ? ` ${className}` : ''}`}
          style={{
            height: '40px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.65 : 1,
            width: '100%',
            ...style,
          }}
        >
          <div className="d-flex align-items-center gap-2 text-truncate">
            <CalendarIcon size={16} className="text-secondary flex-shrink-0" />
            <span
              className={`text-truncate ${value ? 'text-dark fw-medium' : 'text-muted'}`}
              style={{ fontSize: '0.875rem' }}
            >
              {value ? formatDisplay(value, currentLocale) : effectivePlaceholder}
            </span>
          </div>

          <div className="d-flex align-items-center gap-1">
            {value && !disabled && !required && (
              <span
                role="button"
                onClick={handleClear}
                className="text-muted p-1 hover-text-dark"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title={t('common.clear_date')}
              >
                <X size={14} />
              </span>
            )}
          </div>
        </button>

        {/* ── Calendar Dropdown Modal/Card ── */}
        {isOpen && (
          <div
            className="position-absolute bg-white border border-light-subtle rounded-3 shadow-lg p-3"
            style={{
              zIndex: 1070,
              width: '290px',
              maxWidth: '90vw',
              ...(openUp ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
              ...(alignRight ? { right: 0 } : { left: 0 }),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header: Month & Year Navigator ── */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                {months[currentMonth]} {currentYear}
              </span>
              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="btn btn-sm btn-light p-1 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb' }}
                  title={t('common.prev_month')}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="btn btn-sm btn-light p-1 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb' }}
                  title={t('common.next_month')}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* ── Day Names Header ── */}
            <div
              className="d-grid text-center mb-1"
              style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}
            >
              {days.map((d, index) => (
                <span
                  key={`${d}-${index}`}
                  className="text-secondary fw-semibold"
                  style={{ fontSize: '0.72rem', padding: '4px 0' }}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* ── Day Cells Grid ── */}
            <div
              className="d-grid text-center"
              style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}
            >
              {/* Prev month fill days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="text-muted d-flex align-items-center justify-content-center opacity-25"
                    style={{ height: '32px', fontSize: '0.8rem', userSelect: 'none' }}
                  >
                    {dayNum}
                  </div>
                );
              })}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const iso = formatIso(currentYear, currentMonth, dayNum);
                const isSelected = value === iso;
                const isToday = todayStr === iso;
                const isPast = minDate ? iso < minDate : false;
                const isFuture = maxDate ? iso > maxDate : false;
                const isDisabled = isPast || isFuture;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(iso)}
                    className={`btn btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center border-0 fw-medium ${
                      isSelected
                        ? 'bg-dark text-white'
                        : isToday
                        ? 'bg-light text-primary fw-bold'
                        : 'text-dark'
                    }`}
                    style={{
                      height: '32px',
                      width: '32px',
                      margin: 'auto',
                      fontSize: '0.82rem',
                      opacity: isDisabled ? 0.35 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                      border: isToday && !isSelected ? '1px solid #93c5fd' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isDisabled) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isDisabled) {
                        e.currentTarget.style.backgroundColor = isToday ? '#f8fafc' : 'transparent';
                      }
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* ── Footer Quick Actions ── */}
            <div className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top border-light-subtle">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small text-primary fw-semibold"
                style={{ fontSize: '0.78rem' }}
                onClick={handleSelectToday}
                disabled={minDate ? todayStr < minDate : false}
              >
                {t('common.today')}
              </button>
              {value && (
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none small text-secondary"
                  style={{ fontSize: '0.78rem' }}
                  onClick={handleClear}
                >
                  {t('common.clear')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showError && <div className="invalid-feedback d-block">{errorMessage}</div>}
    </div>
  );
};

export default DatePicker;

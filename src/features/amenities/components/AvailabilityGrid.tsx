import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AvailabilityResult, BusyInterval, SharedCapacitySlot } from '../types/amenity.types';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ShieldAlert, BarChart2, Info } from 'lucide-react';
import { formatDateOnly } from '../../../utils/formatDate';

interface AvailabilityGridProps {
  availability: AvailabilityResult | null;
  loading: boolean;
  onOpenBooking?: (slotPrefill?: { start: string; end: string }) => void;
}

const formatHourLabel = (timeStr: string): string => {
  return timeStr; // e.g. "17:00", "18:00"
};

const toMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const AvailabilityGrid = ({ availability, loading, onOpenBooking }: AvailabilityGridProps) => {
  const { t, i18n } = useTranslation();
  const [hoveredSlot, setHoveredSlot] = useState<SharedCapacitySlot | null>(null);
  const [hoveredInterval, setHoveredInterval] = useState<BusyInterval | null>(null);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
        <span className="text-muted small">{t('amenities.checking_schedule')}</span>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="text-center py-4 text-muted small">
        {t('amenities.select_date_prompt')}
      </div>
    );
  }

  const {
    operatingStart,
    operatingEnd,
    busyIntervals = [],
    sharedSlots = [],
    date,
    bookingType,
    totalCapacity = 25,
  } = availability;

  const isShared = bookingType === 'SHARED_CAPACITY' || (sharedSlots && sharedSlots.length > 0);
  const startMin = toMinutes(operatingStart);
  const endMin = toMinutes(operatingEnd);
  const totalMin = Math.max(1, endMin - startMin);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = date === todayStr;
  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

  return (
    <div>
      {/* ── Operating Hours Info Bar ── */}
      <div
        className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3 flex-wrap gap-2"
        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <div className="d-flex align-items-center gap-2">
          <Clock size={16} className="text-primary" />
          <span className="small text-dark fw-medium">
            {t('amenities.operating_hours_colon')} <span className="fw-bold">{operatingStart} – {operatingEnd}</span>
          </span>
          {isShared && (
            <span className="badge bg-success-subtle text-success border border-success-subtle ms-1" style={{ fontSize: '0.72rem' }}>
              {t('amenities.free_concurrent_facility', { capacity: new Intl.NumberFormat(i18n.language).format(totalCapacity) })}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {isShared ? (
            <>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                {t('amenities.low_crowd')}
              </span>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                {t('amenities.moderate_crowd')}
              </span>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                {t('amenities.busy_crowd')}
              </span>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#94a3b8', display: 'inline-block' }} />
                {t('amenities.past_closed')}
              </span>
            </>
          ) : (
            <>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                {t('amenities.available')}
              </span>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                {t('amenities.reserved')}
              </span>
              <span className="d-inline-flex align-items-center gap-1 small text-secondary" style={{ fontSize: '0.78rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#64748b', display: 'inline-block' }} />
                {t('amenities.blackout')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── SHARED CAPACITY AMENITIES: Hourly Crowd Graph / Histogram ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isShared ? (
        <div>
          <div className="card border-0 bg-white p-3 p-sm-4 rounded-3 shadow-sm mb-3">
            {/* Header with Title and Live Inspection Banner */}
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <BarChart2 size={18} className="text-primary" />
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                  {t('amenities.hourly_crowd_activity', { date: formatDateOnly(date) })}
                </h6>
              </div>
              <span className="badge bg-light text-secondary border" style={{ fontSize: '0.75rem' }}>
                {t('amenities.max_capacity', { capacity: new Intl.NumberFormat(i18n.language).format(totalCapacity) })}
              </span>
            </div>

            {/* ── Interactive Thin Bar Graph (100% Width, No Horizontal Scroll) ── */}
            <div
              className="position-relative pt-5 pb-2 w-100"
              style={{ overflow: 'visible', minHeight: '210px' }}
            >
              <div
                className="d-flex align-items-end justify-content-between w-100"
                style={{ height: '135px', gap: '4px' }}
              >
                {sharedSlots.map((slot: SharedCapacitySlot, idx: number) => {
                  const slotStartMin = toMinutes(slot.startTime);
                  const slotEndMin = toMinutes(slot.endTime);
                  const isPast = isToday ? slotEndMin <= currentMinutesNow : date < todayStr;
                  const isCurrentHour = isToday && currentMinutesNow >= slotStartMin && currentMinutesNow < slotEndMin;
                  const isHovered = hoveredSlot?.startTime === slot.startTime;
                  const isSlotClickable = slot.isAvailable && !isPast;

                  const occupancyRatio = slot.totalCapacity > 0 ? slot.currentOccupancy / slot.totalCapacity : 0;
                  const calculatedPct = Math.round(occupancyRatio * 100);
                  const barHeightPct = slot.isBlackout
                    ? 100
                    : slot.currentOccupancy === 0
                    ? 3 // minimal 3% baseline when 0 people
                    : Math.max(8, calculatedPct);

                  const barColor = isPast
                    ? '#cbd5e1'
                    : slot.isBlackout
                    ? '#64748b'
                    : slot.currentOccupancy === 0
                    ? '#e2e8f0'
                    : occupancyRatio >= 0.75
                    ? '#ef4444'
                    : occupancyRatio >= 0.4
                    ? '#f59e0b'
                    : '#22c55e';

                  return (
                    <div
                      key={idx}
                      className="d-flex flex-column align-items-center flex-grow-1 position-relative h-100 justify-content-end"
                      onMouseEnter={() => setHoveredSlot(slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => {
                        if (isSlotClickable && onOpenBooking) {
                          onOpenBooking({ start: slot.startTime, end: slot.endTime });
                        }
                      }}
                      style={{
                        cursor: isSlotClickable ? 'pointer' : 'not-allowed',
                        opacity: isPast ? 0.45 : 1,
                        minWidth: 0,
                      }}
                    >
                      {/* Floating Tooltip when Hovered (Floats dynamically above the top edge of each bar) */}
                      {isHovered && (
                        <div
                          className="position-absolute bg-dark text-white rounded-3 p-2 shadow-lg text-center"
                          style={{
                            bottom: `calc(${barHeightPct}% + 34px)`,
                            left: idx === 0 ? '0%' : idx === sharedSlots.length - 1 ? '100%' : '50%',
                            transform: idx === 0 ? 'translateX(0%)' : idx === sharedSlots.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                            zIndex: 40,
                            whiteSpace: 'nowrap',
                            fontSize: '0.75rem',
                            border: '1px solid #334155',
                            pointerEvents: 'none',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.35)',
                          }}
                        >
                          <div className="fw-bold text-white mb-0">{slot.startTime} – {slot.endTime}</div>
                          {isPast ? (
                            <div className="text-secondary small">{t('amenities.past_hour_closed')}</div>
                          ) : slot.isBlackout ? (
                            <div className="text-warning small">{slot.blackoutReason || t('amenities.maintenance_blackout')}</div>
                          ) : (
                            <div>
                              <span style={{ color: '#cbd5e1' }}>
                                {t('amenities.people_count', {
                                  current: new Intl.NumberFormat(i18n.language).format(slot.currentOccupancy),
                                  total: new Intl.NumberFormat(i18n.language).format(slot.totalCapacity),
                                })}
                              </span>
                              <div className="fw-bold" style={{ color: slot.availableSpots > 0 ? '#34d399' : '#f87171' }}>
                                {slot.availableSpots > 0
                                  ? t('amenities.spots_left', { count: new Intl.NumberFormat(i18n.language).format(slot.availableSpots) })
                                  : t('amenities.full')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* "Now" Indicator above active current hour */}
                      {isCurrentHour && !isHovered && (
                        <span
                          className="badge bg-primary text-white position-absolute rounded-pill fw-bold"
                          style={{
                            bottom: `calc(${barHeightPct}% + 8px)`,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '0.58rem',
                            padding: '2px 5px',
                            zIndex: 5,
                          }}
                        >
                          {t('amenities.now')}
                        </span>
                      )}

                      {/* Thin Histogram Bar Column */}
                      <div
                        className="w-100 rounded-pill transition-all"
                        style={{
                          maxWidth: '12px',
                          height: `${barHeightPct}%`,
                          backgroundColor: barColor,
                          opacity: isHovered ? 1 : isCurrentHour ? 0.95 : 0.85,
                          transform: isHovered && !isPast ? 'scaleY(1.05)' : 'none',
                          transformOrigin: 'bottom',
                          transition: 'all 0.15s ease-in-out',
                          boxShadow: isCurrentHour
                            ? '0 0 0 2px #3b82f6'
                            : isHovered && !isPast
                            ? '0 4px 12px rgba(0,0,0,0.2)'
                            : 'none',
                          border: slot.isBlackout ? '1px dashed #475569' : 'none',
                        }}
                      />

                      {/* X-axis Hour Label (e.g. 17:00, 18:00) */}
                      <span
                        className={`small mt-2 text-center text-truncate ${isCurrentHour ? 'fw-bold text-primary' : 'text-muted'}`}
                        style={{
                          fontSize: '0.65rem',
                          userSelect: 'none',
                          opacity: isPast ? 0.6 : 1,
                          letterSpacing: '-0.2px',
                        }}
                      >
                        {formatHourLabel(slot.startTime)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Graph Bottom Helper Note */}
            <div className="pt-2 border-top border-light-subtle text-muted small" style={{ fontSize: '0.78rem' }}>
              <Info size={13} className="me-1 text-primary d-inline" />
              {t('amenities.crowd_graph_hint')}
            </div>
          </div>
        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* ── EXCLUSIVE AMENITIES: Visual Timeline & Reserved Breakdown ── */
        /* ───────────────────────────────────────────────────────────── */
        <div>
          <div className="d-flex justify-content-between small text-muted mb-1 px-1" style={{ fontSize: '0.75rem' }}>
            <span>{operatingStart}</span>
            <span className="fw-semibold text-dark">{t('amenities.schedule_for_date', { date: formatDateOnly(date) })}</span>
            <span>{operatingEnd}</span>
          </div>

          {/* Timeline Bar Container with generous top space for tooltip */}
          <div className="position-relative pt-4 pb-2 mb-3">
            {/* Hover Tooltip for Timeline */}
            {hoveredInterval && (() => {
              const intStart = Math.max(startMin, toMinutes(hoveredInterval.startTime));
              const intEnd = Math.min(endMin, toMinutes(hoveredInterval.endTime));
              const centerPct = ((intStart + (intEnd - intStart) / 2 - startMin) / totalMin) * 100;
              const isBlackout = hoveredInterval.type === 'blackout';
              const displayReason = hoveredInterval.label
                ? hoveredInterval.label.replace(/^Reserved \((.*)\)$/, '$1').replace(/^Blackout: (.*)$/, '$1')
                : isBlackout
                ? t('amenities.maintenance_blackout')
                : t('amenities.private_booking');

              return (
                <div
                  className="position-absolute bg-dark text-white rounded-3 p-2 shadow-lg text-center"
                  style={{
                    bottom: 'calc(100% - 10px)',
                    left: `${centerPct}%`,
                    transform: centerPct < 18 ? 'translateX(-10%)' : centerPct > 82 ? 'translateX(-90%)' : 'translateX(-50%)',
                    zIndex: 40,
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                    border: '1px solid #334155',
                    pointerEvents: 'none',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.35)',
                  }}
                >
                  <div className="fw-bold text-white mb-0">{hoveredInterval.startTime} – {hoveredInterval.endTime}</div>
                  <div style={{ color: isBlackout ? '#cbd5e1' : '#fca5a5', fontSize: '0.78rem' }}>
                    {displayReason}
                  </div>
                </div>
              );
            })()}

            <div
              className="position-relative rounded-pill overflow-hidden shadow-inner"
              style={{ height: '20px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}
            >
              {busyIntervals.map((interval: BusyInterval, index: number) => {
                const intStart = Math.max(startMin, toMinutes(interval.startTime));
                const intEnd = Math.min(endMin, toMinutes(interval.endTime));
                if (intStart >= intEnd) return null;

                const leftPct = ((intStart - startMin) / totalMin) * 100;
                const widthPct = ((intEnd - intStart) / totalMin) * 100;
                const isBlackout = interval.type === 'blackout';
                const isHovered = hoveredInterval?.startTime === interval.startTime && hoveredInterval?.endTime === interval.endTime;

                return (
                  <div
                    key={index}
                    className="position-absolute top-0 bottom-0 transition-all"
                    onMouseEnter={() => setHoveredInterval(interval)}
                    onMouseLeave={() => setHoveredInterval(null)}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: isBlackout ? '#64748b' : '#ef4444',
                      opacity: isHovered ? 1 : 0.9,
                      filter: isHovered ? 'brightness(1.15)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {busyIntervals.length === 0 ? (
            <div
              className="p-3 rounded-3 text-center d-flex flex-column align-items-center justify-content-center"
              style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <CheckCircle2 size={24} className="text-success mb-2" />
              <h6 className="fw-bold mb-1 text-success fs-6">{t('amenities.fully_available_all_day')}</h6>
              <p className="text-secondary small mb-0" style={{ maxWidth: '420px' }}>
                {t('amenities.fully_available_desc', { start: operatingStart, end: operatingEnd })}
              </p>
            </div>
          ) : (
            <div>
              <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
                <AlertTriangle size={15} className="text-warning" /> {t('amenities.reserved_times_today')}
              </h6>
              <div className="d-flex flex-column gap-2 mb-3">
                {busyIntervals.map((interval: BusyInterval, index: number) => {
                  const isBlackout = interval.type === 'blackout';
                  // Strip redundant "Reserved (" prefix if present
                  const displayReason = interval.label
                    ? interval.label.replace(/^Reserved \((.*)\)$/, '$1').replace(/^Blackout: (.*)$/, '$1')
                    : isBlackout
                    ? t('amenities.maintenance_blackout')
                    : t('amenities.private_booking');

                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 border shadow-sm"
                      style={{
                        backgroundColor: isBlackout ? '#f8fafc' : '#fff',
                        borderColor: isBlackout ? '#e2e8f0' : '#fee2e2',
                        borderLeft: `4px solid ${isBlackout ? '#64748b' : '#ef4444'}`,
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '34px',
                            height: '34px',
                            backgroundColor: isBlackout ? '#f1f5f9' : '#fef2f2',
                          }}
                        >
                          {isBlackout ? (
                            <ShieldAlert size={17} className="text-secondary" />
                          ) : (
                            <Calendar size={17} className="text-danger" />
                          )}
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                              {interval.startTime} – {interval.endTime}
                            </span>
                            <span className="text-muted small">•</span>
                            <span className="text-secondary small fw-medium" style={{ fontSize: '0.82rem' }}>
                              {displayReason}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: isBlackout ? '#e2e8f0' : '#fee2e2',
                          color: isBlackout ? '#475569' : '#991b1b',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '4px 8px',
                        }}
                      >
                        {isBlackout ? t('amenities.blackout') : t('amenities.reserved')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-info-circle me-1" />
                {t('amenities.custom_duration_hint')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityGrid;

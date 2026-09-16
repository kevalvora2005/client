import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApartmentSelect } from "../hooks/useApartmentSelect";

interface ApartmentSelectProps {
  value: number;
  onChange: (val: number) => void;
  onBlur?: () => void;
  error?: string;
  currentApartmentId?: number;
  onlyVacant?: boolean;
  onlyOccupied?: boolean;
}

const ApartmentSelect = ({
  value,
  onChange,
  onBlur,
  error,
  currentApartmentId,
  onlyVacant = false,
  onlyOccupied = false,
}: ApartmentSelectProps) => {
  const { t } = useTranslation();
  const { apartments, loading } = useApartmentSelect(currentApartmentId, onlyVacant, onlyOccupied);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isEmpty = !loading && apartments.length === 0;

  const selectedApartment = useMemo(() => {
    return apartments.find((apt) => apt.id === value);
  }, [apartments, value]);

  const filteredApartments = useMemo(() => {
    if (!search.trim()) return apartments;
    const term = search.toLowerCase().replace(/\s+/g, '');
    return apartments.filter((apt) => {
      const block = (apt.block || '').toLowerCase();
      const floor = apt.floorNumber !== undefined ? String(apt.floorNumber).toLowerCase() : '';
      const unit = (apt.unitNumber || '').toLowerCase();
      const label = `${block}${floor}${unit}`;
      const labelDash = `${block}-${floor}${unit}`;
      return label.includes(term) || labelDash.includes(term) || unit.includes(term) || block.includes(term);
    });
  }, [apartments, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const charMap: number[] = [];
    const cleanText = text.split('').map((c, i) => {
      if (/[a-zA-Z0-9]/.test(c)) {
        charMap.push(i);
        return c.toLowerCase();
      }
      return '';
    }).join('');
    const idx = cleanText.indexOf(q);
    if (idx === -1) return text;
    const start = charMap[idx];
    const end = charMap[idx + q.length - 1] + 1;
    return (
      <>
        {text.slice(0, start)}
        <span style={{ backgroundColor: '#fef08a', fontWeight: 600 }}>{text.slice(start, end)}</span>
        {text.slice(end)}
      </>
    );
  };

  const handleToggle = () => {
    if (loading) return;
    setIsOpen((prev) => !prev);
    setSearch("");
  };

  const handleSelect = (id: number) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="position-relative w-100" ref={containerRef}>

      {/* ── Dropdown Trigger Button ── */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`btn w-100 bg-white d-flex align-items-center justify-content-between px-3 border rounded-2 shadow-none text-start ${error ? "border-danger" : "border-light-subtle"
          }`}
        style={{
          height: "42px",
          boxShadow: isOpen ? "0 0 0 3px rgba(26, 31, 54, 0.15)" : "none",
          borderColor: isOpen ? "#a5b4fc" : "",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        <div className="d-flex flex-column min-w-0" style={{ gap: "1px" }}>
          {loading ? (
            <span className="text-muted small">
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              {t("apartments.loading_units")}
            </span>
          ) : selectedApartment ? (
            <>
              <span
                className="fw-medium text-truncate"
                style={{ fontSize: "0.875rem", color: "#1a1f36", lineHeight: 1.2 }}
              >
                {selectedApartment.block}-{selectedApartment.floorNumber}{selectedApartment.unitNumber}
              </span>
              <span className="text-muted" style={{ fontSize: "0.72rem", lineHeight: 1 }}>
                {t("apartments.block_prefix", { block: selectedApartment.block })} • {t("apartments.floor_suffix", { floor: selectedApartment.floorNumber })}
              </span>
            </>
          ) : (
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              {isEmpty
                ? onlyOccupied
                  ? t("apartments.no_occupied_available")
                  : onlyVacant
                  ? t("apartments.no_vacant_available")
                  : t("apartments.no_apartments_found")
                : t("apartments.select_unit")}
            </span>
          )}
        </div>

        {/* Chevron Icon with Rotation Transition */}
        <i
          className="bi bi-chevron-down text-muted"
          style={{
            fontSize: "0.75rem",
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }}
        />
      </button>

      {/* ── Custom Dropdown Menu Floating Card ── */}
      {isOpen && (
        <div
          className="position-absolute w-100 bg-white shadow-lg"
          style={{ top: "calc(100% + 5px)", zIndex: 9999, borderRadius: "0.75rem" }}
        >

          {/* Search — exactly like apartment page filter */}
          <div
            className="d-flex align-items-center bg-white border rounded-2 px-3 text-secondary search-wrapper"
            style={{ height: "46px", transition: "border-color 0.15s, box-shadow 0.15s", borderRadius: "calc(0.75rem - 1px) calc(0.75rem - 1px) 0 0" }}
          >
            <i className="bi bi-search me-2 fs-6 text-muted" style={{ flexShrink: 0 }} />
            <input
              type="text"
              className="w-100 border-0 p-0 bg-transparent text-dark"
              placeholder={t("apartments.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ fontSize: "0.875rem", outline: "none" }}
            />
          </div>

          {/* List Box Container */}
          <ul
            className="list-unstyled m-0 p-1 overflow-y-auto"
            style={{ maxHeight: "200px", border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 calc(0.75rem - 1px) calc(0.75rem - 1px)' }}
          >
            {filteredApartments.length === 0 ? (
              <div className="text-center py-3 text-muted" style={{ fontSize: "0.8rem" }}>
                {t("apartments.no_units_found")}
              </div>
            ) : (
              filteredApartments.map((apt) => {
                const isSelected = apt.id === value;
                return (
                  <li
                    key={apt.id}
                    onClick={() => handleSelect(apt.id)}
                    className="d-flex align-items-center justify-content-between px-3 py-2 rounded-2"
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#eef2ff" : "transparent",
                      transition: "background-color 0.1s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isSelected ? "#e0e7ff" : "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? "#eef2ff" : "transparent")}
                  >
                    <div>
                      <p className="fw-medium m-0" style={{ fontSize: "0.875rem", color: "#1a1f36", lineHeight: 1.2 }}>
                        {highlightMatch(`${apt.block}-${apt.floorNumber}${apt.unitNumber}`, search)}
                      </p>
                      <p className="text-muted m-0" style={{ fontSize: "0.75rem" }}>
                        {t("apartments.block_prefix", { block: apt.block })}, {t("apartments.floor_suffix", { floor: apt.floorNumber })}
                      </p>
                    </div>
                    {isSelected && (
                      <i className="bi bi-check-lg" style={{ color: "#4f46e5", fontSize: "0.9rem" }} />
                    )}
                  </li>
                );
              })
            )}
          </ul>

        </div>
      )}

      {/* Validation Error Message block */}
      {error && (
        <p className="text-danger m-0 mt-1" style={{ fontSize: "0.75rem" }}>
          {error}
        </p>
      )}

      {isEmpty && onlyVacant && (
        <p className="m-0 mt-1 d-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.75rem", color: '#92400e', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '0.9rem' }} />
          {t("apartments.all_occupied_notice")}
        </p>
      )}
    </div>
  );
};

export default ApartmentSelect;
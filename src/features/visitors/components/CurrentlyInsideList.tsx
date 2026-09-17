import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Visitor } from '../types/visitor.types';
import { LogIn, LogOut, Phone, User, Tag, Car } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';

interface CurrentlyInsideListProps {
  visitors: Visitor[];
  loading?: boolean;
  onCheckOut: (visitorId: number) => void;
}

export const CurrentlyInsideList: React.FC<CurrentlyInsideListProps> = ({ visitors, loading, onCheckOut }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="p-4 text-center text-muted border rounded-3 bg-white">
        <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
        {t('visitors.loading_inside')}
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="p-4 text-center text-muted border rounded-3 bg-white">
        <LogIn size={32} className="text-secondary opacity-50 mb-2" />
        <p className="fw-medium mb-0">{t('visitors.no_visitors_inside')}</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {visitors.map((visitor) => (
        <div key={visitor.id} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="card-body p-3 p-md-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              {visitor.photoUrl ? (
                <img
                  src={visitor.photoUrl}
                  alt={visitor.name}
                  className="rounded-3 object-fit-cover border flex-shrink-0"
                  style={{ width: 56, height: 56 }}
                />
              ) : (
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-primary-subtle text-primary border flex-shrink-0"
                  style={{ width: 56, height: 56 }}
                >
                  <User size={26} />
                </div>
              )}

              <div>
                <div className="d-flex align-items-center gap-2">
                  <h6 className="fw-bold mb-0 text-dark">{visitor.name}</h6>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2">
                    {t('visitors.inside_badge')}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-3 text-muted small flex-wrap mt-1">
                  <span className="d-flex align-items-center gap-1">
                    <Phone size={13} />
                    {visitor.phone}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <Tag size={13} />
                    {visitor.purpose}
                  </span>
                  {visitor.vehicleNumber && (
                    <span className="d-flex align-items-center gap-1 fw-medium text-dark">
                      <Car size={13} />
                      {visitor.vehicleNumber}
                    </span>
                  )}
                </div>

                {visitor.checkedInAt && (
                  <span className="text-secondary small d-block mt-1">
                    {t('visitors.entered_at', { time: formatDate(visitor.checkedInAt) })}
                  </span>
                )}
              </div>
            </div>

            <button
              className="btn btn-dark btn-sm px-3.5 py-2 rounded-2 d-flex align-items-center gap-1.5 fw-semibold shadow-xs"
              onClick={() => onCheckOut(visitor.id)}
            >
              <LogOut size={16} />
              {t('visitors.check_out_btn')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentlyInsideList;

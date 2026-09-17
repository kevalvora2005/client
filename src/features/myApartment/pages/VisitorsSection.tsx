import React from 'react';
import { useTranslation } from 'react-i18next';
import PendingApprovalCard from '../../visitors/components/PendingApprovalCard';
import VisitorCard from '../../visitors/components/VisitorCard';
import { useVisitors } from '../../visitors/hooks/useVisitors';
import { UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVisitorMutations } from '../../visitors/hooks/useVisitorMutations';

export const VisitorsSection: React.FC = () => {
  const { t } = useTranslation();
  const { visitors, loading, refetch: fetchVisitors } = useVisitors({ userRole: 'resident', pageSize: 10 });
  const { respond, cancel } = useVisitorMutations();

  const handleApprove = async (visitorId: number) => {
    await respond(visitorId, 'Approve');
    fetchVisitors();
  };

  const handleReject = async (visitorId: number) => {
    await respond(visitorId, 'Reject');
    fetchVisitors();
  };

  const handleCancel = async (visitorId: number) => {
    await cancel(visitorId);
    fetchVisitors();
  };

  const pendingVisitors = visitors.filter((v) => v.status === 'Pending');
  const recentVisitors = visitors.filter((v) => v.status !== 'Pending').slice(0, 4);

  return (
    <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4 mb-4">
      {/* Section Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-circle bg-primary-subtle text-primary">
            <UserCheck size={20} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">{t('myApartment.visitors_header')}</h5>
            <p className="text-muted small mb-0">{t('myApartment.visitors_desc')}</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/my-visitors" className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 px-3 fw-semibold shadow-xs">
            {t('myApartment.go_to_visitors_btn')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Pending Approval Requests Banner / Cards */}
      {pendingVisitors.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold text-warning-emphasis mb-2 small text-uppercase" style={{ letterSpacing: '0.05em' }}>
            {t('myApartment.action_required_approvals', { count: pendingVisitors.length })}
          </h6>
          {pendingVisitors.map((visitor) => (
            <PendingApprovalCard
              key={visitor.id}
              visitor={visitor}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Recent Visitors */}
      {loading ? (
        <div className="p-3 text-center text-muted small">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          {t('myApartment.loading_visitors')}
        </div>
      ) : recentVisitors.length === 0 && pendingVisitors.length === 0 ? (
        <div className="p-4 text-center text-muted bg-light rounded-3">
          <p className="small mb-2 fw-medium">{t('myApartment.no_visitors_recorded')}</p>
          <Link to="/my-visitors" className="btn btn-sm btn-outline-primary rounded-2 fw-semibold">
            {t('myApartment.view_visitors_btn')}
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {recentVisitors.map((visitor) => (
            <div key={visitor.id} className="col-12 col-md-6">
              <VisitorCard
                visitor={visitor}
                userRole="resident"
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorsSection;

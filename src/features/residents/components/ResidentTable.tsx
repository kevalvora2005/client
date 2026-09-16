import { useTranslation } from 'react-i18next';
import AppTable from '../../../components/AppTable/AppTable';
import type { TableColumn } from '../../../components/AppTable/AppTable';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import type { ResidentDetail, ResidentTableProps } from '../types/resident.types';
import { formatDate, getAvatarColor, getInitials } from './residentTableHelpers';
import RowActions from './RowActions';
import { useResidentStore } from '../hooks/useResidentStore';
import { highlightMatch } from '../../../utils/highlight';

const NAME_COL_WIDTH = '18%';
const ACTIONS_COL_WIDTH = '12%';
const COL_WIDTH = '14%';

const ResidentTable = ({ residents, loading, onView, onEdit, onDeactivate }: ResidentTableProps) => {
  const { t } = useTranslation();
  const { filters } = useResidentStore();
  const searchVal = filters.search ?? '';

  const columns: TableColumn<ResidentDetail>[] = [
    {
      key: 'name',
      label: t('residents.col_name'),
      width: NAME_COL_WIDTH,
      render: (r) => {
        const { bg, color } = getAvatarColor(r.user.name);
        return (
          <div className="d-flex align-items-center gap-2 py-1 overflow-hidden">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
              style={{
                background: bg,
                color: color,
                width: '38px',
                height: '38px',
                fontSize: '0.85rem'
              }}
            >
              {getInitials(r.user.name)}
            </div>
            <div className="overflow-hidden text-truncate">
              <p className="fw-bold m-0 text-dark text-truncate" style={{ fontSize: '0.925rem', letterSpacing: '-0.01em' }}>
                {highlightMatch(r.user.name, searchVal)}
              </p>
              <p className="m-0 text-muted text-truncate" style={{ fontSize: '0.8rem' }}>
                {highlightMatch(r.user.email, searchVal)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'apartment',
      label: t('residents.col_apartment'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => r.apartment ? (
        <div className="text-truncate">
          <p className="fw-semibold m-0 text-dark text-truncate" style={{ fontSize: '0.9rem' }}>
            {highlightMatch(`${r.apartment.block}-${r.apartment.floorNumber}${r.apartment.unitNumber}`, searchVal)}
          </p>
          <p className="m-0 text-muted text-truncate" style={{ fontSize: '0.8rem' }}>
            {t('apartments.block_prefix', { block: r.apartment.block })} - {t('apartments.floor_suffix', { floor: r.apartment.floorNumber })}
          </p>
        </div>
      ) : <span className="text-muted small">—</span>,
    },
    {
      key: 'type',
      label: t('residents.col_type'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <span
          className="badge rounded-pill fw-medium px-3 py-2"
          style={{
            fontSize: '0.8rem',
            backgroundColor: r.isOwner ? '#e0f2fe' : '#e0e7ff',
            color: r.isOwner ? '#0369a1' : '#4f46e5'
          }}
        >
          {r.isOwner ? t('roles.owner') : t('roles.tenant')}
        </span>
      ),
    },
    {
      key: 'moveInDate',
      label: t('residents.col_registered_on'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <span className="text-dark fw-normal" style={{ fontSize: '0.875rem' }}>
          {formatDate(r.moveInDate)}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <StatusBadge variant={r.isActive ? 'success' : 'secondary'} label={r.isActive ? t('residents.status_active') : t('residents.status_inactive')} />
      ),
    },
    {
      key: 'occupant',
      label: t('residents.col_occupant'),
      width: COL_WIDTH,
      align: 'center',
      render: (r) => (
        <StatusBadge variant={r.isOccupant ? 'success' : 'secondary'} label={r.isOccupant ? t('residents.status_occupant') : t('residents.status_non_occupant')} />
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      width: ACTIONS_COL_WIDTH,
      align: 'center',
      render: (r) => (
        <div className="d-flex justify-content-center">
          <RowActions
            resident={r}
            onView={() => onView(r)}
            onEdit={() => onEdit(r)}
            onDeactivate={() => onDeactivate(r)}
          />
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={residents}
      loading={loading}
      rowKey={(r) => r.id}
      emptyTitle={t('residents.no_residents_found')}
      emptySubtitle={t('residents.no_residents_desc')}
      emptyIcon="bi-people"
      tableStyle={{ tableLayout: 'fixed' }}
    />
  );
};

export default ResidentTable;
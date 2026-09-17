import { useTranslation } from "react-i18next";
import type { FamilyMember } from "../types/familyMember.types";

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  readOnly?: boolean;
}

const relationIcons: Record<string, string> = {
  Spouse: "bi-heart",
  Child: "bi-star",
  Parent: "bi-person-standing",
  Sibling: "bi-people",
  Other: "bi-person",
};

const FamilyMemberCard = ({ member, onEdit, onDelete, readOnly = false }: FamilyMemberCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border border-light-subtle bg-white gap-3 flex-wrap">
      {/* ── Left — icon + info ── */}
      <div className="d-flex align-items-center gap-3 min-w-0">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 42, height: 42, background: "#eef2ff", color: "#4338ca" }}
        >
          <i className={`bi ${relationIcons[member.relation] ?? "bi-person"}`} style={{ fontSize: "1.1rem" }} />
        </div>
        <div>
          <p className="fw-semibold mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
            {member.name}
          </p>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span
              className="badge rounded-pill fw-medium px-2 py-1"
              style={{ fontSize: "0.75rem", background: "#eef2ff", color: "#4338ca" }}
            >
              {t(`myApartment.relation_${member.relation.toLowerCase()}`)}
            </span>
            {member.age != null && (
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                {member.age} {t('myApartment.yrs')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Right — actions ── */}
      {!readOnly && (
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            style={{ fontSize: "0.8rem", borderRadius: "8px" }}
            onClick={() => onEdit(member)}
          >
            <i className="bi bi-pencil" /> {t('common.edit')}
          </button>
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            style={{ fontSize: "0.8rem", borderRadius: "8px" }}
            onClick={() => onDelete(member)}
          >
            <i className="bi bi-trash3" /> {t('myApartment.remove')}
          </button>
        </div>
      )}
    </div>
  );
};

export default FamilyMemberCard;
import { CheckCircle, Clock, Ban, User, Building, Download, Upload, Trash2, AlertCircle, FileText, FileSignature, FileSpreadsheet, FileImage, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DocumentRequestItem } from "../types/documentRequest.types";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";
import { getDocTypeLabel } from "../utils/getDocTypeLabel";

const DOCUMENT_TYPE_ICONS: Record<string, typeof FileText> = {
  "Rent / Lease Agreement": FileSignature,
  "NOC for Address Proof (Passport/Aadhaar)": FileImage,
  "Police Verification Certificate Form": FileSpreadsheet,
  "Utility Bill Copy (Electricity/Water)": FileText,
  "Rent Receipt (HRA Claim)": FileSignature,
  "NOC for Wi-Fi / Gas / DTH Connection": FileText,
};

const cardAccentBorder = (status: string) => {
  if (status === "UPLOADED") return "3px solid #15803d";
  if (status === "REJECTED") return "3px solid #dc2626";
  return "3px solid #d97706";
};

interface Props {
  item: DocumentRequestItem;
  isSent: boolean;
  isAdmin: boolean;
  onUpload: (item: DocumentRequestItem) => void;
  onReject: (item: DocumentRequestItem) => void;
  onCancel: (id: number) => void;
  onViewDetail: (item: DocumentRequestItem) => void;
}

const DocumentRequestCard = ({ item, isSent, isAdmin, onUpload, onReject, onCancel, onViewDetail }: Props) => {
  const { t } = useTranslation();
  const otherParty = isSent ? item.target : item.requester;

  const statusMeta = (status: string) => {
    if (status === "UPLOADED") return { label: t("documents.status_uploaded"), bg: "bg-success-subtle", text: "text-success", border: "border-success-subtle", icon: CheckCircle };
    if (status === "REJECTED") return { label: t("documents.status_declined"), bg: "bg-danger-subtle", text: "text-danger", border: "border-danger-subtle", icon: Ban };
    return { label: t("documents.status_pending"), bg: "bg-warning-subtle", text: "text-warning-emphasis", border: "border-warning-subtle", icon: Clock };
  };

  const sm = statusMeta(item.status);
  const StatusIcon = sm.icon;
  const DocIcon = DOCUMENT_TYPE_ICONS[item.documentType] || FileText;

  return (
    <div
      className="section-card"
      style={{ borderLeft: cardAccentBorder(item.status), transition: "box-shadow 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div className="p-3 p-md-4 d-flex flex-column gap-2">
        <div className="d-flex align-items-start gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2" style={{ width: 40, height: 40, background: "#f3f4f6" }}>
              <DocIcon size={20} className="text-secondary" />
            </div>
            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ fontSize: "0.95rem" }}>
                  {getDocTypeLabel(item.documentType, t)}
                </h6>
                <span className={`badge rounded-pill ${sm.bg} ${sm.text} ${sm.border} d-inline-flex align-items-center gap-1 px-3 py-1 text-nowrap`} style={{ fontSize: "0.72rem", fontWeight: 600, borderWidth: 1 }}>
                  <StatusIcon size={12} /> {sm.label}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3 text-muted flex-wrap" style={{ fontSize: "0.78rem" }}>
                <span className="d-inline-flex align-items-center gap-1"><Clock size={12} /> {formatRelativeTime(item.createdAt)}</span>
                {item.apartment && (
                  <span className="d-inline-flex align-items-center gap-1">
                    <Building size={12} /> {item.apartment.block}-{item.apartment.floorNumber}{item.apartment.unitNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0 flex-wrap">
            <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center px-2 py-1.5 rounded-2"
              style={{ fontSize: "0.8rem", width: 34, height: 34 }} onClick={() => onViewDetail(item)}
              title={t("documents.view_details")}>
              <Eye size={15} />
            </button>
            {item.status === "UPLOADED" && item.documentUrl && (
              <a href={item.documentUrl} target="_blank" rel="noreferrer"
                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 rounded-2"
                style={{ fontSize: "0.8rem" }}>
                <Download size={14} /> {t("documents.download")}
              </a>
            )}
            {isAdmin && item.status === "APPROVED" && (
              <>
                <button className="btn btn-sm btn-dark d-inline-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 rounded-2"
                  style={{ fontSize: "0.8rem" }} onClick={() => onUpload(item)}>
                  <Upload size={14} /> {t("documents.upload")}
                </button>
                <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 fw-semibold px-2.5 py-1.5 rounded-2"
                  style={{ fontSize: "0.8rem" }} onClick={() => onReject(item)}>
                  <Ban size={14} /> {t("documents.decline")}
                </button>
              </>
            )}
            {!isAdmin && !isSent && item.status === "PENDING" && (
              <>
                <button className="btn btn-sm btn-dark d-inline-flex align-items-center gap-1.5 fw-semibold px-3 py-1.5 rounded-2"
                  style={{ fontSize: "0.8rem" }} onClick={() => onUpload(item)}>
                  <Upload size={14} /> {t("documents.upload")}
                </button>
                <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 fw-semibold px-2.5 py-1.5 rounded-2"
                  style={{ fontSize: "0.8rem" }} onClick={() => onReject(item)}>
                  <Ban size={14} /> {t("documents.decline")}
                </button>
              </>
            )}
            {isSent && item.status === "PENDING" && (
              <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2.5 py-1.5 rounded-2"
                style={{ fontSize: "0.8rem" }} onClick={() => onCancel(item.id)}>
                <Trash2 size={14} /> {t("common.cancel")}
              </button>
            )}
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2" style={{ paddingLeft: 52 }}>
          {otherParty && (
            <span className="d-inline-flex align-items-center gap-1 small text-dark fw-medium" style={{ fontSize: "0.8rem" }}>
              <User size={13} />
              {isAdmin
                ? t("documents.from_user", { name: otherParty.user.name })
                : isSent
                ? t("documents.to_user", { name: otherParty.user.name })
                : t("documents.from_user", { name: otherParty.user.name })}
            </span>
          )}
          {item.note && (
            <span className="small text-muted" style={{ fontSize: "0.78rem" }}>&middot; {item.note}</span>
          )}
          {item.status === "REJECTED" && item.rejectionReason && (
            <span className="small text-danger d-inline-flex align-items-center gap-1" style={{ fontSize: "0.78rem" }}>
              <AlertCircle size={12} /> {t("documents.reason_prefix", { reason: item.rejectionReason })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { DocumentRequestCard };

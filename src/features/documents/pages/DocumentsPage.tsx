import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { useDocumentRequests } from "../hooks/useDocumentRequests";
import { useDocumentRequestMutations } from "../hooks/useDocumentRequestMutations";
import DocumentRequestTable from "../components/DocumentRequestTable";
import RequestDocumentModal from "../components/RequestDocumentModal";
import UploadDocumentModal from "../components/UploadDocumentModal";
import RejectDocumentModal from "../components/RejectDocumentModal";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import Pagination from "../../../components/Pagination/Pagination";
import type { DocumentRequestItem } from "../types/documentRequest.types";

const DocumentsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isOwner = user?.resident?.isOwner ?? false;

  const tabParam = searchParams.get("tab");
  const activeTab: "my-requests" | "received-requests" =
    tabParam === "received-requests" ? "received-requests" : "my-requests";

  const { myRequests, receivedRequests, loading, refetch } = useDocumentRequests(isAdmin, isOwner);
  const { createRequest, uploadDocument, rejectRequest, cancelRequest } = useDocumentRequestMutations(refetch);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<DocumentRequestItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DocumentRequestItem | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);

  const currentList = isAdmin ? receivedRequests : (activeTab === "my-requests" ? myRequests : receivedRequests);
  const totalCount = currentList.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 0;
  const paginatedList = currentList.slice((page - 1) * pageSize, page * pageSize);

  const handleTabChange = (tab: "my-requests" | "received-requests") => {
    setSearchParams({ tab });
    setPage(1);
  };

  const paginationObj = {
    pageNumber: page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    await cancelRequest(cancelTargetId);
    setCancelTargetId(null);
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <h4 className="fw-bold mb-2 fs-4 fs-sm-3" style={{ color: '#1a1f36' }}>
            {t('documents.page_title')}
          </h4>
          <p className="text-muted small mb-0">
            {isAdmin
              ? t('documents.page_desc_admin')
              : t('documents.page_desc_resident')}
          </p>
        </div>

        {!isAdmin && activeTab === "my-requests" && (
          <button className="page-add-btn" onClick={() => setShowRequestModal(true)}>
            <Plus size={16} /> {t('documents.request_document_btn')}
          </button>
        )}
      </div>

      {!isAdmin && isOwner && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          <TabButton label={t('documents.tab_my_sent')} count={myRequests.length} active={activeTab === "my-requests"} onClick={() => handleTabChange("my-requests")} />
          <TabButton label={t('documents.tab_received_tenant')} count={receivedRequests.length} active={activeTab === "received-requests"} onClick={() => handleTabChange("received-requests")} />
        </div>
      )}

      <div className="card bg-white border border-light-subtle rounded-3 shadow-sm">
        <DocumentRequestTable
          requests={paginatedList}
          loading={loading}
          isSent={!isAdmin && activeTab === "my-requests"}
          isAdmin={isAdmin}
          onUpload={setUploadTarget}
          onReject={setRejectTarget}
          onCancel={setCancelTargetId}
          onViewDetail={(item) => navigate(`/documents/${item.id}`)}
        />

        {(!loading && totalCount > 0) && (
          <div className="card-footer bg-white border-top border-light-subtle p-3 d-flex justify-content-end">
            <Pagination
              pagination={paginationObj}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      <RequestDocumentModal open={!isAdmin && showRequestModal} onClose={() => setShowRequestModal(false)} isOwner={isOwner} onSubmit={createRequest} />
      <UploadDocumentModal target={uploadTarget} onClose={() => setUploadTarget(null)} onSubmit={uploadDocument} />
      <RejectDocumentModal target={rejectTarget} onClose={() => setRejectTarget(null)} onSubmit={rejectRequest} />
      <ConfirmDialog
        show={!!cancelTargetId}
        title={t('documents.cancel_dialog_title')}
        message={t('documents.cancel_dialog_message')}
        confirmLabel={t('documents.cancel_dialog_confirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTargetId(null)}
      />
    </div>
  );
};

const TabButton = ({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    className="btn btn-sm fw-semibold px-3 py-2"
    style={{
      borderRadius: "8px", fontSize: "0.83rem",
      backgroundColor: active ? "#1a1f36" : "#ffffff",
      color: active ? "#ffffff" : "#4b5563",
      border: `1px solid ${active ? "#1a1f36" : "#e5e7eb"}`,
      transition: "all 0.15s",
    }}
    onClick={onClick}
  >
    {label} ({count})
  </button>
);

export default DocumentsPage;

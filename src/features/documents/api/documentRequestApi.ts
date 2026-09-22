import api from "../../../config/api";
import type { CreateDocumentRequestPayload, DocumentRequestItem, DocumentRequestDetail, PresignedPostResponse, DownloadUrlResponse } from "../types/documentRequest.types";

export const documentRequestApi = {
  createRequest: async (payload: CreateDocumentRequestPayload): Promise<DocumentRequestItem> => {
    const res = await api.post<{ success: boolean; data: DocumentRequestItem }>("/document-requests", payload);
    return res.data.data;
  },

  getMyRequests: async (): Promise<DocumentRequestItem[]> => {
    const res = await api.get<{ success: boolean; data: DocumentRequestItem[] }>("/document-requests/my-requests");
    return res.data.data;
  },

  getReceivedRequests: async (): Promise<DocumentRequestItem[]> => {
    const res = await api.get<{ success: boolean; data: DocumentRequestItem[] }>("/document-requests/received-requests");
    return res.data.data;
  },

  uploadDocument: async (requestId: number, file: File): Promise<DocumentRequestItem> => {
    const formData = new FormData();
    formData.append("document", file);
    const res = await api.post<{ success: boolean; data: DocumentRequestItem }>(
      `/document-requests/${requestId}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  getUploadUrl: async (requestId: number, fileName: string, contentType: string): Promise<PresignedPostResponse> => {
    const res = await api.post<{ success: boolean; data: PresignedPostResponse }>(
      `/document-requests/${requestId}/upload-url`,
      { fileName, contentType },
    );
    return res.data.data;
  },

  uploadToS3: async (url: string, fields: Record<string, string>, file: File): Promise<void> => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed with status ${response.status}`);
    }
  },

  confirmUpload: async (requestId: number, s3Key: string, fileName: string): Promise<DocumentRequestItem> => {
    const res = await api.post<{ success: boolean; data: DocumentRequestItem }>(
      `/document-requests/${requestId}/confirm-upload`,
      { s3Key, fileName },
    );
    return res.data.data;
  },

  uploadDocumentViaS3: async (requestId: number, file: File): Promise<DocumentRequestItem> => {
    const { url, fields, key } = await documentRequestApi.getUploadUrl(
      requestId,
      file.name,
      file.type,
    );

    await documentRequestApi.uploadToS3(url, fields, file);

    return documentRequestApi.confirmUpload(requestId, key, file.name);
  },

  rejectRequest: async (requestId: number, rejectionReason: string): Promise<DocumentRequestItem> => {
    const res = await api.post<{ success: boolean; data: DocumentRequestItem }>(
      `/document-requests/${requestId}/reject`,
      { rejectionReason }
    );
    return res.data.data;
  },

  cancelRequest: async (requestId: number): Promise<void> => {
    await api.delete(`/document-requests/${requestId}`);
  },

  getDownloadUrl: async (requestId: number): Promise<string> => {
    const res = await api.get<{ success: boolean; data: DownloadUrlResponse }>(
      `/document-requests/${requestId}/download-url`
    );
    return res.data.data.downloadUrl;
  },

  getDetail: async (requestId: number): Promise<DocumentRequestDetail> => {
    const res = await api.get<{ success: boolean; data: DocumentRequestDetail }>(
      `/document-requests/${requestId}/detail`,
    );
    return res.data.data;
  },

  bulkRecordVotes: async (requestId: number, votes: { committeeMemberId: number; vote: "Approve" | "Reject" }[], adminVote?: "Approve" | "Reject"): Promise<void> => {
    await api.post(`/document-requests/${requestId}/votes`, { votes, adminVote });
  },

  finalizeRequest: async (requestId: number): Promise<DocumentRequestItem> => {
    const res = await api.post<{ success: boolean; data: DocumentRequestItem }>(
      `/document-requests/${requestId}/finalize`,
    );
    return res.data.data;
  },
};

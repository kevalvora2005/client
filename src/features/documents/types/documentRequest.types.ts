export type DocumentRequestStatus = "PENDING" | "APPROVED" | "UPLOADED" | "REJECTED";
export type RequestRole = "TENANT" | "OWNER" | "ADMIN";

export interface DocumentRequestItem {
  id: number;
  apartmentId: number;
  requesterId: number;
  requesterRole: RequestRole;
  targetId: number | null;
  targetRole: RequestRole;
  documentType: string;
  customDocumentName: string | null;
  note: string | null;
  status: DocumentRequestStatus;
  documentUrl: string | null;
  documentFileName: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  apartment?: {
    id: number;
    block: string;
    floorNumber: number;
    unitNumber: string;
  };
  requester?: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
  target?: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface CreateDocumentRequestPayload {
  documentType: string;
  customDocumentName?: string;
  note?: string;
}

export interface PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

export interface CommitteeMember {
  id: number;
  fullName: string;
  email: string;
  apartmentId: number;
}

export interface DocumentRequestVote {
  id?: number;
  documentRequestId: number;
  committeeMemberId?: number;
  vote: "Approve" | "Reject";
  recordedByAdminId?: number;
  createdAt?: string;
  committeeMember?: {
    id: number;
    apartmentId: number;
    user?: { id: number; name: string };
  } | null;
}

export interface DocumentRequestDetail extends DocumentRequestItem {
  votes: DocumentRequestVote[];
  committeeMembers: CommitteeMember[];
}

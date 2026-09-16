import api from '../../../config/api';
import type {
  Apartment,
  ApartmentFilters,
  ApartmentsResponse,
  CreateApartmentPayload,
  ImportApartmentResult,
  FailedImportItem,
} from '../types/apartment.types';

export interface ImportApartmentsResponse {
  message: string;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  failedItems: FailedImportItem[];
}

export const apartmentApi = {
  getApartments: async (filters: ApartmentFilters): Promise<ApartmentsResponse> => {
    const params = new URLSearchParams();
    params.append("pageNumber", String(filters.pageNumber || 1));
    params.append("pageSize", String(filters.pageSize || 100));
    if (filters.search) params.append("search", filters.search);
    if (filters.type) params.append("type", filters.type);
    if (filters.isOccupied !== undefined) params.append("isOccupied", String(filters.isOccupied));

    const response = await api.get(`/apartments?${params.toString()}`);
    const body = response.data;

    // Support all response structures
    const rawData = body?.data?.data || body?.data || body;
    let itemsList: Apartment[] = [];
    if (Array.isArray(rawData)) {
      itemsList = rawData;
    } else if (Array.isArray(rawData?.items)) {
      itemsList = rawData.items;
    } else if (Array.isArray(body?.items)) {
      itemsList = body.items;
    } else if (Array.isArray(body)) {
      itemsList = body;
    }

    const pageNum = rawData?.pageNumber || filters.pageNumber || 1;
    const totalP = rawData?.totalPages || 1;
    return {
      items: itemsList,
      pageNumber: pageNum,
      pageSize: rawData?.pageSize || filters.pageSize || 100,
      totalCount: rawData?.totalCount || itemsList.length,
      totalPages: totalP,
      hasNextPage: rawData?.hasNextPage ?? pageNum < totalP,
      hasPreviousPage: rawData?.hasPreviousPage ?? pageNum > 1,
      stats: rawData?.stats,
    };
  },

  getApartment: async (id: number): Promise<Apartment> => {
    const response = await api.get(`/apartments/${id}`);
    const body = response.data;
    return body?.data?.data || body?.data || body;
  },

  getVacantApartments: async (): Promise<Apartment[]> => {
    const res = await apartmentApi.getApartments({ pageSize: 100, pageNumber: 1 });
    return res.items.filter((a) => !a.isOccupied);
  },

  createApartment: async (payload: CreateApartmentPayload): Promise<Apartment> => {
    const response = await api.post('/apartments', payload);
    const body = response.data;
    return body?.data?.data || body?.data || body;
  },

  importApartments: async (file: File): Promise<ImportApartmentResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/apartments/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const body = response.data;
    const data = body?.data?.data || body?.data || body;

    return {
      successCount: data?.successCount || 0,
      failedCount: data?.failedItems?.length || data?.failedCount || 0,
      failedItems: data?.failedItems || [],
    };
  },
};
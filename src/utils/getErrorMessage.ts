import axios from "axios";
import i18n from "../config/i18n";

export const getErrorMessage = (err: unknown, fallback = "Something went wrong"): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;

    if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
      return data.details.join(", ");
    }

    if (data?.errorCode) {
      if (i18n.exists(`errors.${data.errorCode}`)) {
        return i18n.t(`errors.${data.errorCode}`);
      }

      const modules = ["common", "auth", "visitors", "maintenance", "amenities", "apartments", "residents", "complaints", "documents", "tenants"];
      for (const mod of modules) {
        const key = `errors.${mod}.${data.errorCode}`;
        if (i18n.exists(key)) {
          return i18n.t(key);
        }
      }
    }

    return data?.message ?? data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};
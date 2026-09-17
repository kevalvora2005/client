import i18n from 'i18next';
import type { TFunction } from 'i18next';

export const OWNER_DOC_TYPES = [
  "No Due Certificate / Clearance Certificate",
  "Society Maintenance Ledger / Statement",
  "NOC for Property Sale / Rental",
  "Building Plan / Layout Approval Copy",
  "Membership Transfer / Share Certificate",
  "AGM / Committee Meeting Minutes",
  "Fire Safety Compliance Certificate",
  "Parking Slot Allocation / Transfer Letter",
  "Property Tax Receipt (Society-Level)",
  "Common Area Maintenance Certificate",
  "Other",
] as const;

export const TENANT_DOC_TYPES = [
  "Rent / Lease Agreement",
  "NOC for Address Proof (Passport/Aadhaar)",
  "Police Verification Certificate Form",
  "Utility Bill Copy (Electricity/Water)",
  "Rent Receipt (HRA Claim)",
  "NOC for Wi-Fi / Gas / DTH Connection",
  "Maintenance / Sinking Fund Receipt",
  "Property Tax Paid Certificate",
  "Water / Electricity Meter Reading Statement",
  "Society ID Card / Gate Pass Letter",
  "Other",
] as const;

const DOC_TYPE_KEY_MAP: Record<string, string> = {
  "Rent / Lease Agreement": "documents.doc_type_rent_lease",
  "NOC for Address Proof (Passport/Aadhaar)": "documents.doc_type_noc_address",
  "Police Verification Certificate Form": "documents.doc_type_police_verification",
  "Utility Bill Copy (Electricity/Water)": "documents.doc_type_utility_bill",
  "Rent Receipt (HRA Claim)": "documents.doc_type_rent_receipt",
  "NOC for Wi-Fi / Gas / DTH Connection": "documents.doc_type_noc_utility",
  "Maintenance / Sinking Fund Receipt": "documents.doc_type_maintenance_receipt",
  "Property Tax Paid Certificate": "documents.doc_type_property_tax",
  "Water / Electricity Meter Reading Statement": "documents.doc_type_meter_reading",
  "Society ID Card / Gate Pass Letter": "documents.doc_type_society_id",
  "No Due Certificate / Clearance Certificate": "documents.doc_type_no_due",
  "Society Maintenance Ledger / Statement": "documents.doc_type_ledger_statement",
  "NOC for Property Sale / Rental": "documents.doc_type_noc_sale_rental",
  "Building Plan / Layout Approval Copy": "documents.doc_type_building_plan",
  "Membership Transfer / Share Certificate": "documents.doc_type_membership_share",
  "AGM / Committee Meeting Minutes": "documents.doc_type_agm_minutes",
  "Fire Safety Compliance Certificate": "documents.doc_type_fire_safety",
  "Parking Slot Allocation / Transfer Letter": "documents.doc_type_parking_letter",
  "Property Tax Receipt (Society-Level)": "documents.doc_type_property_tax_society",
  "Common Area Maintenance Certificate": "documents.doc_type_common_area",
  "Other": "documents.doc_type_other",
};

export const getDocTypeLabel = (
  docType?: string | null,
  t: TFunction = i18n.t
): string => {
  if (!docType) return "";
  const key = DOC_TYPE_KEY_MAP[docType];
  return key ? t(key) : docType;
};

export type AddonServiceType =
  | "adapter"
  | "authorization_letter"
  | "personal_insurance"
  | "tm2_tm3"
  | "tdac"
  | "towing"
  | "sim_card";

export interface AddonFormField {
  key: string;
  label: string;
  type: "text" | "tel" | "date";
  placeholder?: string;
  helperText?: string;
  required: boolean;
}

export interface AddonDocumentRequirement {
  key: string;
  label: string;
  helperText: string;
  required: boolean;
}

export interface AddonServiceConfig {
  type: AddonServiceType;
  title: string;
  description: string;
  icon: string; // lucide icon name
  fields: AddonFormField[];
  documents: AddonDocumentRequirement[];
}

export interface AddonFormData {
  fullName: string;
  phone: string;
  driverName?: string;
  destination?: string;
  travelDate?: string;
  [key: string]: string | undefined;
}

export interface AddonSubmission {
  addonType: AddonServiceType;
  formData: AddonFormData;
  documents: Record<string, File | null>;
}

export interface AddonRequest {
  id: string;
  addonType: AddonServiceType;
  fullName: string;
  phone: string;
  additionalDetails: Record<string, string>;
  documentUrls: Record<string, string>;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  orderId?: string;
}

// Service configurations
export const ADDON_SERVICES: AddonServiceConfig[] = [
  {
    type: "adapter",
    title: "Adapter",
    description: "Vehicle adapter service for cross-border travel",
    icon: "Plug",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
    ],
    documents: [],
  },
  {
    type: "authorization_letter",
    title: "Authorization Letter",
    description: "Official authorization for another driver to operate the vehicle",
    icon: "ScrollText",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
      { key: "driverName", label: "Who will drive the vehicle?", type: "text", placeholder: "Enter driver's full name", required: true },
    ],
    documents: [
      { key: "passport", label: "Passport", helperText: "Upload a clear passport photo", required: true },
      { key: "vehicleOwnerIC", label: "Vehicle Owner IC", helperText: "IC of the vehicle owner must be clearly visible", required: true },
      { key: "vehicleGrant", label: "Vehicle Grant", helperText: "Vehicle grant must be clearly visible", required: true },
    ],
  },
  {
    type: "personal_insurance",
    title: "Personal Insurance",
    description: "Personal accident and travel insurance coverage",
    icon: "Shield",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
    ],
    documents: [
      { key: "passport", label: "Passport", helperText: "Upload a clear passport photo", required: true },
    ],
  },
  {
    type: "tm2_tm3",
    title: "TM2 / TM3",
    description: "Cross-border travel permit documentation",
    icon: "FileCheck",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
    ],
    documents: [
      { key: "passport", label: "Passport", helperText: "Upload a clear passport photo", required: true },
      { key: "vehicleGrant", label: "Vehicle Grant", helperText: "Vehicle grant must be clearly visible", required: true },
    ],
  },
  {
    type: "tdac",
    title: "TDAC",
    description: "Thai Duty and Customs clearance for vehicles",
    icon: "FileText",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
      { key: "destination", label: "Where are you going?", type: "text", placeholder: "Enter destination city or province", helperText: "e.g. Bangkok, Hatyai, Phuket", required: true },
      { key: "travelDate", label: "When are you going?", type: "date", required: true },
    ],
    documents: [
      { key: "passport", label: "Passport", helperText: "Upload a clear passport photo", required: true },
    ],
  },
  {
    type: "towing",
    title: "Towing",
    description: "Vehicle towing and roadside assistance",
    icon: "Truck",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
    ],
    documents: [
      { key: "vehicleGrant", label: "Vehicle Grant", helperText: "Vehicle grant must be clearly visible", required: true },
      { key: "passport", label: "Passport", helperText: "Upload a clear passport photo", required: true },
    ],
  },
  {
    type: "sim_card",
    title: "SIM Card",
    description: "Thai SIM card with data plan for your trip",
    icon: "Smartphone",
    fields: [
      { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
      { key: "phone", label: "Phone Number", type: "tel", placeholder: "+60 12-345-6789", required: true },
    ],
    documents: [],
  },
];

// Shared TypeScript types — mirrors the interfaces exported from agent/src/agent.ts

export interface ChecklistItem {
  category: string;
  item: string;
  priority: string;
  completed: boolean;
}

export interface VendorAssessment {
  vendorId: string;
  name: string;
  country: string;
  category: string;
  riskScore: number;
  riskLevel: string;
  eligible: boolean;
  categoryMatch: boolean;
  justification: string;
}

export interface TargetedVendor {
  vendorId: string;
  name: string;
  country: string;
  riskScore: number;
  riskLevel: string;
  justification: string;
}

export interface DiscardedVendor {
  vendorId: string;
  name: string;
  country: string;
  riskScore: number;
  riskLevel: string;
  reason: string;
}

export interface RfpOutput {
  rfpTopic: string;
  budget: number;
  prerequisitesChecklist: ChecklistItem[];
  technicalChecklist: ChecklistItem[];
  functionalChecklist: ChecklistItem[];
  vendorAssessment: VendorAssessment[];
  retainedVendors: TargetedVendor[];
  discardedVendors: DiscardedVendor[];
}

export type Currency = 'USD' | 'EUR';

// Form → App communication

export interface GenerateRequest {
  agentName: string;
  agentVersion: string;
  rfpTopic: string;
  rfpBudget: number;
  currency: Currency;
}

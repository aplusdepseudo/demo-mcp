// Shared TypeScript types — mirrors the interfaces exported from agent/src/rfpAgent.ts

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

export interface RfpOutput {
  rfpTopic: string;
  budget: number;
  prerequisitesChecklist: ChecklistItem[];
  technicalChecklist: ChecklistItem[];
  functionalChecklist: ChecklistItem[];
  vendorAssessment: VendorAssessment[];
  targetedVendors: TargetedVendor[];
}

// API request / response shapes

export interface GenerateRequest {
  projectEndpoint: string;
  agentName: string;
  agentVersion: string;
  mcpServerUrl: string;
  rfpTopic: string;
  rfpBudget: number;
}

// SSE event payloads streamed from the backend
export type SseEvent =
  | { type: 'status'; message: string }
  | { type: 'tool_call'; toolName: string }
  | { type: 'result'; output: RfpOutput }
  | { type: 'error'; message: string };

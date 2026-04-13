type Supplier = {
  id: string;
  name: string;
  status: string;
  category: string;
  country: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  risk_score: number;
  created_date: string;
  last_activity_date?: string;
};

type PurchaseOrder = {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  status: string;
  total_amount: number;
  currency: string;
  created_date: string;
  contract_reference?: string;
  anomaly_flag?: string;
};

type Requisition = {
  id: string;
  requisition_number: string;
  requester: string;
  status: string;
  total_amount: number;
  currency: string;
  created_date: string;
  approval_status: string;
  description: string;
};

type Invoice = {
  id: string;
  invoice_number: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  created_date: string;
  paid_date?: string;
  anomaly_flag?: string;
  rejection_reason?: string;
};

type Contract = {
  id: string;
  contract_number: string;
  title: string;
  supplier_id: string;
  supplier_name: string;
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  status: string;
  anomaly_flag?: string;
};

type RfpRequirement = {
  id: string;
  category: string;
  description: string;
  priority: string;
  weight: number;
};

type Rfp = {
  id: string;
  title: string;
  status: string;
  deadline: string;
  budget_max: number;
  currency: string;
  requirements: RfpRequirement[];
};

type Proposal = {
  id: string;
  rfp_id: string;
  supplier_id: string;
  supplier_name: string;
  status: string;
  submitted_date: string;
  pricing: {
    total: number;
    currency: string;
  };
  delivery_weeks: number;
  validity_days: number;
};

const suppliersDb: Record<string, Supplier> = {
  'SUP-1000': {
    id: 'SUP-1000',
    name: 'ERPMax Solutions',
    status: 'Active',
    category: 'ERP Software',
    country: 'USA',
    contact_name: 'Sarah Mitchell',
    contact_email: 'sarah.mitchell@erpmax.com',
    contact_phone: '+1-555-0142',
    risk_score: 2.1,
    created_date: '2024-03-15T00:00:00'
  },
  'SUP-1001': {
    id: 'SUP-1001',
    name: 'IntegraPro Systems',
    status: 'Active',
    category: 'ERP Software',
    country: 'USA',
    contact_name: 'Michael Chen',
    contact_email: 'm.chen@integrapro.com',
    contact_phone: '+1-555-0287',
    risk_score: 1.8,
    created_date: '2023-11-20T00:00:00'
  },
  'SUP-1002': {
    id: 'SUP-1002',
    name: 'CloudFirst ERP',
    status: 'Active',
    category: 'ERP Software',
    country: 'USA',
    contact_name: 'Jennifer Walsh',
    contact_email: 'j.walsh@cloudfirsterp.com',
    contact_phone: '+1-555-0393',
    risk_score: 3.5,
    created_date: '2025-01-10T00:00:00'
  },
  'SUP-1003': {
    id: 'SUP-1003',
    name: 'ERP Max Solutions Inc',
    status: 'Active',
    category: 'ERP Software',
    country: 'USA',
    contact_name: 'Sarah Mitchell',
    contact_email: 's.mitchell@erpmax.com',
    contact_phone: '+1-555-0142',
    risk_score: 2.3,
    created_date: '2025-06-01T00:00:00'
  },
  'SUP-1004': {
    id: 'SUP-1004',
    name: 'Legacy Systems Corp',
    status: 'Active',
    category: 'Legacy Software',
    country: 'USA',
    contact_name: 'Robert Johnson',
    contact_email: 'r.johnson@legacysystems.com',
    contact_phone: '+1-555-0199',
    risk_score: 7.5,
    created_date: '2019-03-01T00:00:00',
    last_activity_date: '2023-12-15T00:00:00'
  }
};

const purchaseOrdersDb: Record<string, PurchaseOrder> = {
  'PO-2024001': {
    id: 'PO-2024001',
    order_number: 'PO-2024001',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    status: 'Closed',
    total_amount: 125000,
    currency: 'USD',
    created_date: '2024-06-15T00:00:00'
  },
  'PO-2025002': {
    id: 'PO-2025002',
    order_number: 'PO-2025002',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    status: 'Received',
    total_amount: 35000,
    currency: 'USD',
    created_date: '2025-08-05T00:00:00'
  },
  'PO-2025003': {
    id: 'PO-2025003',
    order_number: 'PO-2025003',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    status: 'Closed',
    total_amount: 15000,
    currency: 'USD',
    created_date: '2025-03-15T00:00:00'
  },
  'PO-2025006': {
    id: 'PO-2025006',
    order_number: 'PO-2025006',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    status: 'Pending Approval',
    total_amount: 75000,
    currency: 'USD',
    created_date: '2025-12-01T00:00:00',
    contract_reference: 'CON-5025001',
    anomaly_flag: 'PO amount ($75,000) exceeds contract value ($25,000)'
  }
};

const requisitionsDb: Record<string, Requisition> = {
  'REQ-3024001': {
    id: 'REQ-3024001',
    requisition_number: 'REQ-3024001',
    requester: 'John Smith',
    status: 'Approved',
    total_amount: 390000,
    currency: 'USD',
    created_date: '2026-01-20T00:00:00',
    approval_status: 'Approved',
    description: 'Enterprise ERP System - ERPMax Solutions proposal'
  },
  'REQ-3024002': {
    id: 'REQ-3024002',
    requisition_number: 'REQ-3024002',
    requester: 'Jane Doe',
    status: 'Pending Approval',
    total_amount: 450000,
    currency: 'USD',
    created_date: '2026-01-22T00:00:00',
    approval_status: 'Pending',
    description: 'Enterprise ERP System - IntegraPro Systems proposal'
  }
};

const invoicesDb: Record<string, Invoice> = {
  'INV-4025002': {
    id: 'INV-4025002',
    invoice_number: 'INV-4025002',
    po_number: 'PO-2025002',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    amount: 35000,
    currency: 'USD',
    status: 'Under Review',
    due_date: '2025-09-05T00:00:00',
    created_date: '2025-08-10T00:00:00'
  },
  'INV-4025003': {
    id: 'INV-4025003',
    invoice_number: 'INV-4025003',
    po_number: 'PO-2025003',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    amount: 15000,
    currency: 'USD',
    status: 'Paid',
    due_date: '2025-04-15T00:00:00',
    created_date: '2025-03-20T00:00:00',
    paid_date: '2025-04-25T00:00:00'
  },
  'INV-4025006': {
    id: 'INV-4025006',
    invoice_number: 'INV-4025006',
    po_number: 'PO-2025002',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    amount: 42000,
    currency: 'USD',
    status: 'Rejected',
    due_date: '2025-09-15T00:00:00',
    created_date: '2025-08-20T00:00:00',
    anomaly_flag: 'Invoice amount ($42,000) exceeds PO amount ($35,000) by $7,000',
    rejection_reason: 'Amount mismatch - requires PO amendment or new PO'
  }
};

const contractsDb: Record<string, Contract> = {
  'CON-5024001': {
    id: 'CON-5024001',
    contract_number: 'CON-5024001',
    title: 'Enterprise ERP License and Support Agreement - ERPMax Solutions',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    start_date: '2024-06-01T00:00:00',
    end_date: '2027-05-31T00:00:00',
    value: 450000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5025001': {
    id: 'CON-5025001',
    contract_number: 'CON-5025001',
    title: 'Pilot Program Agreement - CloudFirst ERP',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    start_date: '2025-03-01T00:00:00',
    end_date: '2025-12-31T00:00:00',
    value: 25000,
    currency: 'USD',
    status: 'Active'
  },
  'CON-5023001': {
    id: 'CON-5023001',
    contract_number: 'CON-5023001',
    title: 'Legacy System Maintenance - ERPMax Solutions',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    start_date: '2022-01-01T00:00:00',
    end_date: '2024-05-31T00:00:00',
    value: 180000,
    currency: 'USD',
    status: 'Expired'
  }
};

const rfpsDb: Record<string, Rfp> = {
  'RFP-2026-001': {
    id: 'RFP-2026-001',
    title: 'Enterprise ERP System Implementation',
    status: 'Open',
    deadline: '2026-04-30T00:00:00',
    budget_max: 500000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Functional', description: 'Multi-currency support', priority: 'Must-have', weight: 10 },
      { id: 'REQ-002', category: 'Integration', description: 'SAP S/4HANA integration', priority: 'Must-have', weight: 10 }
    ]
  },
  'RFP-2026-002': {
    id: 'RFP-2026-002',
    title: 'Logistics Management Platform',
    status: 'Open',
    deadline: '2026-05-15T00:00:00',
    budget_max: 300000,
    currency: 'USD',
    requirements: [
      { id: 'REQ-001', category: 'Functional', description: 'Route optimization', priority: 'Must-have', weight: 10 }
    ]
  }
};

const proposalsDb: Record<string, Proposal> = {
  'PROP-6024001': {
    id: 'PROP-6024001',
    rfp_id: 'RFP-2026-001',
    supplier_id: 'SUP-1000',
    supplier_name: 'ERPMax Solutions',
    status: 'Under Review',
    submitted_date: '2026-01-25T00:00:00',
    pricing: {
      total: 390000,
      currency: 'USD'
    },
    delivery_weeks: 16,
    validity_days: 90
  },
  'PROP-6024002': {
    id: 'PROP-6024002',
    rfp_id: 'RFP-2026-001',
    supplier_id: 'SUP-1001',
    supplier_name: 'IntegraPro Systems',
    status: 'Under Review',
    submitted_date: '2026-01-28T00:00:00',
    pricing: {
      total: 450000,
      currency: 'USD'
    },
    delivery_weeks: 20,
    validity_days: 60
  },
  'PROP-6024003': {
    id: 'PROP-6024003',
    rfp_id: 'RFP-2026-001',
    supplier_id: 'SUP-1002',
    supplier_name: 'CloudFirst ERP',
    status: 'Under Review',
    submitted_date: '2026-01-30T00:00:00',
    pricing: {
      total: 290000,
      currency: 'USD'
    },
    delivery_weeks: 12,
    validity_days: 90
  }
};

function notFound(entity: string, id: string) {
  return { error: `${entity} '${id}' not found` };
}

//======================================================================
// DASHBOARD API
// Description: Retourne une vue agrégée des principaux indicateurs métier.
// Entrants: aucun.
// Sortants: objet avec compteurs et montants (suppliers, purchase_orders,
// requisitions, invoices, contracts).
//======================================================================
export function getDashboardSummary() {
  const suppliers = Object.values(suppliersDb);
  const purchaseOrders = Object.values(purchaseOrdersDb);
  const requisitions = Object.values(requisitionsDb);
  const invoices = Object.values(invoicesDb);
  const contracts = Object.values(contractsDb);

  return {
    suppliers: {
      total: suppliers.length,
      active: suppliers.filter((s) => s.status === 'Active').length
    },
    purchase_orders: {
      total: purchaseOrders.length,
      pending: purchaseOrders.filter((p) => p.status === 'Draft' || p.status === 'Pending Approval').length,
      total_value: purchaseOrders.reduce((sum, p) => sum + p.total_amount, 0)
    },
    requisitions: {
      total: requisitions.length,
      pending_approval: requisitions.filter((r) => r.approval_status === 'Pending').length
    },
    invoices: {
      total: invoices.length,
      pending_payment: invoices.filter((i) => i.status === 'Approved' || i.status === 'Under Review').length,
      total_value: invoices.reduce((sum, i) => sum + i.amount, 0)
    },
    contracts: {
      total: contracts.length,
      active: contracts.filter((c) => c.status === 'Active').length,
      total_value: contracts.reduce((sum, c) => sum + c.value, 0)
    }
  };
}

//======================================================================
// SUPPLIERS API
// Description: Liste les fournisseurs avec filtres optionnels et récupère
// un fournisseur par identifiant.
// Entrants:
// - getSuppliers(filters?): { status?: string; category?: string }
// - getSupplier(supplierId): string
// Sortants:
// - getSuppliers: Supplier[]
// - getSupplier: Supplier | { error: string }
//======================================================================
export function getSuppliers(filters?: { status?: string; category?: string }) {
  let suppliers = Object.values(suppliersDb);

  if (filters?.status) {
    suppliers = suppliers.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.category) {
    suppliers = suppliers.filter((s) => s.category.toLowerCase() === filters.category?.toLowerCase());
  }

  return suppliers;
}

export function getSupplier(supplierId: string) {
  return suppliersDb[supplierId] ?? notFound('Supplier', supplierId);
}

//======================================================================
// PURCHASE ORDERS API
// Description: Liste les bons de commande avec filtres optionnels et récupère
// un bon de commande par identifiant.
// Entrants:
// - getPurchaseOrders(filters?): { status?: string; supplier_id?: string }
// - getPurchaseOrder(poId): string
// Sortants:
// - getPurchaseOrders: PurchaseOrder[]
// - getPurchaseOrder: PurchaseOrder | { error: string }
//======================================================================
export function getPurchaseOrders(filters?: { status?: string; supplier_id?: string }) {
  let orders = Object.values(purchaseOrdersDb);

  if (filters?.status) {
    orders = orders.filter((o) => o.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.supplier_id) {
    orders = orders.filter((o) => o.supplier_id === filters.supplier_id);
  }

  return orders;
}

export function getPurchaseOrder(poId: string) {
  return purchaseOrdersDb[poId] ?? notFound('Purchase order', poId);
}

//======================================================================
// REQUISITIONS API
// Description: Liste les demandes d'achat avec filtres optionnels et récupère
// une demande d'achat par identifiant.
// Entrants:
// - getRequisitions(filters?): { status?: string; requester?: string }
// - getRequisition(reqId): string
// Sortants:
// - getRequisitions: Requisition[]
// - getRequisition: Requisition | { error: string }
//======================================================================
export function getRequisitions(filters?: { status?: string; requester?: string }) {
  let requisitions = Object.values(requisitionsDb);

  if (filters?.status) {
    requisitions = requisitions.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.requester) {
    requisitions = requisitions.filter((r) => r.requester.toLowerCase().includes(filters.requester?.toLowerCase() ?? ''));
  }

  return requisitions;
}

export function getRequisition(reqId: string) {
  return requisitionsDb[reqId] ?? notFound('Requisition', reqId);
}

//======================================================================
// INVOICES API
// Description: Liste les factures avec filtres optionnels et récupère une
// facture par identifiant.
// Entrants:
// - getInvoices(filters?): { status?: string; po_number?: string }
// - getInvoice(invoiceId): string
// Sortants:
// - getInvoices: Invoice[]
// - getInvoice: Invoice | { error: string }
//======================================================================
export function getInvoices(filters?: { status?: string; po_number?: string }) {
  let invoices = Object.values(invoicesDb);

  if (filters?.status) {
    invoices = invoices.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.po_number) {
    invoices = invoices.filter((i) => i.po_number === filters.po_number);
  }

  return invoices;
}

export function getInvoice(invoiceId: string) {
  return invoicesDb[invoiceId] ?? notFound('Invoice', invoiceId);
}

//======================================================================
// CONTRACTS API
// Description: Liste les contrats avec filtres optionnels et récupère un
// contrat par identifiant.
// Entrants:
// - getContracts(filters?): { status?: string; supplier_name?: string }
// - getContract(contractId): string
// Sortants:
// - getContracts: Contract[]
// - getContract: Contract | { error: string }
//======================================================================
export function getContracts(filters?: { status?: string; supplier_name?: string }) {
  let contracts = Object.values(contractsDb);

  if (filters?.status) {
    contracts = contracts.filter((c) => c.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.supplier_name) {
    contracts = contracts.filter((c) => c.supplier_name.toLowerCase().includes(filters.supplier_name?.toLowerCase() ?? ''));
  }

  return contracts;
}

export function getContract(contractId: string) {
  return contractsDb[contractId] ?? notFound('Contract', contractId);
}

//======================================================================
// PROPOSALS API
// Description: Liste les propositions fournisseurs avec filtres optionnels
// et récupère une proposition par identifiant.
// Entrants:
// - getProposals(filters?): { rfp_id?: string; supplier_id?: string; status?: string }
// - getProposal(proposalId): string
// Sortants:
// - getProposals: Proposal[]
// - getProposal: Proposal | { error: string }
//======================================================================
export function getProposals(filters?: { rfp_id?: string; supplier_id?: string; status?: string }) {
  let proposals = Object.values(proposalsDb);

  if (filters?.rfp_id) {
    proposals = proposals.filter((p) => p.rfp_id === filters.rfp_id);
  }
  if (filters?.supplier_id) {
    proposals = proposals.filter((p) => p.supplier_id === filters.supplier_id);
  }
  if (filters?.status) {
    proposals = proposals.filter((p) => p.status.toLowerCase() === filters.status?.toLowerCase());
  }

  return proposals;
}

export function getProposal(proposalId: string) {
  return proposalsDb[proposalId] ?? notFound('Proposal', proposalId);
}

//======================================================================
// RFPS API
// Description: Liste les appels d'offres (RFP) avec filtre optionnel et
// récupère un RFP par identifiant.
// Entrants:
// - getRfps(filters?): { status?: string }
// - getRfp(rfpId): string
// Sortants:
// - getRfps: Rfp[]
// - getRfp: Rfp | { error: string }
//======================================================================
export function getRfps(filters?: { status?: string }) {
  let rfps = Object.values(rfpsDb);

  if (filters?.status) {
    rfps = rfps.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
  }

  return rfps;
}

export function getRfp(rfpId: string) {
  return rfpsDb[rfpId] ?? notFound('RFP', rfpId);
}

//======================================================================
// RISK API
// Description: Calcule et renvoie un profil de risque pour un fournisseur
// à partir de son score.
// Entrants:
// - getRiskScore(supplierId): string
// Sortants:
// - objet de risque (supplier_id, supplier_name, risk_score, risk_level,
// factors[]) ou { error: string }
//======================================================================
export function getRiskScore(supplierId: string) {
  const supplier = suppliersDb[supplierId];

  if (!supplier) {
    return notFound('Supplier', supplierId);
  }

  const score = supplier.risk_score;
  const riskLevel = score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low';

  return {
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    risk_score: score,
    risk_level: riskLevel,
    factors: [
      { name: 'Operational Stability', weight: 0.35, score: Number((score * 0.9).toFixed(2)) },
      { name: 'Financial Health', weight: 0.4, score: Number((score * 1.1).toFixed(2)) },
      { name: 'Compliance & Security', weight: 0.25, score: Number((score * 1.0).toFixed(2)) }
    ]
  };
}

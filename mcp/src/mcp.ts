import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';

import {
  getContract,
  getContracts,
  getDashboardSummary,
  getInvoice,
  getInvoices,
  getProposal,
  getProposals,
  getPurchaseOrder,
  getPurchaseOrders,
  getRequisition,
  getRequisitions,
  getRfp,
  getRfps,
  getRiskScore,
  getSupplier,
  getSuppliers
} from './api.js';

export function getMCPServer() {
  // Create server instance
  const server = new McpServer({
    name: 'demo-mcp',
    version: '1.0.0'
  });

  // Register the server tools
  server.registerTool(
    'get_dashboard_summary',
    {
      description: 'Get a summary of all Ariba data including supplier counts, PO totals, invoice status, and contract values.',
      inputSchema: z.object({})
    },
    async () => {
      const result = getDashboardSummary();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_suppliers',
    {
      description: 'List all suppliers in SAP Ariba. Optionally filter by status or category.',
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status (e.g., 'Active', 'Under Review')"),
        category: z.string().optional().describe("Filter by category (e.g., 'IT Services', 'Manufacturing')")
      })
    },
    async (args) => {
      const result = getSuppliers({
        status: args.status,
        category: args.category
      });

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_supplier',
    {
      description: 'Get details for a specific supplier by ID.',
      inputSchema: z.object({
        supplier_id: z.string().describe("The supplier ID (e.g., 'SUP-1000')")
      })
    },
    async (args) => {
      const result = getSupplier(args.supplier_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_purchase_orders',
    {
      description: 'List all purchase orders. Optionally filter by status or supplier.',
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status (e.g., 'Approved', 'Pending Approval')"),
        supplier_id: z.string().optional().describe('Filter by supplier ID')
      })
    },
    async (args) => {
      const result = getPurchaseOrders({
        status: args.status,
        supplier_id: args.supplier_id
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_purchase_order',
    {
      description: 'Get details for a specific purchase order by ID.',
      inputSchema: z.object({
        po_id: z.string().describe("The purchase order ID (e.g., 'PO-2024001')")
      })
    },
    async (args) => {
      const result = getPurchaseOrder(args.po_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_requisitions',
    {
      description: 'List all requisitions. Optionally filter by status or requester.',
      inputSchema: z.object({
        status: z.string().optional().describe('Filter by status'),
        requester: z.string().optional().describe('Filter by requester name')
      })
    },
    async (args) => {
      const result = getRequisitions({
        status: args.status,
        requester: args.requester
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_requisition',
    {
      description: 'Get details for a specific requisition by ID.',
      inputSchema: z.object({
        req_id: z.string().describe("The requisition ID (e.g., 'REQ-3024001')")
      })
    },
    async (args) => {
      const result = getRequisition(args.req_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_invoices',
    {
      description: 'List all invoices. Optionally filter by status or PO number.',
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status (e.g., 'Paid', 'Approved')"),
        po_number: z.string().optional().describe('Filter by purchase order number')
      })
    },
    async (args) => {
      const result = getInvoices({
        status: args.status,
        po_number: args.po_number
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_invoice',
    {
      description: 'Get details for a specific invoice by ID.',
      inputSchema: z.object({
        invoice_id: z.string().describe("The invoice ID (e.g., 'INV-4025002')")
      })
    },
    async (args) => {
      const result = getInvoice(args.invoice_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_contracts',
    {
      description: 'List all contracts. Optionally filter by status or supplier name.',
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status (e.g., 'Active', 'Expired')"),
        supplier_name: z.string().optional().describe('Filter by supplier name')
      })
    },
    async (args) => {
      const result = getContracts({
        status: args.status,
        supplier_name: args.supplier_name
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_contract',
    {
      description: 'Get details for a specific contract by ID.',
      inputSchema: z.object({
        contract_id: z.string().describe("The contract ID (e.g., 'CON-5024001')")
      })
    },
    async (args) => {
      const result = getContract(args.contract_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_proposals',
    {
      description: 'List vendor proposals/offers. Filter by RFP ID, supplier ID, or status.',
      inputSchema: z.object({
        rfp_id: z.string().optional().describe("Filter by RFP ID (e.g., 'RFP-2026-001')"),
        supplier_id: z.string().optional().describe('Filter by supplier ID'),
        status: z.string().optional().describe('Filter by status')
      })
    },
    async (args) => {
      const result = getProposals({
        rfp_id: args.rfp_id,
        supplier_id: args.supplier_id,
        status: args.status
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_proposal',
    {
      description: 'Get details for a specific vendor proposal by ID.',
      inputSchema: z.object({
        proposal_id: z.string().describe("The proposal ID (e.g., 'PROP-6024001')")
      })
    },
    async (args) => {
      const result = getProposal(args.proposal_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'list_rfps',
    {
      description: 'List all RFPs (Request for Proposals).',
      inputSchema: z.object({
        status: z.string().optional().describe("Filter by status (e.g., 'Open', 'Closed')")
      })
    },
    async (args) => {
      const result = getRfps({
        status: args.status
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_rfp',
    {
      description: 'Get RFP details including all requirements and weights.',
      inputSchema: z.object({
        rfp_id: z.string().describe("The RFP ID (e.g., 'RFP-2026-001')")
      })
    },
    async (args) => {
      const result = getRfp(args.rfp_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    'get_risk_score',
    {
      description: 'Get risk assessment score for a specific supplier.',
      inputSchema: z.object({
        supplier_id: z.string().describe("The supplier ID (e.g., 'SUP-1000')")
      })
    },
    async (args) => {
      const result = getRiskScore(args.supplier_id);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  return server;
}

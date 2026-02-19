import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v3';

import { getSuppliers } from './api.js';

export function getMCPServer() {
    // Create server instance
    const server = new McpServer({
        name: 'demo-mcp',
        version: '1.0.0'
    });

    // Register the server tools
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
            const result = await getSuppliers();
            
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

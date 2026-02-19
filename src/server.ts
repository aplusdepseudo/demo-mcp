import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { Request, Response } from 'express';

import cors from 'cors';

import { getMCPServer } from './mcp.js';

const MCP_PORT = process.env.MCP_PORT ? Number.parseInt(process.env.MCP_PORT, 10) : 3000;
const AUTH_PORT = process.env.MCP_AUTH_PORT ? Number.parseInt(process.env.MCP_AUTH_PORT, 10) : 3001;

export function startServer() {
    const allowedHosts = process.env.WEBSITE_HOSTNAME ? process.env.WEBSITE_HOSTNAME.split(',') : ['localhost', '127.0.0.1', '[::1]'];
    const app = createMcpExpressApp({ allowedHosts });

    // Enable CORS for browser-based clients (demo only)
    app.use(cors());

    // Basic get path to verify server is running
    app.get('/', (_request: Request, response: Response) => {
        response.send({ status: 'up', message: 'Demo MCP server running' });
    });

    app.all('/mcp', async (request: Request, response: Response) => {
        console.log(`Received ${request.method} request to /mcp`);

        // Reject unsupported methods (GET/DELETE are only needed for stateful sessions)
        if (request.method === 'GET' || request.method === 'DELETE') {
            response.writeHead(405).end(
                JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32_000,
                        message: 'Method not allowed.'
                    },
                    id: null
                })
            );
            return;
        }

        try {
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined
            });

            // Connect the transport to the MCP server
            const server = getMCPServer();
            await server.connect(transport);

            // Handle the request with the transport
            await transport.handleRequest(request, response, request.body);

            // Clean up when the response is closed
            response.on('close', async () => {
                await transport.close();
                await server.close();
            });
        } catch (error) {
            console.error('Error handling MCP request:', error);
            if (!response.headersSent) {
                response.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32_603,
                        message: 'Internal server error'
                    },
                    id: null
                });
            }
        }
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Demo MCP server listening on port ${PORT}`);
    });

    // Handle server shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down server...');
        process.exit(0);
    });
}

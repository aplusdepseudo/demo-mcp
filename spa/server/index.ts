import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runRfpConversation } from './agentConversation.js';
import type { GenerateRequest, SseEvent } from '../src/types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'up', service: 'rfp-spa-server' });
});

// ── RFP generation endpoint (SSE stream) ──────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const body = req.body as GenerateRequest;

  // Validate required fields
  const required: Array<keyof GenerateRequest> = [
    'projectEndpoint',
    'agentName',
    'rfpTopic',
    'rfpBudget',
  ];
  for (const field of required) {
    if (!body[field]) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  function send(event: SseEvent) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  try {
    const output = await runRfpConversation(
      {
        projectEndpoint: body.projectEndpoint,
        agentName: body.agentName,
        agentVersion: body.agentVersion ?? '1',
        mcpServerUrl: body.mcpServerUrl ?? process.env.MCP_SERVER_URL ?? 'http://localhost:3000',
      },
      body.rfpTopic,
      body.rfpBudget,
      send,
    );

    send({ type: 'result', output });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    send({ type: 'error', message });
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// ── Serve built Vue SPA (production mode) ────────────────────────────────
const clientDist = path.join(__dirname, '..', 'client');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RFP SPA server listening on http://localhost:${PORT}`);
});

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

// Prevent MIME-type sniffing on all responses
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// ── Security helpers ──────────────────────────────────────────────────────

/** Strip HTML meta-characters from a string to prevent reflected XSS. */
function stripHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[c] ?? c;
  });
}

/** Return a copy of an SSE event with all string fields HTML-escaped. */
function sanitizeSseEvent(event: SseEvent): SseEvent {
  if (event.type === 'status') return { ...event, message: stripHtml(event.message) };
  if (event.type === 'error') return { ...event, message: stripHtml(event.message) };
  return event;
}

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'up', service: 'rfp-spa-server' });
});

// ── RFP generation endpoint (SSE stream) ──────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const body = req.body as GenerateRequest;

  // Validate required fields
  const required: Array<keyof GenerateRequest> = [
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
    // Sanitize string fields to strip HTML characters before writing to the
    // SSE stream, preventing reflected XSS if the message contains
    // user-supplied content from error paths.
    const sanitized = sanitizeSseEvent(event);
    res.write(`data: ${JSON.stringify(sanitized)}\n\n`);
  }

  try {
    const projectEndpoint = process.env.FOUNDRY_PROJECT_ENDPOINT;

    if (!projectEndpoint) {
      res.status(500).json({ error: 'FOUNDRY_PROJECT_ENDPOINT is not configured on the server.' });
      return;
    }

    const output = await runRfpConversation(
      {
        projectEndpoint,
        agentName: body.agentName,
        agentVersion: body.agentVersion ?? '1',
      },
      body.rfpTopic,
      body.rfpBudget,
      send,
    );

    send({ type: 'result', output });
  } catch (err) {
    // Log the full error server-side and send only a sanitized message to the
    // client to prevent exception text from being reinterpreted as HTML.
    console.error('RFP generation error:', err);
    const raw = err instanceof Error ? err.message : String(err);
    send({ type: 'error', message: stripHtml(raw) });
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

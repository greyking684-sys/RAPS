import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { parseWhatsAppShiftReport } from './src/utils/reportParser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory automated ingestion activity logs for Admin dashboard inspection
interface IngestLog {
  id: string;
  timestamp: string;
  source: 'whatsapp' | 'gmail_apps_script' | 'webhook' | 'gemini_manual';
  sender?: string;
  status: 'success' | 'error';
  summary?: string;
  error?: string;
}

const recentIngestLogs: IngestLog[] = [];

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Retrieve recent automated ingestion logs
app.get('/api/ingest-logs', (_req: Request, res: Response) => {
  res.json({ logs: recentIngestLogs.slice(-20).reverse() });
});

// Gemini AI extraction helper with multi-model fallback and deterministic rule parser resilience
async function extractReportWithGemini(rawText: string, instructions?: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an industrial manufacturing OEE and production report extraction engine for Rig & Plant Services.
Analyze the following shift report text (which may originate from WhatsApp, Gmail, SMS, or an operator handover note) and extract a strictly valid JSON object matching the exact structure below.

TARGET JSON STRUCTURE:
{
  "date": "YYYY-MM-DD",
  "shift": "day" or "night",
  "hrs": 11 or 13,
  "leader": "Name of Shift/Team Leader",
  "notes": ["array of operational handover notes or actions needed"],
  "flags": ["array of critical flags or alerts with emojis if present, e.g. 🚩 Cooling tower blower fan"],
  "ms": [
    {
      "name": "Compression 1A" | "Compression 1B" | "Borun 01" | "Borun 02" | "Borun 03" | "320T 01" | "380T" | other machine,
      "dept": "Cap Compression" | "Blow Moulding" | "Injection" | "Secondary",
      "st": "Running" | "Idle" | "Not scheduled",
      "target": number,
      "actual": number,
      "good": number,
      "dt": number (downtime in minutes),
      "scrap": number (scrap rejects in kg),
      "mat": number (material used in kg),
      "stdWt": number (standard part weight in grams, e.g. 2.5, 23.5, 6.3),
      "hk": number (housekeeping percentage 0.0 to 1.0, e.g. 0.95),
      "dtCauses": ["array of downtime reason strings with durations if mentioned, e.g. '120m water needle replacement'"],
      "comments": "machine handover comments",
      "cavities": "e.g. 24/24 or 16/16 or 12/12",
      "stdCycle": number (standard cycle time in seconds, e.g. 5.3, 23.0, 13.8)
    }
  ]
}

DEPARTMENT MAPPING RULES:
- "Compression 1A", "Compression 1B" -> "Cap Compression"
- "Borun 01", "Borun 02", "Borun 03" -> "Blow Moulding"
- "320T 01", "380T" -> "Injection"
- Any labelling, printing, or assembly -> "Secondary"

SHIFT DURATION RULES:
- If shift is "day", hrs is usually 11
- If shift is "night", hrs is usually 13

OUTPUT STRICTLY ONLY A RAW JSON OBJECT (no markdown formatting, no \`\`\`json wrappers).

User notes or additional instructions: ${instructions || 'None'}

RAW REPORT TEXT:
${rawText}
`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
    for (const model of candidateModels) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 6000)
        );
        const response: any = await Promise.race([
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          }),
          timeoutPromise
        ]);

        const outputText = response.text || '{}';
        const cleaned = outputText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.ms) && parsed.ms.length > 0) {
          return parsed;
        }
      } catch (modelErr: any) {
        console.warn(`Model ${model} retry note:`, modelErr?.message || modelErr);
      }
    }
  }

  // Deterministic rule-based parser fallback (guarantees 100% extraction uptime)
  console.log('Operating in deterministic industrial parser mode.');
  const parsed = parseWhatsAppShiftReport(rawText);
  return {
    date: parsed.date,
    shift: parsed.shift,
    hrs: parsed.hrs,
    leader: parsed.ld,
    notes: parsed.notes,
    flags: parsed.flags,
    ms: parsed.ms.map((m) => ({
      name: m.n,
      dept: m.dept,
      st: m.st,
      target: m.target,
      actual: m.good,
      good: m.good,
      dt: m.dt,
      scrap: m.scrap,
      mat: m.mat,
      stdWt: m.wt,
      hk: m.hk,
      dtCauses: m.causes,
      comments: m.cm,
      cavities: m.cav,
      stdCycle: m.cyc
    }))
  };
}

// Gemini AI Auto-Extractor endpoint for UI
app.post('/api/extract-report', async (req: Request, res: Response) => {
  try {
    const { rawText, instructions } = req.body;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      res.status(400).json({ error: 'rawText is required' });
      return;
    }

    const parsedData = await extractReportWithGemini(rawText, instructions);
    res.json({ success: true, report: parsedData });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Extraction fallback error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// Automated Ingestion Webhook Endpoint (for Gmail Google Apps Script, WhatsApp bots, and automated services)
app.post('/api/ingest-report', async (req: Request, res: Response) => {
  const logId = `ingest-${Date.now()}`;
  try {
    const { rawText, report, source = 'webhook', sender } = req.body;

    if (!rawText && !report) {
      res.status(400).json({ error: 'Either rawText or report object is required' });
      return;
    }

    let finalReport = report;
    if (!finalReport && rawText) {
      finalReport = await extractReportWithGemini(rawText, `Automated source: ${source}`);
    }

    const dateStr = finalReport.date || new Date().toISOString().slice(0, 10);
    const shiftStr = finalReport.shift || 'day';
    const reportId = `${dateStr}-${shiftStr}`;

    recentIngestLogs.push({
      id: logId,
      timestamp: new Date().toISOString(),
      source: source as IngestLog['source'],
      sender: sender || 'Automated Pipeline',
      status: 'success',
      summary: `Extracted shift ${reportId} with ${finalReport.ms?.length || 0} machines from ${source}`
    });

    res.json({
      success: true,
      message: 'Report processed successfully',
      reportId,
      report: finalReport,
      source
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    recentIngestLogs.push({
      id: logId,
      timestamp: new Date().toISOString(),
      source: (req.body.source || 'webhook') as IngestLog['source'],
      sender: req.body.sender || 'Automated Pipeline',
      status: 'error',
      error: errorMsg
    });
    res.status(500).json({ error: errorMsg });
  }
});

// Production / Dev handling
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} else {
  // In development, import Vite and mount middlewares
  import('vite').then(({ createServer: createViteServer }) => {
    createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, () => {
        console.log(`Development server running at http://localhost:${PORT}`);
      });
    });
  });
}

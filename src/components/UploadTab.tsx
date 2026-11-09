import React, { useState, useEffect } from 'react';
import { ShiftReport } from '../types/oee';
import { parseWhatsAppShiftReport, SAMPLE_PASTE_TEXT } from '../utils/reportParser';
import { buildMachineRecord, n0, pc } from '../utils/oeeCalculations';
import { getTextColor } from './ProgressBar';
import { exportShiftToPdf, exportShiftToWhatsAppText } from '../utils/exportReport';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  PlayCircle,
  PlusCircle,
  Sparkles,
  Database,
  CloudUpload,
  Download,
  Copy,
  Info,
  Check,
  Mail,
  MessageSquare,
  Webhook,
  Activity,
  Send,
  Code2,
  RefreshCw,
  Clock
} from 'lucide-react';

interface Props {
  onAddReport: (report: ShiftReport) => Promise<void> | void;
  onSeedDatabase?: () => Promise<void>;
  dark?: boolean;
}

interface IngestLog {
  id: string;
  timestamp: string;
  source: 'whatsapp' | 'gmail_apps_script' | 'webhook' | 'gemini_manual';
  sender?: string;
  status: 'success' | 'error';
  summary?: string;
  error?: string;
}

export const UploadTab: React.FC<Props> = ({ onAddReport, onSeedDatabase, dark = false }) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'automated'>('whatsapp');
  const [pasteText, setPasteText] = useState<string>('');
  const [pendingReport, setPendingReport] = useState<ShiftReport | null>(null);
  const [isExtractingWithAI, setIsExtractingWithAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState<boolean>(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState<boolean>(false);
  const [ingestLogs, setIngestLogs] = useState<IngestLog[]>([]);

  const cardCls = `rounded-2xl border p-4 shadow-xs transition-all ${
    dark ? 'bg-[#1a212b] border-[#2b3643] text-[#e8ecf1]' : 'bg-white border-[#dce1e8] text-[#18212d]'
  }`;
  const mutedCls = `text-xs ${dark ? 'text-[#97a3b2]' : 'text-[#64707f]'}`;
  const borderCls = dark ? 'border-[#2b3643]' : 'border-[#dce1e8]';

  const webhookEndpointUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/ingest-report`
    : '/api/ingest-report';

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/ingest-logs');
      if (res.ok) {
        const data = await res.json();
        setIngestLogs(data.logs || []);
      }
    } catch {
      // Ignore background log fetch notice
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Standard regex parser (fast, offline, 0ms)
  const handleReadReportOffline = () => {
    if (!pasteText.trim()) return;
    setAiError(null);
    const parsed = parseWhatsAppShiftReport(pasteText);
    parsed.ingestedVia = 'whatsapp';
    setPendingReport(parsed);
  };

  // Gemini AI Smart Extractor (handles complex text, forwarded emails, unstructured notes)
  const handleExtractWithGemini = async () => {
    if (!pasteText.trim()) return;
    setIsExtractingWithAI(true);
    setAiError(null);

    try {
      const res = await fetch('/api/extract-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pasteText })
      });

      const data = await res.json();
      if (!res.ok || !data.report) {
        throw new Error(data.error || 'Gemini extraction failed');
      }

      const rep = data.report;
      const formattedDate = rep.date || new Date().toISOString().slice(0, 10);
      const shiftType = (rep.shift === 'night' ? 'night' : 'day') as 'day' | 'night';
      const shiftHrs = rep.hrs || (shiftType === 'day' ? 11 : 13);
      const reportId = `${formattedDate}-${shiftType}`;

      const machineRecords = (rep.ms || []).map((m: any) =>
        buildMachineRecord(
          m.name || 'Machine',
          m.dept || 'Injection',
          m.st || 'Running',
          Number(m.target) || 0,
          Number(m.good) || Number(m.actual) || 0,
          Number(m.dt) || 0,
          Number(m.scrap) || 0,
          Number(m.mat) || 0,
          Number(m.stdWt) || 2.5,
          m.hk != null ? Number(m.hk) : null,
          Array.isArray(m.dtCauses) ? m.dtCauses : [],
          m.comments || '',
          m.cavities || '16/16',
          Number(m.stdCycle) || 13.8,
          shiftHrs
        )
      );

      const assembledReport: ShiftReport = {
        id: reportId,
        date: formattedDate,
        shift: shiftType,
        hrs: shiftHrs,
        ld: rep.leader || 'Shift Leader',
        notes: Array.isArray(rep.notes) ? rep.notes : [],
        flags: Array.isArray(rep.flags) ? rep.flags : [],
        ms: machineRecords,
        ingestedVia: 'gemini_manual'
      };

      setPendingReport(assembledReport);
    } catch (err: unknown) {
      console.warn('Gemini extraction fallback:', err);
      setAiError(err instanceof Error ? err.message : 'AI extraction unavailable. Used standard rule parser.');
      const parsed = parseWhatsAppShiftReport(pasteText);
      parsed.ingestedVia = 'whatsapp';
      setPendingReport(parsed);
    } finally {
      setIsExtractingWithAI(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ingest-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: SAMPLE_PASTE_TEXT,
          source: 'gmail_apps_script',
          sender: 'plant.reports@rigplant.com'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.report) {
        throw new Error(data.error || 'Webhook test failed');
      }

      await fetchLogs();

      const rep = data.report;
      const formattedDate = rep.date || new Date().toISOString().slice(0, 10);
      const shiftType = (rep.shift === 'night' ? 'night' : 'day') as 'day' | 'night';
      const shiftHrs = rep.hrs || (shiftType === 'day' ? 11 : 13);
      const reportId = `${formattedDate}-${shiftType}`;

      const machineRecords = (rep.ms || []).map((m: any) =>
        buildMachineRecord(
          m.name || 'Machine',
          m.dept || 'Injection',
          m.st || 'Running',
          Number(m.target) || 0,
          Number(m.good) || Number(m.actual) || 0,
          Number(m.dt) || 0,
          Number(m.scrap) || 0,
          Number(m.mat) || 0,
          Number(m.stdWt) || 2.5,
          m.hk != null ? Number(m.hk) : null,
          Array.isArray(m.dtCauses) ? m.dtCauses : [],
          m.comments || '',
          m.cavities || '16/16',
          Number(m.stdCycle) || 13.8,
          shiftHrs
        )
      );

      const assembledReport: ShiftReport = {
        id: reportId,
        date: formattedDate,
        shift: shiftType,
        hrs: shiftHrs,
        ld: rep.leader || 'Shift Leader',
        notes: Array.isArray(rep.notes) ? rep.notes : [],
        flags: Array.isArray(rep.flags) ? rep.flags : [],
        ms: machineRecords,
        ingestedVia: 'gmail_apps_script'
      };

      setPendingReport(assembledReport);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Webhook test error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSaveReport = async () => {
    if (!pendingReport) return;
    await onAddReport(pendingReport);
    setPendingReport(null);
    setPasteText('');
  };

  const handleSeedDatabase = async () => {
    if (!onSeedDatabase) return;
    setIsSeeding(true);
    setSeedSuccess(null);
    try {
      await onSeedDatabase();
      setSeedSuccess('Successfully synchronized historical reports to Firebase Firestore!');
      setTimeout(() => setSeedSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopyWhatsApp = () => {
    if (!pendingReport) return;
    const txt = exportShiftToWhatsAppText(pendingReport);
    navigator.clipboard.writeText(txt);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const appsScriptCode = `/**
 * Rig & Plant Services - Automated Gmail Shift Report Ingestion
 * Attach this function as a 10-minute time-driven trigger in Google Apps Script (script.google.com).
 * 100% Free under standard Google Apps Script quotas.
 */
function ingestGmailShiftReports() {
  const WEBHOOK_URL = "${webhookEndpointUrl}";
  const SEARCH_QUERY = 'subject:"Shift Report" newer_than:1d -label:ingested-oee';

  const threads = GmailApp.search(SEARCH_QUERY, 0, 5);
  let label = GmailApp.getUserLabelByName('ingested-oee');
  if (!label) {
    label = GmailApp.createLabel('ingested-oee');
  }

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    const latestMsg = messages[messages.length - 1];
    const body = latestMsg.getPlainBody();
    const sender = latestMsg.getFrom();

    const payload = {
      rawText: body,
      source: 'gmail_apps_script',
      sender: sender
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
      Logger.log('Ingest Response: ' + response.getContentText());
      threads[i].addLabel(label);
    } catch (err) {
      Logger.log('Ingest Error: ' + err.toString());
    }
  }
}`;

  return (
    <div className="space-y-4">
      {/* Top Banner: Dual Architecture Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Dual Ingestion Hub (WhatsApp &amp; Gmail)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                100% free multi-channel shift ingestion with real-time broadcast to all factory screens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSeedDatabase && (
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Syncing...' : 'Sync History to Firestore'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 text-xs font-semibold mt-4 max-w-md">
          <button
            type="button"
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeChannel === 'whatsapp'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Channel 1: WhatsApp Ingestion
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveChannel('automated');
              fetchLogs();
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeChannel === 'automated'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Channel 2: Gmail Trigger
          </button>
        </div>
      </div>

      {seedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{seedSuccess}</span>
        </div>
      )}

      {/* CHANNEL 1: WHATSAPP & MANUAL INGESTION */}
      {activeChannel === 'whatsapp' && (
        <div className={cardCls}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Channel 1: WhatsApp Handover Message Ingestion
              </h3>
            </div>
            <button
              onClick={() => {
                setPasteText(SAMPLE_PASTE_TEXT);
                setPendingReport(null);
                setAiError(null);
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Load Sample Handover Text</span>
            </button>
          </div>

          <p className={`${mutedCls} mb-3 leading-relaxed`}>
            Paste the raw evening/morning handover text directly from your WhatsApp shift group. Use <b>Gemini AI Smart Extractor</b> for unstructured operator notes, or the offline rule parser for standard WhatsApp templates.
          </p>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste WhatsApp shift report text here..."
            className={`w-full min-h-[190px] p-3 rounded-xl border font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${
              dark
                ? 'bg-[#11161d] border-[#2b3643] text-slate-200'
                : 'bg-slate-50 border-[#dce1e8] text-slate-800'
            }`}
          />

          {aiError && (
            <p className="text-xs text-amber-500 mt-2 font-medium">
              Notice: {aiError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExtractWithGemini}
                disabled={!pasteText.trim() || isExtractingWithAI}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold cursor-pointer shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExtractingWithAI ? 'Extracting with Gemini AI...' : 'Extract with Gemini AI'}</span>
              </button>

              <button
                onClick={handleReadReportOffline}
                disabled={!pasteText.trim()}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Instant Rule Parser</span>
              </button>
            </div>

            {pendingReport && (
              <button
                onClick={handleSaveReport}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Broadcast Shift {pendingReport.date} ({pendingReport.shift.toUpperCase()}) to Plant</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHANNEL 2: AUTOMATED GMAIL & WEBHOOK PIPELINE */}
      {activeChannel === 'automated' && (
        <div className="space-y-4">
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-2">
              <Webhook className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Channel 2: Automated Gmail Ingestion Trigger
              </h3>
            </div>
            <p className={`${mutedCls} mb-3 leading-relaxed`}>
              Every shift handover sent to your email (or auto-forwarded from WhatsApp to Gmail) can be automatically captured and broadcast without manual copying. Configure Google Apps Script once in 60 seconds at zero cost.
            </p>

            {/* Webhook URL Endpoint Box */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                  POST
                </span>
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                  {webhookEndpointUrl}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookEndpointUrl);
                    setCopiedWebhookUrl(true);
                    setTimeout(() => setCopiedWebhookUrl(false), 2000);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
                >
                  {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhookUrl ? 'Copied URL' : 'Copy Endpoint URL'}</span>
                </button>

                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-3 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestingWebhook ? 'Simulating...' : 'Simulate Gmail Trigger'}</span>
                </button>
              </div>
            </div>

            {/* Turnkey Google Apps Script Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-500" /> Turnkey Google Apps Script (Copy &amp; Paste into script.google.com)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appsScriptCode);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2500);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied Full Script!' : 'Copy Apps Script Code'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-[180px] leading-relaxed">
                {appsScriptCode}
              </pre>
            </div>
          </div>

          {/* Ingestion Activity Logs */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Automated Pipeline Ingestion Activity
                </h4>
              </div>
              <button
                onClick={fetchLogs}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
              </button>
            </div>

            {ingestLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No recent automated triggers recorded. Click <b>"Simulate Gmail Trigger"</b> above to test the automated pipeline.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {ingestLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.source === 'gmail_apps_script' ? 'Gmail Trigger' : log.source}
                        </span>
                        {log.sender && (
                          <span className="text-slate-400 text-[11px]">({log.sender})</span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {log.summary || log.error}
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PENDING SHIFT REPORT LIVE PREVIEW */}
      {pendingReport && (
        <div className={`p-4 rounded-2xl border-2 border-emerald-500 shadow-lg ${
          dark ? 'bg-[#11161d]' : 'bg-emerald-50/50'
        } space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ✓ Extracted Shift Preview
                </span>
                {pendingReport.ingestedVia && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300">
                    Source: {pendingReport.ingestedVia === 'gmail_apps_script' ? 'Gmail Ingestion' : 'WhatsApp'}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Shift {pendingReport.date} ({pendingReport.shift.toUpperCase()} · {pendingReport.hrs} hrs)
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Leader: <b>{pendingReport.ld}</b> · {pendingReport.ms.length} machine entries identified
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportShiftToPdf(pendingReport)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1"
                title="Download formatted executive shift PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleCopyWhatsApp}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1"
                title="Copy clean WhatsApp report format"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied!' : 'Copy WhatsApp'}</span>
              </button>

              <button
                onClick={handleSaveReport}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Broadcast to Live Dashboard</span>
              </button>
            </div>
          </div>

          {/* Parsed Machines Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className={`border-b ${borderCls} text-slate-500 dark:text-slate-400`}>
                  <th className="py-2 px-2.5 font-bold">Machine</th>
                  <th className="py-2 px-2.5 font-bold">Dept</th>
                  <th className="py-2 px-2.5 font-bold">Status</th>
                  <th className="py-2 px-2.5 font-bold">Good Output</th>
                  <th className="py-2 px-2.5 font-bold">Target</th>
                  <th className="py-2 px-2.5 font-bold">Attainment</th>
                  <th className="py-2 px-2.5 font-bold">OEE</th>
                  <th className="py-2 px-2.5 font-bold">Downtime (min)</th>
                  <th className="py-2 px-2.5 font-bold">Scrap (kg)</th>
                  <th className="py-2 px-2.5 font-bold">5S HK</th>
                  <th className="py-2 px-2.5 font-bold">Handover Comment</th>
                </tr>
              </thead>
              <tbody>
                {pendingReport.ms.map((m, idx) => (
                  <tr key={idx} className={`border-b last:border-b-0 ${borderCls}`}>
                    <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white">
                      {m.n}
                    </td>
                    <td className="py-2 px-2.5">{m.dept}</td>
                    <td className="py-2 px-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.st === 'Running' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                      }`}>
                        {m.st}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-bold">{n0(m.good)}</td>
                    <td className="py-2 px-2.5">{n0(m.target)}</td>
                    <td className={`py-2 px-2.5 font-bold ${getTextColor(m.att, dark)}`}>
                      {pc(m.att)}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-blue-600 dark:text-blue-400">
                      {pc(m.oee)}
                    </td>
                    <td className="py-2 px-2.5">{m.dt}</td>
                    <td className="py-2 px-2.5">{m.scrap || '–'}</td>
                    <td className="py-2 px-2.5">{pc(m.hk)}</td>
                    <td className="py-2 px-2.5 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {m.cm || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Parsed Flags & Notes */}
          {(pendingReport.flags.length > 0 || pendingReport.notes.length > 0) && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              {pendingReport.flags.map((f, i) => (
                <div key={`f-${i}`} className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                  <span>🚩</span>
                  <span>{f}</span>
                </div>
              ))}
              {pendingReport.notes.map((n, i) => (
                <div key={`n-${i}`} className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400">•</span>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

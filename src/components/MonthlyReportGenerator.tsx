/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bot, FileText, Sparkles, TrendingUp, Cpu, RefreshCw, ClipboardCopy, Send } from 'lucide-react';

interface MonthlyReportGeneratorProps {
  onTriggerGenerate: () => void;
}

export default function MonthlyReportGenerator() {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setReport('');
    
    try {
      const response = await fetch('/api/ai/monthly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error("Gagal mengolah data laporan bulanan pada server.");
      }
      const data = await response.json();
      setReport(data.report || '');
    } catch (err: any) {
      setError(err.message || 'Kendala sambungan ke server pabrik.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Custom visual formatter for Markdown that looks MUCH better than straight text!
  const renderFormattedReport = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, index) => {
      // Headers ###
      if (line.startsWith('###')) {
        return (
          <h4 key={index} className="text-sm font-extrabold text-indigo-900 mt-5 mb-2 flex items-center gap-1.5 border-b border-indigo-100 pb-1 uppercase tracking-tight">
            <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
            {line.replace('###', '').trim()}
          </h4>
        );
      }
      // Headers ####
      if (line.startsWith('####')) {
        return (
          <h5 key={index} className="text-xs font-bold text-slate-800 mt-4 mb-1.5 uppercase">
            {line.replace('####', '').trim()}
          </h5>
        );
      }
      // Bold subheadings with * or ** inside
      if (line.startsWith('*   **') || line.startsWith('* **') || line.startsWith('- **')) {
        // e.g. *   **Total Downtime:** 200 Menit
        const cleaned = line.replace(/^\*\s+\*\*/, '').replace(/^\*\s+\*\*/, '').replace(/^-\s+\*\*/, '').trim();
        const parts = cleaned.split('**');
        if (parts.length > 1) {
          return (
            <div key={index} className="pl-4 py-1 flex items-start gap-1.5 text-xs text-slate-700 leading-relaxed">
              <span className="text-indigo-500 shrink-0 select-none mt-1">&bull;</span>
              <span>
                <strong className="text-slate-900">{parts[0]}</strong>
                {parts.slice(1).join('')}
              </span>
            </div>
          );
        }
      }
      // Standard list items *
      if (line.startsWith('*') || line.startsWith('-')) {
        const cleaned = line.replace(/^[*+-]\s+/, '').trim();
        return (
          <div key={index} className="pl-4 py-1 flex items-start gap-1.5 text-xs text-slate-700 leading-relaxed">
            <span className="text-indigo-500 shrink-0 select-none mt-1">&bull;</span>
            <span>{cleaned}</span>
          </div>
        );
      }
      // Title
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="text-base font-extrabold text-slate-800 text-center mb-3">
            {line.replace(/\*\*/g, '').trim()}
          </h3>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2"></div>;
      }
      // Standard paragraphs
      return (
        <p key={index} className="text-xs text-slate-600 leading-relaxed mb-2">
          {line.replace(/\*\*/g, '').trim()}
        </p>
      );
    });
  };

  return (
    <div id="ai-monthly-report-center" className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-950/40 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/60 mb-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Bot className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 uppercase tracking-wider">Executive Maintenance Report</h3>
            <p className="text-[10px] text-slate-400">Analisa berkala, rekapitulasi audit bottlenecks & rekomendasi mesin presisi.</p>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-indigo-950/40 border border-indigo-400/20"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Menghitung Data Laporan...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Buat Laporan Pemeliharaan Bulanan
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-5">
        Laporan ini menyinkronkan seluruh catatan historis downtime mesin filling guna membuat analisis akar masalah, estimasi kerugian kapasitas material, dan strategi pemeliharaan preventif secara mandiri.
      </p>

      {loading ? (
        <div className="min-h-[220px] bg-slate-950/60 border border-slate-800/40 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-semibold text-slate-300">Menyinkronkan & Memproses Laporan Pemeliharaan...</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-sm leading-relaxed">
            Asisten sedang mempelajari korelasi antara Sensor Nozzle, Capping Motor Overload, dan Level Base Cat dalam seminggu terakhir.
          </p>
        </div>
      ) : report ? (
        <div className="bg-white text-slate-800 border border-slate-100 rounded-xl p-5 shadow-inner transition-all flex flex-col justify-between">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><FileText className="h-4 w-4 text-indigo-500" /> Hasil Analisis Audit Preventif</span>
            <button
              onClick={handleCopy}
              className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded"
            >
              {copySuccess ? 'Copied!' : 'Salin Laporan'}
            </button>
          </div>

          <div className="overflow-y-auto max-h-[350px] pr-2 scrollbar-indigo">
            {renderFormattedReport(report)}
          </div>
        </div>
      ) : (
        <div className="min-h-[140px] bg-slate-950/30 border border-slate-800/40 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-400">
          <FileText className="h-8 w-8 text-slate-600 mb-2" />
          <h4 className="text-xs font-semibold text-slate-200 mb-0.5">Analisis Audit Siap Dibuat</h4>
          <p className="text-[10px] text-slate-500 max-w-sm">
            Klik tombol pengeksekusi di atas kanan untuk memproses logs bulanan ke pusat data.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-rose-950/30 border border-rose-800/40 p-3 rounded-lg text-rose-300 text-xs text-center">
          {error}. Laporan gagal digenerate.
        </div>
      )}
    </div>
  );
}

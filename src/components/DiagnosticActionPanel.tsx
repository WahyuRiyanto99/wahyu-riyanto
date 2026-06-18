/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Bot, Sparkles, User, Hammer, CheckSquare, ShieldAlert, Package, Check, ClipboardCopy, ChevronRight } from 'lucide-react';
import { DowntimeIncident, AIResponse } from '../types';

interface DiagnosticActionPanelProps {
  activeIncidents: DowntimeIncident[];
  onActionCompleted: () => void;
}

export default function DiagnosticActionPanel({ activeIncidents, onActionCompleted }: DiagnosticActionPanelProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  
  // Form submission state
  const [operatorName, setOperatorName] = useState<string>('');
  const [category, setCategory] = useState<'Mechanical' | 'Electrical' | 'Pneumatics' | 'Setup/Cleaning' | 'Material shortage'>('Mechanical');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [litersLost, setLitersLost] = useState<number>(0);
  
  // AI Diagnostics state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [aiError, setAiError] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeIncidents.length > 0) {
      // Default to the first active incident if none selected or the current selected is no longer active
      const currentlyActive = activeIncidents.find(inc => inc.id === selectedIncidentId);
      if (!currentlyActive) {
        setSelectedIncidentId(activeIncidents[0].id);
        setAiResult(null);
        setCompletedSteps({});
      }
    } else {
      setSelectedIncidentId('');
      setAiResult(null);
      setCompletedSteps({});
    }
  }, [activeIncidents, selectedIncidentId]);

  const selectedIncident = activeIncidents.find(inc => inc.id === selectedIncidentId);

  // Initialize form default based on selected incident
  useEffect(() => {
    if (selectedIncident) {
      setOperatorName(selectedIncident.operatorName || '');
      setActionTaken(selectedIncident.actionTaken || '');
      setLitersLost(selectedIncident.litersLostEstimate || 0);
    }
  }, [selectedIncident]);

  const handleFetchAiDiagnosis = async () => {
    if (!selectedIncidentId) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    setCompletedSteps({});
    
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: selectedIncidentId })
      });
      if (!response.ok) {
        throw new Error("Gagal mengambil panduan perbaikan dari server");
      }
      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || 'Gagal menghubungi modul diagnostik.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleStep = (step: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleSubmitAction = async (resolve: boolean) => {
    if (!operatorName.trim()) {
      alert("Mohon masukkan Nama Operator yang bertugas sebelum menyimpan!");
      return;
    }

    try {
      const response = await fetch('/api/operator-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncidentId,
          operatorName,
          category,
          actionTaken,
          litersLost,
          resolveMachineState: resolve
        })
      });

      if (response.ok) {
        onActionCompleted();
        setAiResult(null);
        setCompletedSteps({});
      }
    } catch (error) {
      console.error("Gagal mengirimkan tindak lanjut laporan:", error);
    }
  };

  if (activeIncidents.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/20 rounded-2xl p-8 border border-emerald-100 flex flex-col items-center text-center shadow-xs">
        <div className="h-12 w-12 rounded-full bg-emerald-100/90 flex items-center justify-center text-emerald-600 mb-3.5 ring-8 ring-emerald-500/5">
          <Check className="h-5 w-5" />
        </div>
        <h3 className="font-extrabold text-emerald-900 text-sm tracking-tight mb-1">Seluruh Jalur Filling Beroperasi Normal</h3>
        <p className="text-emerald-700/80 text-xs max-w-md leading-relaxed">
          Tidak ada downtime terdeteksi pada mesin filling saat ini. Pemantauan sensor melaporkan detak status aman (OPERATIONAL).
        </p>
      </div>
    );
  }

  return (
    <div id="diagnostic-center" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* Kolom Kiri: Form Input Tindak Lanjut Operator */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">Resolusi Gangguan Operator</h3>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Tiket Masalah Aktif</label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a]"
            >
              {activeIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.machineId}] {inc.sensorName}
                </option>
              ))}
            </select>
            {selectedIncident && (
              <div className="mt-2 bg-rose-50/60 text-[10px] text-rose-800 p-3 rounded-lg border border-rose-100 font-mono space-y-0.5">
                <div><span className="font-bold">Mulai:</span> {new Date(selectedIncident.startTime).toLocaleTimeString()}</div>
                <div><span className="font-bold">Kode Sensor:</span> {selectedIncident.sensorCode}</div>
              </div>
            )}
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Teknisi / Operator Bertugas</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Nama lengkap penanggungjawab..."
                  className="w-full text-xs pl-9 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-[#004e32]/10 focus:border-[#004e32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Klasifikasi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-[#004e32]/10 focus:border-[#004e32]"
                >
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Pneumatics">Pneumatics</option>
                  <option value="Setup/Cleaning">Setup/Cleaning</option>
                  <option value="Material shortage">Material shortage</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Bahan Terbuang (L)</label>
                <input
                  type="number"
                  value={litersLost}
                  onChange={(e) => setLitersLost(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-bold outline-none focus:ring-2 focus:ring-[#004e32]/10 focus:border-[#004e32]"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Laporan Tindakan Perbaikan</label>
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Langkah spesifik penanganan di lapangan..."
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-[#004e32]/10 focus:border-[#004e32] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-150 space-y-2">
          <button
            onClick={handleFetchAiDiagnosis}
            disabled={aiLoading}
            className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            {aiLoading ? (
              <>
                <Bot className="h-4 w-4 animate-spin text-indigo-200" />
                Mengambil Panduan Standard...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                Dapatkan Panduan Perbaikan Standard
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSubmitAction(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer text-center"
            >
              Simpan Draft Log
            </button>
            <button
              onClick={() => handleSubmitAction(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer text-center shadow-xs"
              title="Selesaikan perbaikan fisik alat dan normalkan mesin."
            >
              Mesin Normal Selesai
            </button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Panduan Diagnostik & Solusi Perbaikan */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px]">
        {aiLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
            <div className="relative flex items-center justify-center mb-4">
              <div className="h-10 w-10 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
              <Sparkles className="h-4 w-4 text-indigo-505 absolute animate-pulse" />
            </div>
            <p className="text-xs font-extrabold text-slate-700">Menganalisis Sinyal Teknis Sensor...</p>
            <p className="text-[10px] text-slate-400 mt-1">Menyelaraskan dengan database Avian</p>
          </div>
        ) : aiResult ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3.5 pb-3.5 border-b border-indigo-50">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-900 leading-none">Panduan Penanganan Pemeliharaan Avian</h4>
                <p className="text-[10px] text-slate-400 mt-1">SOP rekomendasi pemeliharaan mesin</p>
              </div>
              <span className="ml-auto text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-100">SOP GATEWAY</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[340px] space-y-4 text-xs pr-1">
              
              {/* Rekomendasi Utama */}
              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/60 text-slate-700 leading-relaxed font-sans">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1 text-[11px]">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Analisis Akar Masalah:
                </div>
                {aiResult.recommendation}
              </div>

              {/* Checklist Tindakan Lapangan */}
              <div>
                <div className="font-extrabold text-[#004e32] text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Hammer className="h-3.5 w-3.5" /> Panduan Langkah Lapangan:
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {aiResult.suggestedActionSteps && aiResult.suggestedActionSteps.map((step, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleToggleStep(step)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all border ${
                        completedSteps[step] 
                          ? 'bg-emerald-50/50 border-emerald-100 text-slate-500 line-through' 
                          : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded flex items-center justify-center border transition-all ${
                        completedSteps[step] 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {completedSteps[step] && <Check className="h-3 w-3 inline" />}
                      </div>
                      <span className="text-xs">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bahaya & Suku cadang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                  <div className="font-bold text-rose-800 mb-1 flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Faktor Keamanan:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-700">
                    {aiResult.safetyHazards && aiResult.safetyHazards.map((hz, i) => (
                      <li key={i}>{hz}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/20 border border-emerald-100 p-3 rounded-xl">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5 text-[11px]">
                    <Package className="h-3.5 w-3.5 text-emerald-600" /> Suku Cadang & Alat:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                    {aiResult.partsNeeded && aiResult.partsNeeded.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12 text-center my-auto">
            <Bot className="h-12 w-12 text-indigo-100 mb-3 animate-bounce" />
            <h4 className="font-extrabold text-slate-800 text-sm tracking-tight mb-1">Siap untuk Panduan Pemeliharaan</h4>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Tekan tombol "Dapatkan Panduan Perbaikan Standard" untuk menganalisis kode kesalahan dan memunculkan langkah penanganan standar di lantai pabrik.
            </p>
          </div>
        )}

        {aiError && (
          <div className="mt-2 bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-600 text-xs">
            Terjadi kendala memuat panduan: {aiError}. Lanjutkan dengan pengisian manual.
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-450">
          <span>Standard: SOP-AVN-MT-2026</span>
          <span className="font-semibold text-[#004e32]">Factory Plant Terminal Target</span>
        </div>
      </div>

    </div>
  );
}

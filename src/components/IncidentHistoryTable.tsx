/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Filter, FileSpreadsheet, RotateCcw, AlertOctagon, CheckCircle2, Bot, SlidersHorizontal, Calendar, Info } from 'lucide-react';
import { DowntimeIncident, FillingMachine } from '../types';

interface IncidentHistoryTableProps {
  incidents: DowntimeIncident[];
  machines: FillingMachine[];
  onResetDb: () => void;
}

export default function IncidentHistoryTable({ incidents, machines, onResetDb }: IncidentHistoryTableProps) {
  const [filterMachine, setFilterMachine] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Handlers for exporting simulated pdf/csv
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  const handleExportCSV = () => {
    setIsExporting(true);
    setExportMessage('Sedang memformat laporan untuk diunduh (XLSX)...');
    
    setTimeout(() => {
      // Simulate download trigger by converting to a readable format
      const headers = "ID,Mesin,Sensor,Mulai,Selesai,Durasi (Menit),Kategori,Operator,Tindakan,Taksiran Cat Hilang (L)\n";
      const rows = filteredIncidents.map(inc => {
        return `${inc.id},${inc.machineId},"${inc.sensorName}",${inc.startTime},${inc.endTime || "Berlangsung"},${inc.durationMinutes || "N/A"},${inc.category || "Uncategorized"},${inc.operatorName || "N/A"},"${inc.actionTaken || ""}",${inc.litersLostEstimate || 0}`;
      }).join("\n");
      
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Downtime_AvianBrands_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      setExportMessage('Laporan ekspor Excel (.csv) berhasil diunduh!');
      setTimeout(() => setExportMessage(''), 3000);
    }, 1500);
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchMachine = filterMachine === 'ALL' || inc.machineId === filterMachine;
    const matchCategory = filterCategory === 'ALL' || inc.category === filterCategory;
    const matchSearch = searchQuery === '' || 
      inc.sensorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.operatorName && inc.operatorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.actionTaken && inc.actionTaken.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchMachine && matchCategory && matchSearch;
  });

  const getCategoryBadgeClass = (cat: string | null) => {
    switch (cat) {
      case 'Mechanical':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Electrical':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Pneumatics':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Setup/Cleaning':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Material shortage':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="incidents-log" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      
      {/* Header Log */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Histori Downtime & Audit Log</h3>
          <p className="text-xs text-slate-400">Daftar lengkap interupsi, kualifikasi operator, reparasi, dan panduan tindak lanjut.</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors border border-indigo-100 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting ? 'Memproses...' : 'Ekspor Laporan (XLSX)'}
          </button>
          
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin menyetel ulang database logs downtime ke pengaturan demo bawaan?")) {
                onResetDb();
              }
            }}
            className="bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            title="Reset Database"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Data Demo
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg text-xs font-semibold animate-pulse">
          {exportMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/80 mb-5 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter Log:
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div>
            <select
              value={filterMachine}
              onChange={(e) => setFilterMachine(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Mesin Filling (F-01 s/d F-04)</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg p-2 text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Kategori Masalah</option>
              <option value="Mechanical">Mechanical (Mekanis)</option>
              <option value="Electrical">Electrical (Kelistrikan)</option>
              <option value="Pneumatics">Pneumatics (Kompresor)</option>
              <option value="Setup/Cleaning">Setup/Cleaning (Warna)</option>
              <option value="Material shortage">Bahan Baku Kosong</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari kata kunci tindakan/operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 pl-3 outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Tabulasi Log */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">No. Insiden</th>
              <th className="py-3 px-4">Mesin</th>
              <th className="py-3 px-4">IoT Sensor & Trigger</th>
              <th className="py-3 px-4">Waktu Mulai - Selesai</th>
              <th className="py-3 px-4">Durasi</th>
              <th className="py-3 px-4">Kategori SOP</th>
              <th className="py-3 px-4">Operator & Tindakan Lapangan</th>
              <th className="py-3 px-4 text-right">Rugi Vol. (L)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((inc) => {
                const mach = machines.find(m => m.id === inc.machineId);
                const isOngoing = inc.endTime === null;
                const formattedStart = new Date(inc.startTime).toLocaleDateString("id-ID", {
                  day: 'numeric', month: 'short'
                }) + " " + new Date(inc.startTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });

                const formattedEnd = inc.endTime 
                  ? new Date(inc.endTime).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <tr key={inc.id} className={`hover:bg-slate-50/50 transition-colors ${isOngoing ? 'bg-rose-50/20' : ''}`}>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      INC-{inc.id.split('-').pop()}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <div className="text-indigo-600">{inc.machineId}</div>
                      <div className="text-[10px] text-slate-400 font-normal font-sans line-clamp-1">{mach ? mach.name.split(' (')[0] : ''}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{inc.sensorName}</div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5 bg-slate-100 px-1 py-0.2 rounded inline-block">{inc.sensorCode}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <div>{formattedStart}</div>
                          {isOngoing ? (
                            <span className="text-[9px] font-semibold text-red-500 animate-pulse bg-red-50 px-1.5 py-0.2 rounded mt-0.5 inline-block border border-red-100">
                              Berlangsung (Live)
                            </span>
                          ) : (
                            <div className="text-[10px] text-slate-400">&rarr; Selesai: {formattedEnd}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {isOngoing ? (
                        <span className="text-rose-600 font-bold italic">-</span>
                      ) : (
                        <span>{inc.durationMinutes}m</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[10px]">
                      <span className={`px-2 py-0.5 font-bold rounded-lg border text-[10px] tracking-wide inline-block ${getCategoryBadgeClass(inc.category)}`}>
                        {inc.category || "Menunggu Klasifikasi"}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      {inc.operatorName ? (
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full"></span> {inc.operatorName}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed italic border-l border-slate-200 pl-2">
                            "{inc.actionTaken || 'Hanya verifikasi penerimaan alarm'}"
                          </p>
                          {inc.aiRecommendation && (
                            <div className="mt-1.5 bg-indigo-50/50 text-[9px] text-indigo-700 p-1.5 rounded flex items-start gap-1">
                              <Bot className="h-3 w-3 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">Langkah Panduan: {inc.aiRecommendation}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum bertindak (Silakan isi panel di atas)</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                      {inc.litersLostEstimate > 0 ? (
                        <span className="text-rose-600 font-extrabold">{inc.litersLostEstimate.toLocaleString("id-ID")} L</span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-normal font-sans">Belum dihitung</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                  Tidak ada rekaman insiden log yang cocok dengan filter saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500">
        <Info className="h-4 w-4 text-indigo-600 shrink-0" />
        <span>Rasionalisasi Cat Hilang dihitung berdasarkan: <code className="font-mono bg-white px-1 border border-slate-200 rounded">Kecepatan Mesin (L/min) x Durasi Matinya Mesin (min)</code>. Operator berwenang meredesain nilai kehilangan aktual apabila terdapat buffer tangki bypass.</span>
      </div>

    </div>
  );
}

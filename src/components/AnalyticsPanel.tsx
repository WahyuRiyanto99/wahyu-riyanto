/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, BarChart2, TrendingUp, AlertTriangle, Play, RefreshCw, Layers } from 'lucide-react';
import { FillingMachine, MachineStatus } from '../types';

interface AnalyticsPanelProps {
  machines: FillingMachine[];
  stats: {
    totalDowntimeMinutes: number;
    totalLitersLost: number;
    mttr: number;
    mtbf: number;
    categoriesCount: Record<string, number>;
    machineBreakdowns: Record<string, number>;
  };
}

export default function AnalyticsPanel({ machines, stats }: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'OEE' | 'CATEGORIES' | 'BREAKDOWN'>('OEE');

  // Calculates weighted average OEE components
  const activeMachines = machines.filter(m => m.status !== MachineStatus.DOWNTIME);
  const avgAvailability = Math.round(machines.reduce((sum, m) => sum + m.oeeAvailability, 0) / machines.length);
  const avgPerformance = Math.round(machines.reduce((sum, m) => sum + m.oeePerformance, 0) / machines.length);
  const avgQuality = Math.round(machines.reduce((sum, m) => sum + m.oeeQuality, 0) / machines.length);
  
  // OEE = A x P x Q
  const overallOee = Math.round((avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100) * 100);

  // Render SVG Circular Gauge
  const getGaugeCircle = (percentage: number, colorClass: string, strokeHex: string) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="text-slate-100"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="8"
          stroke={strokeHex}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  };

  // Convert stats components to usable structures for charts
  const categoryColors: Record<string, string> = {
    "Mechanical": "#f59e0b", // Amber
    "Electrical": "#6366f1", // Indigo
    "Pneumatics": "#3b82f6", // Blue
    "Setup/Cleaning": "#ec4899", // Pink
    "Material shortage": "#ef4444", // Red
    "Uncategorized": "#94a3b8" // Slate
  };

  const totalCategoriesCount = Object.values(stats.categoriesCount).reduce((a, b) => a + b, 0);

  return (
    <div id="analytics-panel" className="space-y-6">
      
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: OEE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">OEE Rata-rata</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{overallOee}%</h4>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              Target Pabrik: 85%
            </span>
          </div>
          <div className="relative flex items-center justify-center">
            {getGaugeCircle(overallOee, "text-indigo-600", "#4f46e5")}
            <span className="absolute text-sm font-bold text-indigo-900 font-mono">{overallOee}%</span>
          </div>
        </div>

        {/* Card 2: MTTR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">MTTR (Mean Time to Repair)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-bold text-slate-800">{stats.mttr}</h4>
            <span className="text-xs text-slate-400 font-medium">Menit</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
            Rata-rata waktu pemulihan elektrikal & mekanikal perbaikan sejak alarm berbunyi.
          </p>
        </div>

        {/* Card 3: MTBF */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">MTBF (Mean Time Between Failures)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-bold text-slate-800">{stats.mtbf}</h4>
            <span className="text-xs text-slate-400 font-medium">Jam</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
            Estimasi waktu operasional tanpa gangguan di lini pengisian Avian.
          </p>
        </div>

        {/* Card 4: Kapasitas Cat Hilang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Kapasitas Cat Hilang (Hari Ini)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="font-bold text-2xl text-rose-600">{stats.totalLitersLost.toLocaleString("id-ID")}</h4>
            <span className="text-xs text-slate-400 font-medium">Liter</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
            Konsekuensi downtime terhadap volume botol yang urung dipasok.
          </p>
        </div>

      </div>

      {/* Main Charts & Visual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bagian Kiri: Visualisasi OEE per mesin atau timeline */}
        <div className="lg:col-span-12 xl:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Analisa Performa & Frekuensi Mesin</h3>
              <p className="text-xs text-slate-400">Peta metrik OEE, kategori kegagalan, dan total interupsi sistem.</p>
            </div>
            
            <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('OEE')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${activeTab === 'OEE' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Metrik OEE Mesin
              </button>
              <button
                onClick={() => setActiveTab('CATEGORIES')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${activeTab === 'CATEGORIES' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Penyebab Utama (Kategori)
              </button>
              <button
                onClick={() => setActiveTab('BREAKDOWN')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${activeTab === 'BREAKDOWN' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Breakdowns Per Unit
              </button>
            </div>
          </div>

          <div className="min-h-[290px] flex items-center justify-center">
            {activeTab === 'OEE' && (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {machines.map((m) => {
                  const mOeee = Math.round((m.oeeAvailability / 100) * (m.oeePerformance / 100) * (m.oeeQuality / 100) * 100);
                  return (
                    <div key={m.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center flex flex-col items-center">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">{m.id}</span>
                      <h4 className="text-xs font-semibold text-slate-700 mt-2 line-clamp-1 h-4">{m.name.split(' (')[0]}</h4>
                      
                      <div className="relative my-4 flex items-center justify-center">
                        {getGaugeCircle(mOeee, "text-indigo-600", mOeee > 85 ? "#10b981" : mOeee > 70 ? "#eab308" : "#f43f5e")}
                        <span className="absolute text-sm font-bold text-slate-800">{mOeee}%</span>
                      </div>

                      <div className="w-full text-[10px] text-slate-500 space-y-1 mt-1 text-left">
                        <div className="flex justify-between">
                          <span>Availability:</span>
                          <span className="font-semibold text-slate-700">{m.oeeAvailability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Performance:</span>
                          <span className="font-semibold text-slate-700">{m.oeePerformance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <span className="font-semibold text-slate-700">{m.oeeQuality}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'CATEGORIES' && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* SVG Donut Chart */}
                <div className="flex justify-center">
                  {totalCategoriesCount > 0 ? (
                    <div className="relative w-48 h-48">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                        {(() => {
                          let accumulatedPercentage = 0;
                          return Object.entries(stats.categoriesCount).map(([cat, count]) => {
                            if (count === 0) return null;
                            const percentage = (count / totalCategoriesCount) * 100;
                            const strokeRadius = 35;
                            const strokeCircumference = 2 * Math.PI * strokeRadius;
                            const offset = strokeCircumference - (percentage / 100) * strokeCircumference;
                            const rotation = (accumulatedPercentage / 100) * strokeCircumference * -1;
                            accumulatedPercentage += percentage;

                            return (
                              <circle
                                key={cat}
                                cx="50"
                                cy="50"
                                r={strokeRadius}
                                fill="transparent"
                                stroke={categoryColors[cat] || "#94a3b8"}
                                strokeWidth="18"
                                strokeDasharray={strokeCircumference}
                                strokeDashoffset={offset}
                                transform={`rotate(${(rotation / strokeCircumference) * 360} 50 50)`}
                                className="transition-all duration-500"
                              />
                            );
                          });
                        })()}
                        <circle cx="50" cy="50" r="26" fill="white" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
                        <span className="text-xl font-bold text-slate-800">{totalCategoriesCount}</span>
                        <span className="text-[10px] text-slate-400">Insiden</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400">Tidak ada kategori untuk ditampilkan.</div>
                  )}
                </div>

                {/* Legends */}
                <div className="space-y-3">
                  {Object.entries(stats.categoriesCount).map(([cat, count]) => {
                    const percentage = totalCategoriesCount > 0 ? Math.round((count / totalCategoriesCount) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="h-3.3 w-3.3 rounded-full" style={{ backgroundColor: categoryColors[cat] }}></span>
                          <span className="font-semibold text-slate-700">{cat}</span>
                        </div>
                        <div className="flex items-baseline gap-2 font-mono">
                          <span className="text-slate-800 font-bold">{count}</span>
                          <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'BREAKDOWN' && (
              <div className="w-full flex flex-col justify-end min-h-[220px]">
                {/* SVG Bar Chart with pure CSS bars */}
                <div className="grid grid-cols-4 gap-6 items-end h-44 border-b border-slate-200 mb-2 px-6">
                  {Object.entries(stats.machineBreakdowns).map(([machId, count]) => {
                    // Normalize height (max incidents is 6 or 7, so scale factor is ~25px per count)
                    const maxCount = Math.max(...Object.values(stats.machineBreakdowns), 1);
                    const heightPercent = Math.max(8, (count / maxCount) * 100);
                    return (
                      <div key={machId} className="flex flex-col items-center group relative cursor-pointer">
                        {/* Tooltip value */}
                        <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded font-mono shadow-md z-12">
                          {count} Insiden
                        </div>
                        
                        <div 
                          style={{ height: `${heightPercent}%` }}
                          className={`w-12 sm:w-16 rounded-t-lg transition-all duration-500 ease-out ${
                            count > 2 ? 'bg-gradient-to-t from-rose-500 to-rose-400 text-white' : 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                          }`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legends under bar chart */}
                <div className="grid grid-cols-4 gap-6 text-center text-xs text-slate-500 font-mono">
                  {Object.keys(stats.machineBreakdowns).map((machId) => (
                    <div key={machId} className="font-bold text-slate-700">
                      {machId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bagian Kanan: Standar OEE Pabrik (PT. Avia Avian Brands) */}
        <div className="lg:col-span-12 xl:col-span-4 bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-sky-400" />
              <h3 className="font-semibold text-slate-100 text-base">Standar Target OEE Industri</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              PT. Avia Avian Brands mengimplementasikan perhitungan OEE (Overall Equipment Effectiveness) sesuai standar pabrik cat modern Kelas Dunia.
            </p>

            <div className="space-y-4">
              {/* Std 1: Avaialbility */}
              <div className="border-l-2 border-sky-500 pl-3.5">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-semibold text-slate-200">Availability Rate (AV)</span>
                  <span className="text-xs font-bold text-sky-300">Target: &ge; 90%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Rasio waktu pengoperasian efektif terhadap total jam shift kerja, dipengaruhi oleh stop darurat & perbaikan.
                </p>
              </div>

              {/* Std 2: Performance */}
              <div className="border-l-2 border-emerald-500 pl-3.5">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-semibold text-slate-200">Performance Density (PR)</span>
                  <span className="text-xs font-bold text-emerald-300">Target: &ge; 95%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mengukur kecepatan pengisian kaleng (L/min) apakah sesuai dengan kapasitas teoritis mesin utama.
                </p>
              </div>

              {/* Std 3: Quality */}
              <div className="border-l-2 border-indigo-500 pl-3.5">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs font-semibold text-slate-200">Quality Output (QR)</span>
                  <span className="text-xs font-bold text-indigo-300">Target: &ge; 99%</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Rasio volume pengisian kaleng cat presisi tanpa tumpahan (spillage) atau reject klem segel penutup.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
            Formulasi: OEE = AV (%) &times; PR (%) &times; QR (%)
          </div>
        </div>

      </div>
    </div>
  );
}

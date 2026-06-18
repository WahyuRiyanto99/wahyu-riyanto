/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, 
  Wifi, 
  Cpu, 
  Hammer, 
  FileText, 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Wrench,
  TrendingUp,
  Sliders,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  PlayCircle,
  BarChart3,
  ListTodo,
  Bot,
  Database
} from 'lucide-react';

import { FillingMachine, DowntimeIncident, MachineStatus } from './types';
import IotSimulationPanel from './components/IotSimulationPanel';
import DiagnosticActionPanel from './components/DiagnosticActionPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import IncidentHistoryTable from './components/IncidentHistoryTable';
import MonthlyReportGenerator from './components/MonthlyReportGenerator';

import LoginPortal from './components/LoginPortal';
import MainPortalHub from './components/MainPortalHub';
import ManufactureHub from './components/ManufactureHub';

export default function App() {
  // Navigation workflows: 'LOGIN' | 'PORTAL' | 'MANUFACTURE' | 'IOT_DOWNTIME'
  const [activeView, setActiveView] = useState<'LOGIN' | 'PORTAL' | 'MANUFACTURE' | 'IOT_DOWNTIME'>('LOGIN');
  const [currentUser, setCurrentUser] = useState<string>('WAHYU RIYANTO');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  const [machines, setMachines] = useState<FillingMachine[]>([]);
  const [incidents, setIncidents] = useState<DowntimeIncident[]>([]);
  const [stats, setStats] = useState({
    totalDowntimeMinutes: 0,
    totalLitersLost: 0,
    mttr: 24,
    mtbf: 48,
    categoriesCount: {
      "Mechanical": 0,
      "Electrical": 0,
      "Pneumatics": 0,
      "Setup/Cleaning": 0,
      "Material shortage": 0,
      "Uncategorized": 0
    },
    machineBreakdowns: {
      "MF-01": 0,
      "MF-02": 0,
      "MF-03": 0,
      "MF-04": 0
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'MONITORING' | 'OEE' | 'AUDIT'>('MONITORING');

  // Fetch all states from Express backend
  const refreshAllData = async () => {
    try {
      const [resMachines, resIncidents, resStats] = await Promise.all([
        fetch('/api/machines'),
        fetch('/api/incidents'),
        fetch('/api/statistics')
      ]);

      if (!resMachines.ok || !resIncidents.ok || !resStats.ok) {
        throw new Error("Gagal memuat status dari server Express.");
      }

      const dataMachines = await resMachines.json();
      const dataIncidents = await resIncidents.json();
      const dataStats = await resStats.json();

      setMachines(dataMachines);
      setIncidents(dataIncidents);
      setStats(dataStats);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Kesalahan menyambung ke server. Memuat simulasi lokal...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    // Auto refresh data every 10 seconds for real-time vibe
    const interval = setInterval(refreshAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDb = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reset-db', { method: 'POST' });
      if (response.ok) {
        await refreshAllData();
      }
    } catch (err) {
      console.error("Gagal menyetel ulang database logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setActiveView('PORTAL');
  };

  const handleLogout = () => {
    setActiveView('LOGIN');
  };

  const activeIncidents = incidents.filter(inc => inc.endTime === null);

  // VIEW ROUTER
  if (activeView === 'LOGIN') {
    return <LoginPortal onLoginSuccess={handleLogin} />;
  }

  if (activeView === 'PORTAL') {
    return (
      <MainPortalHub 
        username={currentUser} 
        onSelectApp={(appId) => {
          if (appId === 'dashboard') {
            setActiveView('IOT_DOWNTIME');
          } else if (appId === 'manufacture') {
            setActiveView('MANUFACTURE');
          }
        }} 
        onLogout={handleLogout} 
      />
    );
  }

  if (activeView === 'MANUFACTURE') {
    return (
      <ManufactureHub
        username={currentUser}
        onBackToPortal={() => setActiveView('PORTAL')}
        onSelectSubModule={(subModuleId) => {
          if (subModuleId === 'iot-downtime') {
            setActiveView('IOT_DOWNTIME');
          }
        }}
        onLogout={handleLogout}
      />
    );
  }

  // IOT DOWNTIME VIEWER (with sidebar exactly like screen 1)
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-[#00875a] selection:text-white">
      
      {/* SCREEN 1 ALIGNED: GREEN HEADER NAVIGATION BAR */}
      <header className="bg-[#00875a] text-white h-16 flex items-center justify-between px-4 sticky top-0 z-40 shadow-md">
        
        {/* Left corner: Logo and Toggle hamburger menu */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🦆</span>
            <span className="font-bold text-sm sm:text-base tracking-wide uppercase">
              Avian IoT
            </span>
          </div>
        </div>

        {/* Right corner: Welcome profile user badge with circular avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono opacity-80 bg-black/10 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 mt-0.5 text-[#a8fcd5]" /> UTC: {new Date().toISOString().slice(11, 19)}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono tracking-tight text-[#e6fcf1]">
              {currentUser}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border-2 border-emerald-400 text-[#00875a] font-bold text-xs shadow-inner">
              {currentUser.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

      </header>

      {/* CORE WRAPPER: SIDEBAR + CONTENT PANEL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* REVOLUTIONARY SIDEBAR: Slate Dark Theme */}
        <aside 
          className={`bg-[#2c353d] text-slate-300 md:relative absolute z-30 h-[calc(100vh-64px)] transition-all duration-300 shadow-xl border-r border-[#1a2228] flex flex-col justify-between ${
            isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-0 overflow-hidden'
          }`}
        >
          {/* Menu Items */}
          <div className="py-4 space-y-1">
            <div className="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Navigation Subsystems
            </div>
            
            <button
              onClick={() => setActiveView('MANUFACTURE')}
              className="w-full text-left px-4 py-3 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-3 text-xs font-semibold cursor-pointer border-l-4 border-transparent"
            >
              <LayoutDashboard className="h-4 w-4 text-sky-400" />
              Kembali ke Hub Manufaktur
            </button>

            <button
              onClick={() => setActiveView('PORTAL')}
              className="w-full text-left px-4 py-3 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-3 text-xs font-semibold cursor-pointer border-l-4 border-transparent"
            >
              <LayoutDashboard className="h-4 w-4 text-[#a8fcd5]" />
              Kembali ke Portal Utama
            </button>

            <button
              onClick={() => {
                setActiveTab('MONITORING');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-xs font-semibold cursor-pointer border-l-4 ${
                activeTab === 'MONITORING' 
                  ? 'bg-[#1f262c] text-white border-[#00875a]' 
                  : 'hover:bg-slate-700/50 hover:text-white border-transparent'
              }`}
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              Monitor & Simulasi IoT
            </button>

            <button
              onClick={() => {
                setActiveTab('OEE');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-xs font-semibold cursor-pointer border-l-4 ${
                activeTab === 'OEE' 
                  ? 'bg-[#1f262c] text-white border-[#00875a]' 
                  : 'hover:bg-slate-700/50 hover:text-white border-transparent'
              }`}
            >
              <BarChart3 className="h-4 w-4 text-sky-400" />
              Analisis Kinerja OEE
            </button>

            <button
              onClick={() => {
                setActiveTab('AUDIT');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-xs font-semibold cursor-pointer border-l-4 ${
                activeTab === 'AUDIT' 
                  ? 'bg-[#1f262c] text-white border-[#00875a]' 
                  : 'hover:bg-slate-700/50 hover:text-white border-transparent'
              }`}
            >
              <Database className="h-4 w-4 text-purple-400" />
              Audit Log &amp; Rekomendasi Lapangan
            </button>
          </div>

          {/* Bottom user quick actions */}
          <div className="p-4 border-t border-[#1e252a] bg-[#1f262c] space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] text-slate-400 font-bold font-mono">EDGE GATEWAY LIVE</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-[#3e4a55] hover:bg-rose-955 hover:text-red-300 text-slate-200 text-[11px] font-bold py-2 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out System
            </button>
          </div>

        </aside>

        {/* BODY AREA (Main viewport layout) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50">
          
          {/* SCREEN 1 IDENTICAL CAPTION BANNER */}
          <div className="bg-white px-6 py-5 rounded-xl border border-slate-200/60 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
              Selamat datang, {currentUser}.
            </h2>
          </div>

          {/* Error Indicator */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 py-3 px-4 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-pulse">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* RENDER ACTIVE TAB */}
          {activeTab === 'MONITORING' && (
            <div className="space-y-8">
              
              {/* MACHINE CARDS STATUS */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
                    Status Jalur Filling (F-01 s/d F-04)
                  </h3>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2.5 py-0.5 rounded border border-emerald-100">Live Feed</span>
                </div>

                {loading && machines.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="bg-white rounded-2xl h-44 border border-slate-200 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {machines.map((machine) => {
                      const isDowntime = machine.status === MachineStatus.DOWNTIME;
                      const isIdle = machine.status === MachineStatus.IDLE;
                      
                      return (
                        <div 
                          key={machine.id} 
                          className={`bg-white rounded-2xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
                            isDowntime 
                              ? 'border-rose-400 ring-4 ring-rose-500/10 shadow-lg shadow-red-500/5' 
                              : isIdle 
                                ? 'border-amber-300' 
                                : 'border-slate-200 hover:border-emerald-500'
                          }`}
                        >
                          <div>
                            {/* Machine Header */}
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-mono font-black text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                {machine.id}
                              </span>
                              
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 border uppercase tracking-wider ${
                                isDowntime 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
                                  : isIdle 
                                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isDowntime ? 'bg-red-500' : isIdle ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                {machine.status}
                              </span>
                            </div>

                            {/* Details */}
                            <h3 className="font-extrabold text-sm text-slate-800 mt-3 line-clamp-1">
                              {machine.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">{machine.type}</p>
                          </div>

                          {/* Operational Telemetry values */}
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-500">
                              <span>Laju Pengisian:</span>
                              <span className="font-bold text-slate-800">{machine.speedLitersPerMinute} L/min</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                              <span>Total Output:</span>
                              <span className="font-bold text-slate-800">{machine.totalProductionTodayLitres.toLocaleString("id-ID")} L</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                              <span>Operator:</span>
                              <span className="font-semibold text-emerald-700 overflow-hidden truncate max-w-[110px]">
                                {machine.currentOperator}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DIAGNOSTIC WORKSPACE (Full Screen Width for best widescreen layout) */}
              {activeIncidents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <h3 className="font-extrabold text-[11px] text-rose-600 uppercase tracking-widest">
                      Pusat Resolusi &amp; Diagnostik Downtime Aktif
                    </h3>
                  </div>
                  <DiagnosticActionPanel 
                    activeIncidents={activeIncidents} 
                    onActionCompleted={refreshAllData} 
                  />
                </div>
              )}

              {/* SIMULATION & HEALTH CHECK AREA */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {activeIncidents.length === 0 && (
                  <div className="xl:col-span-7 h-full">
                    <DiagnosticActionPanel 
                      activeIncidents={activeIncidents} 
                      onActionCompleted={refreshAllData} 
                    />
                  </div>
                )}
                
                <div className={activeIncidents.length === 0 ? "xl:col-span-5" : "col-span-12"}>
                  <IotSimulationPanel 
                    machines={machines} 
                    onEventSimulated={refreshAllData} 
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'OEE' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Kinerja Produksi & Keandalan Mesin</h3>
              </div>
              <AnalyticsPanel 
                machines={machines} 
                stats={stats} 
              />
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Logs list of occurrences */}
              <div className="xl:col-span-7 h-full">
                <IncidentHistoryTable
                  incidents={incidents}
                  machines={machines}
                  onResetDb={handleResetDb}
                />
              </div>

              {/* Executive Monthly Gemini report generator */}
              <div className="xl:col-span-5 h-full">
                <MonthlyReportGenerator />
              </div>

            </div>
          )}

        </main>

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-500 text-xs py-4 border-t border-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[10px] text-slate-600">Enterprise Gateway</span>
          <span className="text-[10px] text-slate-600">v1.2.0</span>
        </div>
      </footer>

    </div>
  );
}

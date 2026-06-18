/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Settings, 
  Droplet, 
  Dribbble, 
  Columns, 
  TrendingUp, 
  CheckCircle2, 
  User, 
  LogOut,
  Sparkles,
  ChevronRight,
  Gauge
} from 'lucide-react';

interface ManufactureHubProps {
  username: string;
  onBackToPortal: () => void;
  onSelectSubModule: (subModuleId: string) => void;
  onLogout: () => void;
}

export default function ManufactureHub({ username, onBackToPortal, onSelectSubModule, onLogout }: ManufactureHubProps) {
  
  // High fidelity submodules of Avian Brands Manufacturing Division
  const subModules = [
    {
      id: 'iot-downtime',
      title: 'IoT Downtime Mesin Filling',
      description: 'Sistem monitoring real-time berbasis sensor IoT untuk downtime mesin pengisian (filling) produk cat Avian, lengkap dengan analisis diagnostik dan panduan perbaikan terstruktur.',
      badge: 'Sistem Utama - Berjalan',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <Gauge className="h-8 w-8 text-emerald-600" />,
      isActive: true,
      buttonText: 'Masuk Dasbor Downtime'
    },
    {
      id: 'resin-reactor',
      title: 'Resin Reactor Automation & Temp Control',
      description: 'Kontrol otomatisasi suhu dan tekanan sistem reaktor pembuatan bahan resin dasar cat tembok dan cat alkyd solvent-based.',
      badge: 'SOP Pelumasan Reaktor',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <Droplet className="h-8 w-8 text-sky-500" />,
      isActive: false,
      buttonText: 'Under Development'
    },
    {
      id: 'automatic-tinting',
      title: 'Automatic Color Tinting & Mixing Dispenser',
      description: 'Manajemen formulasi pigmen warna cat premium otomatis, pengontrolan takaran tiner, pengikat akrilik, dan aditif kimia agar OEE kualitas capai > 99.5%.',
      badge: 'Dalam Perencanaan',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <Activity className="h-8 w-8 text-indigo-500" />,
      isActive: false,
      buttonText: 'Under Development'
    },
    {
      id: 'packaging-conveyor',
      title: 'Speed Control Guide Rail Conveyor',
      description: 'Sinkronisasi ban berjalan (conveyor belt) pengemasan kaleng besi Avian dan pail Avitex 20 kg guna meminimalkan risiko kaleng terbalik di pembatas guide rail.',
      badge: 'Sikap Siaga Sistem',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <Settings className="h-8 w-8 text-amber-500" />,
      isActive: false,
      buttonText: 'Under Development'
    }
  ];

  return (
    <div id="manufacture-hub" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* HEADER NAVBAR BAR */}
      <nav className="bg-white text-slate-800 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center border border-slate-200 mr-1"
              title="Kembali ke Portal"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <div className="h-8 w-8 rounded bg-[#004e32] flex items-center justify-center text-white text-xs font-black">
              🦆
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-sm sm:text-base font-extrabold text-[#004e32]">
                  Avian Manufacture
                </h1>
                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">Production Plant</span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">
                Manufacturing Operation Gateway
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700">
              <User className="h-3.5 w-3.5 text-emerald-700" />
              <span>PSRG11 - {username}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>

        </div>
      </nav>

      {/* BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* UPPER TITLE SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold uppercase">
              <Sparkles className="h-3 w-3 animate-pulse" /> Factory Plant No. 1
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#004e32] tracking-tight">
              Sistem Manajemen Produksi Cat (Manufacture Hub)
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Selamat datang di portal manufaktur PT. Avia Avian Tbk. Di sini Anda dapat mengakses konsol manajemen mesin, memantau laju konveyor pengisian, koordinasi shift operator kimia, dan mengaudit indikator downtime.
            </p>
          </div>

          <button
            onClick={onBackToPortal}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-98"
          >
            &larr; Kembali ke Portal Utama
          </button>
        </div>

        {/* SUBMODULES GRID LIST */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider block">
            Daftar Modul Aplikasi Kamar Operasi Mesin
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subModules.map((sub) => {
              return (
                <div 
                  key={sub.id}
                  className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between h-[230px] ${
                    sub.isActive 
                      ? 'border-emerald-300 shadow-md hover:shadow-xl ring-2 ring-emerald-500/5' 
                      : 'border-slate-200/80 opacity-80'
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-slate-100/50 rounded-xl">
                        {sub.icon}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${sub.badgeColor}`}>
                        {sub.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h4 className="font-extrabold text-base text-slate-800 mt-4 tracking-tight leading-tight">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  {/* Operational Entry Action Button */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {sub.isActive ? (
                      <button
                        onClick={() => onSelectSubModule(sub.id)}
                        className="w-full bg-[#004e32] hover:bg-[#003622] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#005c3c]"
                      >
                        {sub.buttonText}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 font-semibold text-xs px-4 py-2.5 rounded-lg border border-slate-200 cursor-not-allowed select-none transition-colors"
                      >
                        {sub.buttonText}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT STATUS NOTICE */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
          <div className="p-1 bg-sky-100 text-sky-600 rounded">
            <Cpu className="h-5 w-5 text-sky-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-sky-900">Catatan Integrasi Gateway:</h4>
            <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5">
              Sistem lajur pengisi cat tembok kemasan Avitex Pail (20L) terhubung penuh ke router Gateway Line 3. Seluruh telemetry downtime mengalir lancar, dan analisis OEE diintegrasikan secara berkala.
            </p>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-500 text-xs py-10 mt-12 border-t border-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-extrabold text-[11px] text-white tracking-wider">PT. AVIA AVIAN Tbk</span>
              <span className="bg-[#004e32] text-[#9bf2d0] font-mono text-[9px] px-1.5 py-0.2 rounded font-black">ACTIVE</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm">
              Sektor Manufaktur & Teknis Kontrol Pengemasan Otomatis Pabrik Avian.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-center sm:text-right">
            <div>GATEWAY VERSION V1.2.6</div>
            <div>&copy; {new Date().getFullYear()} Avian Brands Co.</div>
          </div>
        </div>
      </footer>

    </div>
  );
}

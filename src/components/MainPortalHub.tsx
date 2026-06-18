/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  User, 
  LogOut, 
  Gauge, 
  Activity, 
  FlaskConical, 
  Leaf, 
  LifeBuoy, 
  Users, 
  Scale, 
  ClipboardCheck, 
  TrendingUp, 
  Monitor, 
  Megaphone, 
  Newspaper, 
  ShoppingCart, 
  BookOpen, 
  Settings, 
  MoreHorizontal,
  Home,
  MessageSquare
} from 'lucide-react';

interface MainPortalHubProps {
  username: string;
  onSelectApp: (appId: string) => void;
  onLogout: () => void;
}

export default function MainPortalHub({ username, onSelectApp, onLogout }: MainPortalHubProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 18 departments as seen in the grid of Image 2
  const portalApps = [
    { 
      id: 'dashboard', 
      title: 'Dashboard', 
      icon: <Gauge className="h-10 w-10 text-emerald-600" />, 
      bg: 'bg-gradient-to-br from-white to-slate-100',
      tag: 'IoT System'
    },
    { 
      id: 'manufacture', 
      title: 'Manufacture', 
      icon: <Activity className="h-10 w-10 text-blue-600 animate-pulse" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50',
      tag: 'Active'
    },
    { 
      id: 'rdi', 
      title: 'RDI', 
      icon: <FlaskConical className="h-10 w-10 text-purple-600" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'qa-esg', 
      title: 'QA-ESG', 
      icon: <Leaf className="h-10 w-10 text-[#00875a]" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'ehs', 
      title: 'EHS', 
      icon: <LifeBuoy className="h-10 w-10 text-rose-500 animate-spin-slow" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'hrd', 
      title: 'HRD', 
      icon: <Users className="h-10 w-10 text-teal-600" />, 
      bg: 'bg-white'
    },
    { 
      id: 'legal', 
      title: 'Legal', 
      icon: <Scale className="h-10 w-10 text-amber-700" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'internal-audit', 
      title: 'Internal Audit', 
      icon: <ClipboardCheck className="h-10 w-10 text-orange-600" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'finance', 
      title: 'Finance', 
      icon: <TrendingUp className="h-10 w-10 text-emerald-700" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'it', 
      title: 'IT', 
      icon: <Monitor className="h-10 w-10 text-indigo-600" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'sales-marketing', 
      title: 'Sales & Marketing', 
      icon: <ShoppingCart className="h-10 w-10 text-pink-600" />, 
      bg: 'bg-white'
    },
    { 
      id: 'library', 
      title: 'Library', 
      icon: <BookOpen className="h-10 w-10 text-cyan-600" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'announcement', 
      title: 'Announcement', 
      icon: <Megaphone className="h-10 w-10 text-red-500" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'avian-news', 
      title: 'Avian News', 
      icon: <Newspaper className="h-10 w-10 text-slate-600" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'procurement', 
      title: 'Procurement', 
      icon: <ShoppingCart className="h-10 w-10 text-pink-600" />, 
      bg: 'bg-rose-50/50 border-rose-100'
    },
    { 
      id: 'avian-lms', 
      title: 'Avian LMS', 
      icon: (
        // Custom graduation-cap icon for Penguin LMS style
        <div className="relative">
          <span className="text-3xl">🎓</span>
          <span className="absolute -bottom-1 -right-1 text-base">🐧</span>
        </div>
      ), 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'other', 
      title: 'Other', 
      icon: <MoreHorizontal className="h-10 w-10 text-slate-400" />, 
      bg: 'bg-gradient-to-br from-white to-slate-50'
    },
    { 
      id: 'under-development', 
      title: 'Under Development...', 
      icon: <Settings className="h-10 w-10 text-indigo-400 animate-spin-slow" />, 
      bg: 'bg-slate-50 text-slate-400 cursor-not-allowed'
    }
  ];

  const filteredApps = portalApps.filter(app => 
    app.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="avian-portal-hub" className="min-h-screen bg-[#3d697f] text-slate-100 flex flex-col font-sans transition-all duration-300">
      
      {/* PORTAL NAVIGATION BAR */}
      <nav className="bg-white text-slate-800 shadow-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#004e32] flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0 scale-95">
              🦆
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#004e32] tracking-tight leading-none">
                Avian Portal
              </h1>
              <span className="text-[9px] text-[#00875a] font-bold tracking-widest uppercase">
                PT. AVIA AVIAN Tbk
              </span>
            </div>
          </div>

          {/* Color Splash Banner decoration as seen at the top of Image 2 */}
          <div className="hidden lg:block flex-1 max-w-sm mx-8 h-8 rounded bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-500 to-purple-500 opacity-80 shadow-inner">
            <div className="h-full w-full bg-cover opacity-35 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          </div>

          {/* User profile with detailed pill metadata exactly as in image 2 */}
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200/80 px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
              <User className="h-4 w-4 text-emerald-600" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-800 leading-none">
                  PSRG11 - {username} (024260286)
                </p>
                <span className="text-[8px] text-slate-400 font-semibold uppercase">Authorized Session</span>
              </div>
            </div>

            {/* Log Out button styled with white/borders as in Image 2 */}
            <button
              onClick={onLogout}
              className="bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 hover:border-rose-300 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out
            </button>
          </div>

        </div>
      </nav>

      {/* CORE HERO SECTION FOR ENTERPRISE SEARCH */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        
        {/* Avian Brands Big Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg className="w-20 h-20 text-white drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,15 C40,15 32,22 30,30 C34,28 39,28 42,30 C45,32 48,35 48,39 L48,42 C44,45 38,44 32,41 C30,48 34,55 40,58 C45,60 52,58 58,54 C65,58 72,58 78,54 C72,50 68,45 68,39 C68,26 60,15 50,15 Z" />
            <path d="M22,50 C26,50 30,55 35,55 C40,55 45,51 50,51 C55,51 60,55 65,55 C70,55 74,50 78,50 C80,56 75,64 68,68 C60,72 50,72 40,72 C30,72 20,64 22,50 Z" opacity="0.85" />
          </svg>
          <h2 className="text-2xl font-black mt-2 text-white/95 uppercase tracking-wider">
            Avian
          </h2>
          <span className="text-[10px] tracking-widest text-[#9bf2d0] uppercase font-bold leading-none">
            B r a n d s
          </span>
        </div>

        {/* Global Directory Search */}
        <div className="max-w-xl mx-auto relative shadow-2xl rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Home className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search department modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 text-xs rounded-lg py-3.5 pl-11 pr-12 focus:ring-4 focus:ring-sky-500/30 outline-none font-medium placeholder-slate-400 shadow-md border-0"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
        </div>

      </div>

      {/* TABS GRID AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredApps.map((app) => {
            const isClickable = app.id !== 'under-development';
            
            return (
              <button
                key={app.id}
                onClick={() => isClickable && onSelectApp(app.id)}
                disabled={!isClickable}
                className={`relative group ${app.bg} text-slate-800 rounded-xl p-5 border border-slate-200/50 shadow-md flex flex-col justify-between items-start text-left shrink-0 h-[140px] transition-all duration-200 ${
                  isClickable 
                    ? 'cursor-pointer hover:shadow-2xl hover:scale-103 hover:border-emerald-300' 
                    : 'opacity-65 cursor-not-allowed'
                }`}
              >
                
                {/* Upper row: Icon & Action arrow */}
                <div className="flex justify-between w-full items-start">
                  <div className="p-3 bg-slate-100/50 rounded-xl group-hover:bg-indigo-50 group-hover:scale-105 transition-all">
                    {app.icon}
                  </div>
                  
                  {isClickable && (
                    <span className="text-[9px] font-bold bg-[#00875a]/10 text-[#00875a] px-2 py-0.5 rounded-full uppercase scale-90 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Module
                    </span>
                  )}
                </div>

                {/* Bottom title & details */}
                <div className="mt-4">
                  <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-snug group-hover:text-indigo-900">
                    {app.title}
                  </h3>
                  {app.tag && (
                    <span className="text-[8px] bg-indigo-500 text-white font-mono rounded px-1.5 py-0.2 mt-1 inline-block">
                      {app.tag}
                    </span>
                  )}
                </div>

                {/* High quality glossy glare effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 pointer-events-none"></div>

              </button>
            );
          })}
        </div>

        {/* Small footer tips */}
        <div className="mt-8 text-center text-xs text-slate-300/60 font-mono">
          PT. Avia Avian Brands &bull; Jakarta Manufacturing Operations Unit &bull; 2026 Enterprise Gateway
        </div>

      </div>

    </div>
  );
}

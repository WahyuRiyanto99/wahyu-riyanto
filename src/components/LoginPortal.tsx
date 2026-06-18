/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, ChevronDown, User, Lock, Paintbrush, UserPlus, Users, BadgeAlert, CheckCircle, Building } from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (username: string) => void;
}

interface SavedOperator {
  username: string;
  nik: string;
  role: string;
}

export default function LoginPortal({ onLoginSuccess }: LoginPortalProps) {
  const [username, setUsername] = useState('WAHYU RIYANTO');
  const [password, setPassword] = useState('024260286');
  const [showPassword, setShowPassword] = useState(false);
  const [portalType, setPortalType] = useState('Avian');
  
  // Registration and account listing states
  const [isRegistering, setIsRegistering] = useState(false);
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newOperatorNIK, setNewOperatorNIK] = useState('');
  const [newOperatorRole, setNewOperatorRole] = useState('Engineering');
  const [regSuccess, setRegSuccess] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showHelperPanel, setShowHelperPanel] = useState(false);
  
  const [operators, setOperators] = useState<SavedOperator[]>([
    { username: 'WAHYU RIYANTO', nik: '024260286', role: 'Engineering' },
    { username: 'HARIYANTO', nik: '024260287', role: 'Maintenance Engineer' },
    { username: 'BUDI SANTOSO', nik: '024260288', role: 'Automation Specialist' }
  ]);

  // Load custom registered operators from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('avian_registered_operators');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          // Merge presets and saved ones
          const presets = [
            { username: 'WAHYU RIYANTO', nik: '024260286', role: 'Engineering' },
            { username: 'HARIYANTO', nik: '024260287', role: 'Maintenance Engineer' },
            { username: 'BUDI SANTOSO', nik: '024260288', role: 'Automation Specialist' }
          ];
          // Filter duplicates just in case
          const filteredSaved = parsed.filter(
            (sv: any) => !presets.some(p => p.username.toLowerCase() === sv.username.toLowerCase())
          );
          setOperators([...presets, ...filteredSaved]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const formattedUsername = username.trim().toUpperCase();
    const op = operators.find(o => o.username.toUpperCase() === formattedUsername);
    
    if (!op) {
      setLoginError('Operator tidak terdaftar! Harap daftarkan identitas Anda terlebih dahulu.');
      return;
    }

    if (op.nik !== password) {
      setLoginError('Password / NIK karyawan tidak cocok!');
      return;
    }

    // Checking if role is allowed (engineering, leader, spv, manager, admin)
    const r = op.role.toLowerCase();
    const allowed = 
      r.includes('engineering') || 
      r.includes('engineer') || 
      r.includes('leader') || 
      r.includes('lead') || 
      r.includes('spv') || 
      r.includes('supervisor') || 
      r.includes('manager') || 
      r.includes('admin') ||
      r.includes('specialist') ||
      r.includes('automation');

    if (!allowed) {
      setLoginError(`Akses Ditolak! Peran Anda (${op.role}) dilarang masuk. Hanya personil Engineering, Leader, SPV, Manager, dan Admin yang diizinkan.`);
      return;
    }

    onLoginSuccess(op.username);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOperatorName.trim() || !newOperatorNIK.trim()) return;

    const newOp: SavedOperator = {
      username: newOperatorName.trim().toUpperCase(),
      nik: newOperatorNIK.trim(),
      role: newOperatorRole
    };

    const updated = [...operators, newOp];
    setOperators(updated);
    
    // Save only the newly added non-preset ones to localStorage
    const presetsNames = ['WAHYU RIYANTO', 'HARIYANTO', 'BUDI SANTOSO'];
    const customOnes = updated.filter(op => !presetsNames.includes(op.username));
    localStorage.setItem('avian_registered_operators', JSON.stringify(customOnes));

    // Autofill registered account for instant login
    setUsername(newOp.username);
    setPassword(newOp.nik);
    setNewOperatorName('');
    setNewOperatorNIK('');
    setIsRegistering(false);

    setRegSuccess(`Operator ${newOp.username} berhasil terdaftar! Silakan tekan login.`);
    setTimeout(() => setRegSuccess(''), 4000);
  };

  const handleQuickSelect = (op: SavedOperator) => {
    setUsername(op.username);
    setPassword(op.nik);
  };

  return (
    <div id="avian-login-portal" className="min-h-screen w-full flex flex-col items-center justify-center bg-[#004e32] p-4 text-white font-sans selection:bg-emerald-800">
      
      {/* Centered Avian Brands Logo */}
      <div className="flex flex-col items-center mb-6">
        {/* Custom SVG Duck logo of Avian Brands */}
        <svg className="w-24 h-24 text-white mb-2" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50,15 C40,15 32,22 30,30 C34,28 39,28 42,30 C45,32 48,35 48,39 L48,42 C44,45 38,44 32,41 C30,48 34,55 40,58 C45,60 52,58 58,54 C65,58 72,58 78,54 C72,50 68,45 68,39 C68,26 60,15 50,15 Z" />
          <path d="M22,50 C26,50 30,55 35,55 C40,55 45,51 50,51 C55,51 60,55 65,55 C70,55 74,50 78,50 C80,56 75,64 68,68 C60,72 50,72 40,72 C30,72 20,64 22,50 Z" opacity="0.85" />
          <path d="M12,65 C16,65 22,70 30,70 C38,70 44,66 50,66 C56,66 62,70 70,70 C78,70 84,65 88,65 C85,73 78,80 68,82 C58,84 42,84 32,82 C22,80 15,73 12,65 Z" opacity="0.7" />
        </svg>
        <h1 className="text-5xl font-semibold tracking-normal text-center text-white" style={{ fontFamily: 'Georgia, serif' }}>
          Avian
        </h1>
        <p className="text-[11px] font-bold tracking-[0.35em] text-white/90 uppercase mt-1">
          BRANDS
        </p>
      </div>

      {regSuccess && (
        <div className="w-full max-w-[390px] mb-4 bg-emerald-500/20 border border-emerald-400 text-teal-200 text-xs p-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{regSuccess}</span>
        </div>
      )}

      {loginError && (
        <div className="w-full max-w-[390px] mb-4 bg-rose-500/25 border border-rose-400 text-rose-200 text-xs p-3 rounded-lg flex items-start gap-2.5">
          <BadgeAlert className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" />
          <span>{loginError}</span>
        </div>
      )}

      {/* Main Login Card - Styled perfectly as in the user screenshot */}
      <div className="w-full max-w-[390px] bg-[#82a494] border border-[#9cbdb0] rounded-lg p-5 shadow-xl text-[#032e1c]">
        
        <h2 className="text-[#032e1c] text-sm font-semibold tracking-wide text-center mb-4">
          Avian Portal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Dropdown Selector simulating factory/environment selection */}
          <div className="relative">
            <select
              value={portalType}
              onChange={(e) => setPortalType(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs rounded-md py-2.5 pl-10 pr-10 appearance-none font-semibold border border-slate-300 outline-none focus:ring-1 focus:ring-emerald-700 shadow-sm cursor-pointer"
            >
              <option value="Avian">Avian</option>
              <option value="Avian Factory">Avian Factory</option>
              <option value="Logistics System">Logistics System</option>
            </select>
            <span className="absolute left-3.5 top-3 text-slate-500">
              <Building className="w-4 h-4" />
            </span>
            <span className="absolute right-3 top-3 text-slate-500 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

          {/* Username Input */}
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-white text-slate-850 text-xs rounded-md py-2.5 pl-10 pr-4 shadow-sm border border-slate-300 outline-none focus:ring-1 focus:ring-emerald-700 font-semibold"
            />
            <span className="absolute left-3.5 top-3 text-slate-500">
              <User className="w-4 h-4" />
            </span>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white text-slate-850 text-xs rounded-md py-2.5 pl-10 pr-4 shadow-sm border border-slate-300 outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
            />
            <span className="absolute left-3.5 top-3 text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
          </div>

          {/* Show Password Checkbox */}
          <div className="flex items-center gap-2 text-[#032e1c]">
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-800 accent-[#004e32] focus:ring-emerald-700 focus:outline-none cursor-pointer"
            />
            <label htmlFor="show-password" className="text-xs font-semibold select-none cursor-pointer">
              Show Password
            </label>
          </div>

          {/* Submit Login Button - Arrow element set on absolute right */}
          <button
            type="submit"
            className="relative w-full bg-[#004e32] hover:bg-[#003e27] text-white text-xs font-bold py-3 px-4 rounded-md shadow-sm transition-all active:scale-98 flex items-center justify-center cursor-pointer border border-[#003e27]"
          >
            <span>Login</span>
            <span className="absolute right-4 top-3.5 flex items-center">
              <LogIn className="w-4 h-4" />
            </span>
          </button>
        </form>

      </div>

      {/* Footer Copy */}
      <div className="text-center text-xs text-white/90 font-light mt-4 select-none">
        © 2026 Avian Brands.
      </div>

      {/* Hidden Dev & Verification Tool Drawer */}
      <div className="mt-8 text-center max-w-[390px] w-full">
        <button
          type="button"
          onClick={() => setShowHelperPanel(!showHelperPanel)}
          className="text-[10px] text-emerald-100 hover:text-white underline transition-all opacity-80 hover:opacity-100 cursor-pointer"
        >
          {showHelperPanel ? 'Sembunyikan Panel Simulasi Akun' : 'Sistem Demo: Tampilkan Akun Uji Coba & Generator NIK'}
        </button>

        {showHelperPanel && (
          <div className="mt-3 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-left space-y-4">
            
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xs font-extrabold uppercase text-[#aefcd5] flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5" /> Akun Terdaftar (Pilih Cepat)
              </h3>
              <p className="text-[10px] text-slate-200 leading-relaxed mb-3">
                Ketentuan: Hanya Engineering, Leader, SPV, Manager, dan Admin yang diizinkan masuk ke portal.
              </p>
              
              <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {operators.map((op, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickSelect(op)}
                    className={`text-left text-xs p-2 rounded transition-all flex items-center justify-between border cursor-pointer ${
                      username.toUpperCase() === op.username.toUpperCase()
                        ? 'bg-[#005c3c]/85 border-[#aefcd5] text-white font-bold'
                        : 'bg-black/25 hover:bg-black/35 border-white/5 text-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{op.username}</div>
                      <div className="text-[9px] text-[#aefcd5] font-mono leading-none mt-0.5">{op.role}</div>
                    </div>
                    <span className="text-[10px] font-mono bg-black/25 px-1.5 py-0.5 rounded text-white/80">
                      NIK: {op.nik}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <div>
              <div className="flex border-b border-white/10 mb-2 pb-1 justify-between items-center">
                <span className="text-xs font-extrabold uppercase text-[#aefcd5] flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" /> Tambah Staff Operator
                </span>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[#aefcd5] font-bold uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={newOperatorName}
                    onChange={(e) => setNewOperatorName(e.target.value)}
                    placeholder="Contoh: ALDI MAULANA"
                    className="w-full bg-white text-slate-800 text-xs rounded p-2 outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#aefcd5] font-bold uppercase mb-1">9-Digit NIK</label>
                    <input
                      type="text"
                      required
                      maxLength={9}
                      value={newOperatorNIK}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewOperatorNIK(val);
                      }}
                      placeholder="Contoh: 024260299"
                      className="w-full bg-white text-slate-850 text-xs rounded p-2 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#aefcd5] font-bold uppercase mb-1">Kredensial Jabatan</label>
                    <select
                      value={newOperatorRole}
                      onChange={(e) => setNewOperatorRole(e.target.value)}
                      className="w-full bg-white text-slate-850 text-xs rounded p-2 outline-none font-bold"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Leader Shift">Leader Shift</option>
                      <option value="Supervisor (SPV)">Supervisor (SPV)</option>
                      <option value="Manager">Production Manager</option>
                      <option value="Admin Gateway">Admin System &amp; Logistics</option>
                      <option value="Operator Produksi (Dibatasi)">Operator Produksi (Tanpa Akses)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-505 text-white font-bold text-xs py-2 rounded shadow transition-all cursor-pointer border border-emerald-500"
                >
                  Daftarkan ke Database Staff
                </button>
              </form>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}


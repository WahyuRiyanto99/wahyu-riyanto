/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Wifi, AlertTriangle, RefreshCw, Send, CheckCircle, Terminal } from 'lucide-react';
import { MachineId, FillingMachine } from '../types';

interface IotSimulationPanelProps {
  machines: FillingMachine[];
  onEventSimulated: () => void;
}

export default function IotSimulationPanel({ machines, onEventSimulated }: IotSimulationPanelProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<MachineId>('MF-01');
  const [sensorType, setSensorType] = useState<string>('NOZZLE_CLOG');
  const [severity, setSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('CRITICAL');
  const [customValue, setCustomValue] = useState<string>('Flowrate < 5 L/min (Standard: 45)');
  
  const [isSending, setIsSending] = useState(false);
  const [terminalLog, setTerminalLog] = useState<{timestamp: string; data: string}[]>([
    { timestamp: new Date().toLocaleTimeString(), data: "Awaiting logs..." }
  ]);

  const presetSensors = [
    { code: 'NOZZLE_CLOG', name: 'Nozzle Pengisi Tersumbat (Flowrate Rendah)', defaultVal: 'Flowrate < 5 L/min (Standard: 45)', severity: 'CRITICAL' },
    { code: 'PNEUM_LOW', name: 'Tekanan Udara Rendah (< 3 Bar)', defaultVal: 'Pressure: 2.8 Bar (Standard: 6.0)', severity: 'CRITICAL' },
    { code: 'SEAL_JAM', name: 'Sensor Overload Motor Capping (Sealing Macet)', defaultVal: 'Capping Motor Torsi: 8.5 Nm (Toleransi: 4.0)', severity: 'CRITICAL' },
    { code: 'MAT_EMPTY', name: 'Pasokan Base Cat Kosong (Level Tank Min)', defaultVal: 'Level Tank: 2% (Alarm Min: 10%)', severity: 'CRITICAL' },
    { code: 'E_STOP', name: 'Emergency Stop Ditekan', defaultVal: 'E-Stop Push Button Active (Manual Trigger)', severity: 'CRITICAL' },
    { code: 'FORCE_IDLE', name: 'Signal Shift Handover / Idle Manually', defaultVal: 'Operator Break/Shift Handover', severity: 'INFO' }
  ];

  const handleSensorChange = (code: string) => {
    const selected = presetSensors.find(p => p.code === code);
    if (selected) {
      setSensorType(code);
      setSeverity(selected.severity as any);
      setCustomValue(selected.defaultVal);
    }
  };

  const addLog = (text: string) => {
    setTerminalLog(prev => [{ timestamp: new Date().toLocaleTimeString(), data: text }, ...prev].slice(0, 10));
  };

  const handleSimulate = async (customSeverity?: 'CRITICAL' | 'WARNING' | 'INFO', sensorCodeOverride?: string) => {
    setIsSending(true);
    const targetSensor = presetSensors.find(p => p.code === (sensorCodeOverride || sensorType));
    const sensorName = targetSensor ? targetSensor.name : "Sensor custom";
    let finalSeverity = customSeverity || severity;
    let finalValue = customValue;

    if (sensorCodeOverride === 'REPAIR_OK') {
      finalValue = 'Status: Perbaikan Selesai, Sinyal Normal Terdeteksi';
    }

    const payload = {
      machineId: selectedMachineId,
      sensorCode: sensorCodeOverride || sensorType,
      sensorName: sensorCodeOverride === 'REPAIR_OK' ? 'Selesai Perbaikan (Sensor Ready)' : sensorName,
      value: finalValue,
      severity: finalSeverity
    };

    try {
      addLog(`Sending to /api/sim-iot: JSON Payload -> ${selectedMachineId} [${payload.sensorCode}]`);
      
      const response = await fetch('/api/sim-iot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        addLog(`Gateway ACK: Status machine ${selectedMachineId} updated to ${data.machine.status}`);
        onEventSimulated();
      } else {
        addLog(`Error ACK: ${data.error || 'Unknown issue'}`);
      }
    } catch (err: any) {
      addLog(`Transmission Fatal Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const selectedMachine = machines.find(m => m.id === selectedMachineId);

  return (
    <div id="iot-emulator" className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <Cpu className="h-5 w-5 text-emerald-600" />
          <h2 className="font-bold text-base text-slate-800 tracking-tight">Simulasi IoT Sensor</h2>
        </div>
        <span className="text-[10px] font-bold font-mono px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 flex items-center gap-1.5 uppercase">
          <Wifi className="h-3.5 w-3.5 animate-pulse" /> Link Live
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Pilih mesin filling di bawah untuk mensimulasikan kondisi sensor lapangan. Klik tombol alarm untuk mengirimkan kegagalan ke server.
      </p>

      <div className="mb-3">
        
        {/* Kontrol Hardware */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">1. Target Mesin Filling</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value as MachineId)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] text-slate-800 font-bold"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.id}] {m.name} - ({m.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">2. Jenis Sinyal / Status</label>
            <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {presetSensors.map((sensor) => (
                <button
                  key={sensor.code}
                  type="button"
                  onClick={() => handleSensorChange(sensor.code)}
                  className={`text-left text-xs p-2 rounded-lg transition-all border flex items-center gap-2 cursor-pointer ${
                    sensorType === sensor.code
                      ? 'bg-emerald-50 border-[#00875a] text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${sensor.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                  <div className="truncate">
                    <span className="text-[11px]">{sensor.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">3. Teks Nilai Sensor</label>
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#00875a]/20 focus:border-[#00875a] text-slate-800 font-medium"
              placeholder="Sensor reading..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleSimulate()}
              disabled={isSending}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Gangguan
            </button>
            <button
              onClick={() => handleSimulate('INFO', 'REPAIR_OK')}
              disabled={isSending || (selectedMachine && selectedMachine.status !== 'DOWNTIME')}
              className={`px-3.5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                selectedMachine && selectedMachine.status === 'DOWNTIME'
                  ? 'bg-emerald-50 border-[#00875a] text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
              title="Kirim sinyal IoT pulih ke server untuk mereset mesin"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Pulihkan IoT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

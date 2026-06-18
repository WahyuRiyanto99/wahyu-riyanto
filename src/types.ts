/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MachineId = 'MF-01' | 'MF-02' | 'MF-03' | 'MF-04';

export enum MachineStatus {
  OPERATIONAL = 'OPERATIONAL',
  IDLE = 'IDLE',
  DOWNTIME = 'DOWNTIME'
}

export interface FillingMachine {
  id: MachineId;
  name: string;
  type: string; // e.g. "Cat Tembok Emulsi (1L - 5L)", "Cat Kayu Alkyd (0.9L)", "Pail Besar (20L)", "Tinting Custom"
  status: MachineStatus;
  currentOperator: string;
  speedLitersPerMinute: number;
  totalProductionTodayLitres: number;
  oeeAvailability: number; // %
  oeePerformance: number;  // %
  oeeQuality: number;      // %
}

export interface IoTEvent {
  id: string;
  machineId: MachineId;
  timestamp: string;
  sensorCode: string;
  sensorName: string;
  value: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
}

export interface DowntimeIncident {
  id: string;
  machineId: MachineId;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null; // calculated when ended
  sensorCode: string;
  sensorName: string;
  operatorName: string | null;
  category: 'Mechanical' | 'Electrical' | 'Pneumatics' | 'Setup/Cleaning' | 'Material shortage' | null;
  actionTaken: string | null;
  litersLostEstimate: number;
  isAcknowledged: boolean;
  aiRecommendation: string | null;
}

export interface AIResponse {
  recommendation: string;
  suggestedActionSteps: string[];
  safetyHazards: string[];
  partsNeeded: string[];
}

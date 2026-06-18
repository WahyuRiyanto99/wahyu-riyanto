/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { FillingMachine, MachineStatus, IoTEvent, DowntimeIncident, MachineId } from "./src/types";

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI diagnostics will run in simulated fallback.");
}

const app = express();
app.use(express.json());

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "downtime-data.json");

// Initial baseline filling machines of PT. Avia Avian Brands
const INITIAL_MACHINES: FillingMachine[] = [
  {
    id: "MF-01",
    name: "Mesin Filling 01 (Avian Emulsion - 1L)",
    type: "Cat Tembok Standar (1 Liter)",
    status: MachineStatus.OPERATIONAL,
    currentOperator: "Budi Santoso",
    speedLitersPerMinute: 45,
    totalProductionTodayLitres: 12450,
    oeeAvailability: 92.5,
    oeePerformance: 94.0,
    oeeQuality: 99.1,
  },
  {
    id: "MF-02",
    name: "Mesin Filling 02 (Avian Kayu & Besi - 0.9L)",
    type: "Cat Besi/Kayu Solvent-Based (0.9 Liter)",
    status: MachineStatus.OPERATIONAL,
    currentOperator: "Eko Prasetyo",
    speedLitersPerMinute: 30,
    totalProductionTodayLitres: 8120,
    oeeAvailability: 88.2,
    oeePerformance: 91.5,
    oeeQuality: 98.7,
  },
  {
    id: "MF-03",
    name: "Mesin Filling 03 (Avitex Pail - 20L)",
    type: "Cat Tembok Ekonomis Pail (20 Liter)",
    status: MachineStatus.OPERATIONAL,
    currentOperator: "Dedi Wijaya",
    speedLitersPerMinute: 80,
    totalProductionTodayLitres: 24000,
    oeeAvailability: 94.1,
    oeePerformance: 89.0,
    oeeQuality: 99.4,
  },
  {
    id: "MF-04",
    name: "Mesin Filling 04 (Tinting Machine & Custom Premium)",
    type: "Cat Premium Custom Tinting (Custom Volume)",
    status: MachineStatus.IDLE,
    currentOperator: "Siti Rahma",
    speedLitersPerMinute: 15,
    totalProductionTodayLitres: 1950,
    oeeAvailability: 81.0,
    oeePerformance: 93.2,
    oeeQuality: 99.8,
  }
];

// Seed initial historic incidents (downtimes of last 5 days) for gorgeous graphs
const INITIAL_INCIDENTS: DowntimeIncident[] = [
  {
    id: "INC-1001",
    machineId: "MF-01",
    startTime: new Date(Date.now() - 4 * 24 * 3600 * 1000 - 3 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 4 * 24 * 3600 * 1000 - 2 * 3600 * 1000 - 15 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    sensorCode: "PNEUM_LOW",
    sensorName: "Tekanan Udara Rendah (< 3 Bar)",
    operatorName: "Budi Santoso",
    category: "Pneumatics",
    actionTaken: "Koneksi kompresor utama dikencangkan dan valve pneumatic diganti seal-nya.",
    litersLostEstimate: 2025,
    isAcknowledged: true,
    aiRecommendation: "Analisis Tekanan Udara: Penurunan tekanan mendadak menunjukkan kebocoran mikro di seal karet silinder aktuator penekan katup pengisi. Direkomendasikan penggantian preventif seal karet NBR setiap 6 bulan."
  },
  {
    id: "INC-1002",
    machineId: "MF-02",
    startTime: new Date(Date.now() - 3 * 24 * 3600 * 1000 - 1 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 3600 * 1000 - 30 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    sensorCode: "NOZZLE_CLOG",
    sensorName: "Nozzle Pengisi Tersumbat (Flowrate Rendah)",
    operatorName: "Eko Prasetyo",
    category: "Setup/Cleaning",
    actionTaken: "Pembersihan nozzle menggunakan solvent pencuci cat alkyd dan purging pigmen mengering.",
    litersLostEstimate: 900,
    isAcknowledged: true,
    aiRecommendation: "Penyumbatan Cat Solvent: Terjadi pengeringan cepat pigmen cat alkyd pada bibir nozzle luar saat sirkulasi mati sementara. Rekomendasi: Gunakan auto-flushing pelarut ringan setiap kali mesin idle > 15 menit."
  },
  {
    id: "INC-1003",
    machineId: "MF-03",
    startTime: new Date(Date.now() - 2 * 24 * 3600 * 1000 - 5 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 3600 * 1000 - 3 * 3600 * 1000 - 45 * 60 * 1000).toISOString(),
    durationMinutes: 75,
    sensorCode: "SEAL_JAM",
    sensorName: "Sensor Overload Motor Capping (Sealing Macet)",
    operatorName: "Rudi Hartono",
    category: "Mechanical",
    actionTaken: "Reposisi pengumpan tutup pail (cap hopper) dan kalibrasi sensor torsi motor pemutar.",
    litersLostEstimate: 6000,
    isAcknowledged: true,
    aiRecommendation: "Overload Motor Sealing: Pail plastik berukuran 20 kg memiliki ketebalan bibir bervariasi (+/- 0.5mm). Kontak capping terlalu kencang menyebabkan slip kopling magnetik. Rekomendasi: Kalibrasi tinggi silinder pneumatik 1.2mm lebih tinggi."
  },
  {
    id: "INC-1004",
    machineId: "MF-04",
    startTime: new Date(Date.now() - 1 * 24 * 3600 * 1000 - 6 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 3600 * 1000 - 5 * 3600 * 1000 - 35 * 60 * 1000).toISOString(),
    durationMinutes: 25,
    sensorCode: "MAT_EMPTY",
    sensorName: "Pasokan Base Cat Kosong (Level Tank Min)",
    operatorName: "Siti Rahma",
    category: "Material shortage",
    actionTaken: "Koordinasi dengan divisi mixing untuk transfer base emulsion-tinting, melakukan pengisian tank antara (intermediate hopper).",
    litersLostEstimate: 375,
    isAcknowledged: true,
    aiRecommendation: "Kelangkaan Material: Keterlambatan transfer dari tangki blending utama disebabkan tersumbatnya katup pemompaan 3 inci. Rekomendasi: Terapkan sistem Kanban pra-alarm pada sisa level 15%."
  },
  {
    id: "INC-1005",
    machineId: "MF-01",
    startTime: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 3600 * 1000 - 40 * 60 * 1000).toISOString(),
    durationMinutes: 20,
    sensorCode: "E_STOP",
    sensorName: "Emergency Stop Ditekan",
    operatorName: "Budi Santoso",
    category: "Mechanical",
    actionTaken: "Reset tombol emergency stop setelah memindahkan kaleng terbalik di atas meja sirkulasi konveyor.",
    litersLostEstimate: 900,
    isAcknowledged: true,
    aiRecommendation: "Aktivasi E-Stop: Terjadi benturan fisik antara kaleng miring dengan pembatas guide rail konveyor yang terlalu sempit. Rekomendasi: Sesuaikan lebar guide rail ke 112mm (+2mm kelonggaran dari diameter kaleng)."
  }
];

// Database state
interface Database {
  machines: FillingMachine[];
  incidents: DowntimeIncident[];
}

let db: Database = {
  machines: INITIAL_MACHINES,
  incidents: INITIAL_INCIDENTS
};

// Load database if exists
function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      if (parsed && Array.isArray(parsed.machines) && Array.isArray(parsed.incidents)) {
        db = parsed;
        console.log("Database loaded successfully with", db.incidents.length, "incidents.");
      }
    } else {
      saveDb();
    }
  } catch (error) {
    console.error("Error loading mock database file, using in-memory store instead:", error);
  }
}

// Save database
function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database file:", error);
  }
}

loadDb();

// Endpoints

// 1. Get current machines with state
app.get("/api/machines", (req, res) => {
  res.json(db.machines);
});

// 2. Get historical incidents list
app.get("/api/incidents", (req, res) => {
  // Sort by startTime descending
  const sorted = [...db.incidents].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  res.json(sorted);
});

// 3. Reset database (for demo ease)
app.post("/api/reset-db", (req, res) => {
  db = {
    machines: JSON.parse(JSON.stringify(INITIAL_MACHINES)),
    incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS))
  };
  saveDb();
  res.json({ success: true, message: "Database reset to defaults.", data: db });
});

// 4. Simulate IoT Event from Filling Machine Hardware Sensors
app.post("/api/sim-iot", (req, res) => {
  const { machineId, sensorCode, sensorName, value, severity } = req.body;
  
  if (!machineId || !sensorCode || !sensorName) {
    res.status(400).json({ error: "Missing required fields (machineId, sensorCode, sensorName)" });
    return;
  }

  // Find machine
  const machine = db.machines.find(m => m.id === machineId);
  if (!machine) {
    res.status(404).json({ error: `Machine ${machineId} not found` });
    return;
  }

  // Update machine status based on event severity
  if (severity === "CRITICAL") {
    machine.status = MachineStatus.DOWNTIME;
    
    // Check if there is already an active (unresolved) incident for this machine
    const activeIncident = db.incidents.find(inc => inc.machineId === machineId && inc.endTime === null);
    
    if (!activeIncident) {
      // Create new downtime incident
      const newIncident: DowntimeIncident = {
        id: "INC-" + (Math.floor(Math.random() * 9000) + 10000),
        machineId: machineId as MachineId,
        startTime: new Date().toISOString(),
        endTime: null,
        durationMinutes: null,
        sensorCode,
        sensorName,
        operatorName: machine.currentOperator || "Operator On-Duty",
        category: null, // to be populated by operator
        actionTaken: null,
        litersLostEstimate: 0,
        isAcknowledged: false,
        aiRecommendation: null
      };
      
      db.incidents.push(newIncident);
    }
  } else if (severity === "INFO") {
    // If INFO signal acts as repair indicator
    if (sensorCode === "REPAIR_OK") {
      const activeIncident = db.incidents.find(inc => inc.machineId === machineId && inc.endTime === null);
      if (activeIncident) {
        activeIncident.endTime = new Date().toISOString();
        const start = new Date(activeIncident.startTime).getTime();
        const end = new Date(activeIncident.endTime).getTime();
        activeIncident.durationMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
        activeIncident.litersLostEstimate = activeIncident.durationMinutes * machine.speedLitersPerMinute;
      }
      machine.status = MachineStatus.OPERATIONAL;
    } else {
      machine.status = MachineStatus.IDLE;
    }
  } else {
    machine.status = MachineStatus.IDLE;
  }

  saveDb();
  res.json({ success: true, machine, incidents: db.incidents });
});

// 5. Operator logs manual validation: Acknowledge & Update Incident Action
app.post("/api/operator-action", (req, res) => {
  const { incidentId, operatorName, category, actionTaken, litersLost, resolveMachineState } = req.body;

  const incident = db.incidents.find(inc => inc.id === incidentId);
  if (!incident) {
    res.status(404).json({ error: "Downtime incident not found" });
    return;
  }

  incident.operatorName = operatorName || incident.operatorName;
  incident.category = category || incident.category;
  incident.actionTaken = actionTaken || incident.actionTaken;
  incident.isAcknowledged = true;
  if (litersLost !== undefined) {
    incident.litersLostEstimate = litersLost;
  }

  // If resolving the downtime (completing repair)
  if (resolveMachineState) {
    incident.endTime = new Date().toISOString();
    const start = new Date(incident.startTime).getTime();
    const end = new Date(incident.endTime).getTime();
    incident.durationMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
    
    // Automatically recalculate lost liters if operator kept default (0)
    if (incident.litersLostEstimate === 0) {
      const mach = db.machines.find(m => m.id === incident.machineId);
      if (mach) {
        incident.litersLostEstimate = incident.durationMinutes * mach.speedLitersPerMinute;
      }
    }

    // Return machine to operational status
    const machine = db.machines.find(m => m.id === incident.machineId);
    if (machine) {
      machine.status = MachineStatus.OPERATIONAL;
      // Accumulate total output today (maybe subtract the loss factor)
      machine.totalProductionTodayLitres = Math.max(100, machine.totalProductionTodayLitres - Math.round(incident.litersLostEstimate * 0.1));
    }
  }

  saveDb();
  res.json({ success: true, incident, machines: db.machines });
});

// 6. Gemini AI endpoint: Smart Diagnostics for Operator
app.post("/api/ai/diagnose", async (req, res) => {
  const { incidentId } = req.body;
  const incident = db.incidents.find(inc => inc.id === incidentId);
  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  const machine = db.machines.find(m => m.id === incident.machineId);
  const machineName = machine ? machine.name : incident.machineId;
  const machineType = machine ? machine.type : "Mesin Filling Cat";

  const prompt = `Anda adalah "Asisten AI Ahli Pemeliharaan IoT PT. Avia Avian Brands" di pabrik Sidoarjo.
Mesin yang bermasalah: ${machineName} (${machineType})
Kode Sensor IoT: ${incident.sensorCode}
Keterangan Sensor: ${incident.sensorName}
Laporan Awal Operator: ${incident.actionTaken || "Belum ada tindakan spesifik yang didokumentasikan."}

Tolong berikan rekomendasi diagnostik teknis pintas dan mendalam dengan format JSON untuk ditampilkan kepada operator lapangan di dasbor tablet mereka. Format harus valid JSON dengan kunci (keys) persis seperti di bawah ini, tanpa teks pengantar di luar JSON:
{
  "recommendation": "Penjelasan singkat (1-2 paragraf) tentang masalah ini khas di industri pabrik cat Avian Brands (misal: pengeringan resin, tekanan pneumatik drop, solvent menguap) dan solusi utamanya menggunakan bahasa Indonesia yang ramah, sopan, dan profesional.",
  "suggestedActionSteps": ["Langkah 1...", "Langkah 2...", "Langkah 3..."],
  "safetyHazards": ["Bahaya keselamatan 1 terkait solvent/mekanis...", "Bahaya keselamatan 2..."],
  "partsNeeded": ["Suku cadang / Alat 1...", "Suku cadang / Alat 2..."]
}

Catatan Teknis Industri Cat Avian:
- Cat tembok (Avitex) berbasis air (Water-Based), penyumbatannya biasanya berupa gumpalan akrilik kering.
- Cat kayu/besi (Avian) berbasis minyak (Solvent-Based), berisiko uap flammability tinggi (mudah terbakar), menggunakan tiner sebagai pelarut utama.
- Capping silinder menggunakan aktuator pneumatik yang peka terhadap fluktuasi kompresor pabrik Sidoarjo.`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const responseText = response.text || "{}";
      const cleanedData = JSON.parse(responseText.trim());
      
      // Save AI recommendation in historical incident object for persistent logging
      incident.aiRecommendation = cleanedData.recommendation || "Saran AI berhasil digenerate.";
      saveDb();

      res.json(cleanedData);
    } else {
      // Simulate fallback AI offline response
      const mockAiDiagnostics = getSimulatedAiDiagnosis(incident.sensorCode, incident.machineId, machineType);
      incident.aiRecommendation = mockAiDiagnostics.recommendation;
      saveDb();
      res.json(mockAiDiagnostics);
    }
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    // Provide a neat fallback structure instead of crashing
    const mockAiDiagnostics = getSimulatedAiDiagnosis(incident.sensorCode, incident.machineId, machineType);
    res.json({
      ...mockAiDiagnostics,
      recommendation: `[Koneksi AI Offline - Menampilkan Diagnostik Lokal] ${mockAiDiagnostics.recommendation}`
    });
  }
});

// 7. Gemini AI endpoint: Monthly Executive Maintenance Advice
app.post("/api/ai/monthly-summary", async (req, res) => {
  const fileIncidents = db.incidents;
  
  if (!fileIncidents || fileIncidents.length === 0) {
    res.json({ report: "Tidak ada data downtime historical untuk dianalisis oleh Gemini AI." });
    return;
  }

  // Summarize incidents to save tokens and avoid payload limit
  const incidentSummary = fileIncidents.map(inc => ({
    machineId: inc.machineId,
    duration: inc.durationMinutes || "Sedang berlangsung",
    sensor: inc.sensorName,
    code: inc.sensorCode,
    category: inc.category || "Uncategorized",
    action: inc.actionTaken || "Acknowledge Only",
    litersLost: inc.litersLostEstimate
  }));

  const prompt = `Anda adalah "Kepala Teknik & Pemeliharaan (Maintenance Chief) PT. Avia Avian Brands" di Sidoarjo.
Tinjau data log downtime IoT mengisi cat berikut dari pabrik selama periode ini:
${JSON.stringify(incidentSummary.slice(0, 15), null, 2)}

Buatlah laporan analisis berkala (Audit & Rekomendasi Pemeliharaan Preventif) dalam Bahasa Indonesia.
Sebutkan:
1. Analisis Ringkas Tren Downtime (Mesin mana yang paling bermasalah, jenis sensor apa yang tersering menyala, total kehilangan kapasitas produksi cat).
2. Root Cause Analysis (Analisa akar masalah berdasarkan sifat mekanikal dan kimia cat Avian Brands).
3. Preventive Maintenance Roadmap (Rekomendasi taktis berupa penjadwalan pembersihan nozzle, inspeksi pneumatik kompresor, kalibrasi sensor torsi motor capping).
4. Estimasi ROI (Return on Investment) jika program pemeliharaan preventif berjalan (misal: menekan downtime s/d 80%, menghemat sekian ribu liter produksi).

Buat laporan dengan tata bahasa profesional, penuh wibawa teknik, menggunakan format Markdown lengkap dengan bullet points, tabel ringkas jika diperlukan, tapi langsung ke konten teknis tanpa pengantar basa-basi panjang.`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        }
      });
      res.json({ report: response.text });
    } else {
      res.json({ report: getSimulatedMonthlyReport(fileIncidents) });
    }
  } catch (error: any) {
    console.error("Gemini AI Monthly Summary Error:", error);
    res.json({ report: `[Koneksi AI Offline] Gagal menghubungi Gemini AI. Tampilkan Laporan Analisis Lokal:\n\n${getSimulatedMonthlyReport(fileIncidents)}` });
  }
});

// 8. Statistics API
app.get("/api/statistics", (req, res) => {
  const incidents = db.incidents;
  const completedIncidents = incidents.filter(i => i.endTime !== null);
  
  // Total downtime mins
  const totalDowntimeMinutes = completedIncidents.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
  
  // Total Liters Lost
  const totalLitersLost = incidents.reduce((sum, item) => sum + (item.litersLostEstimate || 0), 0);
  
  // MTTR (Mean Time to Repair) in minutes
  const mttr = completedIncidents.length > 0 
    ? Math.round(totalDowntimeMinutes / completedIncidents.length) 
    : 24; // baseline

  // MTBF (Mean Time Between Failures) approximation in hours
  // Let's approximate based on 5 active days over 4 machines
  const totalActiveTimeHours = 4 * 120; // 4 machines * 5 days * 24 hours
  const mtbf = incidents.length > 0
    ? Math.round((totalActiveTimeHours - (totalDowntimeMinutes / 60)) / incidents.length)
    : 48;

  // Downtime categories distribution
  const categoriesCount = {
    "Mechanical": 0,
    "Electrical": 0,
    "Pneumatics": 0,
    "Setup/Cleaning": 0,
    "Material shortage": 0,
    "Uncategorized": 0
  };

  incidents.forEach(inc => {
    if (inc.category) {
      categoriesCount[inc.category] = (categoriesCount[inc.category] || 0) + 1;
    } else {
      categoriesCount["Uncategorized"]++;
    }
  });

  // Machine breakdown count
  const machineBreakdowns: Record<string, number> = { "MF-01": 0, "MF-02": 0, "MF-03": 0, "MF-04": 0 };
  incidents.forEach(inc => {
    if (machineBreakdowns[inc.machineId] !== undefined) {
      machineBreakdowns[inc.machineId]++;
    }
  });

  res.json({
    totalDowntimeMinutes,
    totalLitersLost,
    mttr,
    mtbf,
    categoriesCount,
    machineBreakdowns
  });
});

// Simulated Offline Fallbacks
function getSimulatedAiDiagnosis(sensorCode: string, machineId: string, machineType: string) {
  switch (sensorCode) {
    case "NOZZLE_CLOG":
      return {
        recommendation: `Penyumbatan Nozzle (Nozzle Clogged) pada ${machineId} (${machineType}) biasanya dipicu oleh pengendapan cat pada ujung lubang piston pengisian (filling orifice). Pada cat solvent Avian, penguapan thinner cepat terjadi saat jeda sirkulasi. Kami menyarankan pembersihan intensif dengan pelarut Thinner A Special Avian dan menguji lajur pneumatic nozzle.`,
        suggestedActionSteps: [
          "Buka penutup guard akrilik nozzle pengisian.",
          "Gunakan botol semprot berisi Thinner Avian untuk melarutkan kerak pigment kering pada bibir piston.",
          "Lakukan manual purge (siram) melalui kontrol panel antarmuka mesin sebanyak 3 kali.",
          "Gunakan pin gauge pembersih nozzle 1.2mm jika celah tersumbat material padat keras.",
          "Pasang kembali safety guard sebelum mereset mesin ke OPERATIONAL."
        ],
        safetyHazards: [
          "Uap solvent organik mudah terbakar (flammable vapor). Gunakan masker respirator.",
          "Bahaya pinch-point (terjepit piston nozzle pneumatic). Pastikan tangan tidak menyentuh piston saat udara terpasang."
        ],
        partsNeeded: [
          "Cairan Pembersih Thinner Avian A Special",
          "Kain saring (lint-free cloth)",
          "Pin gauge pembersih nozzle (1.2mm)",
          "Kunci Pas L Set"
        ]
      };
    case "PNEUM_LOW":
      return {
        recommendation: `Tekanan Angin Pneumatik Rendah (Pneumatic Pressure Low) pada ${machineId}. Aktuator pengangkat dispenser, jarum nozzle, dan penjepit kaleng membutuhkan catu daya kompresor stabil minimal sebesar 5.5 - 6.5 Bar. Penurunan di bawah 4 Bar akan menghentikan sensor sirkuit pengaman regulator udara otomatis pabrik Sidoarjo.`,
        suggestedActionSteps: [
          "Periksa indikator pressure gauge lokal pada filter regulator pelumas (FRL Unit) di belakang mesin.",
          "Dengarkan adanya desisan ('hissing sound') di sepanjang selang pneumatic PU diameter 8mm.",
          "Uji kinerja solenoid valve penyuplai udara pengisian.",
          "Pastikan kompresor utama di area outdoor gedung produksi tidak mengalami overload trip listrik.",
          "Reset regulator ke nilai 6 Bar setelah kebocoran udara diatasi."
        ],
        safetyHazards: [
          "Bahaya hembusan udara tekanan tinggi (dapat melukai mata luar biasa). Amankan kacamata pelindung.",
          "Cedera mekanis tak terduga jika silinder pneumatik tiba-tiba terisi tekanan penuh."
        ],
        partsNeeded: [
          "Fitting Pneumatik Quick-Join 8mm",
          "Selang Polyurethane 8mm Biru",
          "Teflon Seal Tape Tokai",
          "Sabun cair busa (deteksi kebocoran udara)"
        ]
      };
    case "SEAL_JAM":
      return {
        recommendation: `Penyegel Kaleng Macet (Capping/Sealing Motor Overload) adalah kendala gesekan tinggi pada poros pemutar spindle pemutar tutup kaleng atau kemacetan hopper pengumpan tutup Avian Kaleng Besi. Overload torsi terjadi jika sensor proximity mendeteksi kemiringan tutup kaleng melebihi toleransi kritis 1mm.`,
        suggestedActionSteps: [
          "Matikan motor servo capping lalu buka pengaman pelindung mesin.",
          "Inspeksi rel penyalur tutup besi (cap chute) dan singkirkan tutup kaleng penyok yang menyumbat lajur.",
          "Bersihkan sisa lumasan atau cipratan cat yang melekat di chuck magnetik pendorong.",
          "Longgarkan spindel penyetel ketinggian kepala pembatas sebanyak 1 putaran penuh (menambah celah).",
          "Coba sirkulasi manual 5 kaleng kosong untuk verifikasi keselarasan (alignment)."
        ],
        safetyHazards: [
          "Gaya gerak torsi spindle tinggi dapat meremukkan jari. Matikan sirkuit pemutus daya (LOTO - Lockout Tagout).",
          "Tepi tajam kaleng kemasan besi Avian Brands."
        ],
        partsNeeded: [
          "Grease rantai mesin standar manufaktur",
          "Kunci inggris 10 inci",
          "Sensor Proximity Silinder Cadangan (M12)"
        ]
      };
    default:
      return {
        recommendation: `Analisis IoT PT. Avia Avian Brands mengidentifikasi peringatan sensor ${sensorCode} pada mesin ${machineId}. Terjadi ketidaksesuaian parameter operasi standar pabrik cat. Direkomendasikan melakukan kalibrasi sensor, pemeriksaan pasokan utilitas listrik atau tangki base pangkalan cat, serta pengecekan sirkuit pengaman interlock mesin.`,
        suggestedActionSteps: [
          "Lakukan investigasi visual pada bagian mesin yang ditunjukkan oleh alarm IoT.",
          "Akses panel listrik utama mesin untuk melihat apakah terjadi trip pada circuit breaker (MCB).",
          "Konsultasikan skema pengawatan (wiring diagram) mesin pada folder maintenance Avian Sidoarjo.",
          "Gunakan manual override untuk menguji pergerakan aktuator secara perlahan."
        ],
        safetyHazards: [
          "Tegangan listrik AC 380V pada panel belakang (bahaya kesetrum). Pastikan pengerjaan dilakukan oleh teknisi bersertifikat.",
          "Prosedur Lock-Out Tag-Out (LOTO) wajib dipatuhi."
        ],
        partsNeeded: [
          "Multimeter Digital",
          "Set obeng berinsulasi listrik 1000V",
          "Contact Cleaner Spray"
        ]
      };
  }
}

function getSimulatedMonthlyReport(incidents: DowntimeIncident[]) {
  return `### LAPORAN ANALISIS BULANAN DOWNTIME MESIN FILLING
**Divisi Pemeliharaan PT. Avia Avian Brands - Pabrik Sidoarjo**

#### 1. Ringkasan Kinerja & Kehilangan Kapasitas
Berdasarkan pencatatan sensor IoT real-time, pabrik mencatat total insiden downtime sebanyak **${incidents.length} kejadian** yang terdeteksi secara otomatis.
*   **Total Downtime:** ${incidents.reduce((s, i) => s + (i.durationMinutes || 0), 0)} Menit.
*   **Estimasi Kehilangan Produksi:** ~${incidents.reduce((s, i) => s + (i.litersLostEstimate || 0), 0).toLocaleString("id-ID")} Liter cat (Setara dengan potensi omset yang tertunda di depo logistik).
*   **Mesin Paling Kritis:** \`MF-03 (Avitex Pail - 20L)\` menyumbang durasi downtime terlama disebabkan penyesuaian mekanikal silinder pneumatik capping pail berukuran besar yang membutuhkan presisi tinggi.

#### 2. Root Cause Analysis (Analisa Akar Masalah Baku)
*   **Kerak Cat Kering (Downtime Setup/Cleaning):** 
    Karakteristik cat minyak solvent-based Avian Besi ditiup udara sekitar nozzle mempercepat penguapan resin alkyd. Hal ini menyumbat nosel pengisian saat jeda pergantian shift kerja tanpa prosedur pencucian nozzle (nozzle cleaning run).
*   **Penurunan Tekanan Udara Kompresor (Downtime Pneumatics):**
    Fluktuasi suplai udara sirkulasi pneumatic dialami saat departemen blending cat tembok mengaktifkan pompa diafragma ganda secara bersamaan. Filter Regulator udara pada mesin seringkali tidak dilengkapi drainase kondensat air sisa kompresor.

#### 3. Preventive Maintenance Roadmap (Rencana Tindakan Cegah)
*   **Harian:** Wajibkan operator melakukan *automatic flushing cycle* menggunakan thinner pembersih khusus di akhir shift kerja (10 Menit).
*   **Mingguan:** Inspeksi kelembaban tangki filter udara regulator mesin filling, buang kondensat air di filter mesin \`MF-01\` s/d \`MF-04\`.
*   **Bulanan:** Kalibrasi kedalaman sensor proximity chuck capping pendorong kemasan cat Avian Besi & Kayu agar slip gesek tidak merusak gigi kopling mesin.

#### 4. Proyeksi ROI Pemeliharaan Preventif (Preventive Program)
Dengan meluncurkan SOP pembersihan sela nozzle sirkulasi mingguan dan perbaikan seal pneumatik terjadwal, efisiensi **Availability OEE** mesin diproyeksikan melonjak dari **88% ke 95%**. Hal ini akan mencegah kerugian kapasitas cat hingga **4,500 Liter per bulan**, setara penghematan biaya tak langsung senilai **Rp 135.000.000 / bulan** bagi PT. Avia Avian Brands Sidoarjo.`;
}

// Serve static build in production, otherwise Vite handles development assets.
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT MODE...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION MODE serving /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server successfully running on http://localhost:${PORT}`);
  });
}

initServer();

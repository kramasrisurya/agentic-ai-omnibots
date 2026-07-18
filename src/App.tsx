/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  SearchCode,
  ClipboardList,
  Globe,
  BarChart3,
  Bot,
  Package,
  Settings as SettingsIcon,
  Terminal,
  AlertOctagon,
} from "lucide-react";
import TopBar from "./components/TopBar";
import DashboardPage from "./pages/DashboardPage";
import InspectionPage from "./pages/InspectionPage";
import AuditPage from "./pages/AuditPage";
import SupplierPage from "./pages/SupplierPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AIAgentsPage from "./pages/AIAgentsPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import LogsPage from "./pages/LogsPage";
import {
  PARTS_CATALOG,
  SUPPLIERS_DB,
  DEFECT_TYPES,
  Part,
  Supplier,
  LedgerEntry,
  AgentLogEntry,
  InventoryStats,
} from "./types";

export default function App() {
  // --- PAGE ROUTING STATE ---
  const [activePage, setActivePage] = useState<string>("dashboard");

  // --- CORE SYSTEM STATES ---
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [activeParts, setActiveParts] = useState<any[]>([]);
  const [injectionGrade, setInjectionGrade] = useState<'random' | 'good' | 'average' | 'poor'>('random');

  // Self-check testing suite state
  const [isSelfChecking, setIsSelfChecking] = useState<boolean>(false);
  const [selfCheckStep, setSelfCheckStep] = useState<number>(0);
  const [selfCheckReport, setSelfCheckReport] = useState<{
    criticalPassed: boolean;
    lowPassed: boolean;
    criticalDetails?: string;
    lowDetails?: string;
  } | null>(null);

  // Counters for unique ID generation
  const instanceSeqRef = useRef<number>(1000);
  const autoSpawnCooldownRef = useRef<number>(1500); // initial delay before first spawn

  // --- WEBSOCKET CLIENT CONFIGURATION ---
  const wsRef = useRef<WebSocket | null>(null);

  // Send message over WebSocket safely
  const sendWsMessage = (type: string, payload?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log(`[WS-CLIENT] Connecting to backend server: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("[WS-CLIENT] WebSocket channel successfully synchronized with central Factory OS.");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`[WS-CLIENT] Broadcast received: ${message.type}`, message.payload);

        switch (message.type) {
          case "STATE_SYNC":
            setIsAutoMode(message.payload.isAutoMode);
            setInjectionGrade(message.payload.injectionGrade);
            setLedger(message.payload.ledger);
            setAgentLogs(message.payload.agentLogs);
            setIsSelfChecking(message.payload.isSelfChecking);
            break;

          case "STATE_UPDATED":
            if (message.payload.isAutoMode !== undefined) setIsAutoMode(message.payload.isAutoMode);
            if (message.payload.injectionGrade !== undefined) setInjectionGrade(message.payload.injectionGrade);
            if (message.payload.isSelfChecking !== undefined) setIsSelfChecking(message.payload.isSelfChecking);
            break;

          case "AGENT_LOG_GENERATED":
            setAgentLogs((prev) => {
              if (prev.some((log) => log.id === message.payload.id)) return prev;
              return [...prev, message.payload];
            });
            break;

          case "LEDGER_UPDATED":
            setLedger((prev) => {
              if (prev.some((entry) => entry.id === message.payload.id)) return prev;
              return [message.payload, ...prev];
            });
            break;

          case "PART_SPAWNED_MANUAL":
            spawnPart(message.payload.part, message.payload.grade);
            break;

          case "INSPECTION_RESOLVED":
            const res = message.payload;
            setActiveParts((prevParts) =>
              prevParts.map((p) => {
                if (p.id === res.partInstanceId) {
                  return {
                    ...p,
                    outcome: res.outcome,
                    defectType: res.defectType,
                    chosenSupplierId: res.chosenSupplierId,
                    chosenSupplierName: res.chosenSupplierName,
                    orderCost: res.orderCost,
                    deliveryDays: res.deliveryDays,
                    tradeOffIgnored: res.tradeOffIgnored,
                    holdTicks: 25, // allow transition out immediately
                  };
                }
                return p;
              })
            );

            // If we are currently executing self-checks, update validation feedback
            if (isSelfChecking) {
              if (res.criticality === "critical" || res.part_id === "SNS-07") {
                const isCorrect = res.chosenSupplierId === "S1-A";
                setSelfCheckReport((prev) => ({
                  ...prev!,
                  criticalPassed: isCorrect,
                  criticalDetails: `Part SNS-07 (Critical): Expected premium next-day carrier (S1-A, $450). Selected: ${res.chosenSupplierName || "None"} ($${res.orderCost || 0}). Verification: ${isCorrect ? "PASS" : "FAIL"}.`,
                }));
              } else if (res.criticality === "low-priority" || res.part_id === "PNL-01") {
                const isCorrect = res.chosenSupplierId === "S6-B";
                setSelfCheckReport((prev) => ({
                  ...prev!,
                  lowPassed: isCorrect,
                  lowDetails: `Part PNL-01 (Low-priority): Expected economy ground bulk (S6-B, $45). Selected: ${res.chosenSupplierName || "None"} ($${res.orderCost || 0}). Verification: ${isCorrect ? "PASS" : "FAIL"}.`,
                }));
              }
            }
            break;

          case "START_SELF_CHECK_TESTS":
            runSelfCheckTests();
            break;

          case "HALT_BELT":
            setActiveParts([]);
            break;
        }
      } catch (err: any) {
        console.error("[WS-CLIENT] Failed to decode server payload:", err.message);
      }
    };

    socket.onclose = () => {
      console.warn("[WS-CLIENT] WebSocket link lost. Re-establishing standby...");
    };

    return () => {
      socket.close();
    };
  }, [isSelfChecking]);

  // --- DYNAMIC INVENTORY STATISTICS ---
  const computeStats = (): InventoryStats => {
    const totalProcessed = ledger.length;
    const passed = ledger.filter((l) => l.outcome === "passed").length;
    const rejected = ledger.filter((l) => l.outcome === "rejected").length;
    const ordersPlaced = ledger.filter((l) => l.outcome === "rejected" && l.chosenSupplierId).length;
    const totalSpend = ledger.reduce((sum, item) => sum + (item.orderCost || 0), 0);

    return {
      totalProcessed,
      passed,
      rejected,
      ordersPlaced,
      totalSpend,
    };
  };

  const stats = computeStats();

  // --- PART SPAWNER ---
  const spawnPart = (forcedPart?: Part, forcedGrade?: 'good' | 'average' | 'poor'): string => {
    const seqId = `TX-${instanceSeqRef.current++}`;
    const partTemplate = forcedPart || PARTS_CATALOG[Math.floor(Math.random() * PARTS_CATALOG.length)];

    let grade: 'good' | 'average' | 'poor';
    if (forcedGrade) {
      grade = forcedGrade;
    } else if (forcedPart) {
      grade = injectionGrade === 'random' ? (partTemplate.typical_grade || 'good') : injectionGrade;
    } else {
      if (injectionGrade !== 'random') {
        grade = injectionGrade;
      } else {
        const r = Math.random();
        grade = r < 0.55 ? 'good' : r < 0.75 ? 'average' : 'poor';
      }
    }

    const newVisualPart = {
      id: seqId,
      part: partTemplate,
      progress: 0,
      status: "approaching" as const,
      outcome: "pending" as const,
      holdTicks: 0,
      grade,
    };

    setActiveParts((prev) => [...prev, newVisualPart]);
    return seqId;
  };

  // --- TICK LOOP (40ms) ---
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setActiveParts((prevParts) => {
        const updatedParts: any[] = [];

        for (let i = 0; i < prevParts.length; i++) {
          const part = prevParts[i];

          let aheadPartOnBelt: any = null;
          for (let j = i - 1; j >= 0; j--) {
            const p = updatedParts[j];
            if (p.status === "approaching" || p.status === "inspecting" || p.status === "passed_moving") {
              aheadPartOnBelt = p;
              break;
            }
          }

          const MIN_GAP = 18;
          let maxAllowedProgress = 100;
          if (aheadPartOnBelt) {
            const aheadPos = aheadPartOnBelt.status === "inspecting" ? 50 : aheadPartOnBelt.progress;
            maxAllowedProgress = aheadPos - MIN_GAP;
          }

          const isScanningStationOccupied = updatedParts.some((p) => p.status === "inspecting");

          if (part.status === "approaching") {
            let nextProgress = part.progress + 0.6;

            if (nextProgress > maxAllowedProgress) {
              nextProgress = Math.max(part.progress, maxAllowedProgress);
            }

            if (nextProgress >= 50) {
              if (!isScanningStationOccupied) {
                // PART ARRIVED AT SCANNING WINDOW: Signal backend RAG agents
                sendWsMessage("REACHED_SCANNER", {
                  partId: part.part.part_id,
                  partInstanceId: part.id,
                  grade: part.grade,
                });

                updatedParts.push({
                  ...part,
                  progress: 50,
                  status: "inspecting" as const,
                });
              } else {
                updatedParts.push({
                  ...part,
                  progress: Math.min(part.progress, 49.9),
                  status: "approaching" as const,
                });
              }
            } else {
              updatedParts.push({
                ...part,
                progress: nextProgress,
                status: "approaching" as const,
              });
            }
          } else if (part.status === "inspecting") {
            const updatedPart = { ...part };
            
            // Wait stationary until backend updates the outcome
            if (updatedPart.outcome !== "pending") {
              updatedParts.push({
                ...updatedPart,
                status: updatedPart.outcome === "passed" ? ("passed_moving" as const) : ("rejecting" as const),
                progress: updatedPart.outcome === "passed" ? 50.6 : 50,
              });
            } else {
              updatedParts.push(updatedPart);
            }
          } else if (part.status === "passed_moving") {
            let nextProgress = part.progress + 0.6;
            if (nextProgress > maxAllowedProgress) {
              nextProgress = Math.max(part.progress, maxAllowedProgress);
            }
            if (nextProgress >= 100) {
              updatedParts.push({ ...part, progress: 100, status: "done" as const });
            } else {
              updatedParts.push({ ...part, progress: nextProgress });
            }
          } else if (part.status === "rejecting") {
            const ticks = (part as any).rejectTicks ?? 0;
            if (ticks >= 38) {
              updatedParts.push({ ...part, status: "done" as const });
            } else {
              updatedParts.push({ ...part, rejectTicks: ticks + 1 });
            }
          } else {
            updatedParts.push(part);
          }
        }

        return updatedParts.filter((p) => p.status !== "done");
      });

      // Spawn new items in autopilot mode
      if (isAutoMode && !isSelfChecking) {
        autoSpawnCooldownRef.current -= 40;
        if (autoSpawnCooldownRef.current <= 0) {
          spawnPart();
          autoSpawnCooldownRef.current = Math.floor(Math.random() * 1500) + 2500;
        }
      }
    }, 40);

    return () => clearInterval(tickInterval);
  }, [isAutoMode, isSelfChecking, ledger]);

  // --- MANUAL COMPONENT INTERACTION ---
  const handleManualResolve = (
    partInstanceId: string,
    outcome: "passed" | "rejected",
    defectType?: string
  ) => {
    const partToResolve = activeParts.find((p) => p.id === partInstanceId);
    if (partToResolve) {
      sendWsMessage("MANUAL_RESOLVE", {
        partId: partToResolve.part.part_id,
        partInstanceId,
        outcome,
        grade: partToResolve.grade,
        defectType,
      });
    }
  };

  // Run self check suite coordinated via the backend
  const runSelfCheckTests = () => {
    setSelfCheckStep(1);
    setSelfCheckReport({
      criticalPassed: false,
      lowPassed: false,
    });

    const criticalPart = PARTS_CATALOG.find((p) => p.part_id === "SNS-07")!;
    const p1Id = spawnPart(criticalPart, "poor");

    const checkP1AtScanner = setInterval(() => {
      setActiveParts((prev) => {
        const item = prev.find((p) => p.id === p1Id);
        if (item && item.status === "inspecting" && item.outcome !== "pending") {
          clearInterval(checkP1AtScanner);

          setTimeout(() => {
            setSelfCheckStep(2);
            const lowPart = PARTS_CATALOG.find((p) => p.part_id === "PNL-01")!;
            const p2Id = spawnPart(lowPart, "poor");

            const checkP2AtScanner = setInterval(() => {
              setActiveParts((prev2) => {
                const item2 = prev2.find((p) => p.id === p2Id);
                if (item2 && item2.status === "inspecting" && item2.outcome !== "pending") {
                  clearInterval(checkP2AtScanner);

                  setTimeout(() => {
                    setSelfCheckStep(0);
                    sendWsMessage("SELF_CHECK_FINISHED");
                  }, 2500);
                }
                return prev2;
              });
            }, 100);
          }, 2500);
        }
        return prev;
      });
    }, 100);
  };

  const runSelfCheck = () => {
    sendWsMessage("RUN_SELF_CHECK");
  };

  const handleEmergencyStop = () => {
    sendWsMessage("EMERGENCY_STOP");
  };

  const handleSpawnManual = () => {
    if (!isAutoMode && activeParts.length === 0) {
      sendWsMessage("SPAWN_PART_MANUAL", {
        partId: PARTS_CATALOG[Math.floor(Math.random() * PARTS_CATALOG.length)].part_id,
        grade: "good",
      });
    }
  };

  const handleInjectPart = (part: Part) => {
    sendWsMessage("SPAWN_PART_MANUAL", {
      partId: part.part_id,
      grade: injectionGrade === 'random' ? 'poor' : injectionGrade,
    });
  };

  const handlePartDropped = (partId: string) => {
    const part = PARTS_CATALOG.find((p) => p.part_id === partId);
    if (part) {
      handleInjectPart(part);
    }
  };

  const handleAddLedgerEntry = (entry: LedgerEntry) => {
    // Treat as manual placement
    sendWsMessage("MANUAL_RESOLVE", {
      partId: entry.part_id,
      partInstanceId: entry.id,
      outcome: "rejected",
      grade: "poor",
      defectType: entry.defectType,
    });
  };

  // --- SIDEBAR NAVIGATION LINKS ---
  const navLinks = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inspection", label: "Inspection Workspace", icon: SearchCode },
    { id: "audit", label: "Audit Center", icon: ClipboardList },
    { id: "suppliers", label: "Supplier Intelligence", icon: Globe },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "agents", label: "AI Agents", icon: Bot },
    { id: "orders", label: "Orders", icon: Package },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "logs", label: "System Logs", icon: Terminal },
  ];

  return (
    <div className="bg-[#fcfdfd] text-slate-800 min-h-screen font-sans flex overflow-hidden relative" id="main-root">
      {/* High-Tech CRT Scanlines and Noise Grain Overlay Filters */}
      <div className="absolute inset-0 pointer-events-none noise-overlay opacity-[0.015] z-50" />
      <div className="absolute inset-0 pointer-events-none scanlines opacity-[0.01] z-50" />

      {/* Vibrant Fluid Mesh Gradient Animated Backdrop Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#a3e635]/30 blur-[110px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#22d3ee]/30 blur-[120px] pointer-events-none animate-blob-2" />
      <div className="absolute top-[20%] right-[10%] w-[550px] h-[550px] rounded-full bg-[#f0abfc]/25 blur-[110px] pointer-events-none animate-blob-3" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#fde047]/25 blur-[100px] pointer-events-none animate-blob-4" />
      <div className="absolute top-[50%] left-[35%] w-[450px] h-[450px] rounded-full bg-[#c084fc]/25 blur-[100px] pointer-events-none animate-blob-5" />

      {/* Floating Glass Capsule Left Sidebar */}
      <aside className="w-64 glass-panel m-4 mr-0 rounded-3xl flex flex-col shrink-0 relative z-25 shadow-2xl border-white/60" id="factory-sidebar">
        {/* Brand Banner */}
        <div className="p-5 border-b border-white/45 flex items-center gap-2.5">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a3e635] via-[#22d3ee] to-[#f0abfc] flex items-center justify-center text-indigo-950 font-black text-sm tracking-tight shadow-[0_4px_12px_rgba(31,38,135,0.1)]"
          >
            F
          </motion.div>
          <div>
            <h2 className="font-display font-black text-indigo-950 text-xs uppercase tracking-widest leading-none">
              Factory OS
            </h2>
            <span className="text-[9px] font-mono text-indigo-900/60 uppercase tracking-widest mt-1 block font-bold">
              Siemens SCADA v4.2
            </span>
          </div>
        </div>

        {/* Links Navigation Matrix */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto scroll-container">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            const Icon = link.icon;
            return (
              <motion.button
                key={link.id}
                whileHover={{ scale: 1.04, x: 4, backgroundColor: "rgba(255,255,255,0.5)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActivePage(link.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/80 border border-white/80 text-indigo-950 font-black shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                    : "hover:bg-white/30 border border-transparent text-slate-700 hover:text-indigo-950"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-950" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* E-Stop alert warning block */}
        <div className="p-4 border-t border-white/45 bg-white/20 text-center space-y-1 rounded-b-3xl">
          <span className="text-[8px] font-mono font-bold text-rose-700 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest block w-fit mx-auto animate-pulse">
            Operational Lane A
          </span>
          <span className="text-[10px] font-mono text-slate-700 block tracking-wider font-semibold">
            Digital Twin Synchronized
          </span>
        </div>
      </aside>

      {/* Main Operating Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Global persistent header */}
        <TopBar
          isAutoMode={isAutoMode}
          onToggleMode={() => {
            if (!isSelfChecking) {
              setIsAutoMode(!isAutoMode);
            }
          }}
          onSpawnManual={handleSpawnManual}
          canSpawnManual={activeParts.length === 0}
          isSelfChecking={isSelfChecking}
          onEmergencyStop={handleEmergencyStop}
          notificationCount={ledger.filter((l) => l.outcome === "rejected").length}
        />

        {/* Active Page Viewport with Smooth Motion Transitions */}
        <main className="flex-1 p-6 overflow-y-auto scroll-container bg-transparent relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="h-full"
            >
              {activePage === "dashboard" && (
                <DashboardPage
                  stats={stats}
                  ledger={ledger}
                  isAutoMode={isAutoMode}
                  onNavigate={(page) => setActivePage(page)}
                  isSelfChecking={isSelfChecking}
                />
              )}

              {activePage === "inspection" && (
                <InspectionPage
                  activeParts={activeParts}
                  isAutoMode={isAutoMode}
                  isSelfChecking={isSelfChecking}
                  onManualResolve={handleManualResolve}
                  onInjectPart={handleInjectPart}
                  onPartDropped={handlePartDropped}
                  ledger={ledger}
                  injectionGrade={injectionGrade}
                  setInjectionGrade={setInjectionGrade}
                />
              )}

              {activePage === "audit" && <AuditPage ledger={ledger} />}

              {activePage === "suppliers" && <SupplierPage />}

              {activePage === "analytics" && <AnalyticsPage stats={stats} ledger={ledger} />}

              {activePage === "agents" && <AIAgentsPage logs={agentLogs} />}

              {activePage === "orders" && (
                <OrdersPage ledger={ledger} onAddLedgerEntry={handleAddLedgerEntry} />
              )}

              {activePage === "settings" && (
                <SettingsPage
                  isAutoMode={isAutoMode}
                  onToggleMode={() => {
                    if (!isSelfChecking) {
                      setIsAutoMode(!isAutoMode);
                    }
                  }}
                  isSelfChecking={isSelfChecking}
                />
              )}

              {activePage === "logs" && (
                <LogsPage logs={agentLogs} onClearLogs={() => setAgentLogs([])} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

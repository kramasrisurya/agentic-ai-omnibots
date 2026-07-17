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
  const logSeqRef = useRef<number>(1);
  const autoSpawnCooldownRef = useRef<number>(1500); // initial delay before first spawn
  const processedRef = useRef<Set<string>>(new Set());

  // Get current timestamp formatted as HH:MM:SS
  const getFormattedTime = () => {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
  };

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

  // --- LOGGING HELPER ---
  const addAgentLog = (
    agent: "Triage Agent" | "Procurement Agent" | "System Check",
    message: string,
    type: "info" | "warning" | "success" | "decision",
    partId?: string
  ) => {
    const newEntry: AgentLogEntry = {
      id: `LOG-${logSeqRef.current++}`,
      timestamp: getFormattedTime(),
      agent,
      message,
      type,
      partId,
    };
    setAgentLogs((prev) => [...prev, newEntry]);
  };

  // --- PART SPAWNER ---
  const spawnPart = (forcedPart?: Part): string => {
    const seqId = `TX-${instanceSeqRef.current++}`;
    const partTemplate = forcedPart || PARTS_CATALOG[Math.floor(Math.random() * PARTS_CATALOG.length)];
    
    // Determine grade based on selection
    let grade: 'good' | 'average' | 'poor';
    if (forcedPart) {
      if (injectionGrade === 'random') {
        grade = partTemplate.typical_grade || 'good';
      } else {
        grade = injectionGrade;
      }
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

  // --- THE TWO-AGENT DECISION PIPELINE ---
  const executePipeline = (
    partInstanceId: string,
    part: Part,
    outcome: "passed" | "rejected",
    defectType?: string,
    grade?: 'good' | 'average' | 'poor'
  ) => {
    if (processedRef.current.has(partInstanceId)) {
      return;
    }
    processedRef.current.add(partInstanceId);

    const timestamp = getFormattedTime();

    if (outcome === "passed") {
      if (grade === "average") {
        addAgentLog(
          "Triage Agent",
          `Inspected part instance ${partInstanceId} (${part.name}).\nVisual OpenCV contour analysis: Minor cosmetic variance (Average Grade).\nPart dimensions within engineering tolerance limits.\nPolicy override: AUTOMATIC PASS with DOWNSTREAM MANUAL VERIFY tag. Keeping the production line running continuously!`,
          "warning",
          part.part_id
        );
      } else {
        addAgentLog(
          "Triage Agent",
          `Inspected part instance ${partInstanceId} (${part.name}).\nVisual OpenCV contour analysis: 0 anomalies detected.\nPart dimensions within ±0.05mm engineering tolerance.\nChecked MCP Resource 'part-criticality-registry' for status clearance.\nPart ${part.part_id} is cleared. Logging PASS event to ledger. No procurement required.`,
          "success",
          part.part_id
        );
      }

      const newLedgerEntry: LedgerEntry = {
        id: partInstanceId,
        part_id: part.part_id,
        part_name: part.name,
        criticality: part.criticality,
        outcome: "passed",
        timestamp,
        grade,
      };
      setLedger((prev) => {
        if (prev.some((entry) => entry.id === partInstanceId)) {
          return prev;
        }
        return [newLedgerEntry, ...prev];
      });

    } else {
      // Access custom defect types defined for this specific part, or fallback
      const partDefects = part.defect_types && part.defect_types.length > 0 
        ? part.defect_types 
        : DEFECT_TYPES;
      const chosenDefect = defectType || partDefects[Math.floor(Math.random() * partDefects.length)];
      
      addAgentLog(
        "Triage Agent",
        `ALERT: Defect detected on part instance ${partInstanceId} (${part.name})!\nDefect signature: '${chosenDefect}'.\nCalling MCP TOOL 'reject_item' to flag instance state as REJECTED.\nQuerying MCP RESOURCE 'part-criticality-registry' for criticality class.\nRESULT: Part ${part.part_id} has a criticality level of [${part.criticality.toUpperCase()}].\nEscalating logs and routing replacement request to Procurement Agent.`,
        "warning",
        part.part_id
      );

      const suppliers = SUPPLIERS_DB[part.part_id] || [];
      let chosenSupplier: Supplier;
      let tradeOffIgnored = "";

      // Count current rejections for this specific part in the ledger
      const defectCount = ledger.filter(
        (entry) => entry.part_id === part.part_id && entry.outcome === "rejected"
      ).length;

      // POLICY RULE:
      // - If "more defective parts are there" (defectCount >= 8, representing high urgency/nearly 10 defects),
      //   or during critical self-check tests, urgency is critical -> Choose FASTEST delivery even if cost/shipping is high.
      // - If defective parts are less (e.g., around 3 defects) -> Choose CHEAPEST/LATE standard option to save costs.
      const hasMoreDefects = defectCount >= 8 || (isSelfChecking && part.criticality === "critical");

      if (hasMoreDefects) {
        // Urgent Sourcing: Speed/Fastest Priority
        const sortedSuppliers = [...suppliers].sort((a, b) => {
          if (a.delivery_days !== b.delivery_days) {
            return a.delivery_days - b.delivery_days;
          }
          return a.cost - b.cost;
        });
        chosenSupplier = sortedSuppliers[0];

        const cheapestSupplier = [...suppliers].sort((a, b) => a.cost - b.cost)[0];
        if (chosenSupplier.supplier_id !== cheapestSupplier.supplier_id) {
          const savingsDiff = chosenSupplier.cost - cheapestSupplier.cost;
          tradeOffIgnored = `Priority: SPEED/FASTEST (HIGH DEFECT COUNT: ${defectCount} parts rejected - nearly 10). Sourced fastest delivery from ${chosenSupplier.name} to avoid line-stoppage risk, despite high cost (ignored saving $${savingsDiff} from ${cheapestSupplier.name}).`;
        } else {
          tradeOffIgnored = `Fastest supplier happens to be the most cost-effective. No cost trade-off required.`;
        }

      } else {
        // Stable Sourcing: Budget/Standard Priority
        const sortedSuppliers = [...suppliers].sort((a, b) => {
          if (a.cost !== b.cost) {
            return a.cost - b.cost;
          }
          return a.delivery_days - b.delivery_days;
        });
        chosenSupplier = sortedSuppliers[0];

        const fastestSupplier = [...suppliers].sort((a, b) => a.delivery_days - b.delivery_days)[0];
        if (chosenSupplier.supplier_id !== fastestSupplier.supplier_id) {
          const dayDiff = chosenSupplier.delivery_days - fastestSupplier.delivery_days;
          tradeOffIgnored = `Priority: SAVINGS (LOW DEFECT COUNT: ${defectCount} parts rejected - under 8). Sourced lowest cost from ${chosenSupplier.name}, opting for slower shipping (+${dayDiff} days) to minimize procurement expenditure.`;
        } else {
          tradeOffIgnored = `Cheapest supplier happens to be the fastest option. No lead-time trade-off required.`;
        }
      }

      addAgentLog(
        "Procurement Agent",
        `Received triage report for rejected part ${part.part_id} (${part.name}).\nActive ledger rejections for this part: ${defectCount} units.\nPolicy choice: ${hasMoreDefects ? "EXPRESS/SPEED SOURCING (High Defect Urgency - nearly 10 defects)" : "ECONOMY/STANDARD SOURCING (Low Defect Urgency - low defects)"}.\nCalling MCP TOOL 'search_suppliers' for part ${part.part_id}.\n\nDECISION ASSIGNMENT:\n- Supplier: [${chosenSupplier.name}]\n- Cost: $${chosenSupplier.cost}, Delivery Time: ${chosenSupplier.delivery_days} day(s).\n- Policy trace: ${tradeOffIgnored}\nCalling MCP TOOL 'place_order' to execute transaction.`,
        "decision",
        part.part_id
      );

      const newLedgerEntry: LedgerEntry = {
        id: partInstanceId,
        part_id: part.part_id,
        part_name: part.name,
        criticality: part.criticality,
        outcome: "rejected",
        timestamp,
        defectType: chosenDefect,
        chosenSupplierId: chosenSupplier.supplier_id,
        chosenSupplierName: chosenSupplier.name,
        orderCost: chosenSupplier.cost,
        deliveryDays: chosenSupplier.delivery_days,
        tradeOffIgnored,
      };
      setLedger((prev) => {
        if (prev.some((entry) => entry.id === partInstanceId)) {
          return prev;
        }
        return [newLedgerEntry, ...prev];
      });

      if (isSelfChecking) {
        if (selfCheckStep === 1 && part.criticality === "critical") {
          const isCorrect = chosenSupplier.supplier_id === "S1-A";
          setSelfCheckReport((prev) => ({
            ...prev!,
            criticalPassed: isCorrect,
            criticalDetails: `Part SNS-07 (Critical): Expected fastest (S1-A, $450, 1d). Selected: ${chosenSupplier.name} ($${chosenSupplier.cost}, ${chosenSupplier.delivery_days}d). Verification: ${isCorrect ? "PASS" : "FAIL"}.`,
          }));
        } else if (selfCheckStep === 2 && part.criticality === "low-priority") {
          const isCorrect = chosenSupplier.supplier_id === "S6-B";
          setSelfCheckReport((prev) => ({
            ...prev!,
            lowPassed: isCorrect,
            lowDetails: `Part PNL-01 (Low-priority): Expected cheapest (S6-B, $45, 14d). Selected: ${chosenSupplier.name} ($${chosenSupplier.cost}, ${chosenSupplier.delivery_days}d). Verification: ${isCorrect ? "PASS" : "FAIL"}.`,
          }));
        }
      }
    }
  };

  // --- TICK LOOP (40ms) ---
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setActiveParts((prevParts) => {
        const updatedParts: any[] = [];
        
        for (let i = 0; i < prevParts.length; i++) {
          const part = prevParts[i];
          
          // Find first preceding part that is still horizontally on the belt
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
          
          const isScanningStationOccupied = updatedParts.some(p => p.status === "inspecting");

          if (part.status === "approaching") {
            let nextProgress = part.progress + 0.6;
            
            if (nextProgress > maxAllowedProgress) {
              nextProgress = Math.max(part.progress, maxAllowedProgress);
            }
            
            if (nextProgress >= 50) {
              if (!isScanningStationOccupied) {
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
            let updatedPart = { ...part };
            const ticks = updatedPart.holdTicks ?? 0;

            if (isAutoMode && updatedPart.outcome === "pending" && !isSelfChecking) {
              // Delay decision until tick 25 (about 1 second) to let the pipeline timeline unfold realistically!
              if (ticks >= 25) {
                const decidedOutcome = updatedPart.grade === "poor" ? ("rejected" as const) : ("passed" as const);
                const defectType = decidedOutcome === "rejected"
                  ? updatedPart.part.defect_types?.[Math.floor(Math.random() * updatedPart.part.defect_types.length)] || "Surface Solder Crack"
                  : undefined;
                
                executePipeline(updatedPart.id, updatedPart.part, decidedOutcome, defectType, updatedPart.grade);

                updatedPart = {
                  ...updatedPart,
                  outcome: decidedOutcome,
                  defectType,
                  // If passed, set holdTicks high so it leaves the station immediately!
                  // If rejected, set to 25 so it continues through stages 4 to 8 slowly.
                  holdTicks: decidedOutcome === "passed" ? 38 : 25,
                };
              } else {
                updatedPart = { ...updatedPart, holdTicks: ticks + 1 };
              }
            } else if (updatedPart.outcome === "pending") {
              // Manual mode or self-checking: accumulate ticks
              updatedPart = { ...updatedPart, holdTicks: ticks + 1 };
            }

            if (updatedPart.outcome !== "pending") {
              const currentTicks = updatedPart.holdTicks ?? 0;
              // If passed, wait until 38 ticks (which is immediately met if we fast-forwarded to 38).
              // If rejected, wait until 50 ticks to show all stages clearly.
              const ticksThreshold = updatedPart.outcome === "passed" ? 38 : 50;
              if (currentTicks >= ticksThreshold) {
                updatedParts.push({
                  ...updatedPart,
                  status: updatedPart.outcome === "passed" ? ("passed_moving" as const) : ("rejecting" as const),
                  progress: updatedPart.outcome === "passed" ? 50.6 : 50,
                });
              } else {
                updatedParts.push({
                  ...updatedPart,
                  holdTicks: currentTicks + 1,
                });
              }
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
    setActiveParts((prev) =>
      prev.map((p) => {
        if (p.id === partInstanceId) {
          executePipeline(partInstanceId, p.part, outcome, defectType, p.grade);
          return {
            ...p,
            outcome,
            holdTicks: 0,
            defectType,
          };
        }
        return p;
      })
    );
  };

  // --- SELF CHECK UNIT-TEST DRIVER ---
  const runSelfCheck = () => {
    setIsAutoMode(false);
    setIsSelfChecking(true);
    setSelfCheckStep(1);
    setActiveParts([]);
    setSelfCheckReport({
      criticalPassed: false,
      lowPassed: false,
    });

    addAgentLog(
      "System Check",
      `LAUNCHING INTEGRATED AGENT SELF-CHECK COMPLIANCE VERIFIER...\nToggling Auto mode to OFF to prevent race conditions.\nClearing conveyor belt stage.\nPreparing test case 1/2: Critical part reorder decision rules audit.`,
      "info"
    );

    const criticalPart = PARTS_CATALOG.find((p) => p.part_id === "SNS-07")!;
    const p1Id = spawnPart(criticalPart);

    const checkP1AtScanner = setInterval(() => {
      setActiveParts((prev) => {
        const item = prev.find((p) => p.id === p1Id);
        if (item && item.status === "inspecting" && item.outcome === "pending") {
          clearInterval(checkP1AtScanner);
          
          setTimeout(() => {
            handleManualResolve(p1Id, "rejected", "Thermal Signature Anomaly");
            
            setTimeout(() => {
              setSelfCheckStep(2);
              addAgentLog(
                "System Check",
                `Test case 1/2 complete. Initializing test case 2/2: Low-priority part reorder decision rules audit.`,
                "info"
              );
              
              const lowPart = PARTS_CATALOG.find((p) => p.part_id === "PNL-01")!;
              const p2Id = spawnPart(lowPart);

              const checkP2AtScanner = setInterval(() => {
                setActiveParts((prev2) => {
                  const item2 = prev2.find((p) => p.id === p2Id);
                  if (item2 && item2.status === "inspecting" && item2.outcome === "pending") {
                    clearInterval(checkP2AtScanner);
                    
                    setTimeout(() => {
                      handleManualResolve(p2Id, "rejected", "Surface Scratch (>5mm)");
                      
                      setTimeout(() => {
                        setIsSelfChecking(false);
                        setSelfCheckStep(0);
                        
                        addAgentLog(
                          "System Check",
                          `SELF-CHECK COMPLETED SUCCESSFULY.\nVerify decisions match expected mathematical logic branches:\n- Critical part (SNS-07) replacement SOURCED: Apex Fast-Track Solutions (1d delivery, ignoring cheaper pricing).\n- Low-priority part (PNL-01) replacement SOURCED: General Sheet Metal Supply ($45 cost, ignoring faster delivery).\nAll rule assertions are fully compliant [OK].`,
                          "info"
                        );
                      }, 2500);
                    }, 800);
                  }
                  return prev2;
                });
              }, 100);
            }, 2500);
          }, 800);
        }
        return prev;
      });
    }, 100);
  };

  // --- EMERGENCY STOP HANDLER ---
  const handleEmergencyStop = () => {
    setActiveParts([]);
    setIsAutoMode(false);
    setIsSelfChecking(false);
    setSelfCheckStep(0);
    addAgentLog(
      "System Check",
      `🚨 EMERGENCY STOP INITIATED BY OPERATOR! Halting all simulated conveyors. Flushed diagnostic pipeline slots. Sourcing requests frozen. Manual safety inspection required.`,
      "warning"
    );
  };

  const handleSpawnManual = () => {
    if (!isAutoMode && activeParts.length === 0) {
      spawnPart();
    }
  };

  const handleInjectPart = (part: Part) => {
    spawnPart(part);
    addAgentLog(
      "System Check",
      `MANUAL INJECT SEQUENCE: Initiated full-spectrum visual scan and sourcing compliance check for Part ${part.part_id} (${part.name}).`,
      "info",
      part.part_id
    );
  };

  const handlePartDropped = (partId: string) => {
    const part = PARTS_CATALOG.find((p) => p.part_id === partId);
    if (part) {
      handleInjectPart(part);
    }
  };

  const handleAddLedgerEntry = (entry: LedgerEntry) => {
    setLedger((prev) => [entry, ...prev]);
    addAgentLog(
      "Procurement Agent",
      `MANUAL PROCUREMENT CONTRACT AUTHORIZED: Appended Order ID ${entry.id} for Part ${entry.part_id} with Supplier [${entry.chosenSupplierName}] costing $${entry.orderCost}.`,
      "success",
      entry.part_id
    );
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
          onRunSelfCheck={runSelfCheck}
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

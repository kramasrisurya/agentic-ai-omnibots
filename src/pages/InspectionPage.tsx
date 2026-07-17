/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

import {
  Layers,
  Cpu,
  CheckCircle2,
  Database,
  Camera,
  Eye,
} from "lucide-react";
import { Part, PARTS_CATALOG, SUPPLIERS_DB, LedgerEntry } from "../types";
import ConveyorBelt, { VisualPart } from "../components/ConveyorBelt";
import PartsCatalogList from "../components/PartsCatalogList";
import Part3DModel from "../components/Part3DModel";

interface InspectionPageProps {
  activeParts: VisualPart[];
  isAutoMode: boolean;
  isSelfChecking: boolean;
  onManualResolve: (
    partInstanceId: string,
    outcome: "passed" | "rejected",
    defectType?: string
  ) => void;
  onInjectPart: (part: Part) => void;
  onPartDropped: (partId: string) => void;
  ledger: LedgerEntry[];
  injectionGrade: "random" | "good" | "average" | "poor";
  setInjectionGrade: (grade: "random" | "good" | "average" | "poor") => void;
}

export default function InspectionPage({
  activeParts,
  isAutoMode,
  isSelfChecking,
  onManualResolve,
  onInjectPart,
  onPartDropped,
  ledger,
  injectionGrade,
  setInjectionGrade,
}: InspectionPageProps) {
  // Find currently inspecting part, if any
  const inspectingItem = activeParts.find((p) => p.status === "inspecting");
  
  // Simulated scanner heatmap grid
  const [heatmapGrid, setHeatmapGrid] = useState<number[]>([]);
  useEffect(() => {
    // Generate a random 8x8 matrix of values between 0.1 and 0.9
    const grid = Array.from({ length: 64 }, () => Math.random());
    setHeatmapGrid(grid);
  }, [inspectingItem?.id]);

  // Keep track of active pipeline stage based on the state of the inspecting item
  const getActiveStage = () => {
    if (!inspectingItem) return 0;
    
    const ticks = inspectingItem.holdTicks ?? 0;
    
    if (inspectingItem.outcome === "pending") {
      // Progress through analysis stages slowly while pending (total 25 ticks)
      if (ticks < 8) return 1;   // Vision Agent Dispatch
      if (ticks < 16) return 2;  // Optical Image Analysis
      return 3;                  // Defect Classification
    } else if (inspectingItem.outcome === "passed") {
      // Passes clear immediately
      return 4; // Pipeline Logged & Cleared
    } else if (inspectingItem.outcome === "rejected") {
      // Rejects progress slowly through procurement stages
      if (ticks < 30) return 4;  // Triage Agent Evaluation
      if (ticks < 35) return 5;  // MCP Sourcing Query
      if (ticks < 40) return 6;  // Procurement Agent Sourcing
      if (ticks < 45) return 7;  // Automated Order Placed
      return 8;                  // Pipeline Logged & Cleared
    }
    
    return 1;
  };

  const currentStage = getActiveStage();

  // Helper styles for timeline stages
  const getStageStyle = (stageNum: number) => {
    if (!inspectingItem) {
      return { border: "border-slate-300 text-slate-400", text: "text-slate-400", dot: "bg-slate-300" };
    }
    if (currentStage >= stageNum) {
      // Completed or active
      const isCurrent = currentStage === stageNum;
      const glow = isCurrent ? "animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "";
      
      const isDefectCase = inspectingItem.outcome === "rejected";
      const colorClass = isCurrent 
        ? "border-cyan-500 text-cyan-700 bg-cyan-500/10 font-black" 
        : isDefectCase && stageNum >= 4 
        ? "border-rose-400 text-rose-700 bg-rose-500/10 font-bold" 
        : "border-emerald-400 text-emerald-700 bg-emerald-500/10 font-bold";

      const dotColor = isCurrent
        ? "bg-cyan-500"
        : isDefectCase && stageNum >= 4
        ? "bg-rose-500"
        : "bg-emerald-500";

      return { border: `${colorClass} ${glow}`, text: isCurrent ? "text-cyan-700 font-black" : "text-slate-800", dot: dotColor };
    }
    return { border: "border-slate-200 text-slate-400 bg-white/20", text: "text-slate-400", dot: "bg-slate-200" };
  };

  // Find corresponding ledger entry for more details
  const currentLedgerEntry = inspectingItem ? ledger.find((l) => l.id === inspectingItem.id) : null;
  const isDefectFound = inspectingItem && inspectingItem.outcome === "rejected";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      id="inspection-workspace"
    >
      {/* Conveyor Belt Panel - Top Span */}
      <motion.div 
        variants={itemVariants}
        className="glass-panel rounded-3xl p-5 relative overflow-hidden shadow-lg border-white/60 transition-all duration-300"
      >
        {isDefectFound && (
          <div className="absolute inset-0 border-4 border-rose-500/40 rounded-3xl shadow-[inset_0_0_100px_rgba(244,63,94,0.15)] pointer-events-none z-30 animate-pulse" style={{ animationDuration: "0.8s" }} />
        )}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500/35 via-cyan-400/10 to-transparent" />
        <div className="flex items-center justify-between mb-4 border-b border-white/45 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-cyan-600 animate-pulse" />
            <span className="text-xs font-display font-black text-indigo-950 uppercase tracking-widest">
              [Live Conveyor Transport &amp; Inspection Belt]
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-slate-600 hidden md:inline font-bold">
              Drag parts from the library below and drop them onto the active conveyor belt lane!
            </span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-cyan-700 font-black">LANE SPEED: 1.2M/S</span>
            </div>
          </div>
        </div>

        {/* The Conveyor Stage Component */}
        <div className="h-[680px]">
          <ConveyorBelt
            activeParts={activeParts}
            isAutoMode={isAutoMode}
            onManualResolve={onManualResolve}
            isSelfChecking={isSelfChecking}
            onPartDropped={onPartDropped}
          />
        </div>
      </motion.div>

      {/* Two-Column Mid Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parts Library */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 glass-panel rounded-3xl p-5 flex flex-col h-[520px] border-white/60 shadow-lg"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/45 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-950">
                Parts Sourcing Catalog
              </h3>
            </div>
            <span className="text-[9px] font-mono text-slate-600 font-bold">
              CLICK OR DRAG PARTS
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto scroll-container min-h-0">
            <PartsCatalogList
              onInjectPart={onInjectPart}
              isAutoMode={isAutoMode}
              isSelfChecking={isSelfChecking}
              injectionGrade={injectionGrade}
              setInjectionGrade={setInjectionGrade}
            />
          </div>
        </motion.div>

        {/* Center: AI Vision Scanner & Heatmap */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 glass-panel rounded-3xl p-5 flex flex-col h-[520px] border-white/60 shadow-lg"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/45 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-950">
                AI Vision Real-time Scanner
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-600 font-bold">
              OPTICAL CONTUOR SENSOR
            </span>
          </div>

          {/* Inspection Details */}
          {inspectingItem ? (
            <div className="flex-1 flex flex-col justify-between space-y-4 min-h-0">
              {/* Image & Bounding Box Overlays */}
              <div className="bg-white/50 border border-white/75 rounded-2xl p-3 flex flex-col items-center justify-center relative aspect-square max-h-[220px] mx-auto w-full overflow-hidden shrink-0 shadow-inner">
                {/* Simulated contour scan matrix */}
                <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-0.5 opacity-20 pointer-events-none">
                  {heatmapGrid.map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor:
                          inspectingItem.outcome === "rejected"
                            ? `rgba(239, 68, 68, ${val * 0.75})`
                            : inspectingItem.outcome === "passed"
                            ? `rgba(16, 185, 129, ${val * 0.75})`
                            : `rgba(6, 182, 212, ${val * 0.75})`,
                      }}
                      className="w-full h-full rounded-[1px] transition-all"
                    />
                  ))}
                </div>

                <div className="w-28 h-28 relative flex items-center justify-center">
                  <Part3DModel partId={inspectingItem.part.part_id} status={inspectingItem.status} />
                  {/* Glowing Laser Scanner Line */}
                  <div className={`absolute left-0 right-0 h-[2px] ${
                    inspectingItem.outcome === "rejected"
                      ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                      : inspectingItem.outcome === "passed"
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      : "bg-cyan-500 shadow-[0_0_8px_#22d3ee] animate-[bounce_1.5s_infinite_ease-in-out]"
                  }`} />
                </div>

                <span className="text-[8px] font-mono text-slate-600 absolute bottom-1 right-2 font-bold">
                  CONF_GAUGE: PROD_S9
                </span>
              </div>

              {/* Scan Readings */}
              <div className="space-y-2 bg-white/50 border border-white/80 rounded-2xl p-3.5 font-mono text-[11px] flex-1 overflow-y-auto scroll-container shadow-inner">
                <div className="flex justify-between border-b border-white/45 pb-1">
                  <span className="text-slate-600 font-bold">INSTANCE ID:</span>
                  <span className="text-indigo-950 font-black">{inspectingItem.id}</span>
                </div>
                <div className="flex justify-between border-b border-white/45 pb-1">
                  <span className="text-slate-600 font-bold">PART NAME:</span>
                  <span className="text-indigo-950 truncate max-w-[150px] font-black">{inspectingItem.part.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/45 pb-1">
                  <span className="text-slate-600 font-bold">CRITICALITY:</span>
                  <span className={`text-[10px] font-black uppercase ${
                    inspectingItem.part.criticality === "critical"
                      ? "text-rose-600"
                      : inspectingItem.part.criticality === "standard"
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}>{inspectingItem.part.criticality}</span>
                </div>
                <div className="flex justify-between border-b border-white/45 pb-1">
                  <span className="text-slate-600 font-bold">PHYSICAL GRADE:</span>
                  <span className={`text-[10px] font-black uppercase ${
                    inspectingItem.grade === "good"
                      ? "text-emerald-600"
                      : inspectingItem.grade === "average"
                      ? "text-amber-600"
                      : "text-rose-600 animate-pulse"
                  }`}>{inspectingItem.grade || "GOOD"}</span>
                </div>
                <div className="flex justify-between border-b border-white/45 pb-1">
                  <span className="text-slate-600 font-bold">CLASSIFIER CONF:</span>
                  <span className="text-cyan-700 font-black">
                    {inspectingItem.outcome === "pending" ? "ANALYZING..." : "99.4% CLEAR"}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600 font-bold">PREDICTION:</span>
                  <span className={`font-black uppercase tracking-wider text-[12px] ${
                    inspectingItem.outcome === "passed"
                      ? "text-emerald-600 animate-pulse"
                      : inspectingItem.outcome === "rejected"
                      ? "text-rose-600 animate-pulse"
                      : "text-cyan-600"
                  }`}>
                    {inspectingItem.outcome}
                  </span>
                </div>

                {inspectingItem.outcome === "rejected" && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl mt-2 shadow-sm">
                    <span className="text-[9px] text-rose-600 font-black block">DETECTED ANOMALY:</span>
                    <span className="text-[11px] text-rose-700 font-bold">{inspectingItem.defectType || "Surface Solder Crack"}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/45 rounded-2xl bg-white/20 shadow-inner">
              <Eye className="w-10 h-10 text-slate-400 mb-2 animate-pulse" />
              <p className="text-xs text-slate-600 uppercase tracking-wider font-mono font-bold">
                Awaiting part inspection...
              </p>
              <p className="text-[10px] text-slate-700 font-semibold font-sans mt-1.5 max-w-[200px]">
                Click "Spawn Part" above or drag a part from the library onto the conveyor to start the visual pipeline.
              </p>
            </div>
          )}
        </motion.div>

        {/* Right Side: Agent Review Timeline */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 glass-panel rounded-3xl p-5 flex flex-col h-[520px] border-white/60 shadow-lg"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/45 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600 animate-pulse" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-950">
                AI Multi-Agent Review Timeline
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-600 font-bold">
              PIPELINE TELEMETRY
            </span>
          </div>

          <div className="flex-1 overflow-y-auto scroll-container pr-1 pl-1 space-y-4">
            {inspectingItem ? (
              <div className="relative pl-6 space-y-5 py-2">
                {/* Vertical Line Connector */}
                <div className="absolute left-2.5 top-2.5 bottom-2.5 w-[1.5px] bg-slate-300" />

                {/* Stage 1: Vision Agent */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(1).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(1).text}`}>
                      Vision Agent Dispatch
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Launches full optical camera sensor stream and grabs image coordinates under strobe backlight.
                    </p>
                  </div>
                </div>

                {/* Stage 2: Image Analysis */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(2).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(2).text}`}>
                      Optical Image Analysis
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Executes spatial filters, pixel comparison, and compares dimensions to engineering CAD tolerance.
                    </p>
                  </div>
                </div>

                {/* Stage 3: Defect Detection */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(3).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(3).text}`}>
                      Defect Classification
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Runs neural classification models on potential anomalies to tag scratch, solder crack, or voids.
                    </p>
                  </div>
                </div>

                {/* Stage 4: Triage Agent */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(4).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(4).text}`}>
                      Triage Agent Evaluation
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Consults <code>part-criticality-registry</code> resource. Assesses part classification weight.
                    </p>
                  </div>
                </div>

                {/* Stage 5: MCP Tool Calls */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(5).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(5).text}`}>
                      MCP Sourcing Query
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Fires <code>search_suppliers</code> tool if defects are confirmed, pulling real-time vendor rates.
                    </p>
                  </div>
                </div>

                {/* Stage 6: Sourcing Decision */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(6).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(6).text}`}>
                      Procurement Agent Sourcing
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Applies algorithmic trade-offs (Fastest Delivery vs Cheapest Cost) strictly matching criticality mandates.
                    </p>
                  </div>
                </div>

                {/* Stage 7: Purchase Order Dispatch */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(7).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(7).text}`}>
                      Automated Order Placed
                    </p>
                    <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                      Triggers <code>place_order</code> with the selected vendor. Logs contract costs to the ledger system.
                    </p>
                  </div>
                </div>

                {/* Stage 8: Pipeline Completion */}
                <div className="relative">
                  <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border border-white ${getStageStyle(8).dot}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-mono uppercase font-black tracking-wider ${getStageStyle(8).text}`}>
                      Pipeline Logged &amp; Cleared
                    </p>
                    {currentLedgerEntry ? (
                      <div className="p-3 bg-white/60 border border-white/80 rounded-2xl mt-2 text-[10px] font-mono space-y-1 shadow-sm">
                        <div className="text-emerald-700 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> LEDGER EVENT COMPLETED
                        </div>
                        {currentLedgerEntry.outcome === "rejected" ? (
                          <>
                            <div className="text-slate-800 font-bold">Supplier: <strong className="text-indigo-950">{currentLedgerEntry.chosenSupplierName}</strong></div>
                            <div className="text-slate-800 font-bold">Cost: <strong className="text-indigo-950">${currentLedgerEntry.orderCost}</strong> | ETA: <strong className="text-indigo-950">{currentLedgerEntry.deliveryDays} Days</strong></div>
                          </>
                        ) : (
                          <div className="text-slate-600 font-semibold">Standard Clearance: Part cleared inspection, no reorders needed.</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-relaxed">
                        Compiling decisions, writing log structures, and clearing conveyor zone indexes.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/20 border border-dashed border-white/45 rounded-2xl shadow-inner">
                <Cpu className="w-8 h-8 text-slate-400 mb-1.5" />
                <p className="text-[11px] text-slate-500 font-mono font-bold">
                  ACTIVE DESTRUCTIVE ANALYSIS IDLE
                </p>
                <p className="text-[10px] text-slate-700 font-semibold font-sans mt-1 max-w-[180px]">
                  Flow triggers dynamically as parts roll into the visual inspection zone.
                </p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

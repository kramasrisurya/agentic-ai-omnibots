/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { motion } from "motion/react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Package,
  TrendingUp,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
  Server,
  Zap,
} from "lucide-react";
import { LedgerEntry, InventoryStats } from "../types";

interface DashboardPageProps {
  stats: InventoryStats;
  ledger: LedgerEntry[];
  isAutoMode: boolean;
  onNavigate: (page: string) => void;
  isSelfChecking: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 } 
  },
};

export default function DashboardPage({
  stats,
  ledger,
  isAutoMode,
  onNavigate,
  isSelfChecking,
}: DashboardPageProps) {
  // Calculate dynamic metrics
  const passRate = stats.totalProcessed > 0 ? (stats.passed / stats.totalProcessed) * 100 : 100;
  const rejectRate = stats.totalProcessed > 0 ? (stats.rejected / stats.totalProcessed) * 100 : 0;
  
  // Recent alerts (only rejected ones)
  const recentAlerts = ledger.filter((l) => l.outcome === "rejected").slice(0, 4);
  const recentActivities = ledger.slice(0, 5);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6" 
      id="dashboard-page"
    >
      {/* Top Welcome Title Grid */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#a3e635]/15 via-[#22d3ee]/15 to-[#f0abfc]/15 backdrop-blur-3xl border border-white/65 rounded-3xl relative overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.06)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-xs font-mono tracking-widest text-indigo-950 uppercase font-black">
              [INDUSTRY 4.0 ACTIVE OPERATIONAL HUB]
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-indigo-950 tracking-tight">
            Factory OS Executive Command
          </h1>
          <p className="text-xs text-indigo-900/80 mt-1 max-w-xl font-medium">
            Real-time visual quality assurance, multi-agent dispatch protocols, and automated sourcing analytics.
          </p>
        </div>
        
        {/* Quick Nav Shortcut Buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0 z-10">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("inspection")}
            className="px-4 py-2 rounded-xl bg-indigo-950 text-white hover:bg-indigo-900 text-xs font-black font-mono tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            Launch Inspector <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,0.85)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("suppliers")}
            className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-indigo-950 border border-white text-xs font-black font-mono tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            Sourcing Database
          </motion.button>
        </div>
      </motion.div>

      {/* Real-time High-level Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Processed */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.45)" }}
          className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group border-white/60 shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-indigo-950/70 uppercase font-black">
                [TOTAL PROCESSED]
              </span>
              <h3 className="text-3xl font-mono font-black text-indigo-950 mt-1.5">
                {stats.totalProcessed}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-cyan-600 shrink-0">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-900/80 mt-4 flex items-center gap-1 font-mono font-semibold">
            <span className="text-cyan-600 animate-pulse font-bold">⚡ LIVE</span> throughput telemetry
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-cyan-500" />
        </motion.div>

        {/* Passed Q.C. */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.45)" }}
          className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group border-white/60 shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-indigo-950/70 uppercase font-black">
                [Q.C. CLEARANCE]
              </span>
              <h3 className="text-3xl font-mono font-black text-emerald-600 mt-1.5">
                {stats.passed}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-900/80 mt-4 flex items-center gap-1 font-mono font-semibold">
            <span className="text-emerald-600 font-black">{passRate.toFixed(1)}%</span> pass rate
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500" />
        </motion.div>

        {/* Rejected Q.C. */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.45)" }}
          className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group border-white/60 shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-indigo-950/70 uppercase font-black">
                [DEFECT FAULTS]
              </span>
              <h3 className="text-3xl font-mono font-black text-rose-600 mt-1.5">
                {stats.rejected}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-900/80 mt-4 flex items-center gap-1 font-mono font-semibold">
            <span className="text-rose-600 font-black">{rejectRate.toFixed(1)}%</span> defect rate
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-rose-500" />
        </motion.div>

        {/* Orders Placed */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.45)" }}
          className="glass-panel rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group border-white/60 shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-indigo-950/70 uppercase font-black">
                [AGENT ORDERS]
              </span>
              <h3 className="text-3xl font-mono font-black text-amber-600 mt-1.5">
                {stats.ordersPlaced}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-amber-600 shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-900/80 mt-4 flex items-center gap-1 font-mono font-semibold">
            <span className="text-amber-600 font-bold">Auto-Reorders</span> dispatched
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500" />
        </motion.div>

        {/* Total Spend */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.45)" }}
          className="glass-panel rounded-3xl p-5 col-span-2 lg:col-span-1 flex flex-col justify-between relative overflow-hidden group border-white/60 shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-indigo-950/70 uppercase font-black">
                [REORDER CAPITAL]
              </span>
              <h3 className="text-3xl font-mono font-black text-indigo-600 mt-1.5">
                ${stats.totalSpend.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-[10px] text-indigo-900/80 mt-4 flex items-center gap-1 font-mono font-semibold">
            <span className="text-indigo-600 font-bold">Optimize</span> cost-control logic
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-500" />
        </motion.div>
      </div>

      {/* Main Grid: Health & Alerts on Left, Activities & System on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Health Index & Alert Monitor */}
        <div className="lg:col-span-7 space-y-6">
          {/* Factory Health Indicators */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel rounded-3xl p-5 relative border-white/60 shadow-lg"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/45 mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-widest">
                  [Factory Efficiency &amp; Health Index]
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-black bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl shadow-sm">
                SYSTEM NOMINAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Health Ring Meter */}
              <div className="bg-white/45 border border-white/60 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[170px] shadow-sm">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer circle track */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="#f0abfc" strokeWidth="12" fill="transparent" />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="46"
                      stroke="#a3e635"
                      strokeWidth="12"
                      strokeDasharray="289"
                      initial={{ strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 289 - (289 * passRate) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      fill="transparent"
                      className="filter drop-shadow-[0_2px_8px_rgba(163,230,53,0.4)]"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-mono font-black text-indigo-950">
                      {passRate.toFixed(0)}%
                    </span>
                    <span className="text-[8px] font-mono uppercase text-indigo-900 tracking-widest font-black">
                      [Yield Rate]
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-700 mt-3 text-center tracking-wide font-semibold">
                  Production Line Sourcing Quality Ratio
                </span>
              </div>

              {/* Secondary Status Meters */}
              <div className="space-y-4 justify-center flex flex-col">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-700 mb-1.5 font-bold">
                    <span>VISION MODEL CONFIDENCE</span>
                    <span className="text-cyan-600 font-bold">98.2%</span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-white/80 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "98.2%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-cyan-500 rounded-full shadow-[0_1px_4px_rgba(6,182,212,0.3)]" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-700 mb-1.5 font-bold">
                    <span>MC COMPLIANCE RATE</span>
                    <span className="text-emerald-600 font-bold">100%</span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-white/80 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full shadow-[0_1px_4px_rgba(16,185,129,0.3)]" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-700 mb-1.5 font-bold">
                    <span>PIPELINE DISPATCH SPEED</span>
                    <span className="text-indigo-600 font-bold">
                      {isSelfChecking ? "SPEED-UP" : "NORMAL"}
                    </span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-white/80 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isSelfChecking ? "100%" : "45%" }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-indigo-500 rounded-full shadow-[0_1px_4px_rgba(99,102,241,0.3)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active Defects & Alerts Tracker */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel rounded-3xl p-5 border-white/60 shadow-lg"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/45 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-widest">
                  [Live Factory Quality Alerts]
                </h3>
              </div>
              <span className="text-[10px] font-mono text-rose-700 font-black bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {recentAlerts.length} REJECT EVENTS
              </span>
            </div>

            {recentAlerts.length === 0 ? (
              <div className="p-8 bg-white/40 rounded-2xl border border-dashed border-slate-300 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-700 uppercase tracking-widest font-mono font-bold">
                  No active quality anomalies reported
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 bg-white/60 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 flex items-center justify-between gap-3 text-xs transition-all shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-rose-700">{alert.id}</span>
                        <span className="text-[9px] font-mono bg-rose-500/15 text-rose-700 border border-rose-500/25 px-1.5 py-0.2 rounded-full font-black uppercase tracking-wide">
                          {alert.part_id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{alert.timestamp}</span>
                      </div>
                      <p className="text-slate-800 font-sans mt-1.5 truncate text-[11px] font-medium">
                        Defect: <strong className="text-rose-700 font-extrabold">{alert.defectType}</strong> — {alert.part_name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-amber-700 block font-bold">
                        Sourced replacement
                      </span>
                      <span className="text-[9px] font-mono text-slate-800 block truncate max-w-[125px] font-black">
                        {alert.chosenSupplierName || "Pending order..."}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Side: System Logs & Quick Feed Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Stats Summary Panel */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel rounded-3xl p-5 border-white/60 shadow-lg"
          >
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-widest pb-3.5 border-b border-white/45 mb-4">
              [Operation Metrics Summary]
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 bg-white/50 border border-white/70 rounded-2xl shadow-sm">
                <span className="text-slate-700 font-semibold">Simulated Autopilot:</span>
                <span className={isAutoMode ? "text-cyan-600 font-black" : "text-amber-600 font-black"}>
                  {isAutoMode ? "ENGAGED" : "PAUSED"}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white/50 border border-white/70 rounded-2xl shadow-sm">
                <span className="text-slate-700 font-semibold">Total Capital Cost:</span>
                <span className="text-indigo-600 font-black">${stats.totalSpend.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white/50 border border-white/70 rounded-2xl shadow-sm">
                <span className="text-slate-700 font-semibold">Critical Parts Sourced:</span>
                <span className="text-rose-600 font-black">
                  {ledger.filter((l) => l.outcome === "rejected" && l.criticality === "critical").length} units
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white/50 border border-white/70 rounded-2xl shadow-sm">
                <span className="text-slate-700 font-semibold">Damping/Standard Sourced:</span>
                <span className="text-emerald-700 font-black">
                  {ledger.filter((l) => l.outcome === "rejected" && l.criticality !== "critical").length} units
                </span>
              </div>
            </div>
          </motion.div>

          {/* System Status Metrics */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel rounded-3xl p-5 border-white/60 shadow-lg"
          >
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-widest pb-3.5 border-b border-white/45 mb-4">
              [System Telemetry Stats]
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-white/50 border border-white/75 rounded-2xl flex items-center gap-3 shadow-sm">
                <Server className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[8px] font-mono text-indigo-950/70 uppercase font-black tracking-wide">
                    HOST STATUS
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-800 truncate block">
                    CLOUD RUN INGRESS
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-white/50 border border-white/75 rounded-2xl flex items-center gap-3 shadow-sm">
                <Cpu className="w-5 h-5 text-cyan-600 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[8px] font-mono text-indigo-950/70 uppercase font-black tracking-wide">
                    MODEL INSTANCE
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-800 truncate block">
                    NITRO-STACK.AI
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Mini Feed */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel rounded-3xl p-5 border-white/60 shadow-lg"
          >
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-widest pb-3.5 border-b border-white/45 mb-4">
              [Recent Production Flow]
            </h3>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">
                No telemetry recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                      act.grade === "average"
                        ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                        : act.outcome === "passed"
                        ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                        : "bg-rose-500 shadow-[0_0_8px_#ef4444]"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between font-mono text-[9px] text-slate-500 font-bold">
                        <span>{act.id} ({act.part_id})</span>
                        <span>{act.timestamp}</span>
                      </div>
                      <p className="text-slate-800 font-sans mt-0.5 truncate text-[11px] font-semibold">
                        {act.part_name} — {
                          act.grade === "average" ? (
                            <span className="text-amber-600 font-black">Passed (Manual Verify)</span>
                          ) : act.outcome === "passed" ? (
                            <span className="text-emerald-600 font-black">Passed QC</span>
                          ) : (
                            <span className="text-rose-600 font-black">Rejected: {act.defectType}</span>
                          )
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

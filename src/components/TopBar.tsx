/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  AlertOctagon,
  User,
  Clock,
  Wifi,
  RefreshCw,
  Plus,
} from "lucide-react";
import { InventoryStats } from "../types";

interface TopBarProps {
  isAutoMode: boolean;
  onToggleMode: () => void;
  onSpawnManual: () => void;
  canSpawnManual: boolean;
  isSelfChecking: boolean;
  onEmergencyStop: () => void;
  notificationCount: number;
}

export default function TopBar({
  isAutoMode,
  onToggleMode,
  onSpawnManual,
  canSpawnManual,
  isSelfChecking,
  onEmergencyStop,
  notificationCount,
}: TopBarProps) {
  const [timeStr, setTimeStr] = useState("");

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(" ")[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className="m-4 mb-0 rounded-3xl bg-white/40 backdrop-blur-3xl border border-white/55 px-6 py-4 shrink-0 shadow-[0_8px_32px_rgba(31,38,135,0.06)] relative z-30 flex flex-col md:flex-row items-center justify-between gap-4" 
      id="global-header"
    >
      {/* Brand & Connection Stats */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-10 h-10 rounded-xl bg-white/85 border border-white flex items-center justify-center text-indigo-950 font-display font-black text-lg shadow-[0_4px_12px_rgba(31,38,135,0.08)]"
          >
            SL
          </motion.div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div>
          <h1 className="font-display font-black text-sm text-indigo-950 tracking-widest flex items-center gap-2">
            SYNTH-LINE VIRTUAL
            <span className="text-[9px] font-mono font-black bg-white/80 text-indigo-950 border border-white/90 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse shadow-sm">
              FACTORY OS v1.2
            </span>
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700 mt-0.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-emerald-700 font-bold">● CONNECTED</span>
            <span className="mx-1 text-slate-300">|</span>
            <span className="text-slate-600 font-semibold tracking-wider">BANDWIDTH: 1.2 GB/S</span>
          </div>
        </div>
      </div>

      {/* Operator Status Deck (User Email, Notifications & Time) */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">


        {/* Live Clock */}
        <div className="flex items-center gap-1.5 bg-white/65 px-3 py-1.5 rounded-xl border border-indigo-200/50 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span className="text-indigo-950 text-[11px] font-mono font-bold w-[65px] tracking-wider">
            {timeStr || "00:00:00"}
          </span>
        </div>
      </div>

      {/* Action Controls (Toggles, Tests, E-Stop) */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-end">
        {/* Pilot autopilot mode toggle */}
        <div className="flex items-center gap-2 bg-white/60 border border-white/85 px-3.5 py-1.5 rounded-xl shadow-sm">
          <span className={`text-[10px] font-mono tracking-wider font-bold transition-colors ${isAutoMode ? "text-cyan-600" : "text-slate-500"}`}>
            AUTO
          </span>
          <button
            onClick={onToggleMode}
            disabled={isSelfChecking}
            className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAutoMode ? "bg-cyan-500 shadow-[0_2px_10px_rgba(6,182,212,0.3)]" : "bg-slate-300"
            }`}
            title="Toggle Pilot Autopilot"
          >
            <span
              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isAutoMode ? "translate-x-4.5" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-[10px] font-mono tracking-wider font-bold transition-colors ${!isAutoMode ? "text-amber-600" : "text-slate-500"}`}>
            MANUAL
          </span>
        </div>

        {/* Manual Spawn shortcut (visible in manual mode) */}
        {!isAutoMode && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onSpawnManual}
            disabled={!canSpawnManual || isSelfChecking}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 font-sans text-xs font-semibold transition-all ${
              canSpawnManual && !isSelfChecking
                ? "bg-white/70 hover:bg-white text-indigo-950 border-white shadow-sm cursor-pointer"
                : "bg-white/30 text-slate-400 border-white/40 cursor-not-allowed"
            }`}
            title="Spawn a random part on the belt"
          >
            <Plus className="w-3.5 h-3.5" />
            Inject Part
          </motion.button>
        )}



        {/* EMERGENCY STOP BUTTON */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEmergencyStop}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black font-mono tracking-widest uppercase transition-all shadow-[0_4px_14px_rgba(244,63,94,0.3)] flex items-center gap-1.5 cursor-pointer border border-rose-500"
          title="HALT ALL OPERATIONS"
        >
          <AlertOctagon className="w-4 h-4 stroke-[2.5]" /> E-STOP
        </motion.button>
      </div>
    </header>
  );
}

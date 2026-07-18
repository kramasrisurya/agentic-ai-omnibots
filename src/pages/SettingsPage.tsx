/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sliders,
  Camera,
  Shield,
  Eye,
  Check,
  CheckCircle2,
} from "lucide-react";

interface SettingsPageProps {
  isAutoMode: boolean;
  onToggleMode: () => void;
  isSelfChecking: boolean;
}

export default function SettingsPage({
  isAutoMode,
  onToggleMode,
  isSelfChecking,
}: SettingsPageProps) {
  // Exposure slider state
  const [exposure, setExposure] = useState(85);
  const [exposureTime, setExposureTime] = useState(1.5);
  const [alertSpeed, setAlertSpeed] = useState("normal");
  const [notifState, setNotifState] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = () => {
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2500);
  };

  return (
    <div className="space-y-6" id="settings-configuration-page">
      {/* Toast Alert */}
      {showSavedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-emerald-500 text-emerald-800 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce font-mono text-xs">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          <span className="font-bold">FACTORY PARAMS COMMITTED TO DISK STORAGE SUCCESSFULY</span>
        </div>
      )}

      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-500/15 via-white/55 to-transparent border border-white/65 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#64748b_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-700 uppercase font-black">
              [FACTORY TELEMETRY &amp; HARDWARE CALIBRATION]
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-indigo-950 tracking-tight">
            Factory System Settings
          </h1>
          <p className="text-xs text-slate-800 mt-1 max-w-xl font-semibold">
            Configure line conveyor speeds, adjust machine-vision camera parameters, calibrate strobe sensors, and set multi-agent defaults.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-black font-mono tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 font-sans"
        >
          Save Configuration
        </button>
      </div>

      {/* Main Grid: Settings boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Column: Conveyor & Camera Settings */}
        <div className="lg:col-span-6 space-y-6">
          {/* Conveyor Controls */}
          <div className="glass-panel border border-white/60 rounded-3xl p-5 space-y-4 shadow-lg">
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider pb-3 border-b border-white/45 flex items-center gap-1.5">
              <Sliders className="w-4.5 h-4.5 text-cyan-600" /> Lane Autopilot Settings
            </h3>

            <div className="space-y-4 font-mono text-xs">
              {/* Autopilot toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white/50 border border-white/85 rounded-2xl shadow-inner">
                <div>
                  <span className="text-indigo-950 block font-bold">Simulated Spawning Autopilot</span>
                  <span className="text-[10px] text-slate-600 mt-0.5 block font-sans font-semibold">
                    Automatically spawns new random parts sequentially at set speed intervals.
                  </span>
                </div>
                <button
                  onClick={onToggleMode}
                  disabled={isSelfChecking}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isAutoMode
                      ? "bg-indigo-950 text-white shadow-sm"
                      : "bg-white/60 border border-white/80 text-slate-500"
                  }`}
                >
                  {isAutoMode ? "ENGAGED" : "MANUAL"}
                </button>
              </div>

              {/* Simulation speed select */}
              <div className="space-y-1.5">
                <label className="text-slate-600 block font-bold">Simulated Factory Line Velocity</label>
                <div className="grid grid-cols-3 gap-2">
                  {["slow", "normal", "fast"].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setAlertSpeed(speed)}
                      className={`py-2 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                        alertSpeed === speed
                          ? "bg-white/95 border-indigo-400 text-indigo-950 font-black shadow-sm"
                          : "bg-white/40 border-white/60 text-slate-500 hover:bg-white/65"
                      }`}
                    >
                      {speed} speed
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Machine Vision Camera Settings */}
          <div className="glass-panel border border-white/60 rounded-3xl p-5 space-y-4 shadow-lg">
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider pb-3 border-b border-white/45 flex items-center gap-1.5">
              <Camera className="w-4.5 h-4.5 text-emerald-600" /> Machine Vision Diagnostics
            </h3>

            <div className="space-y-4 font-mono text-xs">
              {/* Shutter Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-bold">Optical Strobe Lens Exposure</span>
                  <span className="text-emerald-700 font-black">{exposure}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={exposure}
                  onChange={(e) => setExposure(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Frame Rate Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-bold">Strobe Flash Interval Duration</span>
                  <span className="text-emerald-700 font-black">{exposureTime}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={exposureTime}
                  onChange={(e) => setExposureTime(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Column: Theme & Security Keys */}
        <div className="lg:col-span-6 space-y-6">
          {/* Aesthetic Profiles */}
          <div className="glass-panel border border-white/60 rounded-3xl p-5 space-y-4 shadow-lg">
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider pb-3 border-b border-white/45 flex items-center gap-1.5">
              <Eye className="w-4.5 h-4.5 text-indigo-600 animate-pulse" /> UI Visual Settings
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-3.5 bg-white/50 border border-white/85 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-indigo-950 block font-bold">Frosted Glass Fluid Theme</span>
                  <span className="text-[10px] text-slate-600 font-sans block mt-0.5 font-semibold">
                    Vivid mesh canvas, translucent panels, and deep indigo visual indicators are now system defaults.
                  </span>
                </div>
                <span className="text-[9px] bg-indigo-500/15 text-indigo-700 border border-indigo-500/25 px-2.5 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> LOCKED
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white/50 border border-white/85 rounded-2xl shadow-sm">
                <div>
                  <span className="text-indigo-950 block font-bold">Desktop Notification Alarms</span>
                  <span className="text-[10px] text-slate-600 font-sans block mt-0.5 font-semibold">
                    Pushes system notifications when defect events are flagged by the triage agent.
                  </span>
                </div>
                <button
                  onClick={() => setNotifState(!notifState)}
                  className={`px-3 py-1.5 rounded-xl font-black text-[11px] cursor-pointer transition-colors shadow-sm ${
                    notifState ? "bg-indigo-950 text-white" : "bg-white/60 border border-white/80 text-slate-400"
                  }`}
                >
                  {notifState ? "ENABLED" : "MUTED"}
                </button>
              </div>
            </div>
          </div>

          {/* API Security Keys config */}
          <div className="glass-panel border border-white/60 rounded-3xl p-5 space-y-4 shadow-lg">
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider pb-3 border-b border-white/45 flex items-center gap-1.5">
              <Shield className="w-4.5 h-4.5 text-cyan-600 animate-pulse" /> Key Registries &amp; MCP Credentials
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-slate-600 text-[11px] block font-bold">NITRO STACK API Secret Key</span>
                <input
                  type="password"
                  disabled
                  value="••••••••••••••••••••••••••••••••"
                  className="w-full bg-white/90 border border-slate-300 rounded-xl p-2.5 text-slate-500 shadow-inner font-bold"
                />
                <span className="text-[9px] text-slate-600 block leading-normal mt-1 font-sans font-semibold">
                  The active environment automatically loads your NITRO-STACK API secret credentials on the server container.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

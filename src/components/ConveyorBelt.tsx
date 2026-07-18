/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Eye, Camera, ShieldAlert, Cpu, Crosshair, Maximize2, Settings, Compass } from "lucide-react";
import { Part, DEFECT_TYPES, Criticality } from "../types";
import Part3DModel from "./Part3DModel";

export interface VisualPart {
  id: string; // instance sequence ID (e.g. "PART-1234")
  part: Part;
  progress: number; // 0 to 100
  status: "approaching" | "inspecting" | "passed_moving" | "rejecting" | "done";
  outcome: "passed" | "rejected" | "pending";
  defectType?: string;
  holdTicks?: number;
  grade?: "good" | "average" | "poor";
}

interface ConveyorBeltProps {
  activeParts: VisualPart[];
  isAutoMode: boolean;
  onManualResolve: (partInstanceId: string, outcome: "passed" | "rejected", defectType?: string) => void;
  isSelfChecking: boolean;
  onPartDropped?: (partId: string) => void;
}

// Map part IDs to high-resolution photorealistic Unsplash images of real-world parts
export const PART_IMAGES: Record<string, string> = {
  "SNS-07": "https://images.unsplash.com/photo-1581092162384-8987c17d4e26?auto=format&fit=crop&w=400&h=400&q=80", // Sensor on test-rig
  "BRK-22": "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&w=400&h=400&q=80", // Polished metal brake / hub
  "BAT-99": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&h=400&q=80", // Heatsink thermal management
  "MTR-44": "https://images.unsplash.com/photo-1513818433747-5f175a6129f8?auto=format&fit=crop&w=400&h=400&q=80", // Electric drive motor
  "GRB-15": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&h=400&q=80", // Machined steel gearbox gears
  "PNL-01": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&h=400&q=80", // Carbon shroud weave plate
  "BKT-05": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&h=400&q=80", // Gray steel industrial bracket
  "FST-12": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&h=400&q=80", // Premium heavy bolt fasteners
};

// Simulated factory logs for the viewport corner overlay
const FACTORY_STATS = {
  feedId: "VISION-CAM_A-1_NODE4",
  fps: 60,
  exposure: "8.5 ms",
  aperture: "f/2.8",
  temp: "24.2°C",
};

export default function ConveyorBelt({
  activeParts,
  isAutoMode,
  onManualResolve,
  isSelfChecking,
  onPartDropped,
}: ConveyorBeltProps) {
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [selectedDefect, setSelectedDefect] = useState<string>(DEFECT_TYPES[0]);
  const [laserPosition, setLaserPosition] = useState<number>(0);
  const [systemTime, setSystemTime] = useState<string>("");

  // Find if there is an inspecting part in manual mode waiting for decision
  const pendingManualPart = activeParts.find(
    (p) => p.progress === 50 && p.status === "inspecting" && p.outcome === "pending"
  );

  // Update selectedDefect to match the pending manual part's specific defect catalog
  useEffect(() => {
    if (pendingManualPart) {
      const partDefects = pendingManualPart.part.defect_types && pendingManualPart.part.defect_types.length > 0
        ? pendingManualPart.part.defect_types
        : DEFECT_TYPES;
      setSelectedDefect(partDefects[0]);
    }
  }, [pendingManualPart?.id]);

  // Update laser sweep position for scanning effects
  useEffect(() => {
    let animationFrameId: number;
    const updateSweep = (time: number) => {
      const cycle = (time % 2000) / 2000; // 2s duration
      setLaserPosition(Math.sin(cycle * Math.PI * 2) * 45 + 50); // sweep between 5% and 95%
      animationFrameId = requestAnimationFrame(updateSweep);
    };
    animationFrameId = requestAnimationFrame(updateSweep);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Live video feed millisecond timer clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemTime(
        `${now.toISOString().slice(11, 19)}:${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0")}`
      );
    }, 33);
    return () => clearInterval(timer);
  }, []);

  const getCriticalityStyles = (criticality: Criticality) => {
    switch (criticality) {
      case "critical":
        return {
          bg: "bg-rose-500/15",
          border: "border-rose-500/30",
          text: "text-rose-400",
          dot: "bg-rose-500",
          glow: "shadow-rose-500/30",
        };
      case "standard":
        return {
          bg: "bg-amber-500/15",
          border: "border-amber-500/30",
          text: "text-amber-400",
          dot: "bg-amber-500",
          glow: "shadow-amber-500/30",
        };
      case "low-priority":
        return {
          bg: "bg-slate-500/15",
          border: "border-slate-500/30",
          text: "text-slate-400",
          dot: "bg-slate-400",
          glow: "shadow-slate-500/30",
        };
    }
  };

  return (
    <div
      className={`bg-slate-950 border rounded-xl p-5 flex flex-col justify-between h-[680px] relative overflow-hidden shadow-2xl transition-all duration-200 ${
        isDraggingOver ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] scale-[1.01]" : "border-slate-800"
      }`}
      id="conveyor-container"
      onDragOver={(e) => {
        e.preventDefault();
        if (!isSelfChecking) {
          setIsDraggingOver(true);
        }
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (isSelfChecking) return;
        const partId = e.dataTransfer.getData("partId");
        if (partId && onPartDropped) {
          onPartDropped(partId);
        }
      }}
    >
      {/* Drag Over High-Tech HUD Drop Zone Grid */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-cyan-950/60 border-2 border-dashed border-cyan-400 rounded-xl flex flex-col items-center justify-center gap-3 z-40 pointer-events-none backdrop-blur-[2px]">
          <div className="w-14 h-14 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse">
            <Compass className="w-7 h-7 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="text-center">
            <span className="block text-sm font-display font-bold text-cyan-400 uppercase tracking-widest">
              Release to Inject Part
            </span>
            <span className="block text-[10px] font-mono text-cyan-500 mt-1 uppercase tracking-wider">
              System: Spawns new QC inspection sequence
            </span>
          </div>
        </div>
      )}
      
      {/* Live Video Feed Outer Glass & Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#00f3ff_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none z-10" />
      
      {/* Live Video Feed HUD Indicators - Top Row */}
      <div className="flex items-start justify-between relative z-20 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-200 tracking-widest uppercase">
              LIVE OPTICAL FEED // A-1
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
            SYS_CAM: {FACTORY_STATS.feedId} ({FACTORY_STATS.fps} FPS)
          </span>
        </div>

        {/* Video feed calibration telemetry values */}
        <div className="flex gap-4 font-mono text-[9px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg">
          <div>EXP: <span className="text-cyan-400 font-bold">{FACTORY_STATS.exposure}</span></div>
          <div className="border-l border-slate-800 pl-2">APT: <span className="text-cyan-400 font-bold">{FACTORY_STATS.aperture}</span></div>
          <div className="border-l border-slate-800 pl-2">TEMP: <span className="text-emerald-400 font-bold">{FACTORY_STATS.temp}</span></div>
          <div className="border-l border-slate-800 pl-2">UTC_CLK: <span className="text-cyan-400 font-bold">{systemTime || "00:00:00:00"}</span></div>
        </div>
      </div>

      {/* The Main 3D Conveyor Belt and Camera Viewport Area */}
      <div className="relative flex-1 my-3 flex flex-col items-stretch justify-center select-none bg-slate-950 border border-slate-900/80 rounded-xl overflow-hidden" id="belt-stage">
        
        {/* Deep Field Ambient Factory Background */}
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-between opacity-80 pointer-events-none">
          <div className="h-full w-full bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-40" />
        </div>

        {/* TOP SUSPENDED MACHINE VISION STATION (Cognex-inspired design) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 flex flex-col items-center justify-start z-30 pointer-events-none">
          {/* Heavy Steel Bracket Arms */}
          <svg className="w-40 h-8 text-slate-700" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0 L40 28 L120 28 L150 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M45 28 L115 28" stroke="#334155" strokeWidth="5" />
            <circle cx="45" cy="28" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="115" cy="28" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
          </svg>

          {/* Yellow Cognex Smart-Camera Block */}
          <div className="w-36 h-12 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border border-amber-300 rounded shadow-2xl relative flex flex-col justify-between p-1">
            {/* Anodized Black Metal Side Panels and Branding */}
            <div className="absolute inset-y-0 left-0 w-3 bg-slate-950 rounded-l" />
            <div className="absolute inset-y-0 right-0 w-3 bg-slate-950 rounded-r" />
            <div className="flex justify-between items-center px-4">
              <span className="text-[7px] font-mono font-bold text-slate-950 tracking-tighter">AI VISION SENSOR</span>
              <span className="text-[7px] font-mono bg-slate-950 text-amber-400 px-1 rounded font-black tracking-widest">COGNEX</span>
            </div>

            {/* Lens barrel & LED ring light array */}
            <div className="flex justify-center items-center gap-1.5 pb-1">
              {/* Left Laser Module */}
              <div className="w-1.5 h-1.5 bg-rose-600 rounded-full border border-rose-400 shadow-[0_0_4px_#ef4444]" />
              
              {/* Central Metallic Camera Lens */}
              <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center p-0.5 shadow-inner">
                {/* Dual LED Circular Ring Light Bezel (12 circular LED elements) */}
                <div className="w-full h-full rounded-full border border-cyan-500/40 flex items-center justify-center relative bg-gradient-to-tr from-slate-900 to-slate-800">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 border border-white" />
                  </div>
                  {/* Glowing micro-LED bulbs */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`led-${i}`}
                      className="absolute w-1 h-1 rounded-full bg-white animate-pulse"
                      style={{
                        transform: `rotate(${i * 60}deg) translate(8px)`,
                        boxShadow: "0 0 4px #fff",
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right Laser Module */}
              <div className="w-1.5 h-1.5 bg-rose-600 rounded-full border border-rose-400 shadow-[0_0_4px_#ef4444]" />
            </div>
          </div>

          {/* Translucent Glowing Blue Volumetric Light Cone */}
          <div
            className="w-72 bg-gradient-to-b from-cyan-400/40 via-cyan-500/15 to-transparent absolute top-14 rounded-b-full blur-[2px] pointer-events-none transform origin-top z-10 animate-pulse"
            style={{
              height: "calc(50% - 14px)",
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
              transform: `scaleX(${1 + Math.sin(laserPosition / 10) * 0.05})`,
              transition: "transform 100ms ease-out"
            }}
          />

          {/* Glowing laser line projecting down onto the active scan coordinate - Perfectly Centered in the Square */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-72 h-3.5 z-10 pointer-events-none"
            style={{
              top: `calc(50% - 75px + ${laserPosition * 1.5}px)`
            }}
          >
            {/* Thick bright cyan gradient laser line with heavy shadows */}
            <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1.5px] shadow-[0_0_20px_rgba(34,211,238,0.95),0_0_40px_rgba(34,211,238,0.6)]" />
            <div className="absolute inset-y-1 left-0 right-0 h-[1.5px] bg-white blur-[0.5px] opacity-90" />
          </div>
        </div>

        {/* INDUSTRIAL SAFETY GUARD RAILS - Upper Guard Rail */}
        <div className="absolute top-[calc(50%-120px)] left-0 right-0 h-2 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 border-b border-slate-700 rounded-full shadow z-20" />

        {/* PHYSICAL CONVEYOR BELT TRACK (Black Rubber & Metallic End Rollers) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-12 right-12 h-52 bg-zinc-950 border-y-4 border-slate-800 flex items-center shadow-[inset_0_16px_32px_rgba(0,0,0,0.95)] overflow-hidden rounded-xl z-10">
          
          {/* Real Industrial Black Rubber Textured Conveyor Belt */}
          <div 
            className="w-[200%] h-full opacity-90 transition-all"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.85) 100%),
                repeating-linear-gradient(90deg, #18181b 0px, #18181b 16px, #0f0f11 16px, #0f0f11 18px, #27272a 18px, #27272a 19px, #18181b 19px, #18181b 36px)
              `,
              backgroundSize: "36px 100%",
              animation: activeParts.some(p => p.status !== "inspecting") ? "conveyor 2.2s linear infinite" : "none"
            }}
          />
        </div>

        {/* METALLIC CHROME CHASSIS ROLLER GEARS (Left and Right Sides) */}
        {/* Left Roller Cylinder */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-16 h-56 rounded-xl border-2 border-slate-500 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 shadow-2xl flex flex-col justify-between items-center py-3 z-20">
          <div className="w-14 h-1 bg-slate-700 rounded-full animate-pulse" />
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center">
            <div
              className="w-8 h-1.5 bg-slate-400 rounded-full"
              style={{
                animation: activeParts.some(p => p.status !== "inspecting") ? "spin 2s linear infinite" : "none"
              }}
            />
          </div>
          <div className="w-14 h-1 bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* Right Roller Cylinder */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-16 h-56 rounded-xl border-2 border-slate-500 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 shadow-2xl flex flex-col justify-between items-center py-3 z-20">
          <div className="w-14 h-1 bg-slate-700 rounded-full animate-pulse" />
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center">
            <div
              className="w-8 h-1.5 bg-slate-400 rounded-full"
              style={{
                animation: activeParts.some(p => p.status !== "inspecting") ? "spin 2s linear infinite" : "none"
              }}
            />
          </div>
          <div className="w-14 h-1 bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* INDUSTRIAL SAFETY GUARD RAILS - Lower Guard Rail */}
        <div className="absolute top-[calc(50%+112px)] left-0 right-0 h-2 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700 border-t border-slate-800 rounded-full shadow z-20" />

        {/* CENTRAL MACHINE VISION INSPECTION FIELD TARGETS - Perfectly Centered in the Square */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 flex flex-col items-center justify-center z-15 pointer-events-none">
          {/* Target Alignment Crosshairs */}
          <div className="absolute w-48 h-48 border border-dashed border-cyan-500/20 rounded-xl flex items-center justify-center">
            {/* Top-Left Target Bracket */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            {/* Top-Right Target Bracket */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            {/* Bottom-Left Target Bracket */}
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            {/* Bottom-Right Target Bracket */}
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            <span className="text-[7px] font-mono text-cyan-400 bg-slate-950/90 px-1 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest absolute -bottom-5">
              INSPECT_ZONE_ACTIVE
            </span>
          </div>
        </div>

        {/* REJECT SCRAP BIN - BACK LAYER (Behind the falling parts) - Tapered 3D Dustbin Shape */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-48 h-32 z-15 pointer-events-none"
          style={{ top: "75%" }}
        >
          <svg className="w-full h-full" viewBox="0 0 192 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bin-back-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#020408" />
              </linearGradient>
              <radialGradient id="bin-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Tapered back plate of the dustbin */}
            <path d="M 12,0 L 180,0 L 152,120 L 40,120 Z" fill="url(#bin-back-grad)" stroke="#1e293b" strokeWidth="2" />
            {/* Depth shadow under the rim */}
            <path d="M 12,0 L 180,0 L 174,15 L 18,15 Z" fill="#020408" opacity="0.8" />
            {/* Warning red center glow */}
            <circle cx="96" cy="70" r="45" fill="url(#bin-glow)" className="animate-pulse" style={{ animationDuration: "1.5s" }} />
          </svg>
        </div>

        {/* ACTIVE PHYSICAL PARTS IN TRANSIT */}
        {activeParts.map((item) => {
          const style = getCriticalityStyles(item.part.criticality);
          const isInspecting = item.status === "inspecting";
          const partImage = PART_IMAGES[item.part.part_id] || PART_IMAGES["SNS-07"];
          
          // Absolute positioning on conveyor
          let horizontalPos = `${item.progress}%`;
          let verticalPos = "50%";
          let rotation = "rotate(0deg)";
          let scale = "scale(1)";
          let opacity = "opacity-100";
          let glowClass = "";
          let isRejecting = item.status === "rejecting";

          if (isRejecting) {
            horizontalPos = "50%";
            verticalPos = "85%"; // drops into the scrap bin
            rotation = "rotate(45deg)";
            scale = "scale(0.75)";
            opacity = "opacity-0";
          } else if (isInspecting) {
            horizontalPos = "50%";
            scale = "scale(1.15)";
          }

          // Generate stable mock values for vision overlays based on instance ID
          const instanceNumber = parseInt(item.id.replace(/\D/g, "") || "100", 10);
          const confidence = item.outcome === "rejected" 
            ? (30 + (instanceNumber % 15)).toFixed(2)
            : (98.5 + (instanceNumber % 14) / 10).toFixed(2);
          
          const dimL = (115 + (instanceNumber % 30)).toFixed(1);
          const dimW = (75 + (instanceNumber % 20)).toFixed(1);
          const dimH = (35 + (instanceNumber % 15)).toFixed(1);
          const serialNumber = `SN-99${item.part.part_id}-${instanceNumber}`;

          return (
            <React.Fragment key={item.id}>
              {/* Part Container (Borderless, transparent to show only raw 3D part) */}
              <div
                className={`absolute w-32 h-32 flex items-center justify-center select-none z-20 ${opacity}`}
                style={{
                  left: horizontalPos,
                  top: verticalPos,
                  transform: `translate(-50%, -50%) ${rotation} ${scale}`,
                  transition: isRejecting 
                    ? "left 700ms ease-in, top 700ms cubic-bezier(0.25, 1, 0.5, 1), opacity 700ms ease-in, transform 700ms ease-in" 
                    : isInspecting 
                    ? "left 300ms cubic-bezier(0.25, 1, 0.5, 1), top 300ms ease-out, transform 300ms ease-out"
                    : "top 300ms ease-out, transform 300ms ease-out, opacity 300ms", // Removing left transition here completely avoids React interval animation lock/fights!
                }}
              >
                {/* 3D Soft drop shadow to ground the part onto the belt */}
                <div 
                  className={`absolute w-24 h-5 bg-black/75 rounded-full blur-md bottom-1 -z-10 transition-all duration-300 ${
                    isInspecting ? "scale-x-110 opacity-90" : "scale-x-95 opacity-60"
                  }`} 
                />

                {/* Cybernetic inspection light ring glow directly on the belt under the part */}
                {isInspecting && (
                  <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 -z-20 animate-pulse ${
                    item.grade === "average"
                      ? "bg-amber-500"
                      : item.outcome === "passed"
                      ? "bg-emerald-500"
                      : item.outcome === "rejected"
                      ? "bg-rose-500"
                      : "bg-cyan-500"
                  }`} style={{ animationDuration: "1s" }} />
                )}

                {/* Float-animated wrapper for the Part */}
                <div className={`w-full h-full relative flex items-center justify-center ${
                  item.status === "approaching" || item.status === "passed_moving"
                    ? instanceNumber % 2 === 0 ? "animate-float" : "animate-float-slow"
                    : ""
                }`}>
                  <Part3DModel 
                    partId={item.part.part_id} 
                    status={item.status}
                    animate={item.status !== "inspecting" || item.outcome === "pending"} 
                    className="w-[95%] h-[95%] object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] scale-[1.3]"
                  />
                  
                  {/* Real-time laser profiling sweep line on top of the part */}
                  {isInspecting && item.outcome === "pending" && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className={`absolute h-[2px] left-1 right-1 shadow-[0_0_12px_#22d3ee,0_0_4px_#ffffff] z-30 ${
                          item.grade === "average" ? "bg-amber-400 shadow-amber-500/80" : "bg-cyan-400"
                        }`}
                        style={{ top: `${laserPosition}%` }}
                      />
                      <div className={`absolute inset-0 border rounded-xl animate-pulse ${
                        item.grade === "average" ? "border-amber-400/25 bg-amber-500/[0.02]" : "border-cyan-400/25 bg-cyan-500/[0.02]"
                      }`} />
                    </div>
                  )}
                </div>

                {/* Elegant Floating Holographic Label Tag */}
                <div className={`absolute -bottom-6 flex items-center gap-1.5 bg-slate-950/95 border px-2 py-0.5 rounded-full shadow-2xl font-mono text-[8px] select-none ${
                  item.grade === "average" ? "border-amber-500/50 bg-amber-950/20 text-amber-200 shadow-amber-500/5" : "border-white/5 text-slate-300"
                }`}>
                  <span className={`${item.grade === "average" ? "text-amber-400 font-bold" : "text-cyan-400"} font-bold`}>{item.id}</span>
                  <span className="w-[1px] h-2 bg-white/10" />
                  <span className="text-slate-400 font-semibold">{item.part.part_id}</span>
                  {item.grade === "average" && (
                    <>
                      <span className="w-[1px] h-2 bg-white/10" />
                      <span className="text-amber-400 font-black tracking-tighter">AVG - MANUAL VERIFY</span>
                    </>
                  )}
                </div>
              </div>

              {/* MACHINE VISION TELEMETRY OVERLAYS (NVIDIA Metropolis / Cognex-style GUI) */}
              {isInspecting && (
                <div 
                  className="absolute z-25 pointer-events-none transition-all duration-300"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(92px, -50%)", // offset to the right side of the conveyor
                  }}
                >
                  <div className={`p-2.5 rounded-lg border font-mono text-[9px] w-[210px] shadow-2xl backdrop-blur-md bg-slate-950/90 ${
                    item.grade === "average"
                      ? "border-amber-500/50 text-amber-400"
                      : item.outcome === "passed"
                      ? "border-emerald-500/50 text-emerald-400"
                      : item.outcome === "rejected"
                      ? "border-rose-500/50 text-rose-400"
                      : "border-cyan-500/50 text-cyan-400"
                  }`}>
                    {/* Overlay Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
                      <span className="font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {item.grade === "average" ? "MANUAL_ROUTING..." : item.outcome === "pending" ? "ANALYZING_PART..." : "DECISION_LOCKED"}
                      </span>
                      <span className={`text-[8px] px-1 rounded uppercase font-black ${
                        item.grade === "average"
                          ? "bg-amber-950 text-amber-400 border border-amber-500/20"
                          : item.outcome === "passed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                          : item.outcome === "rejected"
                          ? "bg-rose-950 text-rose-400 border border-rose-500/20"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        {item.grade === "average" ? "MANUAL" : item.outcome}
                      </span>
                    </div>

                    {/* Numeric Telemetry Metrics */}
                    <div className="space-y-0.5 text-slate-300 text-[8px]">
                      <div className="flex justify-between">
                        <span>TARGET:</span>
                        <span className="text-white font-bold">{item.part.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SYS_OCR:</span>
                        <span className="text-slate-400">{serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CONFIDENCE:</span>
                        <span className={`font-bold ${item.grade === "average" ? "text-amber-400" : item.outcome === "rejected" ? "text-rose-400" : "text-emerald-400"}`}>
                          {item.grade === "average" ? "MANUAL INSPECTION" : `${confidence}%`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>DIM_L:</span>
                        <span>{dimL} mm <span className="text-emerald-500/70">±0.05</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>DIM_W:</span>
                        <span>{dimW} mm <span className="text-emerald-500/70">±0.05</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>DIM_H:</span>
                        <span>{dimH} mm <span className="text-emerald-500/70">±0.05</span></span>
                      </div>
                    </div>

                    {/* Defect Warning Markers inside HUD */}
                    {item.outcome === "rejected" && (
                      <div className="mt-1.5 p-1 bg-rose-950/40 border border-rose-500/20 rounded text-[8px] text-rose-300">
                        <div className="flex items-center gap-1 font-bold">
                          <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                          <span>ANOMALY_DETECTED</span>
                        </div>
                        <p className="mt-0.5 text-[7px] leading-relaxed opacity-90 truncate text-rose-400">
                          {item.defectType || "SPEC_OUT_OF_BOUNDS"}
                        </p>
                      </div>
                    )}

                    {/* Calibration Grid Graph Overlay Graphic */}
                    <div className="mt-1.5 h-1.5 w-full bg-slate-900 border border-slate-800 rounded-sm overflow-hidden relative">
                      <div 
                        className={`h-full rounded-sm ${
                          item.grade === "average" ? "bg-amber-500" : item.outcome === "passed" ? "bg-emerald-500" : item.outcome === "rejected" ? "bg-rose-500" : "bg-cyan-500"
                        }`}
                        style={{
                          width: item.outcome === "pending" && item.grade !== "average" ? `${laserPosition}%` : "100%",
                          transition: item.outcome === "pending" && item.grade !== "average" ? "none" : "width 0.5s ease-out"
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Defect target scope drawn DIRECTLY on the physical part */}
              {isInspecting && item.outcome === "rejected" && (
                <div 
                  className="absolute z-30 pointer-events-none"
                  style={{
                    left: "50%",
                    top: "50%", // EXACTLY center on the part
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Targeting scope reticle circles */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-20 animate-ping" />
                    <div className="w-8 h-8 rounded-full border border-dashed border-rose-400 flex items-center justify-center animate-spin" style={{ animationDuration: "5s" }} />
                    <div className="w-3 h-3 rounded-full border-2 border-rose-500 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-rose-400" />
                    </div>
                    {/* Defect coordinate tick label */}
                    <div className="absolute -top-5 bg-slate-950 text-rose-400 border border-rose-500/40 rounded px-1 text-[7px] font-mono uppercase tracking-tighter whitespace-nowrap">
                      FAULT_LOC: X:42.5 Y:88.1
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* REJECT SCRAP BIN - FRONT LAYER (In front of falling parts, creating 3D drop-in depth sandwich) - Tapered 3D Dustbin Shape */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-48 h-32 z-25 pointer-events-none"
          style={{ top: "75%" }}
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 192 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bin-front-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="40%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="handle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <pattern id="hazard-stripes-bin" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M-4,12 L12,-4 L16,0 L0,16 Z" fill="#fbbf24" />
                <path d="M4,20 L20,4 L24,8 L8,24 Z" fill="#fbbf24" />
                <path d="M 0,0 L 16,16" stroke="#000" strokeWidth="4" />
              </pattern>
            </defs>
            
            {/* 3D Metal Side Handles (Extending outside the bin body) */}
            {/* Left Handle */}
            <path d="M 12,30 Q -6,30 -6,45 Q -6,60 18,60" stroke="url(#handle-grad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 12,30 Q -6,30 -6,45 Q -6,60 18,60" stroke="#334155" strokeWidth="1" strokeLinecap="round" fill="none" />
            <rect x="10" y="25" width="4" height="10" rx="1" fill="#475569" />
            <rect x="15" y="55" width="4" height="10" rx="1" fill="#475569" />

            {/* Right Handle */}
            <path d="M 180,30 Q 198,30 198,45 Q 198,60 174,60" stroke="url(#handle-grad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 180,30 Q 198,30 198,45 Q 198,60 174,60" stroke="#334155" strokeWidth="1" strokeLinecap="round" fill="none" />
            <rect x="178" y="25" width="4" height="10" rx="1" fill="#475569" />
            <rect x="173" y="55" width="4" height="10" rx="1" fill="#475569" />

            {/* Tapered Front Shell of the Container */}
            <path d="M 12,12 L 180,12 L 152,120 L 40,120 Z" fill="url(#bin-front-grad)" stroke="#334155" strokeWidth="1.5" />

            {/* Top Reinforced Metal Rim Lip */}
            <path d="M 8,0 L 184,0 L 180,12 L 12,12 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
            
            {/* Yellow/Black Safety Hazard Striping Collar on the Lip */}
            <path d="M 10,2 L 182,2 L 179,10 L 13,10 Z" fill="url(#hazard-stripes-bin)" />
            {/* Shiny metal rim highlight */}
            <line x1="8" y1="0" x2="184" y2="0" stroke="#64748b" strokeWidth="1" />

            {/* Vertical Heavy-Duty Structural Ribs */}
            <path d="M 45,15 L 58,115" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 45,15 L 58,115" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            
            <path d="M 70,15 L 78,115" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 70,15 L 78,115" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            <path d="M 122,15 L 114,115" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 122,15 L 114,115" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            <path d="M 147,15 L 134,115" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 147,15 L 134,115" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

            {/* Warning decal plate / Industrial placard */}
            <rect x="64" y="32" width="64" height="40" rx="3" fill="#090d16" stroke="#475569" strokeWidth="1" />
            
            {/* Scrap Warning Decal Content */}
            <rect x="68" y="36" width="56" height="6" fill="#f43f5e" rx="1" />
            {/* Text: REJECTS BIN */}
            <text x="96" y="41" fill="#ffffff" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">REJECTS BIN</text>
            
            {/* Sub-text stats */}
            <text x="96" y="52" fill="#94a3b8" fontSize="4.5" fontFamily="monospace" textAnchor="middle">MAX CAP: 250 U</text>
            <text x="96" y="60" fill="#64748b" fontSize="4" fontFamily="monospace" textAnchor="middle">SYSTEM ACTIVE</text>
            
            {/* Mini blinking status led */}
            <circle cx="96" cy="66" r="1.5" fill="#f43f5e" className="animate-pulse" />

            {/* Bottom Base Lip */}
            <path d="M 40,120 L 152,120 L 148,126 L 44,126 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* FOOTER HUD: DECISION PANEL FOR MANUAL MODE */}
      <div className="relative z-20 shrink-0 h-16 flex items-center justify-center" id="hud-panel">
        {pendingManualPart ? (
          <div className="bg-slate-950 border border-cyan-500/40 rounded-xl px-4 py-2 flex items-center gap-4 shadow-2xl max-w-full animate-pulse-slow">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                MANUAL TRIAGE REQUIRED
              </span>
              <span className="text-xs font-sans text-slate-200 font-medium truncate max-w-[160px]">
                {pendingManualPart.part.part_id} ({pendingManualPart.part.name})
              </span>
            </div>

            <div className="h-6 w-[1px] bg-slate-800" />

            {/* Defect selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="defect-select" className="text-[9px] font-mono text-slate-500 uppercase">Defect:</label>
              <select
                id="defect-select"
                value={selectedDefect}
                onChange={(e) => setSelectedDefect(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-sans text-slate-300 focus:outline-none focus:border-cyan-500/70"
              >
                {(pendingManualPart.part.defect_types && pendingManualPart.part.defect_types.length > 0
                  ? pendingManualPart.part.defect_types
                  : DEFECT_TYPES
                ).map((d, i) => (
                  <option key={i} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Decisions */}
            <div className="flex items-center gap-2">
              <button
                id="manual-pass-btn"
                onClick={() => onManualResolve(pendingManualPart.id, "passed")}
                disabled={isSelfChecking}
                className="bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-400 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:scale-[1.03] transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Pass
              </button>
              <button
                id="manual-reject-btn"
                onClick={() => onManualResolve(pendingManualPart.id, "rejected", selectedDefect)}
                disabled={isSelfChecking}
                className="bg-rose-950/80 hover:bg-rose-900/90 border border-rose-500/40 text-rose-400 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:scale-[1.03] transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Mark Defective
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs font-sans text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            {isAutoMode ? (
              <span>Automatic mode running... streaming parts through AI quality checks.</span>
            ) : (
              <span>Paused. Click "Spawn Part" to run manual inspect checks.</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

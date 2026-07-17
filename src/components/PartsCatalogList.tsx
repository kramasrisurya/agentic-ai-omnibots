/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Move, Info, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Part, PARTS_CATALOG, Criticality } from "../types";
import { PART_IMAGES } from "./ConveyorBelt";
import Part3DModel from "./Part3DModel";

interface PartsCatalogListProps {
  onInjectPart: (part: Part) => void;
  isAutoMode: boolean;
  isSelfChecking: boolean;
  injectionGrade?: "random" | "good" | "average" | "poor";
  setInjectionGrade?: (grade: "random" | "good" | "average" | "poor") => void;
}

export default function PartsCatalogList({
  onInjectPart,
  isAutoMode,
  isSelfChecking,
  injectionGrade,
  setInjectionGrade,
}: PartsCatalogListProps) {
  
  const handleDragStart = (e: React.DragEvent, part: Part) => {
    e.dataTransfer.setData("partId", part.part_id);
    e.dataTransfer.effectAllowed = "copy";
    
    // Create a drag image or set drag data
    const ghost = document.createElement("div");
    ghost.className = "bg-slate-900 border border-cyan-500/50 text-cyan-400 font-mono text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-50 absolute -top-40";
    ghost.innerText = `Injecting ${part.part_id}`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const getCriticalityBadge = (criticality: Criticality) => {
    switch (criticality) {
      case "critical":
        return (
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            CRITICAL
          </span>
        );
      case "standard":
        return (
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            STANDARD
          </span>
        );
      case "low-priority":
        return (
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            LOW PRIORITY
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/40 border border-white/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm select-none h-full overflow-hidden" id="parts-catalog-panel">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-indigo-950/10 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-600" />
          <h2 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider">
            Parts Library
          </h2>
        </div>
        <span className="text-[9px] font-mono bg-cyan-500/15 text-cyan-700 border border-cyan-500/20 px-1.5 py-0.5 rounded font-black">
          {PARTS_CATALOG.length} TYPES
        </span>
      </div>

      {/* Dynamic Injection Grade Selector */}
      {setInjectionGrade && injectionGrade && (
        <div className="p-2 bg-white/60 rounded-lg border border-white/80 shrink-0 shadow-inner">
          <span className="text-[9px] font-mono font-black text-indigo-950 block mb-1.5 uppercase tracking-wider">
            Manual Quality Injection Profile
          </span>
          <div className="grid grid-cols-4 gap-1">
            {(["random", "good", "average", "poor"] as const).map((gradeVal) => {
              const isActive = injectionGrade === gradeVal;
              let btnClass = "bg-white/40 text-slate-600 hover:text-slate-800 border-white/80";
              if (isActive) {
                if (gradeVal === "random") btnClass = "bg-cyan-500/15 border-cyan-500/30 text-cyan-700 font-bold shadow-sm";
                else if (gradeVal === "good") btnClass = "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 font-bold shadow-sm";
                else if (gradeVal === "average") btnClass = "bg-amber-500/15 border-amber-500/30 text-amber-700 font-bold shadow-sm";
                else if (gradeVal === "poor") btnClass = "bg-rose-500/15 border-rose-500/30 text-rose-700 font-bold shadow-sm";
              }
              const label = gradeVal === "random" ? "Auto" : gradeVal === "good" ? "Good" : gradeVal === "average" ? "Avg" : "Poor";
              return (
                <button
                  key={gradeVal}
                  onClick={() => setInjectionGrade(gradeVal)}
                  className={`text-[10px] font-mono py-1 rounded border ${btnClass} transition-all cursor-pointer text-center uppercase tracking-tighter`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Drag & Drop Instructions */}
      <div className="p-2 bg-white/70 rounded-lg border border-white/90 text-[11px] text-slate-700 shrink-0 flex items-start gap-2 leading-relaxed shadow-sm">
        <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <div>
          <p>
            <strong className="text-indigo-950 font-black">Test Sourcing Policies manually:</strong>
          </p>
          <p className="mt-0.5 font-medium">
            1. <span className="text-cyan-700 font-black">Drag</span> any part below &amp; <span className="text-cyan-700 font-black">Drop</span> it onto the conveyor belt.
          </p>
          <p className="font-medium">
            2. Or simply <span className="text-cyan-700 font-black">Click</span> a card to inject it.
          </p>
          <p className="mt-1 text-[10px] text-slate-500 font-bold">
            {isAutoMode ? (
              <span className="text-emerald-700">● Automatic inspection active</span>
            ) : (
              <span className="text-amber-700">● Paused (Manual decision active)</span>
            )}
          </p>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scroll-container" id="parts-catalog-list">
        {PARTS_CATALOG.map((part) => {
          const partImg = PART_IMAGES[part.part_id] || "";
          return (
            <div
              key={part.part_id}
              draggable={!isSelfChecking}
              onDragStart={(e) => handleDragStart(e, part)}
              onClick={() => {
                if (!isSelfChecking) {
                  onInjectPart(part);
                }
              }}
              className={`p-2 bg-white/65 hover:bg-white border border-white/80 hover:border-cyan-500/30 rounded-lg shadow-sm transition-all flex items-center justify-between gap-3 group relative cursor-grab active:cursor-grabbing ${
                isSelfChecking ? "opacity-50 pointer-events-none" : ""
              }`}
              title="Drag onto conveyor or click to inject"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Part Thumbnail */}
                <div className="w-10 h-10 rounded-md overflow-hidden bg-white/80 border border-white/95 shrink-0 relative flex items-center justify-center p-0.5">
                  <Part3DModel partId={part.part_id} className="w-full h-full" animate={false} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                </div>

                {/* Part info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-700 tracking-tight group-hover:text-cyan-800 transition-colors">
                      {part.part_id}
                    </span>
                  </div>
                  <h4 className="text-[11px] text-indigo-950 font-sans font-black truncate leading-tight mt-1 max-w-[140px] md:max-w-[160px]">
                    {part.name}
                  </h4>
                </div>
              </div>

              {/* Drag indicator icon */}
              <div className="text-slate-400 group-hover:text-cyan-600 transition-colors shrink-0 pr-1">
                <Move className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

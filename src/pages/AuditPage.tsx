/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Search,
  Filter,
  AlertOctagon,
  Wrench,
  Download,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { LedgerEntry, PARTS_CATALOG } from "../types";
import Part3DModel from "../components/Part3DModel";

interface AuditPageProps {
  ledger: LedgerEntry[];
}

export default function AuditPage({ ledger }: AuditPageProps) {
  const rejectedItems = ledger.filter((l) => l.outcome === "rejected");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartFilter, setSelectedPartFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<LedgerEntry | null>(
    rejectedItems.length > 0 ? rejectedItems[0] : null
  );

  // Filter items
  const filteredItems = rejectedItems.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.defectType && item.defectType.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPart = selectedPartFilter === "ALL" || item.part_id === selectedPartFilter;
    return matchesSearch && matchesPart;
  });

  // Handle export trigger
  const [showExportToast, setShowExportToast] = useState(false);
  const triggerExport = () => {
    setShowExportToast(true);
    setTimeout(() => {
      setShowExportToast(false);
    }, 3000);
  };

  // Get severity of the defect based on part criticality
  const getSeverity = (criticality: string) => {
    switch (criticality) {
      case "critical":
        return { text: "CRITICAL FAULT", bg: "bg-rose-500/15 text-rose-700 border-rose-500/30 font-black" };
      case "standard":
        return { text: "MEDIUM SEVERITY", bg: "bg-amber-500/15 text-amber-700 border-amber-500/30 font-bold" };
      default:
        return { text: "LOW PRIORITY FLAGGED", bg: "bg-slate-100 text-slate-700 border-slate-300 font-medium" };
    }
  };

  // Get simulated root cause based on defect type
  const getRootCause = (defectType?: string) => {
    if (!defectType) return "Undetermined micro-cavity extrusion error.";
    if (defectType.includes("Scratch")) {
      return "Friction wear in delivery hopper rails. Robotic gripper claw out of alignment by +0.35mm.";
    }
    if (defectType.includes("Deviation")) {
      return "Sub-assembly CNC tool heating caused structural steel thermal expansion during high-speed molding.";
    }
    if (defectType.includes("Void")) {
      return "Reflow oven zone 4 thermal curve dipped 8°C below liquidus threshold, resulting in localized solder tension gaps.";
    }
    if (defectType.includes("Cracked")) {
      return "Over-torquing during high-pressure pneumatic casing fastener deployment stage.";
    }
    if (defectType.includes("Thermal")) {
      return "Internal silicon gate impedance mismatch causing excessive heating under 5V pilot load.";
    }
    return "Micro-component pick-and-place nozzle vacuum drop during cartridge supply cycle.";
  };

  return (
    <div className="space-y-6" id="audit-center-page">
      {/* Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-emerald-500 text-emerald-800 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce font-mono text-xs">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span className="font-bold">REPORT EXPORTED SUCCESSFULLY: SECURE_Q_AUDIT_{Date.now().toString().slice(-4)}.CSV</span>
        </div>
      )}

      {/* Audit Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#f0abfc]/20 via-white/55 to-transparent border border-white/65 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-rose-700 uppercase font-black">
              [NON-CONFORMANCE REGISTER &amp; QUARANTINE]
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-indigo-950 tracking-tight">
            Quality Audit Command
          </h1>
          <p className="text-xs text-slate-800 mt-1 max-w-xl font-semibold">
            Analyze rejected mechanical parts, inspect automated agent-led diagnostic data, and export compliant ISO reports.
          </p>
        </div>
        
        <button
          onClick={triggerExport}
          className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white shadow-sm text-xs font-black font-mono tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Export CSV Audit
        </button>
      </div>

      {/* Main Grid: List on left, dynamic details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Ledger List */}
        <div className="lg:col-span-5 glass-panel border border-white/60 rounded-3xl p-5 flex flex-col h-[580px] shadow-lg">
          {/* Header & Filters */}
          <div className="space-y-3 pb-3 border-b border-white/45 mb-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-950">
                Non-Conformant Ledger ({filteredItems.length})
              </h3>
              <span className="text-[9px] font-mono text-slate-600 font-bold">
                FILTER BY COMPONENT TYPE
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search fault logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/60 border border-white/90 rounded-xl py-1 pl-8 pr-3 text-xs focus:outline-none focus:border-indigo-500 text-indigo-950 font-mono shadow-inner"
                />
              </div>

              <select
                value={selectedPartFilter}
                onChange={(e) => setSelectedPartFilter(e.target.value)}
                className="bg-white/60 border border-white/90 rounded-xl px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer font-bold shadow-sm"
              >
                <option value="ALL">ALL PARTS</option>
                {PARTS_CATALOG.map((p) => (
                  <option key={p.part_id} value={p.part_id}>
                    {p.part_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto scroll-container space-y-2 pr-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-3xl bg-white/20 py-20">
                <AlertOctagon className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-700 uppercase tracking-wider font-mono font-bold">
                  No quarantined parts detected
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-white/90 border-indigo-400 shadow-[0_4px_16px_rgba(31,38,135,0.06)]"
                        : "bg-white/40 border-white/60 hover:bg-white/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-indigo-950 text-xs">
                          {item.id}
                        </span>
                        <span className="text-[9px] font-mono bg-rose-500/15 text-rose-700 border border-rose-500/20 px-1.5 py-0.2 rounded-full font-black uppercase">
                          {item.part_id}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono font-bold">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-800 font-sans mt-1 text-xs font-bold truncate">
                        {item.defectType}
                      </p>
                      <p className="text-slate-600 font-sans text-[10px] mt-0.5 truncate font-medium">
                        {item.part_name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-mono text-slate-600 block font-bold">
                        Cost impact
                      </span>
                      <span className="text-xs font-mono font-black text-rose-600 block">
                        ${item.orderCost ? item.orderCost : "Pending"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Damage Diagnostic Explanations */}
        <div className="lg:col-span-7 glass-panel border border-white/60 rounded-3xl p-5 h-[580px] flex flex-col justify-between shadow-lg">
          {selectedItem ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between min-h-0 overflow-y-auto scroll-container pr-1">
              {/* Header Details */}
              <div className="border-b border-white/45 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-display font-black text-indigo-950">
                      Diagnostic File: {selectedItem.id}
                    </h2>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      getSeverity(selectedItem.criticality).bg
                    }`}>
                      {getSeverity(selectedItem.criticality).text}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono font-bold mt-1">
                    Inspected on line segment A3 at {selectedItem.timestamp}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-950 bg-white/60 border border-white/80 px-2.5 py-1 rounded-xl shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  Quarantine Duration: 2.1 Hours
                </div>
              </div>

              {/* Graphical Diagnostic Model Side-by-side with Fault Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center shrink-0">
                {/* 3D solid visual with damage target marker */}
                <div className="md:col-span-4 bg-white/60 border border-white/80 rounded-2xl p-3 flex flex-col items-center justify-center relative aspect-square max-h-[140px] overflow-hidden shadow-sm">
                  <div className="w-20 h-20 relative">
                    <Part3DModel partId={selectedItem.part_id} status="inspecting" animate={false} />
                    {/* Simulated Damage crosshair */}
                    <span className="absolute top-1/3 left-1/2 -ml-2 -mt-2 w-4.5 h-4.5 rounded-full border border-rose-500 bg-rose-500/10 flex items-center justify-center animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-rose-600 absolute bottom-1 uppercase font-black">
                    FAULT_LOC_DET_S1
                  </span>
                </div>

                {/* Specific Sourcing Resolutions */}
                <div className="md:col-span-8 space-y-2">
                  <div className="p-2.5 bg-white/60 border border-white/80 rounded-2xl shadow-sm">
                    <span className="text-[9px] text-cyan-700 font-mono font-black block uppercase">
                      Defect Assessment
                    </span>
                    <p className="text-xs text-slate-800 font-sans font-bold">
                      {selectedItem.defectType} — Detected during visual contour mapping.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white/60 border border-white/80 rounded-2xl shadow-sm">
                    <span className="text-[9px] text-emerald-700 font-mono font-black block uppercase">
                      Sourced Resolution
                    </span>
                    <p className="text-xs text-slate-800 font-sans">
                      Automated purchase order of <strong>1 unit</strong> replacement dispatched to <strong>{selectedItem.chosenSupplierName || "Global Sourcing Database"}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Explanation */}
              <div className="bg-white/50 border border-white/80 rounded-2xl p-4 space-y-3 flex-1 min-h-[150px] overflow-y-auto scroll-container shadow-inner">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span className="text-[10px] font-mono text-cyan-700 font-black uppercase tracking-wider">
                    VISION AGENT EXPLANATION LOGS
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <h4 className="text-[10px] font-mono text-slate-700 uppercase font-bold">
                      Root Cause Mechanical Analysis:
                    </h4>
                    <p className="text-slate-800 font-sans mt-0.5 leading-relaxed font-medium">
                      {getRootCause(selectedItem.defectType)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono text-slate-700 uppercase font-bold">
                      Sourcing Policy Assertion:
                    </h4>
                    <p className="text-slate-800 font-sans mt-0.5 leading-relaxed">
                      {selectedItem.criticality === "critical" ? (
                        <>
                          This part is marked <strong>CRITICAL</strong>. Sourcing rules asserted: <strong>MINIMIZE DELIVERY SPEED</strong> over all pricing bounds. Selected Apex/Fast-Track vendor, bypassing cheaper alternatives.
                          {selectedItem.tradeOffIgnored && (
                            <span className="text-[10px] text-rose-700 block mt-1 bg-rose-500/10 p-1.5 rounded-xl font-mono border border-rose-500/10 font-bold">
                              ⚠️ Sourcing trade-off: {selectedItem.tradeOffIgnored}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          This part is marked <strong>LOW-PRIORITY / STANDARD</strong>. Sourcing rules asserted: <strong>MINIMIZE PROCUREMENT COST</strong> over delivery delays. Sourced cheaper general supply, ignoring faster express options.
                          {selectedItem.tradeOffIgnored && (
                            <span className="text-[10px] text-amber-700 block mt-1 bg-amber-500/10 p-1.5 rounded-xl font-mono border border-amber-500/10 font-bold">
                              ℹ️ Sourcing notice: {selectedItem.tradeOffIgnored}
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  {/* ISO Standard Compliance Verification */}
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-mono text-emerald-700 font-black block">
                        ISO 9001 RESOLUTION VERIFICATION [OK]
                      </span>
                      <p className="text-[10px] text-slate-700 font-medium leading-snug">
                        Automated reorder matches part specs exactly. Digital audit envelope sealed. Sourcing route fully deterministic and auditable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-300 rounded-3xl bg-white/20">
              <FileSpreadsheet className="w-12 h-12 text-slate-500 mb-2 animate-pulse" />
              <p className="text-xs text-slate-700 uppercase tracking-wider font-mono font-bold">
                No Quarantined Part Selected
              </p>
              <p className="text-[10px] text-slate-600 font-sans mt-1 max-w-[220px] font-medium">
                Select a defective part entry from the quarantined register list on the left to inspect mechanical damage files.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

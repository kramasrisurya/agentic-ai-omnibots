/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Clock, Truck, DollarSign, Archive } from "lucide-react";
import { LedgerEntry, Criticality } from "../types";

interface LedgerProps {
  ledger: LedgerEntry[];
}

export default function Ledger({ ledger }: LedgerProps) {
  const [passedOpen, setPassedOpen] = useState(true);
  const [rejectedOpen, setRejectedOpen] = useState(true);

  // Separate passed vs rejected
  // Newest first is assumed (we will push to front or reverse)
  const passedEntries = ledger.filter((entry) => entry.outcome === "passed");
  const rejectedEntries = ledger.filter((entry) => entry.outcome === "rejected");

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper for criticality badge
  const getCriticalityBadge = (criticality: Criticality) => {
    switch (criticality) {
      case "critical":
        return (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-rose-950 text-rose-400 border border-rose-500/30">
            CRITICAL
          </span>
        );
      case "standard":
        return (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-950 text-amber-400 border border-amber-500/30">
            STANDARD
          </span>
        );
      case "low-priority":
        return (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            LOW PRIORITY
          </span>
        );
    }
  };

  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full flex flex-col gap-4 shadow-xl select-none" id="ledger-panel">
      {/* Panel Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Archive className="w-4 h-4 text-cyan-400" />
        <h2 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider">
          Parts Audit Ledger
        </h2>
      </div>

      {/* Ledger Sections */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" id="ledger-sections-container">
        {/* SECTION 1: REJECTED / DAMAGED */}
        <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setRejectedOpen(!rejectedOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-rose-950/20 text-rose-400 hover:bg-rose-950/30 transition-colors border-b border-slate-800/60"
            aria-expanded={rejectedOpen}
          >
            <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Damaged / Rejected</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-mono">
                {rejectedEntries.length}
              </span>
            </div>
            {rejectedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {rejectedOpen && (
            <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto scroll-container" id="rejected-ledger-list">
              {rejectedEntries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  No damaged parts logged yet.
                </div>
              ) : (
                rejectedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 hover:border-rose-500/30 transition-all shadow-sm"
                  >
                    {/* Part Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-100">
                            {entry.part_id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {entry.id}
                          </span>
                        </div>
                        <h4 className="text-xs text-slate-300 font-sans font-medium leading-tight mt-0.5">
                          {entry.part_name}
                        </h4>
                      </div>
                      {getCriticalityBadge(entry.criticality)}
                    </div>

                    {/* Defect Metadata */}
                    <div className="mt-2 text-[11px] font-mono font-medium text-rose-400 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                      Defect: {entry.defectType || "Surface Degradation"}
                    </div>

                    {/* Procurement Resolution (from Procurement Agent) */}
                    {entry.chosenSupplierId ? (
                      <div className="mt-2 pt-2 border-t border-slate-900 space-y-1 text-[10px] text-slate-400">
                        <div className="font-sans font-bold text-slate-500 text-[9px] tracking-wider uppercase">
                          Procurement Resolution:
                        </div>
                        <div className="flex items-center gap-1 text-amber-400/95 font-semibold">
                          <Truck className="w-3 h-3 text-slate-500" />
                          <span>Ordered from:</span>
                          <span className="text-slate-200">{entry.chosenSupplierName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="flex items-center gap-1 font-mono">
                            <DollarSign className="w-3 h-3 text-slate-500" />
                            <span>Cost: {formatCurrency(entry.orderCost || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Delivery: {entry.deliveryDays} day(s)</span>
                          </div>
                        </div>
                        {entry.tradeOffIgnored && (
                          <p className="text-[9px] leading-relaxed text-slate-500 italic mt-1 bg-slate-900/50 p-1 rounded border border-slate-900">
                            {entry.tradeOffIgnored}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500 italic animate-pulse">
                        Resolving sourcing options...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: GOOD / PASSED */}
        <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setPassedOpen(!passedOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/20 transition-colors border-b border-slate-800/60"
            aria-expanded={passedOpen}
          >
            <div className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Good / Passed</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
                {passedEntries.length}
              </span>
            </div>
            {passedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {passedOpen && (
            <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto scroll-container" id="passed-ledger-list">
              {passedEntries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  No passed parts logged yet.
                </div>
              ) : (
                passedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2 bg-slate-950 rounded border border-slate-900 hover:border-slate-800 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {entry.part_id}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">
                          {entry.id}
                        </span>
                      </div>
                      <h4 className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5">
                        {entry.part_name}
                      </h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[8px] text-slate-600 font-mono">
                        {entry.timestamp}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-0.5 mt-0.5">
                        <ShieldCheck className="w-3 h-3" /> OK
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

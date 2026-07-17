/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Layers,
  Award,
  Globe,
  ArrowRight,
  TrendingUp,
  Clock,
  Coins,
  Cpu,
  BookmarkCheck,
} from "lucide-react";
import { PARTS_CATALOG, SUPPLIERS_DB, Part, Supplier } from "../types";
import Part3DModel from "../components/Part3DModel";

export default function SupplierPage() {
  const [selectedPartId, setSelectedPartId] = useState<string>("SNS-07");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedPart = PARTS_CATALOG.find((p) => p.part_id === selectedPartId)!;
  const suppliers = SUPPLIERS_DB[selectedPartId] || [];

  // Filter parts catalog
  const filteredParts = PARTS_CATALOG.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.part_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting: First is fastest (S-A), second is cheapest (S-B), third is balanced (S-C)
  const fastestSupplier = suppliers[0];
  const cheapestSupplier = suppliers[1];
  const balancedSupplier = suppliers[2];

  return (
    <div className="space-y-6" id="supplier-intelligence-page">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-500/15 via-white/55 to-transparent border border-white/65 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-emerald-700 uppercase font-black">
              [MULTI-AGENT SUPPLY CHAIN MATRICES &amp; CRITICALITY REGISTER]
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-indigo-950 tracking-tight">
            Supplier Intelligence Registry
          </h1>
          <p className="text-xs text-slate-800 mt-1 max-w-xl font-semibold">
            Query pre-cleared industrial suppliers, verify contract logistics, and examine active SLA parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-indigo-950 bg-white/60 border border-white/80 px-3 py-1.5 rounded-xl shadow-sm">
          <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="font-bold">Active Vendors Indexed: 24 (Global Network)</span>
        </div>
      </div>

      {/* Main Split Layout: Left is Part List, Right is Sourcing Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Part Criticality Selector */}
        <div className="lg:col-span-4 glass-panel border border-white/60 rounded-3xl p-5 flex flex-col h-[520px] shadow-lg">
          <div className="space-y-3 pb-3 border-b border-white/45 mb-3 shrink-0">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 animate-pulse" /> [Criticality Registry Explorer]
            </h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
              <input
                type="text"
                placeholder="Search registered parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 border border-white/90 rounded-xl py-1 pl-8 pr-3 text-xs focus:outline-none focus:border-indigo-500 text-indigo-950 font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Parts List */}
          <div className="flex-1 overflow-y-auto scroll-container space-y-1.5 pr-1">
            {filteredParts.map((p) => {
              const isSelected = p.part_id === selectedPartId;
              return (
                <button
                  key={p.part_id}
                  onClick={() => setSelectedPartId(p.part_id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-white/95 border-indigo-400 text-indigo-950 font-black shadow-sm"
                      : "bg-white/40 border-white/60 hover:bg-white/65 text-slate-800"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-black block opacity-60">
                      PART ID: {p.part_id}
                    </span>
                    <span className="text-xs truncate block mt-0.5 font-bold">{p.name}</span>
                  </div>

                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border uppercase shrink-0 ${
                    p.criticality === "critical"
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-700"
                      : p.criticality === "standard"
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-700"
                      : "bg-slate-100 border-slate-300 text-slate-600"
                  }`}>
                    {p.criticality.replace("-priority", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Active Supplier Comparisons */}
        <div className="lg:col-span-8 space-y-6">
          {/* Supplier Grid cards */}
          <div className="glass-panel border border-white/60 rounded-3xl p-5 relative shadow-lg">
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider pb-3 border-b border-white/45 mb-4 flex items-center justify-between">
              <span>[Sourcing Matrix: {selectedPart.name} ({selectedPart.part_id})]</span>
              <span className="text-[9px] font-mono text-slate-600 font-bold">MCP TOOL: search_suppliers</span>
            </h3>

            {/* Side by side comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* FASTEST */}
              {fastestSupplier && (
                <div className="bg-white/60 border border-white/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden h-[240px] hover:border-rose-500/40 hover:bg-white/70 transition-all shadow-sm">
                  <div className="absolute top-0 right-0 p-2 bg-rose-500/15 border-b border-l border-rose-500/35 rounded-bl-lg text-[8px] font-mono text-rose-700 font-black uppercase tracking-widest">
                    Fastest Delivery
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-black text-indigo-950 truncate">{fastestSupplier.name}</p>
                    <span className="text-[9px] font-mono text-slate-600 font-bold block">ID: {fastestSupplier.supplier_id}</span>
                  </div>

                  <div className="py-4 space-y-2 border-y border-white/60 font-mono">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Lead Time:</span>
                      <span className="text-rose-600 font-black flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {fastestSupplier.delivery_days} Day
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Contract Cost:</span>
                      <span className="text-indigo-950 font-black">${fastestSupplier.cost}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-800 leading-snug pt-2 font-medium">
                    Priority shipping route via express aerospace carrier. Clears customs in 2h.
                  </p>
                </div>
              )}

              {/* CHEAPEST */}
              {cheapestSupplier && (
                <div className="bg-white/60 border border-white/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden h-[240px] hover:border-emerald-500/40 hover:bg-white/70 transition-all shadow-sm">
                  <div className="absolute top-0 right-0 p-2 bg-emerald-500/15 border-b border-l border-emerald-500/35 rounded-bl-lg text-[8px] font-mono text-emerald-700 font-black uppercase tracking-widest">
                    Lowest Cost
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-black text-indigo-950 truncate">{cheapestSupplier.name}</p>
                    <span className="text-[9px] font-mono text-slate-600 font-bold block">ID: {cheapestSupplier.supplier_id}</span>
                  </div>

                  <div className="py-4 space-y-2 border-y border-white/60 font-mono">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Lead Time:</span>
                      <span className="text-indigo-950 font-black">{cheapestSupplier.delivery_days} Days</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Contract Cost:</span>
                      <span className="text-emerald-700 font-black flex items-center gap-1">
                        <Coins className="w-3 h-3" /> ${cheapestSupplier.cost}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-800 leading-snug pt-2 font-medium">
                    Bulk cargo oceanic/train route. Extended lead times. Standard quality validation.
                  </p>
                </div>
              )}

              {/* BALANCED */}
              {balancedSupplier && (
                <div className="bg-white/60 border border-white/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden h-[240px] hover:border-cyan-500/40 hover:bg-white/70 transition-all shadow-sm">
                  <div className="absolute top-0 right-0 p-2 bg-cyan-500/15 border-b border-l border-cyan-500/35 rounded-bl-lg text-[8px] font-mono text-cyan-700 font-black uppercase tracking-widest">
                    Balanced Range
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-black text-indigo-950 truncate">{balancedSupplier.name}</p>
                    <span className="text-[9px] font-mono text-slate-600 font-bold block">ID: {balancedSupplier.supplier_id}</span>
                  </div>

                  <div className="py-4 space-y-2 border-y border-white/60 font-mono">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Lead Time:</span>
                      <span className="text-slate-800 font-black">{balancedSupplier.delivery_days} Days</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Contract Cost:</span>
                      <span className="text-slate-800 font-black">${balancedSupplier.cost}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-800 leading-snug pt-2 font-medium">
                    Truck line logistics. Intermediate cost range. Moderate supply chain resilience.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Sourcing Suggestions & Policy Rules */}
          <div className="glass-panel border border-white/60 rounded-3xl p-5 shadow-lg">
            <h3 className="font-display font-black text-xs text-indigo-950 uppercase tracking-wider pb-3 border-b border-white/45 mb-4 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-cyan-600 animate-pulse" /> [Sourcing Policy &amp; SLA Guidelines]
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white/50 border border-white/85 rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] text-rose-700 font-mono font-black block uppercase tracking-wider">
                  ⚠️ FOR CRITICAL CLASSIFICATIONS
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  <strong>Priority Rule:</strong> Sourcing dispatch is hardcoded to <strong>minimize lead times</strong> at all costs to avoid assembly stoppages. 
                  <span className="text-slate-600 block mt-1.5 font-semibold">
                    If {selectedPart.name} fails, the agent will select <strong>{fastestSupplier?.name}</strong>, ignoring cheaper prices to secure standard 1-2 day turnaround.
                  </span>
                </p>
              </div>

              <div className="p-3.5 bg-white/50 border border-white/85 rounded-2xl space-y-2 shadow-sm">
                <span className="text-[10px] text-emerald-700 font-mono font-black block uppercase tracking-wider">
                  ✅ FOR STANDARD / LOW PRIORITY
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  <strong>Priority Rule:</strong> Sourcing dispatch is hardcoded to <strong>minimize procurement cost</strong>, allowing longer transit delays.
                  <span className="text-slate-600 block mt-1.5 font-semibold">
                    If {selectedPart.name} fails, the agent will select <strong>{cheapestSupplier?.name}</strong>, saving budget despite the 12-15 day logistics backlog.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

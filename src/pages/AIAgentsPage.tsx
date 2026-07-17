/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Terminal,
  Activity,
  Bot,
  MemoryStick,
  Clock,
  ChevronDown,
  ChevronUp,
  Sliders,
  Database,
} from "lucide-react";
import { AgentLogEntry } from "../types";

interface AIAgentsPageProps {
  logs: AgentLogEntry[];
}

export default function AIAgentsPage({ logs }: AIAgentsPageProps) {
  const [activeTab, setActiveTab] = useState<"vision" | "triage" | "procurement" | "supplier">("vision");
  const [showPrompts, setShowPrompts] = useState<Record<string, boolean>>({
    vision: false,
    triage: false,
    procurement: false,
    supplier: false,
  });

  const togglePrompt = (agent: string) => {
    setShowPrompts((prev) => ({ ...prev, [agent]: !prev[agent] }));
  };

  // Agent Specific Specifications
  const agentSpecs = {
    vision: {
      name: "AI Vision Contour & Defect Classifier",
      role: "Performs localized optical pixel scan analysis to detect physical structural defects.",
      executionTime: "45ms",
      status: "ACTIVE STROBE BACKLIGHTING",
      mcpTools: ["opencv-contour-vector-scan", "heat-map-overlay"],
      prompt: `ROLE: Lead Mechanical QC Vision Model
TASK: Inspect mechanical components on high-speed conveyor.
PROCEDURE:
1. Grabs frame from line camera strobe coordinate.
2. Applies localized FFT noise filters to isolate bezel edges.
3. Maps dimensions against CAD blueprint vector files (tolerance: ±0.05mm).
4. Classifies anomaly signatures: surface scratch, thermal void, cracked molding, solder void.
5. Emits normalized confidence coefficients [0.0 - 1.0].`,
      memory: "Active frame buffer slot A2. Frame coordinates X:112, Y:89. Reference standard CAD file: SNS-07_v4.2.",
    },
    triage: {
      name: "Triage & Escalation Dispatcher",
      role: "Evaluates part criticality classifications and executes immediate isolation alerts.",
      executionTime: "12ms",
      status: "NOMINAL",
      mcpTools: ["reject_item", "part-criticality-registry"],
      prompt: `ROLE: Manufacturing Safety Dispatch Agent
TASK: Analyze classification weights of defective components.
PROCEDURE:
1. Receives defect classifications from Vision Agent.
2. References MCP Resource 'part-criticality-registry' for specific SLA classification class (Critical, Standard, Low).
3. If 'critical': Flag immediate high-priority warning. Stop non-essential lines. Dispatch replacement order task to Procurement Agent.
4. If 'standard': Flag medium-priority warning. Keep assembly lines spinning. Route reorder tasks.
5. If 'low': Queue buffer inventory replacement logs. Clean up quarantine indicators.`,
      memory: "Last lookup entry: SNS-07 (Level: CRITICAL). Alert routing queue: SOURCING_AGENT_PROMPT.",
    },
    procurement: {
      name: "Procurement Sourcing Specialist",
      role: "Assesses commercial quotes and manages replacement contracts, automatically routing to express shipping (high cost) for high-defect items, or low-cost slow shipping for low-defect items.",
      executionTime: "110ms",
      status: "LISTENING ON PO_DISPATCH",
      mcpTools: ["search_suppliers", "place_order"],
      prompt: `ROLE: Lead Commercial Sourcing Agent
TASK: Solve replacement procurement under adaptive operational limits.
PROCEDURE:
1. Query MCP Tool 'search_suppliers' for current vendor rates, shipping timeframes, and stock counts.
2. Check previous defect occurrences for this part ID in the ledger:
   - CASE (Defect occurrences in ledger >= 2): Urgency level is CRITICAL. Enforce speed optimization. Select supplier with minimum delivery time (Express Shipping), ignoring high shipping costs.
   - CASE (Defect occurrences in ledger < 2): Urgency level is LOW. Enforce budget optimization. Select supplier with minimum unit cost (Standard Late Shipping), opting for cheaper, slower delivery.
3. Dispatch replacement purchase order via MCP Tool 'place_order'.`,
      memory: "Defect-rate tracking enabled. Comparing historic part failures against vendor lead times. Active constraint: DEFECT_COUNT_ADAPTIVE_ROUTING.",
    },
    supplier: {
      name: "Supplier Network Negotiator",
      role: "Monitors vendor logistics backlogs, audits shipping status, and rates supplier SLA compliance.",
      executionTime: "185ms",
      status: "LOGISTICS MONITOR NOMINAL",
      mcpTools: ["audit_vendor_latency", "supplier-slas"],
      prompt: `ROLE: Supply Chain Relationship Agent
TASK: Audit real-time supplier backlog coefficients.
PROCEDURE:
1. Poll supplier delivery latency logs.
2. Compile and score historical contract completion metrics (lead time vs actual delivery).
3. Update supplier-slas resource weights.
4. Rate suppliers by speed compliance, price transparency, and structural failure rates.`,
      memory: "Scored 24 vendors in registry. S-A Sourcing Group rating: 98.4 (Tier 1 Premium). S-B Group rating: 78.1 (Tier 2 Bulk).",
    },
  };

  const activeSpec = agentSpecs[activeTab];

  // Filter logs for selected agent
  const getAgentLogName = () => {
    if (activeTab === "vision") return "System Check"; // vision outputs mostly are system/vision checks
    if (activeTab === "triage") return "Triage Agent";
    return "Procurement Agent";
  };
  const filteredLogs = logs.filter((log) => log.agent === getAgentLogName()).slice(0, 10);

  return (
    <div className="space-y-6" id="ai-operations-center">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-500/15 via-white/55 to-transparent border border-white/65 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#818cf8_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-indigo-700 uppercase font-black">
              [MULTI-AGENT OPERATIONS CONTROL &amp; NEURAL DISPATCH]
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-indigo-950 tracking-tight">
            AI Operations Center
          </h1>
          <p className="text-xs text-slate-800 mt-1 max-w-xl font-semibold">
            Audit system prompt directives, monitor model execution latencies, and supervise active MCP tool calls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] text-indigo-950 bg-white/60 border border-white/80 px-3 py-1.5 rounded-xl shadow-sm">
          <Bot className="w-4 h-4 text-indigo-600 animate-bounce" />
          <span className="font-bold">Active Cognitive Agents: 4 Dispatched</span>
        </div>
      </div>

      {/* Main Grid Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Selector Tabs */}
        <div className="lg:col-span-4 glass-panel border border-white/60 rounded-3xl p-5 space-y-2.5 h-[520px] shrink-0 shadow-lg">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-600 pb-2 border-b border-white/45">
            Select Active Cognitive Agent
          </h3>

          <button
            onClick={() => setActiveTab("vision")}
            className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "vision"
                ? "bg-white/95 border-indigo-400 text-indigo-950 font-black shadow-sm"
                : "bg-white/40 border-white/60 text-slate-800 hover:bg-white/65"
            }`}
          >
            <Activity className="w-4.5 h-4.5 text-cyan-600 animate-pulse" />
            <div className="min-w-0">
              <span className="text-xs block font-bold">AI Vision Classifier</span>
              <span className="text-[9px] font-mono opacity-60 uppercase block mt-0.5">LATENCY: 45MS</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("triage")}
            className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "triage"
                ? "bg-white/95 border-indigo-400 text-indigo-950 font-black shadow-sm"
                : "bg-white/40 border-white/60 text-slate-800 hover:bg-white/65"
            }`}
          >
            <Bot className="w-4.5 h-4.5 text-indigo-600" />
            <div className="min-w-0">
              <span className="text-xs block font-bold">Triage Agent</span>
              <span className="text-[9px] font-mono opacity-60 uppercase block mt-0.5">LATENCY: 12MS</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("procurement")}
            className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "procurement"
                ? "bg-white/95 border-indigo-400 text-indigo-950 font-black shadow-sm"
                : "bg-white/40 border-white/60 text-slate-800 hover:bg-white/65"
            }`}
          >
            <Sliders className="w-4.5 h-4.5 text-amber-600" />
            <div className="min-w-0">
              <span className="text-xs block font-bold">Procurement Agent</span>
              <span className="text-[9px] font-mono opacity-60 uppercase block mt-0.5">LATENCY: 110MS</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("supplier")}
            className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "supplier"
                ? "bg-white/95 border-indigo-400 text-indigo-950 font-black shadow-sm"
                : "bg-white/40 border-white/60 text-slate-800 hover:bg-white/65"
            }`}
          >
            <Database className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
            <div className="min-w-0">
              <span className="text-xs block font-bold">Supplier Network Agent</span>
              <span className="text-[9px] font-mono opacity-60 uppercase block mt-0.5">LATENCY: 185MS</span>
            </div>
          </button>
        </div>

        {/* Right Panel: Selected Agent Specifications & Working Memory */}
        <div className="lg:col-span-8 glass-panel border border-white/60 rounded-3xl p-5 h-[520px] flex flex-col justify-between overflow-y-auto scroll-container pr-3 shadow-lg">
          
          <div className="space-y-4">
            {/* Header Spec */}
            <div className="border-b border-white/45 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0">
              <div>
                <h2 className="text-base font-display font-black text-indigo-950 flex items-center gap-1.5">
                  <Bot className="w-5 h-5 text-indigo-600 animate-pulse" /> {activeSpec.name}
                </h2>
                <p className="text-xs text-slate-700 font-semibold mt-1">
                  {activeSpec.role}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase">
                  {activeSpec.status}
                </span>
                <span className="text-[9px] font-mono text-cyan-700 bg-cyan-500/15 border border-cyan-500/20 px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {activeSpec.executionTime}
                </span>
              </div>
            </div>

            {/* MCP tools & Working Memory Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Working Memory */}
              <div className="bg-white/50 border border-white/80 rounded-2xl p-4 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700 uppercase font-black">
                  <MemoryStick className="w-3.5 h-3.5 text-cyan-600" /> Current Cognitive Memory
                </div>
                <p className="text-xs text-slate-800 font-sans leading-relaxed font-semibold">
                  {activeSpec.memory}
                </p>
              </div>

              {/* MCP Tools registry */}
              <div className="bg-white/50 border border-white/80 rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-700 uppercase font-black">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Dispatched MCP Interfaces
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeSpec.mcpTools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] font-mono bg-white/70 border border-white/95 px-2 py-0.5 rounded-full text-indigo-700 font-black shadow-sm"
                    >
                      {tool}()
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* System Prompt (Expandable) */}
            <div className="border border-white/60 rounded-2xl overflow-hidden bg-white/40 shadow-sm">
              <button
                onClick={() => togglePrompt(activeTab)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/60 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-mono text-indigo-950 uppercase font-black">
                    System Instruction Prompt Directive
                  </span>
                </div>
                {showPrompts[activeTab] ? (
                  <ChevronUp className="w-4.5 h-4.5 text-slate-600 font-bold" />
                ) : (
                  <ChevronDown className="w-4.5 h-4.5 text-slate-600 font-bold" />
                )}
              </button>

              {showPrompts[activeTab] && (
                <div className="p-3.5 border-t border-white/45 bg-white/50 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto scroll-container font-medium">
                  {activeSpec.prompt}
                </div>
              )}
            </div>
          </div>

          {/* Active Logs output */}
          <div className="border border-white/45 rounded-2xl bg-white/30 p-4 space-y-2 mt-4 shrink-0 shadow-inner">
            <h4 className="text-[10px] font-mono text-slate-700 uppercase font-black tracking-wider">
              Recent Live Logs for {activeSpec.name}
            </h4>

            {filteredLogs.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono italic">
                No active execution records registered for this agent session yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto scroll-container">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="text-[11px] font-mono flex items-start gap-2 leading-relaxed">
                    <span className="text-indigo-600 font-bold shrink-0">[{log.timestamp}]</span>
                    <span className="text-emerald-600 font-black shrink-0">[{log.id}]</span>
                    <p className="text-slate-800 truncate font-semibold">{log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

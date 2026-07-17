/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { AgentLogEntry } from "../types";

interface LogsPageProps {
  logs: AgentLogEntry[];
  onClearLogs: () => void;
}

export default function LogsPage({ logs, onClearLogs }: LogsPageProps) {
  const [filterType, setFilterType] = useState<"ALL" | "INFO" | "WARNING" | "DECISION">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal to bottom when streaming new logs
  useEffect(() => {
    if (isStreaming && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs.length, isStreaming]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "ALL") return matchesSearch;
    if (filterType === "INFO") return log.type === "info" && matchesSearch;
    if (filterType === "WARNING") return log.type === "warning" && matchesSearch;
    return (log.type === "decision" || log.type === "success") && matchesSearch;
  });

  const handleDownload = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  return (
    <div className="space-y-6" id="terminal-logs-page">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-emerald-500 text-emerald-800 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce font-mono text-xs">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          <span className="font-bold">TERMINAL SECURE BUFFER WRITTEN TO /LOGS_EX_RAW_{Date.now().toString().slice(-4)}.TXT</span>
        </div>
      )}

      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-500/15 via-white/55 to-transparent border border-white/65 rounded-3xl relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-700 uppercase font-black">
              [CENTRAL UNIX TERMINAL &amp; COMPILE TELEMETRY]
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-indigo-950 tracking-tight">
            System Console Logs
          </h1>
          <p className="text-xs text-slate-800 mt-1 max-w-xl font-semibold">
            Query background worker execution, inspect live multi-agent TCP sockets, and debug raw telemetry values.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isStreaming
                ? "bg-indigo-950 border-transparent text-white"
                : "bg-white/60 border-white/80 text-slate-700 hover:bg-white/85"
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-cyan-400" /> Stop Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-indigo-500" /> Start Stream
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-white/60 hover:bg-white/85 text-slate-800 border border-white/80 hover:border-indigo-500/30 text-xs font-bold font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" /> Export Raw Buffer
          </button>

          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/20 text-xs font-bold font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Clear Buffer
          </button>
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl flex flex-col h-[520px] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500/10 via-transparent" />
        
        {/* Terminal Header controls */}
        <div className="bg-white/60 border-b border-white/45 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Pills filters */}
          <div className="flex gap-1.5">
            {["ALL", "INFO", "WARNING", "DECISION"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-cyan-500/15 text-cyan-700 border border-cyan-500/30"
                    : "hover:bg-white/80 text-slate-600 border border-transparent"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Inline search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search active terminal state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 border border-white/95 rounded-xl py-1 pl-8 pr-3 text-[11px] focus:outline-none focus:border-cyan-500 text-indigo-950 font-mono shadow-inner"
            />
          </div>
        </div>

        {/* Real logs lines scroll area */}
        <div className="flex-1 p-4 overflow-y-auto scroll-container font-mono text-xs leading-relaxed space-y-2 text-slate-800">
          <div className="text-slate-500 text-[11px] select-none pb-2 border-b border-indigo-950/10 font-bold">
            * CENTRAL SYSTEM LOG BUFFER ACTIVE *
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-mono italic">
              No active logs detected matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              // Color tags based on log type
              const getLogColor = (type: string) => {
                switch (type) {
                  case "warning":
                    return "text-rose-700";
                  case "success":
                    return "text-emerald-700";
                  case "decision":
                    return "text-cyan-700";
                  default:
                    return "text-indigo-900";
                }
              };

              return (
                <div key={log.id} className="flex items-start gap-2.5 hover:bg-white/40 py-0.5 px-1 rounded-md transition-colors">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                  <span className={`font-black shrink-0 uppercase text-[10px] ${getLogColor(log.type)}`}>
                    [{log.agent.replace(" Agent", "")}]
                  </span>
                  <p className="text-indigo-950 font-medium leading-normal flex-1 font-mono text-[11px] whitespace-pre-wrap">
                    {log.message}
                  </p>
                </div>
              );
            })
          )}

          {/* Anchoring point for automatic scroll */}
          <div ref={terminalEndRef} />
        </div>

        {/* Footer info stats bar */}
        <div className="bg-white/60 border-t border-white/45 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-600 shrink-0 select-none font-bold">
          <span className="flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isStreaming ? "animate-spin" : ""}`} />
            {isStreaming ? "STREAMING TELEMETRY FLOW ACTIVE" : "STREAMING TELEMETRY SUSPENDED"}
          </span>
          <span>Buffer: {filteredLogs.length} Lines shown</span>
        </div>
      </div>
    </div>
  );
}

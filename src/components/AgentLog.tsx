/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { Terminal, Shield, Cpu, RefreshCw, Layers } from "lucide-react";
import { AgentLogEntry } from "../types";

interface AgentLogProps {
  logs: AgentLogEntry[];
}

export default function AgentLog({ logs }: AgentLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll horizontally to the far right on new logs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: "smooth"
      });
    }
  }, [logs]);

  // Helper for line color coding
  const getLineStyles = (entry: AgentLogEntry) => {
    switch (entry.agent) {
      case "Triage Agent":
        return {
          agentColor: "text-cyan-400",
          bgClass: "bg-cyan-950/20 border-l-2 border-cyan-500/50",
          messageColor: "text-slate-200",
          icon: <Shield className="w-4 h-4 text-cyan-400 shrink-0" />,
        };
      case "Procurement Agent":
        return {
          agentColor: "text-amber-400",
          bgClass: "bg-amber-950/20 border-l-2 border-amber-500/50",
          messageColor: "text-slate-200",
          icon: <Cpu className="w-4 h-4 text-amber-400 shrink-0" />,
        };
      case "System Check":
        return {
          agentColor: "text-violet-400",
          bgClass: "bg-violet-950/25 border-l-2 border-violet-500/50",
          messageColor: "text-violet-200",
          icon: <RefreshCw className="w-4 h-4 text-violet-400 shrink-0 animate-spin" style={{ animationDuration: "3s" }} />,
        };
      default:
        return {
          agentColor: "text-slate-400",
          bgClass: "bg-slate-900/30 border-l-2 border-slate-700/50",
          messageColor: "text-slate-300",
          icon: <Layers className="w-4 h-4 text-slate-500 shrink-0" />,
        };
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full shadow-2xl relative" id="agent-log-panel">
      {/* Terminal Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 rounded-t-xl flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-widest">
            Agent Reasoning Stream (Horizontal Timeline)
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>MCP PROTOCOL ACTIVE</span>
        </div>
      </div>

      {/* Terminal Console Feed - Horizontal Scrolling */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto p-4 font-mono text-xs flex flex-row gap-3.5 items-stretch select-text scroll-container"
        id="agent-log-console"
      >
        {/* Welcome message when console is empty */}
        {logs.length === 0 ? (
          <div className="text-slate-600 flex items-center justify-center w-full italic">
            Waiting for factory cycle to begin...
          </div>
        ) : (
          logs.map((entry) => {
            const styles = getLineStyles(entry);
            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded-lg ${styles.bgClass} flex flex-col justify-between shrink-0 w-[380px] border border-slate-800/80 hover:border-cyan-500/30 transition-all hover:bg-slate-900/30 shadow-sm`}
              >
                {/* Log Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/40 pb-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    {styles.icon}
                    <span className={`font-bold text-xs ${styles.agentColor}`}>
                      {entry.agent}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {entry.partId && (
                      <span className="text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 text-slate-500 rounded border border-slate-800 font-normal uppercase">
                        {entry.partId}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-600 font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {entry.timestamp}
                    </span>
                  </div>
                </div>

                {/* Log Text Content */}
                <div className="flex-1 overflow-y-auto mt-2 pr-1 scroll-container">
                  <p className={`leading-relaxed text-[11px] whitespace-pre-wrap ${styles.messageColor}`}>
                    {entry.message}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Console Caret Blink Card */}
        <div className="flex flex-col justify-center items-center shrink-0 w-48 bg-slate-900/10 border border-dashed border-slate-800/80 rounded-lg p-3 text-slate-500 text-[10px] text-center">
          <div className="flex items-center gap-1.5">
            <span>&gt; pipeline active</span>
            <span className="w-1.5 h-3 bg-cyan-400 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </div>
  );
}


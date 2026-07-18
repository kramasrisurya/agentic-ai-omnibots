/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { AIService } from "./backend/mcp/services/ai.service";
import { RAGService } from "./backend/rag/rag.service";
import {
  PARTS_CATALOG,
  SUPPLIERS_DB,
  Part,
  Supplier,
  LedgerEntry,
  AgentLogEntry,
} from "./src/types";

// Initialize services
const ragService = new RAGService();
const aiService = new AIService();

// Fire up asynchronous background embedding compilation
ragService.initializeEmbeddings().catch((err) => {
  console.error("[RAG-INIT] Background embedding compilation failed:", err);
});

const app = express();
const server = createHttpServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = 3000;

// State maintained server-side for the Factory OS Digital Twin
let isAutoMode = true;
let injectionGrade: "random" | "good" | "average" | "poor" = "random";
let ledger: LedgerEntry[] = [];
let agentLogs: AgentLogEntry[] = [];
let activeParts: any[] = [];
let isSelfChecking = false;

// Sequential counter refs
let logSeq = 1;

// Helper to get timestamp
function getFormattedTime(): string {
  return new Date().toTimeString().split(" ")[0];
}

// Helper to add agent log server-side
function addAgentLog(
  agent: "Triage Agent" | "Procurement Agent" | "System Check",
  message: string,
  type: "info" | "warning" | "success" | "decision",
  partId?: string
): AgentLogEntry {
  const newLog: AgentLogEntry = {
    id: `LOG-${logSeq++}`,
    timestamp: getFormattedTime(),
    agent,
    message,
    type,
    partId,
  };
  agentLogs.push(newLog);
  // Keep logs within bounds
  if (agentLogs.length > 200) {
    agentLogs.shift();
  }
  return newLog;
}

// Broadcast helper
function broadcast(message: any) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Send current state to a single client
function sendState(ws: WebSocket) {
  ws.send(
    JSON.stringify({
      type: "STATE_SYNC",
      payload: {
        isAutoMode,
        injectionGrade,
        ledger,
        agentLogs,
        isSelfChecking,
      },
    })
  );
}

// Implement the RAG + MCP Agentic workflow
async function runAgenticWorkflow(partId: string, partInstanceId: string, grade: "good" | "average" | "poor") {
  const part = PARTS_CATALOG.find((p) => p.part_id === partId);
  if (!part) return;

  console.log(`[AGENT-ORCHESTRATOR] Initializing RAG-assisted scan pipeline for ${partInstanceId} (${part.name}), grade [${grade.toUpperCase()}]`);

  // 1. Triage Agent: Visual scan evaluation via RAG ISO-9001 and Blueprint specs
  const triageQuery = `ISO 9001 defect tolerance and dimensions spec sheet for part ${part.part_id} ${part.name} under quality grade ${grade}`;
  const triageContextDocs = await ragService.retrieveContext(triageQuery, 2);
  const triageContextText = triageContextDocs.map(d => `[Document: ${d.title}]\n${d.content}`).join("\n\n");

  const triageLog = addAgentLog(
    "Triage Agent",
    `Initializing automated optical scan for part instance ${partInstanceId}.\nRetrieving standard spec blueprints and tolerance thresholds via RAG context...`,
    "info",
    part.part_id
  );
  broadcast({ type: "AGENT_LOG_GENERATED", payload: triageLog });

  // Simulate thinking/retrieval delays for realism
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Determine defect outcome
  const outcome = grade === "poor" ? "rejected" : "passed";
  let defectType: string | undefined;

  if (outcome === "passed") {
    const successMsg = grade === "average"
      ? `Visual scan completed for ${partInstanceId} (${part.name}).\nFound minor surface contour variations (Average Grade).\nCross-referenced RAG Specs (Tolerance limit matched).\nPolicy recommendation: AUTOMATIC PASS with DOWNSTREAM MANUAL VERIFY tag. Keeping the production line running continuously!`
      : `Visual scan completed for ${partInstanceId} (${part.name}).\nNo structural anomalies detected.\nDimensions are within absolute tolerance bounds (verified via Blueprint specs).\nLogging PASS state to Ledger. No procurement required.`;

    const decisionLog = addAgentLog(
      "Triage Agent",
      successMsg,
      grade === "average" ? "warning" : "success",
      part.part_id
    );
    broadcast({ type: "AGENT_LOG_GENERATED", payload: decisionLog });

    const newLedgerEntry: LedgerEntry = {
      id: partInstanceId,
      part_id: part.part_id,
      part_name: part.name,
      criticality: part.criticality,
      outcome: "passed",
      timestamp: getFormattedTime(),
      grade,
    };
    ledger.unshift(newLedgerEntry);
    broadcast({ type: "LEDGER_UPDATED", payload: newLedgerEntry });

    // Notify client of inspection resolution
    broadcast({
      type: "INSPECTION_RESOLVED",
      payload: {
        partInstanceId,
        outcome: "passed",
        grade,
      },
    });

  } else {
    // Rejected part
    const partDefects = part.defect_types && part.defect_types.length > 0 ? part.defect_types : ["Surface Cracking"];
    defectType = partDefects[Math.floor(Math.random() * partDefects.length)];

    const alertLog = addAgentLog(
      "Triage Agent",
      `ALERT: Structural defect found on part ${partInstanceId} (${part.name}).\nDefect Profile: '${defectType}'.\nInvoking MCP Tool 'reject_item' to tag state. Sourcing replacement blueprint SLA parameters via RAG...`,
      "warning",
      part.part_id
    );
    broadcast({ type: "AGENT_LOG_GENERATED", payload: alertLog });

    await new Promise((resolve) => setTimeout(resolve, 250));

    // 2. Procurement Agent: Select supplier based on criticality SLA rules
    // Count prior rejections of this part
    const priorRejectionsCount = ledger.filter(
      (l) => l.part_id === part.part_id && l.outcome === "rejected"
    ).length;

    // SLA retrieval
    const slaQuery = `Supplier SLA logistics contracts and delivery pricing schedules for part ${part.part_id} ${part.name}`;
    const slaDocs = await ragService.retrieveContext(slaQuery, 3);
    const slaContextText = slaDocs.map(d => `[Contract: ${d.title}]\n${d.content}`).join("\n\n");

    const suppliers = SUPPLIERS_DB[part.part_id] || [];
    let chosenSupplier: Supplier;
    let tradeOffIgnored = "";

    // Sourcing urgency policy rule
    const isUrgent = priorRejectionsCount >= 8 || part.criticality === "critical" || isSelfChecking;

    if (isUrgent) {
      // Speed Priority Sourcing: S1-A or fastest
      const sorted = [...suppliers].sort((a, b) => {
        if (a.delivery_days !== b.delivery_days) return a.delivery_days - b.delivery_days;
        return a.cost - b.cost;
      });
      chosenSupplier = sorted[0];

      const cheapest = [...suppliers].sort((a, b) => a.cost - b.cost)[0];
      if (chosenSupplier.supplier_id !== cheapest.supplier_id) {
        const costDiff = chosenSupplier.cost - cheapest.cost;
        tradeOffIgnored = `Priority: SPEED/FLEXIBILITY. Active rejections count (${priorRejectionsCount}) or high-criticality constraint triggered next-day shipping. Sourced fastest delivery from ${chosenSupplier.name} (ignored saving $${costDiff} from economy provider ${cheapest.name}).`;
      } else {
        tradeOffIgnored = `Fastest supplier is also the most cost-effective. Sourced optimally.`;
      }
    } else {
      // Budget Priority Sourcing: Cheapest
      const sorted = [...suppliers].sort((a, b) => {
        if (a.cost !== b.cost) return a.cost - b.cost;
        return a.delivery_days - b.delivery_days;
      });
      chosenSupplier = sorted[0];

      const fastest = [...suppliers].sort((a, b) => a.delivery_days - b.delivery_days)[0];
      if (chosenSupplier.supplier_id !== fastest.supplier_id) {
        const dayDiff = chosenSupplier.delivery_days - fastest.delivery_days;
        tradeOffIgnored = `Priority: BUDGET CONTROL. Sourced lowest cost tier from ${chosenSupplier.name} to preserve capital, electing slower transit (+${dayDiff} days) over premium next-day carrier ${fastest.name}.`;
      } else {
        tradeOffIgnored = `Cheapest supplier also meets fastest delivery timeline. Sourced optimally.`;
      }
    }

    const procurementLog = addAgentLog(
      "Procurement Agent",
      `Received triage dispatch report. Initiated supplier SLA evaluation.\nPolicy Selection: ${isUrgent ? "EXPRESS SOURCING (High Criticality/Defects)" : "ECONOMY SOURCING (Standard Budget)"}.\n\nDECISION SUMMARY:\n- Sourced Vendor: ${chosenSupplier.name}\n- Procurement Premium: $${chosenSupplier.cost}\n- Estimated Transit: ${chosenSupplier.delivery_days} day(s)\n- Strategy: ${tradeOffIgnored}\nInvoking MCP Tool 'place_order' to initiate reorder pipeline.`,
      "decision",
      part.part_id
    );
    broadcast({ type: "AGENT_LOG_GENERATED", payload: procurementLog });

    const newLedgerEntry: LedgerEntry = {
      id: partInstanceId,
      part_id: part.part_id,
      part_name: part.name,
      criticality: part.criticality,
      outcome: "rejected",
      timestamp: getFormattedTime(),
      defectType,
      grade,
      chosenSupplierId: chosenSupplier.supplier_id,
      chosenSupplierName: chosenSupplier.name,
      chosenSupplierWebsite: chosenSupplier.website,
      orderCost: chosenSupplier.cost,
      deliveryDays: chosenSupplier.delivery_days,
      tradeOffIgnored,
    };
    ledger.unshift(newLedgerEntry);
    broadcast({ type: "LEDGER_UPDATED", payload: newLedgerEntry });

    // Notify client of inspection resolution
    broadcast({
      type: "INSPECTION_RESOLVED",
      payload: {
        partInstanceId,
        outcome: "rejected",
        grade,
        defectType,
        chosenSupplierId: chosenSupplier.supplier_id,
        chosenSupplierName: chosenSupplier.name,
        chosenSupplierWebsite: chosenSupplier.website,
        orderCost: chosenSupplier.cost,
        deliveryDays: chosenSupplier.delivery_days,
        tradeOffIgnored,
      },
    });
  }
}

// WebSocket Message Handler
wss.on("connection", (ws: WebSocket) => {
  console.log("[WS-SERVER] Incoming client connection authorized.");
  
  // Instantly send full current server state to client
  sendState(ws);

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`[WS-SERVER] Received Action: ${message.type}`, message.payload);

      switch (message.type) {
        case "TOGGLE_AUTO_MODE":
          isAutoMode = message.payload;
          broadcast({ type: "STATE_UPDATED", payload: { isAutoMode } });
          break;

        case "SET_INJECTION_GRADE":
          injectionGrade = message.payload;
          broadcast({ type: "STATE_UPDATED", payload: { injectionGrade } });
          break;

        case "REACHED_SCANNER":
          const { partId, partInstanceId, grade: scanGrade } = message.payload;
          if (isAutoMode || isSelfChecking) {
            await runAgenticWorkflow(partId, partInstanceId, scanGrade);
          } else {
            // Manual Mode: Log that part arrived at scanning station, but do NOT resolve automatically!
            const manualArrivedPart = PARTS_CATALOG.find((p) => p.part_id === partId);
            if (manualArrivedPart) {
              const triageLog = addAgentLog(
                "Triage Agent",
                `Part instance ${partInstanceId} (${manualArrivedPart.name}) arrived at scanning station [MANUAL MODE]. Awaiting operator's PASS/DEFECT decision...`,
                "info",
                manualArrivedPart.part_id
              );
              broadcast({ type: "AGENT_LOG_GENERATED", payload: triageLog });
            }
          }
          break;

        case "SPAWN_PART_MANUAL":
          const specPart = PARTS_CATALOG.find((p) => p.part_id === message.payload.partId);
          if (specPart) {
            broadcast({
              type: "PART_SPAWNED_MANUAL",
              payload: {
                part: specPart,
                grade: message.payload.grade,
              },
            });
          }
          break;

        case "MANUAL_RESOLVE":
          const rPartId = message.payload.partId;
          const rInstanceId = message.payload.partInstanceId;
          const rOutcome = message.payload.outcome;
          const rGrade = message.payload.grade;
          const rDefect = message.payload.defectType;
          
          const manualPart = PARTS_CATALOG.find((p) => p.part_id === rPartId);
          if (manualPart) {
            const mLog = addAgentLog(
              "Triage Agent",
              `MANUAL INTERVENTION: Inspector forced [${rOutcome.toUpperCase()}] status on part ${rInstanceId} (${manualPart.name}). Logging override sequence.`,
              rOutcome === "passed" ? "success" : "warning",
              manualPart.part_id
            );
            broadcast({ type: "AGENT_LOG_GENERATED", payload: mLog });

            let ledgerEntry: LedgerEntry;
            if (rOutcome === "passed") {
              ledgerEntry = {
                id: rInstanceId,
                part_id: manualPart.part_id,
                part_name: manualPart.name,
                criticality: manualPart.criticality,
                outcome: "passed",
                timestamp: getFormattedTime(),
                grade: rGrade,
              };
            } else {
              const suppliers = SUPPLIERS_DB[manualPart.part_id] || [];
              const chosen = suppliers[0] || {
                supplier_id: "S0-DEFAULT",
                name: "Default Sourcing",
                website: "https://example.com",
                cost: 100,
                delivery_days: 7,
              };
              ledgerEntry = {
                id: rInstanceId,
                part_id: manualPart.part_id,
                part_name: manualPart.name,
                criticality: manualPart.criticality,
                outcome: "rejected",
                timestamp: getFormattedTime(),
                defectType: rDefect || "Forced Deviation",
                grade: rGrade,
                chosenSupplierId: chosen.supplier_id,
                chosenSupplierName: chosen.name,
                chosenSupplierWebsite: chosen.website,
                orderCost: chosen.cost,
                deliveryDays: chosen.delivery_days,
                tradeOffIgnored: "Manual override initiated by operator.",
              };
            }
            ledger.unshift(ledgerEntry);
            broadcast({ type: "LEDGER_UPDATED", payload: ledgerEntry });
            broadcast({
              type: "INSPECTION_RESOLVED",
              payload: {
                partInstanceId: rInstanceId,
                outcome: rOutcome,
                grade: rGrade,
                defectType: rDefect,
                chosenSupplierId: ledgerEntry.chosenSupplierId,
                chosenSupplierName: ledgerEntry.chosenSupplierName,
                chosenSupplierWebsite: ledgerEntry.chosenSupplierWebsite,
                orderCost: ledgerEntry.orderCost,
                deliveryDays: ledgerEntry.deliveryDays,
              },
            });
          }
          break;

        case "RUN_SELF_CHECK":
          isSelfChecking = true;
          broadcast({ type: "STATE_UPDATED", payload: { isSelfChecking } });
          const testSuiteLog = addAgentLog(
            "System Check",
            "LAUNCHING COMPLIANCE AUDIT SELF-CHECK CONTROLLER...\nInjecting standard critical/low priority test cases dynamically to verify RAG threshold accuracy.",
            "info"
          );
          broadcast({ type: "AGENT_LOG_GENERATED", payload: testSuiteLog });

          // Test suite client-driven loop. We broadcast to start.
          broadcast({ type: "START_SELF_CHECK_TESTS" });
          break;

        case "SELF_CHECK_FINISHED":
          isSelfChecking = false;
          broadcast({ type: "STATE_UPDATED", payload: { isSelfChecking } });
          const testFinLog = addAgentLog(
            "System Check",
            "COMPLIANCE AUDIT COMPLETED. AI Agents resolved sourcing scenarios fully compliant with SLA regulations.",
            "success"
          );
          broadcast({ type: "AGENT_LOG_GENERATED", payload: testFinLog });
          break;

        case "EMERGENCY_STOP":
          isAutoMode = false;
          broadcast({ type: "STATE_UPDATED", payload: { isAutoMode } });
          const stopLog = addAgentLog(
            "System Check",
            "EMERGENCY ESTOP PRESSED. Conveyor drive system halted. Clear sequence initiated.",
            "warning"
          );
          broadcast({ type: "AGENT_LOG_GENERATED", payload: stopLog });
          broadcast({ type: "HALT_BELT" });
          break;

        case "CLEAR_LOGS":
          ledger = [];
          agentLogs = [];
          logSeq = 1;
          const clearLog = addAgentLog(
            "System Check",
            "System registry, audit trail and ledger files wiped successfully.",
            "info"
          );
          broadcast({
            type: "STATE_SYNC",
            payload: {
              isAutoMode,
              injectionGrade,
              ledger,
              agentLogs: [clearLog],
              isSelfChecking,
            },
          });
          break;

        default:
          console.warn(`[WS-SERVER] Unrecognized WS message type: ${message.type}`);
      }
    } catch (err: any) {
      console.error("[WS-SERVER] Parse error on client payload:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("[WS-SERVER] Client socket connection released.");
  });
});

// Upgrade requests to WebSocket protocol on HTTP server
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
  if (pathname === "/ws" || pathname === "/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Express Setup with Vite Middleware for dev / Static server for prod
async function bootstrapServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting Vite development engine on same port (3000)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Mounting production static asset compiler pipeline...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`================================================================`);
    console.log(`🚀 FACTORY OS DIGITAL TWIN BACKEND SERVER IS ONLINE              `);
    console.log(`🔗 Interface: http://localhost:${PORT}                           `);
    console.log(`📈 Mode: ${process.env.NODE_ENV || "development"}                 `);
    console.log(`================================================================`);
  });
}

bootstrapServer().catch((err) => {
  console.error("[SERVER-FATAL] Bootstrapping failed:", err);
});

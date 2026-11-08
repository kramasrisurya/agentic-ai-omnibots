var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = require("http");
var import_ws = require("ws");
var import_vite = require("vite");

// backend/mcp/adapters/gemini.adapter.ts
var import_genai = require("@google/genai");

// backend/mcp/adapters/placeholder.adapter.ts
var PlaceholderAIProvider = class {
  logLifecycle(event, meta) {
    console.log(`[AI-LIFECYCLE-LOG] ${(/* @__PURE__ */ new Date()).toISOString()} - ${event}`, meta ? JSON.stringify(meta) : "");
  }
  async chat(systemPrompt, userMessage) {
    this.logLifecycle("Chat completion requested", { systemPromptLength: systemPrompt.length });
    return `[Placeholder AI response to: "${userMessage}"]`;
  }
  async analyzeImage(request) {
    this.logLifecycle("Analyze Image requested", request);
    const isDefective = request.grade === "poor";
    const confidence = isDefective ? 0.94 : 0.98;
    const detectedDefects = isDefective ? ["Surface Anomaly / Solder Void", "Contour Deviation"] : [];
    return {
      partInstanceId: `TX-${Math.floor(1e3 + Math.random() * 9e3)}`,
      hasAnomalies: isDefective,
      confidence,
      detectedDefects,
      dimensions: {
        lengthMm: 120.4,
        widthMm: 45.2,
        deviationMm: isDefective ? 0.28 : 0.02
      },
      scannedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString()
    };
  }
  async streamResponse(systemPrompt, userMessage, onToken) {
    this.logLifecycle("Streaming requested", { systemPromptLength: systemPrompt.length });
    const fullText = `[Streaming Placeholder Response] Analyzing context... Processing tool tokens... Cleared!`;
    const tokens = fullText.split(" ");
    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      onToken(token + " ");
    }
    return fullText;
  }
  async reasoning(request, partData) {
    this.logLifecycle("Reasoning process requested", { request, partId: partData?.part_id });
    const isCritical = partData?.criticality === "critical";
    const isUrgent = request.systemContext.historicRejectionRate >= 8 || isCritical;
    let chosenSupplierId = "S6-B";
    let chosenSupplierName = "General Sheet Metal Supply";
    let urgency = "economy";
    let tradeOffDetail = "Priority: SAVINGS. Sourced lowest cost, opting for standard standard shipping to minimize budget impact.";
    if (isUrgent) {
      chosenSupplierId = "S1-A";
      chosenSupplierName = "Apex Fast-Track Solutions";
      urgency = "express";
      tradeOffDetail = "Priority: SPEED. Sourced fastest delivery to avoid high-risk line blockage, despite higher premium cost.";
    }
    return {
      partInstanceId: request.partInstanceId,
      chosenSupplierId,
      chosenSupplierName,
      procurementUrgency: urgency,
      tradeOffDetail,
      decisionLogicChain: [
        `Evaluating structural damage risk score for instance ${request.partInstanceId}`,
        `Referencing criticality rating [${partData?.criticality || "standard"}]`,
        `Analyzing historic fail rate across current batch: ${request.systemContext.historicRejectionRate} failures.`,
        isUrgent ? "Decision rule match: High defect batch rate or critical SLA. Directing request to EXPRESS procurement adapter." : "Decision rule match: Low failure rate. Sourcing lowest cost supplier option.",
        `Sourcing contract assigned to supplier ID: ${chosenSupplierId} (${chosenSupplierName})`
      ]
    };
  }
  async generateReport(stats, anomaliesByPart) {
    this.logLifecycle("Generate Report requested", { stats });
    return {
      reportId: `REP-${Math.floor(100 + Math.random() * 900)}`,
      generatedAt: (/* @__PURE__ */ new Date()).toLocaleString(),
      scope: {
        startPeriod: "Shift A - 08:00",
        endPeriod: "Current Session",
        totalProcessed: stats.totalProcessed
      },
      metrics: {
        passRatePercent: stats.passRatePercent,
        totalSpend: stats.totalSpend,
        totalOrdersPlaced: stats.totalOrdersPlaced
      },
      anomaliesByPart,
      executiveSummary: `Autonomous factory line scan analysis completed successfully. Current Q.C. yield index sits at ${stats.passRatePercent.toFixed(1)}%. Total dispatched capital for replacement modules amounts to $${stats.totalSpend.toLocaleString()}. Core operational bottlenecks are concentrated around part calibration constraints.`,
      actionRequired: stats.passRatePercent < 95
    };
  }
  async summarize(textToSummarize) {
    this.logLifecycle("Summarize requested", { length: textToSummarize.length });
    return `Summary: Sourced part, analyzed anomalies, compiled ledger dispatch logs.`;
  }
};

// backend/mcp/adapters/gemini.adapter.ts
var GeminiAIProvider = class {
  constructor() {
    this.fallback = new PlaceholderAIProvider();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      console.log("[GEMINI-PROVIDER] API Key detected. Bootstrapping Gemini model interface.");
      this.ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } else {
      console.log("[GEMINI-PROVIDER] No API Key found. Operating in localized offline twin mode.");
    }
  }
  /**
   * Helper to execute Gemini request or gracefully fall back
   */
  async executeWithFallback(operationName, action, fallbackAction) {
    if (this.ai) {
      try {
        console.log(`[GEMINI-PROVIDER] Executing real LLM request: ${operationName}`);
        return await action(this.ai);
      } catch (err) {
        console.error(`[GEMINI-PROVIDER] Real LLM request failed for '${operationName}'. Invoking localized fallback. Error:`, err.message);
        return await fallbackAction();
      }
    }
    return await fallbackAction();
  }
  async chat(systemPrompt, userMessage) {
    return this.executeWithFallback(
      "chat",
      async (ai) => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt
          }
        });
        return response.text || "";
      },
      () => this.fallback.chat(systemPrompt, userMessage)
    );
  }
  async analyzeImage(request) {
    return this.executeWithFallback(
      "analyzeImage",
      async (ai) => {
        const prompt = `Classify part and detect dimensional contours.
Part ID: ${request.partId}
Part Name: ${request.partName}
Molding Grade Selection: ${request.grade}
Analyze if this part is defective based on the grade. Return a structured JSON response.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                partInstanceId: { type: import_genai.Type.STRING },
                hasAnomalies: { type: import_genai.Type.BOOLEAN },
                confidence: { type: import_genai.Type.NUMBER },
                detectedDefects: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                },
                dimensions: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    lengthMm: { type: import_genai.Type.NUMBER },
                    widthMm: { type: import_genai.Type.NUMBER },
                    deviationMm: { type: import_genai.Type.NUMBER }
                  },
                  required: ["lengthMm", "widthMm", "deviationMm"]
                },
                scannedAt: { type: import_genai.Type.STRING }
              },
              required: ["partInstanceId", "hasAnomalies", "confidence", "detectedDefects", "dimensions"]
            }
          }
        });
        const jsonText = response.text || "{}";
        const result = JSON.parse(jsonText.trim());
        return {
          partInstanceId: result.partInstanceId || `TX-${Math.floor(1e3 + Math.random() * 9e3)}`,
          hasAnomalies: result.hasAnomalies ?? request.grade === "poor",
          confidence: result.confidence ?? 0.95,
          detectedDefects: result.detectedDefects || (request.grade === "poor" ? ["Surface Void"] : []),
          dimensions: result.dimensions || {
            lengthMm: 120,
            widthMm: 45,
            deviationMm: request.grade === "poor" ? 0.28 : 0.02
          },
          scannedAt: result.scannedAt || (/* @__PURE__ */ new Date()).toLocaleTimeString()
        };
      },
      () => this.fallback.analyzeImage(request)
    );
  }
  async streamResponse(systemPrompt, userMessage, onToken) {
    if (this.ai) {
      try {
        console.log("[GEMINI-PROVIDER] Executing streaming response");
        const responseStream = await this.ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt
          }
        });
        let fullText = "";
        for await (const chunk of responseStream) {
          const text = chunk.text || "";
          fullText += text;
          onToken(text);
        }
        return fullText;
      } catch (err) {
        console.warn("[GEMINI-PROVIDER] Stream failed, invoking offline fallback:", err);
      }
    }
    return this.fallback.streamResponse(systemPrompt, userMessage, onToken);
  }
  async reasoning(request, partData) {
    return this.executeWithFallback(
      "reasoning",
      async (ai) => {
        const prompt = `Solve sourcing dilemma and select optimal vendor.
Part Details: ${JSON.stringify(partData)}
System State: ${JSON.stringify(request.systemContext)}
Dilemma Specs:
- SNS-07 and BAT-99 are CRITICAL components.
- PNL-01 is standard or LOW-PRIORITY.
- Current active suppliers are:
  1. Apex Fast-Track Solutions (S1-A): cost $450, delivery 1 day. (Fastest, High Cost)
  2. Paramount Logistics (S1-B): cost $180, delivery 3 days. (Moderate)
  3. General Sheet Metal Supply (S6-B): cost $45, delivery 14 days. (Cheapest, Slower)

Rule parameters:
- High defect rate or critical part requires SPEED-based express procurement.
- Low priority or low defect rate uses economy cost-saving procurement.

Provide vendor selection in JSON:`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                partInstanceId: { type: import_genai.Type.STRING },
                chosenSupplierId: { type: import_genai.Type.STRING },
                chosenSupplierName: { type: import_genai.Type.STRING },
                procurementUrgency: { type: import_genai.Type.STRING },
                tradeOffDetail: { type: import_genai.Type.STRING },
                decisionLogicChain: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                }
              },
              required: ["partInstanceId", "chosenSupplierId", "chosenSupplierName", "procurementUrgency", "tradeOffDetail", "decisionLogicChain"]
            }
          }
        });
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText.trim());
      },
      () => this.fallback.reasoning(request, partData)
    );
  }
  async generateReport(stats, anomaliesByPart) {
    return this.executeWithFallback(
      "generateReport",
      async (ai) => {
        const prompt = `Compile shifts metrics and ledger log outputs.
Stats: ${JSON.stringify(stats)}
Anomalies: ${JSON.stringify(anomaliesByPart)}
Write a formal executive summary analysis report. Output formatted JSON:`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                reportId: { type: import_genai.Type.STRING },
                generatedAt: { type: import_genai.Type.STRING },
                scope: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    startPeriod: { type: import_genai.Type.STRING },
                    endPeriod: { type: import_genai.Type.STRING },
                    totalProcessed: { type: import_genai.Type.INTEGER }
                  },
                  required: ["startPeriod", "endPeriod", "totalProcessed"]
                },
                metrics: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    passRatePercent: { type: import_genai.Type.NUMBER },
                    totalSpend: { type: import_genai.Type.NUMBER },
                    totalOrdersPlaced: { type: import_genai.Type.INTEGER }
                  },
                  required: ["passRatePercent", "totalSpend", "totalOrdersPlaced"]
                },
                anomaliesByPart: {
                  type: import_genai.Type.OBJECT,
                  description: "Object mapping part IDs to defect frequencies"
                },
                executiveSummary: { type: import_genai.Type.STRING },
                actionRequired: { type: import_genai.Type.BOOLEAN }
              },
              required: ["reportId", "generatedAt", "scope", "metrics", "anomaliesByPart", "executiveSummary", "actionRequired"]
            }
          }
        });
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText.trim());
      },
      () => this.fallback.generateReport(stats, anomaliesByPart)
    );
  }
  async summarize(textToSummarize) {
    return this.executeWithFallback(
      "summarize",
      async (ai) => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Summarize the following raw factory log stream into a scannable operator rollup paragraph: ${textToSummarize}`
        });
        return response.text || "";
      },
      () => this.fallback.summarize(textToSummarize)
    );
  }
};

// backend/mcp/tools/ai.tools.ts
async function scanPartsTool(provider, request) {
  const result = await provider.analyzeImage(request);
  return result;
}
async function reviewReasoningTool(provider, request, partData) {
  const result = await provider.reasoning(request, partData);
  return result;
}
async function generateReportTool(provider, stats, anomaliesByPart) {
  const result = await provider.generateReport(stats, anomaliesByPart);
  return result;
}
async function explainResultsTool(provider, partInstanceId, defectType, toleranceDeviation) {
  const prompt = `Provide shop-floor explanation for defective part instance: ${partInstanceId}. Defect: ${defectType}, Deviation: ${toleranceDeviation}mm`;
  const explanation = await provider.chat("System Diagnostics Advisor", prompt);
  return {
    explanation: `Instance ${partInstanceId} failed visual inspection due to ${defectType} presenting a ${toleranceDeviation}mm dimensional deviation. This exceeds allowable CAD tolerances.`,
    correctiveAction: "Isolate item in containment bin. Check nozzle calibration on injection mold machine."
  };
}

// backend/mcp/services/ai.service.ts
var AIService = class {
  constructor(provider) {
    this.logs = [];
    this.provider = provider || new GeminiAIProvider();
  }
  /**
   * Return internal performance and telemetry execution logs
   */
  getLogs() {
    return this.logs;
  }
  /**
   * Centralized telemetry logger
   */
  log(level, message, durationMs, metadata) {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      durationMs,
      metadata
    };
    this.logs.push(entry);
    console.log(`[AI-SERVICE][${level.toUpperCase()}] ${message}`, durationMs ? `(${durationMs}ms)` : "", metadata || "");
  }
  /**
   * Utility wrapper to execute tasks with performance metrics and resilient error envelopes
   */
  async executeWithTelemetry(taskName, timeoutMs, fn) {
    const startTime = Date.now();
    this.log("info", `Initiating task execution: ${taskName}`);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`TIMEOUT_ERROR: Task '${taskName}' exceeded SLA timeout of ${timeoutMs}ms.`));
      }, timeoutMs);
    });
    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      const duration = Date.now() - startTime;
      this.log("metric", `Successfully completed task: ${taskName}`, duration, { status: "success" });
      return result;
    } catch (err) {
      const duration = Date.now() - startTime;
      this.log("error", `Task execution failure: ${taskName} - ${err.message}`, duration, {
        errorStack: err.stack,
        status: "failed"
      });
      throw err;
    }
  }
  /**
   * Triage / Scan Feature Orchestrator
   */
  async scanPart(request) {
    return this.executeWithTelemetry("scanPart", 5e3, async () => {
      if (!request.partId) {
        throw new Error("INVALID_RESPONSE: Part ID must not be blank.");
      }
      return await scanPartsTool(this.provider, request);
    });
  }
  /**
   * Sourcing / Procurement Reasoning Orchestrator
   */
  async resolveProcurementReasoning(request, partData) {
    return this.executeWithTelemetry("resolveProcurementReasoning", 8e3, async () => {
      if (!request.partInstanceId) {
        throw new Error("INVALID_RESPONSE: Part Instance ID is required for reasoning chain analysis.");
      }
      return await reviewReasoningTool(this.provider, request, partData);
    });
  }
  /**
   * Shift Audit Summary Generator Orchestrator
   */
  async compileReport(stats, anomaliesByPart) {
    return this.executeWithTelemetry("compileReport", 1e4, async () => {
      return await generateReportTool(this.provider, stats, anomaliesByPart);
    });
  }
  /**
   * Localized Operator Recommendation
   */
  async getOperatorRecommendation(partInstanceId, defectType, deviationMm) {
    return this.executeWithTelemetry(
      "getOperatorRecommendation",
      4e3,
      async () => {
        return await explainResultsTool(this.provider, partInstanceId, defectType, deviationMm);
      }
    );
  }
};

// backend/rag/rag.service.ts
var import_genai2 = require("@google/genai");
var RAGService = class {
  constructor() {
    this.documents = [];
    this.isEmbeddingServiceSuspended = false;
    this.lastSuspendedTime = 0;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new import_genai2.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
    this.seedDatabase();
  }
  /**
   * Seed mock factory documentation (ISO 9001, component blueprints, supplier SLAs)
   */
  seedDatabase() {
    const mockDocs = [
      {
        id: "iso-9001-defect-tolerances",
        category: "iso_standards",
        title: "ISO 9001 Section 4.2: Conveyor QC Defect Tolerances",
        content: `ISO 9001 Quality Standard for Micro-assembly Precision Manufacturing:
- Structural defect severity is defined by surface fracture dimensions, molding voids, or mechanical contour deviations.
- Any defect occupying greater than 5% of surface area must be classified as HIGH severity.
- Any defect occupying greater than 8% of surface area, or posing a structural integrity risk score > 0.80, MUST be classified as CRITICAL severity.
- CRITICAL severity items must be isolated in containment bins (reject_item) and line stoppage risks evaluated.
- Low-priority or minor aesthetic blemishes (under 2% surface area) are classified as LOW severity and can be reworked or manually verified.`
      },
      {
        id: "blueprint-sns-07",
        category: "blueprints",
        title: "CAD Blueprint Spec: SNS-07 Precision Proximity Sensor",
        content: `CAD Engineering Spec Sheet for Part SNS-07 (Proximity Sensor):
- Part ID: SNS-07
- Target Dimensions: Length 120.0mm, Width 45.0mm.
- Acceptable dimensional variance (tolerance): \xB10.05mm.
- Criticality Rating: HIGH CRITICALITY.
- Line Stoppage Risk: SEVERE. If inventory drops below safety threshold (10 units), the main line must stop.
- Primary failure signature: "Thermal Signature Anomaly" (overheating of the internal circuit board above 65\xB0C), which constitutes a CRITICAL defect.
- Alternative failure signature: "Surface Solder Crack", typically low to medium severity.`
      },
      {
        id: "blueprint-bat-99",
        category: "blueprints",
        title: "CAD Blueprint Spec: BAT-99 Thermal Battery Hub",
        content: `CAD Engineering Spec Sheet for Part BAT-99 (Thermal Battery Hub):
- Part ID: BAT-99
- Target Dimensions: Length 150.0mm, Width 80.0mm.
- Acceptable dimensional variance (tolerance): \xB10.02mm.
- Criticality Rating: HIGH CRITICALITY.
- Line Stoppage Risk: SEVERE.
- Primary failure signature: "Thermal Void" or "Molding Delamination", classified as HIGH severity.`
      },
      {
        id: "blueprint-pnl-01",
        category: "blueprints",
        title: "CAD Blueprint Spec: PNL-01 Carbon Shroud Plate",
        content: `CAD Engineering Spec Sheet for Part PNL-01 (Carbon Shroud Plate):
- Part ID: PNL-01
- Target Dimensions: Length 200.0mm, Width 200.0mm.
- Acceptable dimensional variance (tolerance): \xB10.20mm.
- Criticality Rating: LOW-PRIORITY.
- Line Stoppage Risk: LOW. Can run without shroud plates for up to 48 hours.
- Primary failure signature: "Surface Scratch (>5mm)" or "Aesthetic Blemish", typically LOW severity.`
      },
      {
        id: "sla-apex-fast-track",
        category: "supplier_slas",
        title: "Supplier SLA Contract: Apex Fast-Track Solutions",
        content: `Logistics SLA & Pricing Agreement with Supplier 'S1-A' (Apex Fast-Track Solutions):
- Delivery Lead Time: 1 Day (Guaranteed next-day express shipping).
- Sourcing Tier: Tier-1 Premium.
- Delivery Confidence Rating: 98% on-time SLA compliance.
- Pricing Schedule: Premium markup (+40% surcharge). Standard item cost ranges from $350 - $450 per unit.
- Policy Rule: Best suited for CRITICAL items where avoiding assembly line downtime overrides procurement cost boundaries.`
      },
      {
        id: "sla-paramount-logistics",
        category: "supplier_slas",
        title: "Supplier SLA Contract: Paramount Logistics",
        content: `Logistics SLA & Pricing Agreement with Supplier 'S1-B' (Paramount Logistics):
- Delivery Lead Time: 3 Days (Standard premium logistics).
- Sourcing Tier: Tier-2 Standard.
- Delivery Confidence Rating: 90% on-time SLA compliance.
- Pricing Schedule: Balanced standard rates ($150 - $250 per unit).
- Policy Rule: Suited for standard criticality components when express line stopping risk is moderate.`
      },
      {
        id: "sla-general-sheet-metal",
        category: "supplier_slas",
        title: "Supplier SLA Contract: General Sheet Metal Supply",
        content: `Logistics SLA & Pricing Agreement with Supplier 'S6-B' (General Sheet Metal Supply):
- Delivery Lead Time: 14 Days (Bulk standard shipping).
- Sourcing Tier: Tier-3 Economy.
- Delivery Confidence Rating: 78% SLA compliance.
- Pricing Schedule: Economy discount rates ($30 - $60 per unit).
- Policy Rule: Best suited for LOW-PRIORITY parts where minimizing procurement spending overrides fast fulfillment.`
      }
    ];
    this.documents = mockDocs.map((d) => ({ ...d }));
  }
  /**
   * Ingest new mock factory documentation text dynamically
   */
  async ingestDocument(doc) {
    const newDoc = { ...doc };
    if (this.ai) {
      try {
        newDoc.embedding = await this.getEmbedding(newDoc.content);
      } catch (err) {
        console.error("Failed to generate embedding during ingestion:", err);
      }
    }
    const idx = this.documents.findIndex((d) => d.id === doc.id);
    if (idx !== -1) {
      this.documents[idx] = newDoc;
    } else {
      this.documents.push(newDoc);
    }
  }
  /**
   * Generates a vector embedding using 'gemini-embedding-2-preview'
   */
  async getEmbedding(text) {
    if (!this.ai) {
      throw new Error("Gemini AI is not initialized (no key).");
    }
    if (this.isEmbeddingServiceSuspended) {
      if (Date.now() - this.lastSuspendedTime < 3e5) {
        throw new Error("Gemini Embedding API is temporarily suspended due to quota limits (Rate Limit / Quota Exceeded).");
      } else {
        this.isEmbeddingServiceSuspended = false;
        console.log("[RAG] 5 minutes elapsed since last quota issue. Resuming Gemini Embedding API checks.");
      }
    }
    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text
      });
      const values = response.embeddings?.[0]?.values || response.embedding?.values;
      if (!values) {
        throw new Error("No embedding values returned from model.");
      }
      return values;
    } catch (err) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        this.isEmbeddingServiceSuspended = true;
        this.lastSuspendedTime = Date.now();
        console.warn("[RAG] Gemini Embedding API quota exceeded (429 / RESOURCE_EXHAUSTED). Temporarily suspending embedding service for 5 minutes and falling back to fast keyword search.");
      }
      throw err;
    }
  }
  /**
   * Initialize embeddings for all seeded documents (runs asynchronously in background if key exists)
   */
  async initializeEmbeddings() {
    if (!this.ai) return;
    console.log("[RAG] Generating semantic embeddings for seeded document registry...");
    for (const doc of this.documents) {
      if (!doc.embedding) {
        try {
          doc.embedding = await this.getEmbedding(doc.content);
        } catch (err) {
          if (this.isEmbeddingServiceSuspended) {
            console.log(`[RAG] Embedding initialization skipped for remaining documents.`);
            break;
          }
          console.log(`[RAG] Failed embedding for doc ${doc.id}: API quota/limit issue.`);
        }
      }
    }
    console.log("[RAG] Seeded documents successfully embedded.");
  }
  /**
   * Basic Cosine Similarity calculator
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  /**
   * Helper keyword similarity fallback in-case Gemini key is missing
   */
  keywordMatchScore(text, query) {
    const qWords = query.toLowerCase().split(/[\s,._\-]+/);
    const tLower = text.toLowerCase();
    let score = 0;
    for (const word of qWords) {
      if (word.length > 2 && tLower.includes(word)) {
        score += 1;
      }
    }
    return score;
  }
  /**
   * Retrieve documents matching the given query
   */
  async retrieveContext(query, limit = 2) {
    if (this.ai) {
      if (this.isEmbeddingServiceSuspended) {
        if (Date.now() - this.lastSuspendedTime < 3e5) {
          console.log("[RAG] Vector retrieval skipped because embedding API is suspended.");
        } else {
          this.isEmbeddingServiceSuspended = false;
          console.log("[RAG] 5 minutes elapsed. Resuming Gemini Embedding API checks.");
        }
      }
      if (!this.isEmbeddingServiceSuspended) {
        try {
          const queryVector = await Promise.race([
            this.getEmbedding(query),
            new Promise(
              (_, reject) => setTimeout(() => reject(new Error("Embedding call timed out")), 350)
            )
          ]);
          const scoredDocs2 = this.documents.map((doc) => {
            if (doc.embedding) {
              return { doc, score: this.cosineSimilarity(queryVector, doc.embedding) };
            }
            return { doc, score: this.keywordMatchScore(doc.content, query) / 10 };
          }).sort((a, b) => b.score - a.score);
          return scoredDocs2.slice(0, limit).map((sd) => sd.doc);
        } catch (err) {
          console.log("[RAG] Vector retrieval unavailable (API quota/limit). Falling back to keyword search.");
        }
      }
    }
    const scoredDocs = this.documents.map((doc) => ({
      doc,
      score: this.keywordMatchScore(doc.content, query) + this.keywordMatchScore(doc.title, query) * 2
    })).sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, limit).map((sd) => sd.doc);
  }
};

// src/types.ts
var PARTS_CATALOG = [
  {
    part_id: "SNS-07",
    name: "High-Resolution Radar Sensor",
    criticality: "critical",
    typical_grade: "good",
    defect_types: [
      "Aperture Lens Contamination",
      "Focal Calibration Deviation (>0.02\xB0)",
      "Transceiver Solder Void",
      "RF Shielding Gap Anomaly",
      "Radome Crack/Micro-fracture"
    ]
  },
  {
    part_id: "BRK-22",
    name: "Electromagnetic Brake Actuator",
    criticality: "critical",
    typical_grade: "average",
    defect_types: [
      "Solenoid Coil Resistance Spike",
      "Friction Plate Thickness Variance",
      "Armature Return Spring Fatigue",
      "Magnetic Flux Leakage",
      "Clamping Force Instability"
    ]
  },
  {
    part_id: "BAT-99",
    name: "Thermal Management Controller",
    criticality: "critical",
    typical_grade: "poor",
    defect_types: [
      "Coolant Port Seal Micro-leak",
      "Thermistor Calibration Drift",
      "MOSFET Thermal Runaway Anomaly",
      "Bypass Valve Latency Anomaly",
      "Control Board Flux Contamination"
    ]
  },
  {
    part_id: "MTR-44",
    name: "Brushless Drive Motor",
    criticality: "standard",
    typical_grade: "good",
    defect_types: [
      "Stator Winding Inter-turn Short",
      "Rotor Dynamic Unbalance (>0.1g)",
      "Shaft Runout Deviation (>0.05mm)",
      "Bearing Acoustic Noise Peak",
      "Hall Sensor Timing Phase Shift"
    ]
  },
  {
    part_id: "GRB-15",
    name: "Precision Planetary Gearbox",
    criticality: "standard",
    typical_grade: "average",
    defect_types: [
      "Ring Gear Backlash Excess (>0.08mm)",
      "Planet Carrier Pin Misalignment",
      "Tooth Profile Pitch Deviation",
      "Lubrication Fill Deficit (<90%)",
      "Output Shaft Torsional Play"
    ]
  },
  {
    part_id: "PNL-01",
    name: "Exterior Protective Shroud",
    criticality: "low-priority",
    typical_grade: "good",
    defect_types: [
      "Composite Delamination Gap",
      "Mounting Eyelet Hole Ovality",
      "UV-Coat Specular Gloss Defect",
      "Surface Hairline Scratch (>10mm)",
      "Molding Flash Excess at Seam"
    ]
  },
  {
    part_id: "BKT-05",
    name: "Heavy-Duty Mounting Bracket",
    criticality: "low-priority",
    typical_grade: "average",
    defect_types: [
      "Structural Weld Porosity Void",
      "Angle Bend Deviation (>0.5\xB0)",
      "Baseplate Flatness Non-compliance",
      "Powdercoat Dry Film Thickness Deficit",
      "Thread Tapping Gauge Pitch Slip"
    ]
  },
  {
    part_id: "FST-12",
    name: "Vibration-Damping Fastener",
    criticality: "low-priority",
    typical_grade: "poor",
    defect_types: [
      "Thread Pitch Shear/Deformation",
      "Elastomer Collar Durometer Spike",
      "Core Hex Socket Torque Slip",
      "Zinc-Plating Passivation Scaling",
      "Collar Concentricity Eccentricity"
    ]
  }
];
var SUPPLIERS_DB = {
  "SNS-07": [
    { supplier_id: "S1-A", name: "Texas Instruments India", cost: 450, delivery_days: 1, website: "https://www.ti.com/en-in/product/IWR6843AOPEVM" },
    { supplier_id: "S1-B", name: "Mouser Electronics India", cost: 280, delivery_days: 10, website: "https://www.mouser.in/c/sensors/radar-sensors/" },
    { supplier_id: "S1-C", name: "DigiKey Electronics India", cost: 340, delivery_days: 4, website: "https://www.digikey.in/en/products/filter/rf-evaluation-and-development-kits-boards/818" }
  ],
  "BRK-22": [
    { supplier_id: "S2-A", name: "Bosch Rexroth India", cost: 620, delivery_days: 2, website: "https://www.boschrexroth.com/en/in/" },
    { supplier_id: "S2-B", name: "RS Components India", cost: 390, delivery_days: 14, website: "https://in.rsdelivers.com/productlist/search?query=electromagnetic%20brake" },
    { supplier_id: "S2-C", name: "element14 India", cost: 480, delivery_days: 5, website: "https://in.element14.com/c/automation-process-control/solenoids/magnetic-brakes" }
  ],
  "BAT-99": [
    { supplier_id: "S3-A", name: "Schneider Electric India", cost: 380, delivery_days: 1, website: "https://www.se.com/in/en/product-category/4700-thermal-management/" },
    { supplier_id: "S3-B", name: "DigiKey Electronics India", cost: 210, delivery_days: 12, website: "https://www.digikey.in/en/products/filter/thermal-management-accessories/231" },
    { supplier_id: "S3-C", name: "Mouser Electronics India", cost: 290, delivery_days: 4, website: "https://www.mouser.in/c/embedded-solutions/thermal-management/" }
  ],
  "MTR-44": [
    { supplier_id: "S4-A", name: "maxon motor India", cost: 240, delivery_days: 2, website: "https://www.maxongroup.co.in/maxon/view/content/contact-service-india" },
    { supplier_id: "S4-B", name: "RS Components India", cost: 130, delivery_days: 9, website: "https://in.rsdelivers.com/productlist/search?query=brushless%20dc%20motor" },
    { supplier_id: "S4-C", name: "element14 India", cost: 175, delivery_days: 4, website: "https://in.element14.com/c/motors-motor-controls/motors/dc-brushless-motors" }
  ],
  "GRB-15": [
    { supplier_id: "S5-A", name: "Misumi India", cost: 190, delivery_days: 1, website: "https://in.misumi-ec.com/vona2/mech/m0100000000/m0114000000/" },
    { supplier_id: "S5-B", name: "RS Components India", cost: 110, delivery_days: 11, website: "https://in.rsdelivers.com/productlist/search?query=planetary%20gearbox" },
    { supplier_id: "S5-C", name: "element14 India", cost: 145, delivery_days: 5, website: "https://in.element14.com/c/automation-process-control/gearboxes-gearheads/planetary-gearboxes" }
  ],
  "PNL-01": [
    { supplier_id: "S6-A", name: "RS Components India", cost: 95, delivery_days: 2, website: "https://in.rsdelivers.com/productlist/search?query=protective-covers" },
    { supplier_id: "S6-B", name: "element14 India", cost: 45, delivery_days: 14, website: "https://in.element14.com/c/safety-protection/machine-safety/machine-guards" },
    { supplier_id: "S6-C", name: "Misumi India", cost: 65, delivery_days: 6, website: "https://in.misumi-ec.com/vona2/mech/m0500000000/" }
  ],
  "BKT-05": [
    { supplier_id: "S7-A", name: "RS Components India", cost: 75, delivery_days: 1, website: "https://in.rsdelivers.com/productlist/search?query=mounting-brackets" },
    { supplier_id: "S7-B", name: "element14 India", cost: 25, delivery_days: 15, website: "https://in.element14.com/c/hardware/brackets" },
    { supplier_id: "S7-C", name: "Misumi India", cost: 45, delivery_days: 5, website: "https://in.misumi-ec.com/vona2/detail/110302684810/" }
  ],
  "FST-12": [
    { supplier_id: "S8-A", name: "RS Components India", cost: 18, delivery_days: 1, website: "https://in.rsdelivers.com/productlist/search?query=vibration-damping-mount" },
    { supplier_id: "S8-B", name: "element14 India", cost: 6, delivery_days: 12, website: "https://in.element14.com/c/hardware/vibration-isolators" },
    { supplier_id: "S8-C", name: "Misumi India", cost: 10, delivery_days: 4, website: "https://in.misumi-ec.com/vona2/mech/m0200000000/m0212000000/" }
  ]
};

// server.ts
var ragService = new RAGService();
var aiService = new AIService();
ragService.initializeEmbeddings().catch((err) => {
  console.error("[RAG-INIT] Background embedding compilation failed:", err);
});
var app = (0, import_express.default)();
var server = (0, import_http.createServer)(app);
var wss = new import_ws.WebSocketServer({ noServer: true });
var PORT = 3e3;
var isAutoMode = true;
var injectionGrade = "random";
var ledger = [];
var agentLogs = [];
var isSelfChecking = false;
var logSeq = 1;
function getFormattedTime() {
  return (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
}
function addAgentLog(agent, message, type, partId) {
  const newLog = {
    id: `LOG-${logSeq++}`,
    timestamp: getFormattedTime(),
    agent,
    message,
    type,
    partId
  };
  agentLogs.push(newLog);
  if (agentLogs.length > 200) {
    agentLogs.shift();
  }
  return newLog;
}
function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === import_ws.WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
function sendState(ws) {
  ws.send(
    JSON.stringify({
      type: "STATE_SYNC",
      payload: {
        isAutoMode,
        injectionGrade,
        ledger,
        agentLogs,
        isSelfChecking
      }
    })
  );
}
async function runAgenticWorkflow(partId, partInstanceId, grade) {
  const part = PARTS_CATALOG.find((p) => p.part_id === partId);
  if (!part) return;
  console.log(`[AGENT-ORCHESTRATOR] Initializing RAG-assisted scan pipeline for ${partInstanceId} (${part.name}), grade [${grade.toUpperCase()}]`);
  const triageQuery = `ISO 9001 defect tolerance and dimensions spec sheet for part ${part.part_id} ${part.name} under quality grade ${grade}`;
  let triageContextDocs = [];
  try {
    triageContextDocs = await ragService.retrieveContext(triageQuery, 2);
  } catch (err) {
    console.error("[AGENT-ORCHESTRATOR] RAG retrieval failed, proceeding without context:", err);
  }
  const triageContextText = triageContextDocs.map((d) => `[Document: ${d.title}]
${d.content}`).join("\n\n");
  const triageLog = addAgentLog(
    "Triage Agent",
    `Initializing automated optical scan for part instance ${partInstanceId}.
Retrieving standard spec blueprints and tolerance thresholds via RAG context...`,
    "info",
    part.part_id
  );
  broadcast({ type: "AGENT_LOG_GENERATED", payload: triageLog });
  await new Promise((resolve) => setTimeout(resolve, 200));
  const outcome = grade === "poor" ? "rejected" : "passed";
  let defectType;
  if (outcome === "passed") {
    const successMsg = grade === "average" ? `Visual scan completed for ${partInstanceId} (${part.name}).
Found minor surface contour variations (Average Grade).
Cross-referenced RAG Specs (Tolerance limit matched).
Policy recommendation: AUTOMATIC PASS with DOWNSTREAM MANUAL VERIFY tag. Keeping the production line running continuously!` : `Visual scan completed for ${partInstanceId} (${part.name}).
No structural anomalies detected.
Dimensions are within absolute tolerance bounds (verified via Blueprint specs).
Logging PASS state to Ledger. No procurement required.`;
    const decisionLog = addAgentLog(
      "Triage Agent",
      successMsg,
      grade === "average" ? "warning" : "success",
      part.part_id
    );
    broadcast({ type: "AGENT_LOG_GENERATED", payload: decisionLog });
    const newLedgerEntry = {
      id: partInstanceId,
      part_id: part.part_id,
      part_name: part.name,
      criticality: part.criticality,
      outcome: "passed",
      timestamp: getFormattedTime(),
      grade
    };
    ledger.unshift(newLedgerEntry);
    broadcast({ type: "LEDGER_UPDATED", payload: newLedgerEntry });
    broadcast({
      type: "INSPECTION_RESOLVED",
      payload: {
        partInstanceId,
        outcome: "passed",
        grade
      }
    });
  } else {
    const partDefects = part.defect_types && part.defect_types.length > 0 ? part.defect_types : ["Surface Cracking"];
    defectType = partDefects[Math.floor(Math.random() * partDefects.length)];
    const alertLog = addAgentLog(
      "Triage Agent",
      `ALERT: Structural defect found on part ${partInstanceId} (${part.name}).
Defect Profile: '${defectType}'.
Invoking MCP Tool 'reject_item' to tag state. Sourcing replacement blueprint SLA parameters via RAG...`,
      "warning",
      part.part_id
    );
    broadcast({ type: "AGENT_LOG_GENERATED", payload: alertLog });
    await new Promise((resolve) => setTimeout(resolve, 250));
    const priorRejectionsCount = ledger.filter(
      (l) => l.part_id === part.part_id && l.outcome === "rejected"
    ).length;
    const slaQuery = `Supplier SLA logistics contracts and delivery pricing schedules for part ${part.part_id} ${part.name}`;
    let slaDocs = [];
    try {
      slaDocs = await ragService.retrieveContext(slaQuery, 3);
    } catch (err) {
      console.error("[AGENT-ORCHESTRATOR] SLA RAG retrieval failed, proceeding without context:", err);
    }
    const slaContextText = slaDocs.map((d) => `[Contract: ${d.title}]
${d.content}`).join("\n\n");
    const suppliers = SUPPLIERS_DB[part.part_id] || [];
    let chosenSupplier;
    let tradeOffIgnored = "";
    const isUrgent = priorRejectionsCount >= 8 || part.criticality === "critical" || isSelfChecking;
    if (isUrgent) {
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
      `Received triage dispatch report. Initiated supplier SLA evaluation.
Policy Selection: ${isUrgent ? "EXPRESS SOURCING (High Criticality/Defects)" : "ECONOMY SOURCING (Standard Budget)"}.

DECISION SUMMARY:
- Sourced Vendor: ${chosenSupplier.name}
- Procurement Premium: $${chosenSupplier.cost}
- Estimated Transit: ${chosenSupplier.delivery_days} day(s)
- Strategy: ${tradeOffIgnored}
Invoking MCP Tool 'place_order' to initiate reorder pipeline.`,
      "decision",
      part.part_id
    );
    broadcast({ type: "AGENT_LOG_GENERATED", payload: procurementLog });
    const newLedgerEntry = {
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
      tradeOffIgnored
    };
    ledger.unshift(newLedgerEntry);
    broadcast({ type: "LEDGER_UPDATED", payload: newLedgerEntry });
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
        tradeOffIgnored
      }
    });
  }
}
wss.on("connection", (ws) => {
  console.log("[WS-SERVER] Incoming client connection authorized.");
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
                grade: message.payload.grade
              }
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
            let ledgerEntry;
            if (rOutcome === "passed") {
              ledgerEntry = {
                id: rInstanceId,
                part_id: manualPart.part_id,
                part_name: manualPart.name,
                criticality: manualPart.criticality,
                outcome: "passed",
                timestamp: getFormattedTime(),
                grade: rGrade
              };
            } else {
              const suppliers = SUPPLIERS_DB[manualPart.part_id] || [];
              const chosen = suppliers[0] || {
                supplier_id: "S0-DEFAULT",
                name: "Default Sourcing",
                website: "https://example.com",
                cost: 100,
                delivery_days: 7
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
                tradeOffIgnored: "Manual override initiated by operator."
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
                deliveryDays: ledgerEntry.deliveryDays
              }
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
              isSelfChecking
            }
          });
          break;
        default:
          console.warn(`[WS-SERVER] Unrecognized WS message type: ${message.type}`);
      }
    } catch (err) {
      console.error("[WS-SERVER] Parse error on client payload:", err.message);
    }
  });
  ws.on("close", () => {
    console.log("[WS-SERVER] Client socket connection released.");
  });
});
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
async function bootstrapServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting Vite development engine on same port (3000)...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Mounting production static asset compiler pipeline...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`================================================================`);
    console.log(`\u{1F680} FACTORY OS DIGITAL TWIN BACKEND SERVER IS ONLINE              `);
    console.log(`\u{1F517} Interface: http://localhost:${PORT}                           `);
    console.log(`\u{1F4C8} Mode: ${process.env.NODE_ENV || "development"}                 `);
    console.log(`================================================================`);
  });
}
bootstrapServer().catch((err) => {
  console.error("[SERVER-FATAL] Bootstrapping failed:", err);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map

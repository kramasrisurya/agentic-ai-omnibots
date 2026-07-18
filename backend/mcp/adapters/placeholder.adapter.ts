/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from "./provider.interface";
import {
  ScanRequest,
  ScanResponse,
  InspectionResult,
  DamageAnalysis,
  ReasoningRequest,
  ReasoningResponse,
  ReportOutput,
} from "../schemas/ai.schemas";

export class PlaceholderAIProvider implements AIProvider {
  private logLifecycle(event: string, meta?: any) {
    console.log(`[AI-LIFECYCLE-LOG] ${new Date().toISOString()} - ${event}`, meta ? JSON.stringify(meta) : "");
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    this.logLifecycle("Chat completion requested", { systemPromptLength: systemPrompt.length });
    return `[Placeholder AI response to: "${userMessage}"]`;
  }

  async analyzeImage(request: ScanRequest): Promise<ScanResponse> {
    this.logLifecycle("Analyze Image requested", request);
    
    // Simulate smart analysis based on the injected part's grade
    const isDefective = request.grade === "poor";
    const confidence = isDefective ? 0.94 : 0.98;
    const detectedDefects = isDefective 
      ? ["Surface Anomaly / Solder Void", "Contour Deviation"]
      : [];

    return {
      partInstanceId: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      hasAnomalies: isDefective,
      confidence,
      detectedDefects,
      dimensions: {
        lengthMm: 120.4,
        widthMm: 45.2,
        deviationMm: isDefective ? 0.28 : 0.02,
      },
      scannedAt: new Date().toLocaleTimeString(),
    };
  }

  async streamResponse(
    systemPrompt: string,
    userMessage: string,
    onToken: (token: string) => void
  ): Promise<string> {
    this.logLifecycle("Streaming requested", { systemPromptLength: systemPrompt.length });
    const fullText = `[Streaming Placeholder Response] Analyzing context... Processing tool tokens... Cleared!`;
    const tokens = fullText.split(" ");
    
    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      onToken(token + " ");
    }
    
    return fullText;
  }

  async reasoning(request: ReasoningRequest, partData: any): Promise<ReasoningResponse> {
    this.logLifecycle("Reasoning process requested", { request, partId: partData?.part_id });

    const isCritical = partData?.criticality === "critical";
    const isUrgent = request.systemContext.historicRejectionRate >= 8 || isCritical;

    // Simulate appropriate supplier and tradeoff ignoring
    let chosenSupplierId = "S6-B";
    let chosenSupplierName = "General Sheet Metal Supply";
    let urgency: "express" | "economy" | "buffer-log" = "economy";
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
        isUrgent 
          ? "Decision rule match: High defect batch rate or critical SLA. Directing request to EXPRESS procurement adapter."
          : "Decision rule match: Low failure rate. Sourcing lowest cost supplier option.",
        `Sourcing contract assigned to supplier ID: ${chosenSupplierId} (${chosenSupplierName})`,
      ],
    };
  }

  async generateReport(
    stats: {
      totalProcessed: number;
      passRatePercent: number;
      totalSpend: number;
      totalOrdersPlaced: number;
    },
    anomaliesByPart: Record<string, number>
  ): Promise<ReportOutput> {
    this.logLifecycle("Generate Report requested", { stats });

    return {
      reportId: `REP-${Math.floor(100 + Math.random() * 900)}`,
      generatedAt: new Date().toLocaleString(),
      scope: {
        startPeriod: "Shift A - 08:00",
        endPeriod: "Current Session",
        totalProcessed: stats.totalProcessed,
      },
      metrics: {
        passRatePercent: stats.passRatePercent,
        totalSpend: stats.totalSpend,
        totalOrdersPlaced: stats.totalOrdersPlaced,
      },
      anomaliesByPart,
      executiveSummary: `Autonomous factory line scan analysis completed successfully. Current Q.C. yield index sits at ${stats.passRatePercent.toFixed(1)}%. Total dispatched capital for replacement modules amounts to $${stats.totalSpend.toLocaleString()}. Core operational bottlenecks are concentrated around part calibration constraints.`,
      actionRequired: stats.passRatePercent < 95,
    };
  }

  async summarize(textToSummarize: string): Promise<string> {
    this.logLifecycle("Summarize requested", { length: textToSummarize.length });
    return `Summary: Sourced part, analyzed anomalies, compiled ledger dispatch logs.`;
  }
}

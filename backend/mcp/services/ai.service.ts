/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from "../adapters/provider.interface";
import { GeminiAIProvider } from "../adapters/gemini.adapter";
import {
  ScanRequest,
  ScanResponse,
  ReasoningRequest,
  ReasoningResponse,
  ReportOutput,
} from "../schemas/ai.schemas";
import {
  scanPartsTool,
  reviewReasoningTool,
  generateReportTool,
  explainResultsTool,
} from "../tools/ai.tools";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "metric";
  message: string;
  durationMs?: number;
  metadata?: any;
}

export class AIService {
  private provider: AIProvider;
  private logs: LogEntry[] = [];

  constructor(provider?: AIProvider) {
    // Default to our robust Gemini provider, making the system 100% plug-and-play
    this.provider = provider || new GeminiAIProvider();
  }

  /**
   * Return internal performance and telemetry execution logs
   */
  public getLogs(): LogEntry[] {
    return this.logs;
  }

  /**
   * Centralized telemetry logger
   */
  private log(level: "info" | "warn" | "error" | "metric", message: string, durationMs?: number, metadata?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      durationMs,
      metadata,
    };
    this.logs.push(entry);
    console.log(`[AI-SERVICE][${level.toUpperCase()}] ${message}`, durationMs ? `(${durationMs}ms)` : "", metadata || "");
  }

  /**
   * Utility wrapper to execute tasks with performance metrics and resilient error envelopes
   */
  private async executeWithTelemetry<T>(
    taskName: string,
    timeoutMs: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.log("info", `Initiating task execution: ${taskName}`);

    // Create a promise that rejects after the given timeout limit
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`TIMEOUT_ERROR: Task '${taskName}' exceeded SLA timeout of ${timeoutMs}ms.`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      const duration = Date.now() - startTime;
      this.log("metric", `Successfully completed task: ${taskName}`, duration, { status: "success" });
      return result;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.log("error", `Task execution failure: ${taskName} - ${err.message}`, duration, {
        errorStack: err.stack,
        status: "failed",
      });
      throw err;
    }
  }

  /**
   * Triage / Scan Feature Orchestrator
   */
  public async scanPart(request: ScanRequest): Promise<ScanResponse> {
    return this.executeWithTelemetry<ScanResponse>("scanPart", 5000, async () => {
      if (!request.partId) {
        throw new Error("INVALID_RESPONSE: Part ID must not be blank.");
      }
      return await scanPartsTool(this.provider, request);
    });
  }

  /**
   * Sourcing / Procurement Reasoning Orchestrator
   */
  public async resolveProcurementReasoning(
    request: ReasoningRequest,
    partData: any
  ): Promise<ReasoningResponse> {
    return this.executeWithTelemetry<ReasoningResponse>("resolveProcurementReasoning", 8000, async () => {
      if (!request.partInstanceId) {
        throw new Error("INVALID_RESPONSE: Part Instance ID is required for reasoning chain analysis.");
      }
      return await reviewReasoningTool(this.provider, request, partData);
    });
  }

  /**
   * Shift Audit Summary Generator Orchestrator
   */
  public async compileReport(
    stats: {
      totalProcessed: number;
      passRatePercent: number;
      totalSpend: number;
      totalOrdersPlaced: number;
    },
    anomaliesByPart: Record<string, number>
  ): Promise<ReportOutput> {
    return this.executeWithTelemetry<ReportOutput>("compileReport", 10000, async () => {
      return await generateReportTool(this.provider, stats, anomaliesByPart);
    });
  }

  /**
   * Localized Operator Recommendation
   */
  public async getOperatorRecommendation(
    partInstanceId: string,
    defectType: string,
    deviationMm: number
  ): Promise<{ explanation: string; correctiveAction: string }> {
    return this.executeWithTelemetry<{ explanation: string; correctiveAction: string }>(
      "getOperatorRecommendation",
      4000,
      async () => {
        return await explainResultsTool(this.provider, partInstanceId, defectType, deviationMm);
      }
    );
  }
}

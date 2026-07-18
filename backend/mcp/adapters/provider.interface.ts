/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ScanRequest,
  ScanResponse,
  InspectionResult,
  DamageAnalysis,
  ReasoningRequest,
  ReasoningResponse,
  ReportOutput,
} from "../schemas/ai.schemas";

export interface AIProvider {
  /**
   * General-purpose chat completions.
   */
  chat(systemPrompt: string, userMessage: string): Promise<string>;

  /**
   * Analyze high-definition part images for physical and geometric defects.
   */
  analyzeImage(request: ScanRequest): Promise<ScanResponse>;

  /**
   * Support for streaming text tokens (e.g. reasoning progress bar, typing effect)
   */
  streamResponse(
    systemPrompt: string,
    userMessage: string,
    onToken: (token: string) => void
  ): Promise<string>;

  /**
   * Evaluate a manufacturing defect scenario and resolve optimal supply chain reordering decisions.
   */
  reasoning(request: ReasoningRequest, partData: any): Promise<ReasoningResponse>;

  /**
   * Compile factory metrics, ledger history, and supplier stats into a formal report.
   */
  generateReport(
    stats: {
      totalProcessed: number;
      passRatePercent: number;
      totalSpend: number;
      totalOrdersPlaced: number;
    },
    anomaliesByPart: Record<string, number>
  ): Promise<ReportOutput>;

  /**
   * Summarize logs or other findings into text snippets.
   */
  summarize(textToSummarize: string): Promise<string>;
}

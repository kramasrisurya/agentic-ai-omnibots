/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider } from "./provider.interface";
import { PlaceholderAIProvider } from "./placeholder.adapter";
import {
  ScanRequest,
  ScanResponse,
  ReasoningRequest,
  ReasoningResponse,
  ReportOutput,
} from "../schemas/ai.schemas";

export class GeminiAIProvider implements AIProvider {
  private ai?: GoogleGenAI;
  private fallback: PlaceholderAIProvider;

  constructor() {
    this.fallback = new PlaceholderAIProvider();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      console.log("[GEMINI-PROVIDER] API Key detected. Bootstrapping Gemini model interface.");
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.log("[GEMINI-PROVIDER] No API Key found. Operating in localized offline twin mode.");
    }
  }

  /**
   * Helper to execute Gemini request or gracefully fall back
   */
  private async executeWithFallback<T>(
    operationName: string,
    action: (ai: GoogleGenAI) => Promise<T>,
    fallbackAction: () => Promise<T>
  ): Promise<T> {
    if (this.ai) {
      try {
        console.log(`[GEMINI-PROVIDER] Executing real LLM request: ${operationName}`);
        return await action(this.ai);
      } catch (err: any) {
        console.error(`[GEMINI-PROVIDER] Real LLM request failed for '${operationName}'. Invoking localized fallback. Error:`, err.message);
        return await fallbackAction();
      }
    }
    return await fallbackAction();
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    return this.executeWithFallback(
      "chat",
      async (ai) => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
          },
        });
        return response.text || "";
      },
      () => this.fallback.chat(systemPrompt, userMessage)
    );
  }

  async analyzeImage(request: ScanRequest): Promise<ScanResponse> {
    return this.executeWithFallback(
      "analyzeImage",
      async (ai) => {
        // Since this is an emulation layer on conveyor triggers, if request has no actual image,
        // we can prompt the visual classifier to describe and analyze the defect grade.
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
              type: Type.OBJECT,
              properties: {
                partInstanceId: { type: Type.STRING },
                hasAnomalies: { type: Type.BOOLEAN },
                confidence: { type: Type.NUMBER },
                detectedDefects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                dimensions: {
                  type: Type.OBJECT,
                  properties: {
                    lengthMm: { type: Type.NUMBER },
                    widthMm: { type: Type.NUMBER },
                    deviationMm: { type: Type.NUMBER },
                  },
                  required: ["lengthMm", "widthMm", "deviationMm"],
                },
                scannedAt: { type: Type.STRING },
              },
              required: ["partInstanceId", "hasAnomalies", "confidence", "detectedDefects", "dimensions"],
            },
          },
        });

        const jsonText = response.text || "{}";
        const result = JSON.parse(jsonText.trim());
        return {
          partInstanceId: result.partInstanceId || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          hasAnomalies: result.hasAnomalies ?? (request.grade === "poor"),
          confidence: result.confidence ?? 0.95,
          detectedDefects: result.detectedDefects || (request.grade === "poor" ? ["Surface Void"] : []),
          dimensions: result.dimensions || {
            lengthMm: 120.0,
            widthMm: 45.0,
            deviationMm: request.grade === "poor" ? 0.28 : 0.02,
          },
          scannedAt: result.scannedAt || new Date().toLocaleTimeString(),
        };
      },
      () => this.fallback.analyzeImage(request)
    );
  }

  async streamResponse(
    systemPrompt: string,
    userMessage: string,
    onToken: (token: string) => void
  ): Promise<string> {
    if (this.ai) {
      try {
        console.log("[GEMINI-PROVIDER] Executing streaming response");
        const responseStream = await this.ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
          },
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

  async reasoning(request: ReasoningRequest, partData: any): Promise<ReasoningResponse> {
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
              type: Type.OBJECT,
              properties: {
                partInstanceId: { type: Type.STRING },
                chosenSupplierId: { type: Type.STRING },
                chosenSupplierName: { type: Type.STRING },
                procurementUrgency: { type: Type.STRING },
                tradeOffDetail: { type: Type.STRING },
                decisionLogicChain: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["partInstanceId", "chosenSupplierId", "chosenSupplierName", "procurementUrgency", "tradeOffDetail", "decisionLogicChain"],
            },
          },
        });

        const jsonText = response.text || "{}";
        return JSON.parse(jsonText.trim());
      },
      () => this.fallback.reasoning(request, partData)
    );
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
              type: Type.OBJECT,
              properties: {
                reportId: { type: Type.STRING },
                generatedAt: { type: Type.STRING },
                scope: {
                  type: Type.OBJECT,
                  properties: {
                    startPeriod: { type: Type.STRING },
                    endPeriod: { type: Type.STRING },
                    totalProcessed: { type: Type.INTEGER },
                  },
                  required: ["startPeriod", "endPeriod", "totalProcessed"],
                },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    passRatePercent: { type: Type.NUMBER },
                    totalSpend: { type: Type.NUMBER },
                    totalOrdersPlaced: { type: Type.INTEGER },
                  },
                  required: ["passRatePercent", "totalSpend", "totalOrdersPlaced"],
                },
                anomaliesByPart: {
                  type: Type.OBJECT,
                  description: "Object mapping part IDs to defect frequencies",
                },
                executiveSummary: { type: Type.STRING },
                actionRequired: { type: Type.BOOLEAN },
              },
              required: ["reportId", "generatedAt", "scope", "metrics", "anomaliesByPart", "executiveSummary", "actionRequired"],
            },
          },
        });

        const jsonText = response.text || "{}";
        return JSON.parse(jsonText.trim());
      },
      () => this.fallback.generateReport(stats, anomaliesByPart)
    );
  }

  async summarize(textToSummarize: string): Promise<string> {
    return this.executeWithFallback(
      "summarize",
      async (ai) => {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Summarize the following raw factory log stream into a scannable operator rollup paragraph: ${textToSummarize}`,
        });
        return response.text || "";
      },
      () => this.fallback.summarize(textToSummarize)
    );
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standard schemas for the NitroStack-ready AI Agent architecture.
 * These types align with the expected inputs/outputs of our generic tools.
 */

export interface ScanRequest {
  partId: string;
  partName: string;
  grade: "good" | "average" | "poor";
  imageUri?: string;
  contourData?: number[];
}

export interface ScanResponse {
  partInstanceId: string;
  hasAnomalies: boolean;
  confidence: number;
  detectedDefects: string[];
  dimensions: {
    lengthMm: number;
    widthMm: number;
    deviationMm: number;
  };
  scannedAt: string;
}

export interface InspectionResult {
  partInstanceId: string;
  partId: string;
  criticality: "critical" | "standard" | "low-priority";
  status: "passed" | "rejected";
  primaryDefect?: string;
  recommendedAction: "approve" | "quarantine" | "replace";
  inspectedAt: string;
}

export interface DamageAnalysis {
  partInstanceId: string;
  defectSignature: string;
  severity: "low" | "medium" | "high" | "critical";
  surfaceAreaPercentage: number;
  structuralIntegrityRisk: number; // 0.0 - 1.0
  reworkFeasible: boolean;
}

export interface ReasoningRequest {
  partInstanceId: string;
  ruleSet: string;
  systemContext: {
    lineStatus: "operational" | "degraded" | "halted";
    historicRejectionRate: number;
    currentBufferStock: number;
  };
}

export interface ReasoningResponse {
  partInstanceId: string;
  chosenSupplierId: string;
  chosenSupplierName: string;
  procurementUrgency: "express" | "economy" | "buffer-log";
  tradeOffDetail: string;
  decisionLogicChain: string[];
}

export interface ReportOutput {
  reportId: string;
  generatedAt: string;
  scope: {
    startPeriod: string;
    endPeriod: string;
    totalProcessed: number;
  };
  metrics: {
    passRatePercent: number;
    totalSpend: number;
    totalOrdersPlaced: number;
  };
  anomaliesByPart: Record<string, number>;
  executiveSummary: string;
  actionRequired: boolean;
}

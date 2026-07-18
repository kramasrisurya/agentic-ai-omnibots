/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  description: string;
  content: string;
}

export const MCP_RESOURCE_REGISTRY: Record<string, MCPResource> = {
  "part-criticality-registry": {
    uri: "mcp://registry/part-criticality-registry",
    name: "Part Criticality Class Specifications",
    mimeType: "application/json",
    description: "Contains SLA thresholds and machine-line tolerances for all active CAD part IDs",
    content: JSON.stringify({
      "SNS-07": { criticality: "critical", lineStoppageRisk: "high", defaultToleranceMm: 0.05 },
      "BRK-22": { criticality: "standard", lineStoppageRisk: "medium", defaultToleranceMm: 0.08 },
      "BAT-99": { criticality: "critical", lineStoppageRisk: "high", defaultToleranceMm: 0.02 },
      "MTR-44": { criticality: "standard", lineStoppageRisk: "medium", defaultToleranceMm: 0.10 },
      "GRB-15": { criticality: "low-priority", lineStoppageRisk: "low", defaultToleranceMm: 0.15 },
      "PNL-01": { criticality: "low-priority", lineStoppageRisk: "low", defaultToleranceMm: 0.20 },
    }, null, 2),
  },
  "supplier-slas": {
    uri: "mcp://logistics/supplier-slas",
    name: "Active Supplier SLA Ratings",
    mimeType: "application/json",
    description: "Evaluates standard shipping speeds and vendor reliability indices",
    content: JSON.stringify({
      "S1-A": { name: "Apex Fast-Track Solutions", tier: "Tier-1", deliveryConfidence: 0.98, costPremium: "high" },
      "S1-B": { name: "Paramount Logistics", tier: "Tier-2", deliveryConfidence: 0.90, costPremium: "medium" },
      "S6-B": { name: "General Sheet Metal Supply", tier: "Tier-3", deliveryConfidence: 0.78, costPremium: "low" },
    }, null, 2),
  }
};

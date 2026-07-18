/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INSPECTION_PROMPT_TEMPLATE = `
ROLE: Manufacturing Safety Dispatch Agent
TASK: Analyze classification weights of defective components and determine recommended downstream action.

INPUT SCHEMAS:
- Part Instance ID: {partInstanceId}
- Primary Defect: {primaryDefect}
- Criticality: {criticality}

PROCEDURE:
1. Receives defect classifications from Vision Agent.
2. References MCP Resource 'part-criticality-registry' for specific SLA classification class (Critical, Standard, Low-priority).
3. Determine recommended action:
   - If defect is high-severity and criticality is Critical: Recommended action is "replace" with express dispatch.
   - If defect is medium-severity and criticality is Standard: Recommended action is "quarantine" for rework.
   - If criticality is Low-priority: Recommended action is "approve" or queue buffer inventory logs.

Return a structured json matching InspectionResult and DamageAnalysis.
`;

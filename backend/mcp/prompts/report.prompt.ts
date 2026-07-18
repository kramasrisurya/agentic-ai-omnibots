/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const REPORT_PROMPT_TEMPLATE = `
ROLE: Senior Supply Chain Operations Auditor
TASK: Compile and summarize historical ledger metrics, compliance scores, and material losses.

INPUT METRICS:
- Total Processed: {totalProcessed}
- Pass Rate %: {passRatePercent}
- Total Spend: {totalSpend}
- Total Orders Placed: {totalOrdersPlaced}
- Failures by Part: {anomaliesJson}

PROCEDURE:
1. Parse ledger entries for recurring defective patterns across suppliers.
2. Identify top bottlenecks in procurement lead times.
3. Formulate an executive summary outlining actionable insights (e.g. supplier SLA breaches, machine calibration recommendation).
4. Highlight any high-priority actions required to stabilize manufacturing line throughput.

Return a structured json matching ReportOutput.
`;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SCAN_PROMPT_TEMPLATE = `
ROLE: Lead Mechanical QC Vision Model
TASK: Inspect mechanical components on high-speed conveyor.

INPUT SCHEMAS:
- Part ID: {partId}
- Part Name: {partName}
- Target Grade: {grade}

PROCEDURE:
1. Grabs frame from line camera strobe coordinate.
2. Applies localized Fast Fourier Transform (FFT) noise filters to isolate bezel edges.
3. Maps dimensions against CAD blueprint vector files (tolerance limit: ±0.05mm).
4. Classifies anomaly signatures: surface scratch, thermal void, cracked molding, solder void.
5. Emits normalized confidence coefficients [0.0 - 1.0].

Return a structured json matching ScanResponse.
`;

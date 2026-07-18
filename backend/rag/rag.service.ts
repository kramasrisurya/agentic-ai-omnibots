/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

export interface RAGDocument {
  id: string;
  category: "iso_standards" | "blueprints" | "supplier_slas";
  title: string;
  content: string;
  embedding?: number[];
}

export class RAGService {
  private documents: RAGDocument[] = [];
  private ai?: GoogleGenAI;
  private isEmbeddingServiceSuspended = false;
  private lastSuspendedTime = 0;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    this.seedDatabase();
  }

  /**
   * Seed mock factory documentation (ISO 9001, component blueprints, supplier SLAs)
   */
  private seedDatabase() {
    const mockDocs: Omit<RAGDocument, "embedding">[] = [
      {
        id: "iso-9001-defect-tolerances",
        category: "iso_standards",
        title: "ISO 9001 Section 4.2: Conveyor QC Defect Tolerances",
        content: `ISO 9001 Quality Standard for Micro-assembly Precision Manufacturing:
- Structural defect severity is defined by surface fracture dimensions, molding voids, or mechanical contour deviations.
- Any defect occupying greater than 5% of surface area must be classified as HIGH severity.
- Any defect occupying greater than 8% of surface area, or posing a structural integrity risk score > 0.80, MUST be classified as CRITICAL severity.
- CRITICAL severity items must be isolated in containment bins (reject_item) and line stoppage risks evaluated.
- Low-priority or minor aesthetic blemishes (under 2% surface area) are classified as LOW severity and can be reworked or manually verified.`,
      },
      {
        id: "blueprint-sns-07",
        category: "blueprints",
        title: "CAD Blueprint Spec: SNS-07 Precision Proximity Sensor",
        content: `CAD Engineering Spec Sheet for Part SNS-07 (Proximity Sensor):
- Part ID: SNS-07
- Target Dimensions: Length 120.0mm, Width 45.0mm.
- Acceptable dimensional variance (tolerance): ±0.05mm.
- Criticality Rating: HIGH CRITICALITY.
- Line Stoppage Risk: SEVERE. If inventory drops below safety threshold (10 units), the main line must stop.
- Primary failure signature: "Thermal Signature Anomaly" (overheating of the internal circuit board above 65°C), which constitutes a CRITICAL defect.
- Alternative failure signature: "Surface Solder Crack", typically low to medium severity.`,
      },
      {
        id: "blueprint-bat-99",
        category: "blueprints",
        title: "CAD Blueprint Spec: BAT-99 Thermal Battery Hub",
        content: `CAD Engineering Spec Sheet for Part BAT-99 (Thermal Battery Hub):
- Part ID: BAT-99
- Target Dimensions: Length 150.0mm, Width 80.0mm.
- Acceptable dimensional variance (tolerance): ±0.02mm.
- Criticality Rating: HIGH CRITICALITY.
- Line Stoppage Risk: SEVERE.
- Primary failure signature: "Thermal Void" or "Molding Delamination", classified as HIGH severity.`,
      },
      {
        id: "blueprint-pnl-01",
        category: "blueprints",
        title: "CAD Blueprint Spec: PNL-01 Carbon Shroud Plate",
        content: `CAD Engineering Spec Sheet for Part PNL-01 (Carbon Shroud Plate):
- Part ID: PNL-01
- Target Dimensions: Length 200.0mm, Width 200.0mm.
- Acceptable dimensional variance (tolerance): ±0.20mm.
- Criticality Rating: LOW-PRIORITY.
- Line Stoppage Risk: LOW. Can run without shroud plates for up to 48 hours.
- Primary failure signature: "Surface Scratch (>5mm)" or "Aesthetic Blemish", typically LOW severity.`,
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
- Policy Rule: Best suited for CRITICAL items where avoiding assembly line downtime overrides procurement cost boundaries.`,
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
- Policy Rule: Suited for standard criticality components when express line stopping risk is moderate.`,
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
- Policy Rule: Best suited for LOW-PRIORITY parts where minimizing procurement spending overrides fast fulfillment.`,
      }
    ];

    this.documents = mockDocs.map(d => ({ ...d }));
  }

  /**
   * Ingest new mock factory documentation text dynamically
   */
  public async ingestDocument(doc: Omit<RAGDocument, "embedding">): Promise<void> {
    const newDoc: RAGDocument = { ...doc };
    if (this.ai) {
      try {
        newDoc.embedding = await this.getEmbedding(newDoc.content);
      } catch (err) {
        console.error("Failed to generate embedding during ingestion:", err);
      }
    }
    // Update if exists, otherwise push
    const idx = this.documents.findIndex(d => d.id === doc.id);
    if (idx !== -1) {
      this.documents[idx] = newDoc;
    } else {
      this.documents.push(newDoc);
    }
  }

  /**
   * Generates a vector embedding using 'gemini-embedding-2-preview'
   */
  private async getEmbedding(text: string): Promise<number[]> {
    if (!this.ai) {
      throw new Error("Gemini AI is not initialized (no key).");
    }

    if (this.isEmbeddingServiceSuspended) {
      // Check if suspension period (e.g., 5 minutes) has elapsed
      if (Date.now() - this.lastSuspendedTime < 300000) {
        throw new Error("Gemini Embedding API is temporarily suspended due to quota limits (Rate Limit / Quota Exceeded).");
      } else {
        this.isEmbeddingServiceSuspended = false;
        console.log("[RAG] 5 minutes elapsed since last quota issue. Resuming Gemini Embedding API checks.");
      }
    }

    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text,
      });
      
      const values = response.embeddings?.[0]?.values || (response as any).embedding?.values;
      if (!values) {
        throw new Error("No embedding values returned from model.");
      }
      return values;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes("429") || 
        errMsg.includes("quota") || 
        errMsg.includes("RESOURCE_EXHAUSTED") || 
        errMsg.includes("Quota exceeded")
      ) {
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
  public async initializeEmbeddings(): Promise<void> {
    if (!this.ai) return;
    console.log("[RAG] Generating semantic embeddings for seeded document registry...");
    for (const doc of this.documents) {
      if (!doc.embedding) {
        try {
          doc.embedding = await this.getEmbedding(doc.content);
        } catch (err: any) {
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
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
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
  private keywordMatchScore(text: string, query: string): number {
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
  public async retrieveContext(query: string, limit = 2): Promise<RAGDocument[]> {
    // If Gemini client is ready, let's use semantic vector matching!
    if (this.ai) {
      if (this.isEmbeddingServiceSuspended) {
        // Check if suspension period (e.g., 5 minutes) has elapsed
        if (Date.now() - this.lastSuspendedTime < 300000) {
          console.log("[RAG] Vector retrieval skipped because embedding API is suspended.");
          // Fallback to keyword search immediately
        } else {
          this.isEmbeddingServiceSuspended = false;
          console.log("[RAG] 5 minutes elapsed. Resuming Gemini Embedding API checks.");
        }
      }

      if (!this.isEmbeddingServiceSuspended) {
        try {
          // Wrap API call in a 350ms timeout to avoid blocking the conveyor pipeline if API is slow
          const queryVector = await Promise.race([
            this.getEmbedding(query),
            new Promise<number[]>((_, reject) =>
              setTimeout(() => reject(new Error("Embedding call timed out")), 350)
            )
          ]);

          const scoredDocs = this.documents
            .map(doc => {
              if (doc.embedding) {
                return { doc, score: this.cosineSimilarity(queryVector, doc.embedding) };
              }
              // Fallback to keyword matching if embedding is missing
              return { doc, score: this.keywordMatchScore(doc.content, query) / 10 };
            })
            .sort((a, b) => b.score - a.score);

          return scoredDocs.slice(0, limit).map(sd => sd.doc);
        } catch (err) {
          console.log("[RAG] Vector retrieval unavailable (API quota/limit). Falling back to keyword search.");
        }
      }
    }

    // Keyword matching fallback (extremely reliable and fast, zero dependencies)
    const scoredDocs = this.documents
      .map(doc => ({
        doc,
        score: this.keywordMatchScore(doc.content, query) + (this.keywordMatchScore(doc.title, query) * 2),
      }))
      .sort((a, b) => b.score - a.score);

    return scoredDocs.slice(0, limit).map(sd => sd.doc);
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// MCP RESOURCE: part-criticality-registry
export type Criticality = "critical" | "standard" | "low-priority";

export interface Part {
  part_id: string;
  name: string;
  criticality: Criticality;
  defect_types?: string[];
  typical_grade?: 'good' | 'average' | 'poor';
}

export interface Supplier {
  supplier_id: string;
  name: string;
  cost: number;
  delivery_days: number;
}

export interface InventoryStats {
  totalProcessed: number;
  passed: number;
  rejected: number;
  ordersPlaced: number;
  totalSpend: number;
}

export type PartOutcome = "passed" | "rejected";

export interface LedgerEntry {
  id: string; // Unique simulation sequence ID (e.g., "TX-1001")
  part_id: string;
  part_name: string;
  criticality: Criticality;
  outcome: PartOutcome;
  timestamp: string;
  defectType?: string;
  grade?: 'good' | 'average' | 'poor';
  // If rejected, these are filled by the Procurement Agent
  chosenSupplierId?: string;
  chosenSupplierName?: string;
  orderCost?: number;
  deliveryDays?: number;
  tradeOffIgnored?: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agent: "Triage Agent" | "Procurement Agent" | "System Check";
  message: string;
  type: "info" | "warning" | "success" | "decision";
  partId?: string;
}

// PARTS CATALOG (6-8 parts with various criticalities and specific defect profiles)
export const PARTS_CATALOG: Part[] = [
  { 
    part_id: "SNS-07", 
    name: "High-Resolution Radar Sensor", 
    criticality: "critical",
    typical_grade: "good",
    defect_types: [
      "Aperture Lens Contamination",
      "Focal Calibration Deviation (>0.02°)",
      "Transceiver Solder Void",
      "RF Shielding Gap Anomaly",
      "Radome Crack/Micro-fracture"
    ]
  },
  { 
    part_id: "BRK-22", 
    name: "Electromagnetic Brake Actuator", 
    criticality: "critical",
    typical_grade: "average",
    defect_types: [
      "Solenoid Coil Resistance Spike",
      "Friction Plate Thickness Variance",
      "Armature Return Spring Fatigue",
      "Magnetic Flux Leakage",
      "Clamping Force Instability"
    ]
  },
  { 
    part_id: "BAT-99", 
    name: "Thermal Management Controller", 
    criticality: "critical",
    typical_grade: "poor",
    defect_types: [
      "Coolant Port Seal Micro-leak",
      "Thermistor Calibration Drift",
      "MOSFET Thermal Runaway Anomaly",
      "Bypass Valve Latency Anomaly",
      "Control Board Flux Contamination"
    ]
  },
  { 
    part_id: "MTR-44", 
    name: "Brushless Drive Motor", 
    criticality: "standard",
    typical_grade: "good",
    defect_types: [
      "Stator Winding Inter-turn Short",
      "Rotor Dynamic Unbalance (>0.1g)",
      "Shaft Runout Deviation (>0.05mm)",
      "Bearing Acoustic Noise Peak",
      "Hall Sensor Timing Phase Shift"
    ]
  },
  { 
    part_id: "GRB-15", 
    name: "Precision Planetary Gearbox", 
    criticality: "standard",
    typical_grade: "average",
    defect_types: [
      "Ring Gear Backlash Excess (>0.08mm)",
      "Planet Carrier Pin Misalignment",
      "Tooth Profile Pitch Deviation",
      "Lubrication Fill Deficit (<90%)",
      "Output Shaft Torsional Play"
    ]
  },
  { 
    part_id: "PNL-01", 
    name: "Exterior Protective Shroud", 
    criticality: "low-priority",
    typical_grade: "good",
    defect_types: [
      "Composite Delamination Gap",
      "Mounting Eyelet Hole Ovality",
      "UV-Coat Specular Gloss Defect",
      "Surface Hairline Scratch (>10mm)",
      "Molding Flash Excess at Seam"
    ]
  },
  { 
    part_id: "BKT-05", 
    name: "Heavy-Duty Mounting Bracket", 
    criticality: "low-priority",
    typical_grade: "average",
    defect_types: [
      "Structural Weld Porosity Void",
      "Angle Bend Deviation (>0.5°)",
      "Baseplate Flatness Non-compliance",
      "Powdercoat Dry Film Thickness Deficit",
      "Thread Tapping Gauge Pitch Slip"
    ]
  },
  { 
    part_id: "FST-12", 
    name: "Vibration-Damping Fastener", 
    criticality: "low-priority",
    typical_grade: "poor",
    defect_types: [
      "Thread Pitch Shear/Deformation",
      "Elastomer Collar Durometer Spike",
      "Core Hex Socket Torque Slip",
      "Zinc-Plating Passivation Scaling",
      "Collar Concentricity Eccentricity"
    ]
  },
];

// SUPPLIER REGISTRY (3 suppliers per part with real cost/speed trade-offs)
// - One fast & expensive
// - One slow & cheap
// - One balanced (middle)
export const SUPPLIERS_DB: Record<string, Supplier[]> = {
  "SNS-07": [
    { supplier_id: "S1-A", name: "Apex Fast-Track Solutions", cost: 450, delivery_days: 1 },
    { supplier_id: "S1-B", name: "Global Bulk Components", cost: 280, delivery_days: 10 },
    { supplier_id: "S1-C", name: "Standard Mid-Range Electronics", cost: 340, delivery_days: 4 },
  ],
  "BRK-22": [
    { supplier_id: "S2-A", name: "Rapid Brake & Motion Inc.", cost: 620, delivery_days: 2 },
    { supplier_id: "S2-B", name: "Industrial Steel Castings LLC", cost: 390, delivery_days: 14 },
    { supplier_id: "S2-C", name: "Apex Actuators Group", cost: 480, delivery_days: 5 },
  ],
  "BAT-99": [
    { supplier_id: "S3-A", name: "Thermal Core Pro", cost: 380, delivery_days: 1 },
    { supplier_id: "S3-B", name: "Pacific Lithium & Cell Ltd", cost: 210, delivery_days: 12 },
    { supplier_id: "S3-C", name: "EuroTherm Components", cost: 290, delivery_days: 4 },
  ],
  "MTR-44": [
    { supplier_id: "S4-A", name: "Hyper-Drive Electric Co.", cost: 240, delivery_days: 2 },
    { supplier_id: "S4-B", name: "Sino-Motor Direct", cost: 130, delivery_days: 9 },
    { supplier_id: "S4-C", name: "Vanguard Rotary Parts", cost: 175, delivery_days: 4 },
  ],
  "GRB-15": [
    { supplier_id: "S5-A", name: "Express Precision Gears", cost: 190, delivery_days: 1 },
    { supplier_id: "S5-B", name: "Continental Gear Works", cost: 110, delivery_days: 11 },
    { supplier_id: "S5-C", name: "Alliance Mechanical Corp.", cost: 145, delivery_days: 5 },
  ],
  "PNL-01": [
    { supplier_id: "S6-A", name: "Ultra-Fab Composite Express", cost: 95, delivery_days: 2 },
    { supplier_id: "S6-B", name: "General Sheet Metal Supply", cost: 45, delivery_days: 14 },
    { supplier_id: "S6-C", name: "Midwest Plastics & Shrouds", cost: 65, delivery_days: 6 },
  ],
  "BKT-05": [
    { supplier_id: "S7-A", name: "Titanium Forge Express", cost: 75, delivery_days: 1 },
    { supplier_id: "S7-B", name: "Bargain Brackets LLC", cost: 25, delivery_days: 15 },
    { supplier_id: "S7-C", name: "Prime Machining Co.", cost: 45, delivery_days: 5 },
  ],
  "FST-12": [
    { supplier_id: "S8-A", name: "Quick-Lock Fastener Express", cost: 18, delivery_days: 1 },
    { supplier_id: "S8-B", name: "Standard Thread Supply", cost: 6, delivery_days: 12 },
    { supplier_id: "S8-C", name: "Integra Bolt & Rivet Co.", cost: 10, delivery_days: 4 },
  ],
};

// KNOWN DEFECT TYPES
export const DEFECT_TYPES = [
  "Surface Scratch (>5mm)",
  "Dimensional Deviation (>0.2mm)",
  "Solder Void Detect",
  "Cracked Housing",
  "Thermal Signature Anomaly",
  "Missing Sub-Component",
];

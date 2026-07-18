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
  website?: string;
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
  chosenSupplierWebsite?: string;
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
    { supplier_id: "S1-A", name: "Texas Instruments India", cost: 450, delivery_days: 1, website: "https://www.ti.com/en-in/product/IWR6843AOPEVM" },
    { supplier_id: "S1-B", name: "Mouser Electronics India", cost: 280, delivery_days: 10, website: "https://www.mouser.in/c/sensors/radar-sensors/" },
    { supplier_id: "S1-C", name: "DigiKey Electronics India", cost: 340, delivery_days: 4, website: "https://www.digikey.in/en/products/filter/rf-evaluation-and-development-kits-boards/818" },
  ],
  "BRK-22": [
    { supplier_id: "S2-A", name: "Bosch Rexroth India", cost: 620, delivery_days: 2, website: "https://www.boschrexroth.com/en/in/" },
    { supplier_id: "S2-B", name: "RS Components India", cost: 390, delivery_days: 14, website: "https://in.rsdelivers.com/productlist/search?query=electromagnetic%20brake" },
    { supplier_id: "S2-C", name: "element14 India", cost: 480, delivery_days: 5, website: "https://in.element14.com/c/automation-process-control/solenoids/magnetic-brakes" },
  ],
  "BAT-99": [
    { supplier_id: "S3-A", name: "Schneider Electric India", cost: 380, delivery_days: 1, website: "https://www.se.com/in/en/product-category/4700-thermal-management/" },
    { supplier_id: "S3-B", name: "DigiKey Electronics India", cost: 210, delivery_days: 12, website: "https://www.digikey.in/en/products/filter/thermal-management-accessories/231" },
    { supplier_id: "S3-C", name: "Mouser Electronics India", cost: 290, delivery_days: 4, website: "https://www.mouser.in/c/embedded-solutions/thermal-management/" },
  ],
  "MTR-44": [
    { supplier_id: "S4-A", name: "maxon motor India", cost: 240, delivery_days: 2, website: "https://www.maxongroup.co.in/maxon/view/content/contact-service-india" },
    { supplier_id: "S4-B", name: "RS Components India", cost: 130, delivery_days: 9, website: "https://in.rsdelivers.com/productlist/search?query=brushless%20dc%20motor" },
    { supplier_id: "S4-C", name: "element14 India", cost: 175, delivery_days: 4, website: "https://in.element14.com/c/motors-motor-controls/motors/dc-brushless-motors" },
  ],
  "GRB-15": [
    { supplier_id: "S5-A", name: "Misumi India", cost: 190, delivery_days: 1, website: "https://in.misumi-ec.com/vona2/mech/m0100000000/m0114000000/" },
    { supplier_id: "S5-B", name: "RS Components India", cost: 110, delivery_days: 11, website: "https://in.rsdelivers.com/productlist/search?query=planetary%20gearbox" },
    { supplier_id: "S5-C", name: "element14 India", cost: 145, delivery_days: 5, website: "https://in.element14.com/c/automation-process-control/gearboxes-gearheads/planetary-gearboxes" },
  ],
  "PNL-01": [
    { supplier_id: "S6-A", name: "RS Components India", cost: 95, delivery_days: 2, website: "https://in.rsdelivers.com/productlist/search?query=protective-covers" },
    { supplier_id: "S6-B", name: "element14 India", cost: 45, delivery_days: 14, website: "https://in.element14.com/c/safety-protection/machine-safety/machine-guards" },
    { supplier_id: "S6-C", name: "Misumi India", cost: 65, delivery_days: 6, website: "https://in.misumi-ec.com/vona2/mech/m0500000000/" },
  ],
  "BKT-05": [
    { supplier_id: "S7-A", name: "RS Components India", cost: 75, delivery_days: 1, website: "https://in.rsdelivers.com/productlist/search?query=mounting-brackets" },
    { supplier_id: "S7-B", name: "element14 India", cost: 25, delivery_days: 15, website: "https://in.element14.com/c/hardware/brackets" },
    { supplier_id: "S7-C", name: "Misumi India", cost: 45, delivery_days: 5, website: "https://in.misumi-ec.com/vona2/detail/110302684810/" },
  ],
  "FST-12": [
    { supplier_id: "S8-A", name: "RS Components India", cost: 18, delivery_days: 1, website: "https://in.rsdelivers.com/productlist/search?query=vibration-damping-mount" },
    { supplier_id: "S8-B", name: "element14 India", cost: 6, delivery_days: 12, website: "https://in.element14.com/c/hardware/vibration-isolators" },
    { supplier_id: "S8-C", name: "Misumi India", cost: 10, delivery_days: 4, website: "https://in.misumi-ec.com/vona2/mech/m0200000000/m0212000000/" },
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

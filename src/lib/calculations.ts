export type CalculationType =
  | "cylinder-force"
  | "air-consumption"
  | "pipe-pressure-drop"
  | "valve-flow-coefficient"
  | "compressor-capacity";

export interface CalculationField {
  id: string;
  label: string;
  unit: string;
  unitImperial?: string;
  placeholder: string;
  min?: number;
}

export interface CalculationConfig {
  id: CalculationType;
  name: string;
  description: string;
  fields: CalculationField[];
  resultLabel: string;
  resultUnit: string;
  resultUnitImperial?: string;
  calculate: (values: Record<string, number>) => number;
}

export const calculations: CalculationConfig[] = [
  {
    id: "cylinder-force",
    name: "Cylinder Force",
    description: "Calculate the theoretical force output of a pneumatic cylinder.",
    fields: [
      { id: "bore", label: "Bore Diameter", unit: "mm", unitImperial: "in", placeholder: "e.g. 50" },
      { id: "pressure", label: "Operating Pressure", unit: "bar", unitImperial: "psi", placeholder: "e.g. 6" },
    ],
    resultLabel: "Theoretical Force",
    resultUnit: "N",
    resultUnitImperial: "lbf",
    calculate: (v) => {
      const areaM2 = Math.PI * Math.pow(v.bore / 1000 / 2, 2);
      const pressurePa = v.pressure * 100000;
      return areaM2 * pressurePa;
    },
  },
  {
    id: "air-consumption",
    name: "Air Consumption",
    description: "Estimate the air consumption rate of a pneumatic cylinder per cycle.",
    fields: [
      { id: "bore", label: "Bore Diameter", unit: "mm", unitImperial: "in", placeholder: "e.g. 50" },
      { id: "stroke", label: "Stroke Length", unit: "mm", unitImperial: "in", placeholder: "e.g. 100" },
      { id: "pressure", label: "Operating Pressure", unit: "bar", unitImperial: "psi", placeholder: "e.g. 6" },
      { id: "cycles", label: "Cycles per Minute", unit: "cpm", placeholder: "e.g. 10" },
    ],
    resultLabel: "Air Consumption",
    resultUnit: "L/min (ANR)",
    resultUnitImperial: "SCFM",
    calculate: (v) => {
      const areaM2 = Math.PI * Math.pow(v.bore / 1000 / 2, 2);
      const strokeM = v.stroke / 1000;
      const volumePerCycleM3 = areaM2 * strokeM * 2;
      const compressionRatio = (v.pressure + 1.01325) / 1.01325;
      return volumePerCycleM3 * compressionRatio * v.cycles * 1000;
    },
  },
  {
    id: "pipe-pressure-drop",
    name: "Pipe Pressure Drop",
    description: "Calculate the pressure drop in a pneumatic pipe run.",
    fields: [
      { id: "flowRate", label: "Flow Rate", unit: "L/min", unitImperial: "SCFM", placeholder: "e.g. 500" },
      { id: "pipeLength", label: "Pipe Length", unit: "m", unitImperial: "ft", placeholder: "e.g. 30" },
      { id: "pipeDiameter", label: "Pipe Inner Diameter", unit: "mm", unitImperial: "in", placeholder: "e.g. 25" },
      { id: "inletPressure", label: "Inlet Pressure", unit: "bar", unitImperial: "psi", placeholder: "e.g. 7" },
    ],
    resultLabel: "Pressure Drop",
    resultUnit: "bar",
    resultUnitImperial: "psi",
    calculate: (v) => {
      // Simplified empirical formula for compressed air
      const d = v.pipeDiameter;
      const q = v.flowRate;
      const l = v.pipeLength;
      const p = v.inletPressure;
      // ΔP ≈ (1.6 × 10^8 × Q^1.85 × L) / (d^5 × P)
      return (1.6e8 * Math.pow(q, 1.85) * l) / (Math.pow(d, 5) * (p + 1.01325) * 1e5) * 1e5;
    },
  },
  {
    id: "valve-flow-coefficient",
    name: "Valve Flow Coefficient (Cv)",
    description: "Calculate the required valve flow coefficient for a given application.",
    fields: [
      { id: "flowRate", label: "Required Flow Rate", unit: "L/min", unitImperial: "SCFM", placeholder: "e.g. 200" },
      { id: "inletPressure", label: "Inlet Pressure", unit: "bar", unitImperial: "psi", placeholder: "e.g. 7" },
      { id: "pressureDrop", label: "Allowable Pressure Drop", unit: "bar", unitImperial: "psi", placeholder: "e.g. 0.5" },
    ],
    resultLabel: "Flow Coefficient",
    resultUnit: "Cv",
    calculate: (v) => {
      const qScfm = v.flowRate * 0.03531;
      const p1Psia = (v.inletPressure + 1.01325) * 14.696 / 1.01325;
      const dpPsi = v.pressureDrop * 14.696 / 1.01325;
      const sg = 1.0;
      const t = 528; // standard temp in Rankine
      return qScfm / (963 * Math.sqrt((dpPsi * (p1Psia - dpPsi / 2)) / (sg * t)));
    },
  },
  {
    id: "compressor-capacity",
    name: "Compressor Capacity",
    description: "Estimate required compressor capacity for your pneumatic system.",
    fields: [
      { id: "totalConsumption", label: "Total Air Consumption", unit: "L/min", unitImperial: "SCFM", placeholder: "e.g. 800" },
      { id: "usageFactor", label: "Usage Factor", unit: "%", placeholder: "e.g. 70", min: 1 },
      { id: "leakageFactor", label: "Leakage Allowance", unit: "%", placeholder: "e.g. 15" },
    ],
    resultLabel: "Required Compressor Capacity",
    resultUnit: "L/min",
    resultUnitImperial: "SCFM",
    calculate: (v) => {
      const usage = v.usageFactor / 100;
      const leakage = 1 + v.leakageFactor / 100;
      return v.totalConsumption * usage * leakage;
    },
  },
];

export interface CalculationResult {
  id: string;
  type: CalculationType;
  typeName: string;
  inputs: Record<string, number>;
  inputLabels: Record<string, string>;
  inputUnits: Record<string, string>;
  result: number;
  resultLabel: string;
  resultUnit: string;
  timestamp: Date;
}

export function formatResult(value: number): string {
  if (Math.abs(value) >= 1000) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(3);
  return value.toFixed(5);
}

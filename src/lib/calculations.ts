// ── Unit System ──────────────────────────────────────────────

export interface UnitDef {
  id: string;
  label: string;
  /** multiply by this to convert FROM this unit TO the base unit */
  toBase: number;
}

export interface UnitGroup {
  id: string;
  name: string;
  baseUnit: string;
  units: UnitDef[];
}

export const unitGroups: Record<string, UnitGroup> = {
  length: {
    id: "length",
    name: "Length",
    baseUnit: "mm",
    units: [
      { id: "mm", label: "mm", toBase: 1 },
      { id: "cm", label: "cm", toBase: 10 },
      { id: "m", label: "m", toBase: 1000 },
      { id: "in", label: "in", toBase: 25.4 },
      { id: "ft", label: "ft", toBase: 304.8 },
    ],
  },
  pressure: {
    id: "pressure",
    name: "Pressure",
    baseUnit: "bar",
    units: [
      { id: "bar", label: "bar", toBase: 1 },
      { id: "psi", label: "psi", toBase: 0.0689476 },
      { id: "kPa", label: "kPa", toBase: 0.01 },
      { id: "MPa", label: "MPa", toBase: 10 },
      { id: "atm", label: "atm", toBase: 1.01325 },
    ],
  },
  force: {
    id: "force",
    name: "Force",
    baseUnit: "N",
    units: [
      { id: "N", label: "N", toBase: 1 },
      { id: "kN", label: "kN", toBase: 1000 },
      { id: "lbf", label: "lbf", toBase: 4.44822 },
      { id: "kgf", label: "kgf", toBase: 9.80665 },
    ],
  },
  flowRate: {
    id: "flowRate",
    name: "Flow Rate",
    baseUnit: "L/min",
    units: [
      { id: "L/min", label: "L/min", toBase: 1 },
      { id: "m3/h", label: "m³/h", toBase: 16.6667 },
      { id: "SCFM", label: "SCFM", toBase: 28.3168 },
      { id: "m3/min", label: "m³/min", toBase: 1000 },
    ],
  },
  rate: {
    id: "rate",
    name: "Rate",
    baseUnit: "cpm",
    units: [{ id: "cpm", label: "cpm", toBase: 1 }],
  },
  percentage: {
    id: "percentage",
    name: "Percentage",
    baseUnit: "%",
    units: [{ id: "%", label: "%", toBase: 1 }],
  },
  cv: {
    id: "cv",
    name: "Flow Coefficient",
    baseUnit: "Cv",
    units: [
      { id: "Cv", label: "Cv", toBase: 1 },
      { id: "Kv", label: "Kv", toBase: 0.864 }, // Kv * 0.864 ≈ Cv (roughly)
    ],
  },
  airConsumption: {
    id: "airConsumption",
    name: "Air Consumption",
    baseUnit: "L/min",
    units: [
      { id: "L/min", label: "L/min (ANR)", toBase: 1 },
      { id: "SCFM", label: "SCFM", toBase: 28.3168 },
      { id: "m3/h", label: "m³/h", toBase: 16.6667 },
    ],
  },
};

export function convertToBase(value: number, unitGroupId: string, unitId: string): number {
  const group = unitGroups[unitGroupId];
  const unit = group.units.find((u) => u.id === unitId);
  if (!unit) return value;
  return value * unit.toBase;
}

export function convertFromBase(value: number, unitGroupId: string, unitId: string): number {
  const group = unitGroups[unitGroupId];
  const unit = group.units.find((u) => u.id === unitId);
  if (!unit) return value;
  return value / unit.toBase;
}

export function convertValue(value: number, unitGroupId: string, fromUnitId: string, toUnitId: string): number {
  const base = convertToBase(value, unitGroupId, fromUnitId);
  return convertFromBase(base, unitGroupId, toUnitId);
}

// ── Calculation Parameters ──────────────────────────────────

export interface ParamDef {
  id: string;
  label: string;
  unitGroup: string;
  defaultUnit: string;
  placeholder: string;
  min?: number;
}

// ── Calculation Types ───────────────────────────────────────

export type CalculationType =
  | "cylinder-force"
  | "cylinder-bore-from-force"
  | "cylinder-pressure-from-force"
  | "air-consumption"
  | "pipe-pressure-drop"
  | "valve-flow-coefficient"
  | "compressor-capacity";

export interface CalculationConfig {
  id: CalculationType;
  name: string;
  category: string;
  description: string;
  params: ParamDef[];
  resultParam: {
    label: string;
    unitGroup: string;
    defaultUnit: string;
  };
  /** All param values are in BASE units. Return value in BASE units. */
  calculate: (values: Record<string, number>) => number;
}

export const calculations: CalculationConfig[] = [
  // ─── Cylinder Force ───
  {
    id: "cylinder-force",
    name: "Cylinder Force",
    category: "Cylinder",
    description: "Calculate theoretical force output from bore diameter and pressure.",
    params: [
      { id: "bore", label: "Bore Diameter", unitGroup: "length", defaultUnit: "mm", placeholder: "e.g. 50" },
      { id: "pressure", label: "Operating Pressure", unitGroup: "pressure", defaultUnit: "bar", placeholder: "e.g. 6" },
    ],
    resultParam: { label: "Theoretical Force", unitGroup: "force", defaultUnit: "N" },
    calculate: (v) => {
      const areaM2 = Math.PI * Math.pow(v.bore / 1000 / 2, 2);
      const pressurePa = v.pressure * 1e5;
      return areaM2 * pressurePa;
    },
  },
  // ─── Bore from Force ───
  {
    id: "cylinder-bore-from-force",
    name: "Bore Diameter from Force",
    category: "Cylinder",
    description: "Calculate required bore diameter given desired force and pressure.",
    params: [
      { id: "force", label: "Required Force", unitGroup: "force", defaultUnit: "N", placeholder: "e.g. 1200" },
      { id: "pressure", label: "Operating Pressure", unitGroup: "pressure", defaultUnit: "bar", placeholder: "e.g. 6" },
    ],
    resultParam: { label: "Required Bore Diameter", unitGroup: "length", defaultUnit: "mm" },
    calculate: (v) => {
      const pressurePa = v.pressure * 1e5;
      const areaM2 = v.force / pressurePa;
      const radiusM = Math.sqrt(areaM2 / Math.PI);
      return radiusM * 2 * 1000; // mm
    },
  },
  // ─── Pressure from Force ───
  {
    id: "cylinder-pressure-from-force",
    name: "Required Pressure from Force",
    category: "Cylinder",
    description: "Calculate required operating pressure given desired force and bore diameter.",
    params: [
      { id: "force", label: "Required Force", unitGroup: "force", defaultUnit: "N", placeholder: "e.g. 1200" },
      { id: "bore", label: "Bore Diameter", unitGroup: "length", defaultUnit: "mm", placeholder: "e.g. 50" },
    ],
    resultParam: { label: "Required Pressure", unitGroup: "pressure", defaultUnit: "bar" },
    calculate: (v) => {
      const areaM2 = Math.PI * Math.pow(v.bore / 1000 / 2, 2);
      const pressurePa = v.force / areaM2;
      return pressurePa / 1e5; // bar
    },
  },
  // ─── Air Consumption ───
  {
    id: "air-consumption",
    name: "Air Consumption",
    category: "Consumption",
    description: "Estimate air consumption rate of a pneumatic cylinder per cycle.",
    params: [
      { id: "bore", label: "Bore Diameter", unitGroup: "length", defaultUnit: "mm", placeholder: "e.g. 50" },
      { id: "stroke", label: "Stroke Length", unitGroup: "length", defaultUnit: "mm", placeholder: "e.g. 100" },
      { id: "pressure", label: "Operating Pressure", unitGroup: "pressure", defaultUnit: "bar", placeholder: "e.g. 6" },
      { id: "cycles", label: "Cycles per Minute", unitGroup: "rate", defaultUnit: "cpm", placeholder: "e.g. 10" },
    ],
    resultParam: { label: "Air Consumption", unitGroup: "airConsumption", defaultUnit: "L/min" },
    calculate: (v) => {
      const areaM2 = Math.PI * Math.pow(v.bore / 1000 / 2, 2);
      const strokeM = v.stroke / 1000;
      const volumePerCycleM3 = areaM2 * strokeM * 2;
      const compressionRatio = (v.pressure + 1.01325) / 1.01325;
      return volumePerCycleM3 * compressionRatio * v.cycles * 1000;
    },
  },
  // ─── Pipe Pressure Drop ───
  {
    id: "pipe-pressure-drop",
    name: "Pipe Pressure Drop",
    category: "Piping",
    description: "Calculate pressure drop in a pneumatic pipe run.",
    params: [
      { id: "flowRate", label: "Flow Rate", unitGroup: "flowRate", defaultUnit: "L/min", placeholder: "e.g. 500" },
      { id: "pipeLength", label: "Pipe Length", unitGroup: "length", defaultUnit: "m", placeholder: "e.g. 30" },
      { id: "pipeDiameter", label: "Pipe Inner Diameter", unitGroup: "length", defaultUnit: "mm", placeholder: "e.g. 25" },
      { id: "inletPressure", label: "Inlet Pressure", unitGroup: "pressure", defaultUnit: "bar", placeholder: "e.g. 7" },
    ],
    resultParam: { label: "Pressure Drop", unitGroup: "pressure", defaultUnit: "bar" },
    calculate: (v) => {
      const d = v.pipeDiameter;
      const q = v.flowRate;
      const l = v.pipeLength / 1000; // mm to m — wait, pipeLength is already in mm (base). Convert to m.
      const lm = v.pipeLength / 1000;
      const p = v.inletPressure;
      return (1.6e8 * Math.pow(q, 1.85) * lm) / (Math.pow(d, 5) * (p + 1.01325) * 1e5) * 1e5;
    },
  },
  // ─── Valve Cv ───
  {
    id: "valve-flow-coefficient",
    name: "Valve Flow Coefficient (Cv)",
    category: "Valves",
    description: "Calculate required valve flow coefficient for a given application.",
    params: [
      { id: "flowRate", label: "Required Flow Rate", unitGroup: "flowRate", defaultUnit: "L/min", placeholder: "e.g. 200" },
      { id: "inletPressure", label: "Inlet Pressure", unitGroup: "pressure", defaultUnit: "bar", placeholder: "e.g. 7" },
      { id: "pressureDrop", label: "Allowable Pressure Drop", unitGroup: "pressure", defaultUnit: "bar", placeholder: "e.g. 0.5" },
    ],
    resultParam: { label: "Flow Coefficient", unitGroup: "cv", defaultUnit: "Cv" },
    calculate: (v) => {
      const qScfm = v.flowRate * 0.03531;
      const p1Psia = (v.inletPressure + 1.01325) * 14.696 / 1.01325;
      const dpPsi = v.pressureDrop * 14.696 / 1.01325;
      const sg = 1.0;
      const t = 528;
      return qScfm / (963 * Math.sqrt((dpPsi * (p1Psia - dpPsi / 2)) / (sg * t)));
    },
  },
  // ─── Compressor Capacity ───
  {
    id: "compressor-capacity",
    name: "Compressor Capacity",
    category: "Compressor",
    description: "Estimate required compressor capacity for your pneumatic system.",
    params: [
      { id: "totalConsumption", label: "Total Air Consumption", unitGroup: "flowRate", defaultUnit: "L/min", placeholder: "e.g. 800" },
      { id: "usageFactor", label: "Usage Factor", unitGroup: "percentage", defaultUnit: "%", placeholder: "e.g. 70", min: 1 },
      { id: "leakageFactor", label: "Leakage Allowance", unitGroup: "percentage", defaultUnit: "%", placeholder: "e.g. 15" },
    ],
    resultParam: { label: "Required Compressor Capacity", unitGroup: "flowRate", defaultUnit: "L/min" },
    calculate: (v) => {
      const usage = v.usageFactor / 100;
      const leakage = 1 + v.leakageFactor / 100;
      // totalConsumption is in L/min (base), percentage is raw
      // But we need to handle percentage specially — it doesn't convert
      return v.totalConsumption * usage * leakage;
    },
  },
];

// ── Result Helpers ──────────────────────────────────────────

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
  if (isNaN(value) || !isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 10000) return value.toFixed(1);
  if (abs >= 100) return value.toFixed(2);
  if (abs >= 1) return value.toFixed(3);
  if (abs >= 0.01) return value.toFixed(4);
  return value.toExponential(3);
}

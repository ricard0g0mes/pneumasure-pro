import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculations,
  CalculationType,
  CalculationResult,
  formatResult,
  unitGroups,
  convertToBase,
  convertFromBase,
} from "@/lib/calculations";
import { addToHistory } from "@/lib/store";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<CalculationType | "">("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [resultUnit, setResultUnit] = useState<string>("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const config = useMemo(
    () => calculations.find((c) => c.id === selectedType),
    [selectedType]
  );

  const handleSelect = (type: CalculationType) => {
    setSelectedType(type);
    setValues({});
    setResult(null);
    setShowSuccess(false);
    const cfg = calculations.find((c) => c.id === type);
    if (cfg) {
      const units: Record<string, string> = {};
      cfg.params.forEach((p) => {
        units[p.id] = p.defaultUnit;
      });
      setSelectedUnits(units);
      setResultUnit(cfg.resultParam.defaultUnit);
    }
  };

  const allFieldsFilled = config
    ? config.params.every(
        (f) => values[f.id] && !isNaN(Number(values[f.id])) && Number(values[f.id]) > 0
      )
    : false;

  const handleCalculate = () => {
    if (!config || !allFieldsFilled) return;
    setCalculating(true);

    setTimeout(() => {
      // Convert all inputs to base units
      const baseValues: Record<string, number> = {};
      const inputLabels: Record<string, string> = {};
      const inputUnits: Record<string, string> = {};
      config.params.forEach((p) => {
        const raw = Number(values[p.id]);
        const unit = selectedUnits[p.id] || p.defaultUnit;
        // For percentage, don't convert
        if (p.unitGroup === "percentage" || p.unitGroup === "rate") {
          baseValues[p.id] = raw;
        } else {
          baseValues[p.id] = convertToBase(raw, p.unitGroup, unit);
        }
        inputLabels[p.id] = p.label;
        inputUnits[p.id] = unit;
      });

      const baseResult = config.calculate(baseValues);

      const calcResult: CalculationResult = {
        id: crypto.randomUUID(),
        type: config.id,
        typeName: config.name,
        inputs: Object.fromEntries(
          config.params.map((p) => [p.id, Number(values[p.id])])
        ),
        inputLabels,
        inputUnits,
        result: baseResult,
        resultLabel: config.resultParam.label,
        resultUnit: config.resultParam.defaultUnit,
        timestamp: new Date(),
      };

      addToHistory(calcResult);
      setResult(calcResult);
      setCalculating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 300);
  };

  // Get result in currently selected display unit
  const displayResult = useMemo(() => {
    if (!result || !config) return null;
    const ug = config.resultParam.unitGroup;
    const unit = resultUnit || config.resultParam.defaultUnit;
    if (ug === "percentage" || ug === "rate") return result.result;
    return convertFromBase(result.result, ug, unit);
  }, [result, config, resultUnit]);

  // All result unit conversions
  const allResultConversions = useMemo(() => {
    if (!result || !config) return [];
    const ug = config.resultParam.unitGroup;
    const group = unitGroups[ug];
    if (!group) return [];
    return group.units.map((u) => ({
      unit: u.id,
      label: u.label,
      value: ug === "percentage" || ug === "rate"
        ? result.result
        : convertFromBase(result.result, ug, u.id),
    }));
  }, [result, config]);

  // Group calculations by category
  const categories = useMemo(() => {
    const cats: Record<string, typeof calculations> = {};
    calculations.forEach((c) => {
      if (!cats[c.category]) cats[c.category] = [];
      cats[c.category].push(c);
    });
    return cats;
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Pneumatic Calculator
        </h1>
        <p className="text-muted-foreground">
          Welcome back. Ready to optimize your pneumatic systems?
        </p>
      </div>

      {/* Calculation Type Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">
          Select Calculation Type
        </Label>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => handleSelect(e.target.value as CalculationType)}
            className="w-full h-12 px-4 pr-10 rounded-lg border bg-card text-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          >
            <option value="">Choose a calculation...</option>
            {Object.entries(categories).map(([cat, calcs]) => (
              <optgroup key={cat} label={cat}>
                {calcs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Input Fields */}
      <AnimatePresence mode="wait">
        {config && (
          <motion.div
            key={config.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className="text-sm text-muted-foreground">{config.description}</p>

            <div className="grid gap-4">
              {config.params.map((field, i) => {
                const group = unitGroups[field.unitGroup];
                const hasMultipleUnits = group && group.units.length > 1;
                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                    className="space-y-1.5"
                  >
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={field.id}
                        type="number"
                        placeholder={field.placeholder}
                        min={field.min ?? 0}
                        step="any"
                        value={values[field.id] || ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                        }
                        className="h-12 flex-1"
                      />
                      {hasMultipleUnits ? (
                        <div className="relative">
                          <select
                            value={selectedUnits[field.id] || field.defaultUnit}
                            onChange={(e) =>
                              setSelectedUnits((prev) => ({
                                ...prev,
                                [field.id]: e.target.value,
                              }))
                            }
                            className="h-12 px-3 pr-8 rounded-lg border bg-secondary text-secondary-foreground text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring transition-shadow min-w-[80px]"
                          >
                            {group.units.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                        </div>
                      ) : (
                        <div className="h-12 px-3 rounded-lg border bg-secondary flex items-center text-sm font-medium text-muted-foreground min-w-[60px] justify-center">
                          {group?.units[0]?.label || field.defaultUnit}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!allFieldsFilled || calculating}
              className="w-full h-12 text-base font-medium"
            >
              {calculating ? (
                <motion.div
                  className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Result
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && config && displayResult !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-xl border bg-card p-8 space-y-6"
          >
            {/* Primary result */}
            <div className="text-center space-y-1">
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mx-auto mb-3 h-10 w-10 rounded-full bg-accent flex items-center justify-center"
                >
                  <Check className="h-5 w-5 text-accent-foreground" />
                </motion.div>
              )}
              <p className="text-sm text-muted-foreground">{result.resultLabel}</p>
              <p className="text-4xl font-bold tracking-tight text-foreground">
                {formatResult(displayResult)}
              </p>
              {/* Result unit selector */}
              {allResultConversions.length > 1 ? (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <select
                    value={resultUnit}
                    onChange={(e) => setResultUnit(e.target.value)}
                    className="px-3 py-1.5 rounded-md border bg-secondary text-sm font-medium text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {allResultConversions.map((c) => (
                      <option key={c.unit} value={c.unit}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm font-medium text-primary">{resultUnit}</p>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Calculation complete. Precision achieved.
            </p>

            {/* All unit conversions */}
            {allResultConversions.length > 1 && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Result in all units
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allResultConversions.map((c) => (
                    <div
                      key={c.unit}
                      className={`rounded-lg border p-3 text-center transition-colors ${
                        c.unit === resultUnit
                          ? "bg-primary/5 border-primary/20"
                          : "bg-secondary/50"
                      }`}
                    >
                      <p className="text-base font-semibold text-foreground">
                        {formatResult(c.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/history")}
                className="w-full h-11"
              >
                View History
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!selectedType && (
        <div className="text-center py-12 text-muted-foreground">
          <Calculator className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>Select a calculation type above to get started.</p>
        </div>
      )}
    </div>
  );
}

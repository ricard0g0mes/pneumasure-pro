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
} from "@/lib/calculations";
import { addToHistory, isUnlocked } from "@/lib/store";
import EmailUnlockModal from "@/components/EmailUnlockModal";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<CalculationType | "">("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
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
  };

  const allFieldsFilled = config
    ? config.fields.every((f) => values[f.id] && !isNaN(Number(values[f.id])) && Number(values[f.id]) > 0)
    : false;

  const handleCalculate = () => {
    if (!config || !allFieldsFilled) return;
    setCalculating(true);

    setTimeout(() => {
      const numericValues: Record<string, number> = {};
      const inputLabels: Record<string, string> = {};
      const inputUnits: Record<string, string> = {};
      config.fields.forEach((f) => {
        numericValues[f.id] = Number(values[f.id]);
        inputLabels[f.id] = f.label;
        inputUnits[f.id] = f.unit;
      });

      const calcResult: CalculationResult = {
        id: crypto.randomUUID(),
        type: config.id,
        typeName: config.name,
        inputs: numericValues,
        inputLabels,
        inputUnits,
        result: config.calculate(numericValues),
        resultLabel: config.resultLabel,
        resultUnit: config.resultUnit,
        timestamp: new Date(),
      };

      addToHistory(calcResult);
      setResult(calcResult);
      setCalculating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 400);
  };

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
            {calculations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
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
              {config.fields.map((field, i) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                  className="space-y-1.5"
                >
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label}{" "}
                    <span className="text-muted-foreground font-normal">({field.unit})</span>
                  </Label>
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
                    className="h-12"
                  />
                </motion.div>
              ))}
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
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-xl border bg-card p-8 space-y-6"
          >
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
                {formatResult(result.result)}
              </p>
              <p className="text-sm font-medium text-primary">{result.resultUnit}</p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Calculation complete. Precision achieved.
            </p>

            {!isUnlocked() && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowUnlock(true)}
                  className="w-full h-11 animate-pulse-subtle"
                >
                  Unlock History & Export
                </Button>
              </div>
            )}

            {isUnlocked() && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate("/history")}
                  className="w-full h-11"
                >
                  View History
                </Button>
              </div>
            )}
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

      <EmailUnlockModal
        open={showUnlock}
        onClose={() => setShowUnlock(false)}
        onUnlocked={() => {
          setShowUnlock(false);
          navigate("/history");
        }}
      />
    </div>
  );
}

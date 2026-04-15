import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHistory, clearHistory, isUnlocked } from "@/lib/store";
import { CalculationResult, formatResult } from "@/lib/calculations";
import EmailUnlockModal from "@/components/EmailUnlockModal";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [showUnlock, setShowUnlock] = useState(false);
  const unlocked = isUnlocked();

  useEffect(() => {
    if (unlocked) setHistory(getHistory());
  }, [unlocked]);

  const exportPdf = (items: CalculationResult[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("PneumaFlow Pro — Calculation Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    let y = 42;
    items.forEach((item, i) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${item.typeName}`, 14, y);
      y += 7;
      doc.setFontSize(10);
      Object.entries(item.inputs).forEach(([key, val]) => {
        doc.text(`  ${item.inputLabels[key]}: ${val} ${item.inputUnits[key]}`, 18, y);
        y += 5;
      });
      doc.setFontSize(11);
      doc.text(`  → ${item.resultLabel}: ${formatResult(item.result)} ${item.resultUnit}`, 18, y);
      y += 5;
      doc.setFontSize(9);
      doc.text(`  ${new Date(item.timestamp).toLocaleString()}`, 18, y);
      y += 10;
    });

    doc.save("pneumaflow-report.pdf");
  };

  if (!unlocked) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">Calculation History</h1>
        <p className="text-muted-foreground">
          No history yet? Perform your first calculation above.
        </p>
        <p className="text-sm text-muted-foreground">
          Enter your email to unlock history tracking and PDF export.
        </p>
        <Button onClick={() => setShowUnlock(true)} className="h-11">
          Unlock History
        </Button>
        <EmailUnlockModal
          open={showUnlock}
          onClose={() => setShowUnlock(false)}
          onUnlocked={() => {
            setShowUnlock(false);
            setHistory(getHistory());
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calculation History</h1>
          <p className="text-sm text-muted-foreground">{history.length} calculations saved</p>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportPdf(history)}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearHistory();
                  setHistory([]);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calculator className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>No calculations yet. Head to the calculator to get started.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            Go to Calculator
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="group border rounded-lg bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{item.typeName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {Object.entries(item.inputs).map(([key, val]) => (
                      <span key={key}>
                        {item.inputLabels[key]}: {val} {item.inputUnits[key]}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => exportPdf([item])}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t flex items-baseline justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">{item.resultLabel}: </span>
                  <span className="text-lg font-bold text-foreground">{formatResult(item.result)}</span>
                  <span className="text-sm text-primary ml-1">{item.resultUnit}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

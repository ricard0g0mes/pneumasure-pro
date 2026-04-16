import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setEmail } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export default function EmailUnlockModal({ open, onClose, onUnlocked }: Props) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError(t("unlock.emailError"));
      return;
    }
    setEmail(value);
    setSuccess(true);
    setTimeout(() => {
      onUnlocked();
      setSuccess(false);
      setValue("");
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card border rounded-xl shadow-2xl w-full max-w-md mx-4 p-8 relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="unlock-title"
            aria-describedby="unlock-desc"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <motion.div
                className="flex flex-col items-center py-8 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-8 w-8 text-accent-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground">{t("unlock.success")}</p>
                <p className="text-sm text-muted-foreground">{t("unlock.redirect")}</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 id="unlock-title" className="text-lg font-semibold">{t("unlock.title")}</h2>
                    <p id="unlock-desc" className="text-sm text-muted-foreground">{t("unlock.desc")}</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        setError("");
                      }}
                      className="h-12"
                      aria-label="Email address"
                    />
                    {error && (
                      <p className="text-sm text-destructive mt-1.5">{error}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-medium">
                    {t("unlock.btn")}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">{t("unlock.privacy")}</p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

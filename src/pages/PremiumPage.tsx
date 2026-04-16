import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Gauge, ArrowRightLeft, Download, Headphones, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function PremiumPage() {
  const { t } = useI18n();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const features = [
    { icon: Gauge, title: t("premium.feat.allCalc"), desc: t("premium.feat.allCalcDesc") },
    { icon: ArrowRightLeft, title: t("premium.feat.units"), desc: t("premium.feat.unitsDesc") },
    { icon: Infinity, title: t("premium.feat.history"), desc: t("premium.feat.historyDesc") },
    { icon: Download, title: t("premium.feat.pdf"), desc: t("premium.feat.pdfDesc") },
    { icon: Headphones, title: t("premium.feat.support"), desc: t("premium.feat.supportDesc") },
  ];

  const plans = [
    { id: "monthly", label: t("premium.monthly"), price: "$9", period: "/mo" },
    { id: "annual", label: t("premium.annual"), price: "$79", period: "/yr", badge: "Save 27%" },
  ];

  const selectedPlan = plans.find((p) => p.id === billing)!;

  const checklistItems = [
    t("premium.list.allCalc"),
    t("premium.list.units"),
    t("premium.list.history"),
    t("premium.list.pdf"),
    t("premium.list.support"),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Crown className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("premium.title")}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{t("premium.subtitle")}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="border rounded-lg bg-card p-5 space-y-2"
          >
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="border rounded-xl bg-card p-8 space-y-6">
        <div className="flex items-center justify-center gap-2">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setBilling(plan.id as "monthly" | "annual")}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billing === plan.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {plan.label}
              {plan.badge && billing === plan.id && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-semibold">
                  {plan.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-center space-y-1">
          <motion.div
            key={billing}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-5xl font-bold text-foreground">{selectedPlan.price}</span>
            <span className="text-muted-foreground text-lg">{selectedPlan.period}</span>
          </motion.div>
        </div>

        <ul className="space-y-2 max-w-xs mx-auto">
          {checklistItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-accent flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <Button className="w-full h-12 text-base font-medium">{t("premium.upgradeBtn")}</Button>
        <p className="text-xs text-center text-muted-foreground">{t("premium.payment")}</p>
      </div>
    </div>
  );
}

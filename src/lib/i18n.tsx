import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "en" | "pt";

const LANG_KEY = "pneumaflow_lang";

function getSavedLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "pt" || saved === "en") return saved;
  return "en";
}

interface I18nContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.calculate": { en: "Calculate", pt: "Calcular" },
  "nav.history": { en: "History", pt: "Histórico" },
  "nav.premium": { en: "Premium", pt: "Premium" },

  // Index page
  "index.title": { en: "Pneumatic Calculator", pt: "Calculadora Pneumática" },
  "index.subtitle": { en: "Welcome back. Ready to optimize your pneumatic systems?", pt: "Bem-vindo. Pronto para otimizar os seus sistemas pneumáticos?" },
  "index.selectType": { en: "Select Calculation Type", pt: "Selecione o Tipo de Cálculo" },
  "index.choose": { en: "Choose a calculation...", pt: "Escolha um cálculo..." },
  "index.calculateBtn": { en: "Calculate Result", pt: "Calcular Resultado" },
  "index.complete": { en: "Calculation complete. Precision achieved.", pt: "Cálculo concluído. Precisão alcançada." },
  "index.allUnits": { en: "Result in all units", pt: "Resultado em todas as unidades" },
  "index.viewHistory": { en: "View History", pt: "Ver Histórico" },
  "index.emptyState": { en: "Select a calculation type above to get started.", pt: "Selecione um tipo de cálculo acima para começar." },

  // History page
  "history.title": { en: "Calculation History", pt: "Histórico de Cálculos" },
  "history.saved": { en: "calculations saved", pt: "cálculos guardados" },
  "history.exportAll": { en: "Export All", pt: "Exportar Tudo" },
  "history.clear": { en: "Clear", pt: "Limpar" },
  "history.empty": { en: "No calculations yet. Head to the calculator to get started.", pt: "Ainda não há cálculos. Vá à calculadora para começar." },
  "history.goCalc": { en: "Go to Calculator", pt: "Ir para Calculadora" },
  "history.noHistory": { en: "No history yet? Perform your first calculation above.", pt: "Ainda sem histórico? Faça o seu primeiro cálculo." },
  "history.unlockDesc": { en: "Enter your email to unlock history tracking and PDF export.", pt: "Insira o seu email para desbloquear o histórico e exportação PDF." },
  "history.unlock": { en: "Unlock History", pt: "Desbloquear Histórico" },

  // Premium page
  "premium.title": { en: "Upgrade to Pro", pt: "Atualizar para Pro" },
  "premium.subtitle": { en: "Unlock the full power of PneumaFlow. Precision tools for serious engineers.", pt: "Desbloqueie todo o poder do PneumaFlow. Ferramentas de precisão para engenheiros sérios." },
  "premium.upgradeBtn": { en: "Upgrade to Pro", pt: "Atualizar para Pro" },
  "premium.payment": { en: "Secure payment via Stripe. Cancel anytime.", pt: "Pagamento seguro via Stripe. Cancele quando quiser." },
  "premium.monthly": { en: "Monthly", pt: "Mensal" },
  "premium.annual": { en: "Annual", pt: "Anual" },

  // Premium features
  "premium.feat.allCalc": { en: "All Calculation Types", pt: "Todos os Tipos de Cálculo" },
  "premium.feat.allCalcDesc": { en: "Access every pneumatic calculation in our library.", pt: "Aceda a todos os cálculos pneumáticos da nossa biblioteca." },
  "premium.feat.units": { en: "Unit System Toggle", pt: "Alternância de Unidades" },
  "premium.feat.unitsDesc": { en: "Switch between SI and Imperial units instantly.", pt: "Alterne entre unidades SI e Imperiais instantaneamente." },
  "premium.feat.history": { en: "Unlimited History", pt: "Histórico Ilimitado" },
  "premium.feat.historyDesc": { en: "Never lose a calculation. Full history retention.", pt: "Nunca perca um cálculo. Retenção total do histórico." },
  "premium.feat.pdf": { en: "Advanced PDF Export", pt: "Exportação PDF Avançada" },
  "premium.feat.pdfDesc": { en: "Branded reports with full calculation breakdowns.", pt: "Relatórios com detalhes completos dos cálculos." },
  "premium.feat.support": { en: "Priority Support", pt: "Suporte Prioritário" },
  "premium.feat.supportDesc": { en: "Dedicated engineering support when you need it.", pt: "Suporte técnico dedicado quando precisar." },
  "premium.list.allCalc": { en: "All calculations", pt: "Todos os cálculos" },
  "premium.list.units": { en: "Unit switching", pt: "Alternância de unidades" },
  "premium.list.history": { en: "Unlimited history", pt: "Histórico ilimitado" },
  "premium.list.pdf": { en: "PDF export", pt: "Exportação PDF" },
  "premium.list.support": { en: "Priority support", pt: "Suporte prioritário" },

  // Unlock modal
  "unlock.title": { en: "Unlock History", pt: "Desbloquear Histórico" },
  "unlock.desc": { en: "Save your work, track progress, export data.", pt: "Guarde o seu trabalho, acompanhe o progresso, exporte dados." },
  "unlock.btn": { en: "Unlock Now", pt: "Desbloquear Agora" },
  "unlock.privacy": { en: "We respect your privacy. No spam, ever.", pt: "Respeitamos a sua privacidade. Sem spam, nunca." },
  "unlock.success": { en: "History Unlocked!", pt: "Histórico Desbloqueado!" },
  "unlock.redirect": { en: "Redirecting you now...", pt: "A redirecionar..." },
  "unlock.emailError": { en: "Please enter a valid email address.", pt: "Por favor insira um email válido." },

  // Footer
  "footer.copy": { en: "PneumaFlow Pro. Precision engineering tools.", pt: "PneumaFlow Pro. Ferramentas de engenharia de precisão." },
  "footer.madeBy": { en: "Developed by", pt: "Desenvolvido por" },

  // Calculation names
  "calc.cylinder-force.name": { en: "Cylinder Force", pt: "Força do Cilindro" },
  "calc.cylinder-force.desc": { en: "Calculate theoretical force output from bore diameter and pressure.", pt: "Calcule a força teórica a partir do diâmetro do êmbolo e da pressão." },
  "calc.cylinder-bore-from-force.name": { en: "Bore Diameter from Force", pt: "Diâmetro do Êmbolo a partir da Força" },
  "calc.cylinder-bore-from-force.desc": { en: "Calculate required bore diameter given desired force and pressure.", pt: "Calcule o diâmetro do êmbolo necessário dada a força e pressão desejadas." },
  "calc.cylinder-pressure-from-force.name": { en: "Required Pressure from Force", pt: "Pressão Necessária a partir da Força" },
  "calc.cylinder-pressure-from-force.desc": { en: "Calculate required operating pressure given desired force and bore diameter.", pt: "Calcule a pressão de operação necessária dada a força e diâmetro do êmbolo." },
  "calc.cylinder-advance-speed.name": { en: "Cylinder Advance Speed", pt: "Velocidade de Avanço do Cilindro" },
  "calc.cylinder-advance-speed.desc": { en: "Calculate piston advance speed from flow rate and bore diameter.", pt: "Calcule a velocidade de avanço do pistão a partir do caudal e diâmetro do êmbolo." },
  "calc.cylinder-retract-speed.name": { en: "Cylinder Retract Speed", pt: "Velocidade de Recuo do Cilindro" },
  "calc.cylinder-retract-speed.desc": { en: "Calculate piston retract speed from flow rate, bore and rod diameter.", pt: "Calcule a velocidade de recuo do pistão a partir do caudal, diâmetro do êmbolo e da haste." },
  "calc.cylinder-required-flow.name": { en: "Required Flow Rate", pt: "Caudal Necessário" },
  "calc.cylinder-required-flow.desc": { en: "Calculate required flow rate for a desired cylinder speed.", pt: "Calcule o caudal necessário para a velocidade desejada do cilindro." },
  "calc.cylinder-travel-time.name": { en: "Cylinder Travel Time", pt: "Tempo de Movimento do Cilindro" },
  "calc.cylinder-travel-time.desc": { en: "Calculate time for a cylinder to complete its stroke given speed.", pt: "Calcule o tempo para o cilindro completar o seu curso dada a velocidade." },
  "calc.cylinder-stroke-from-time.name": { en: "Stroke from Travel Time", pt: "Curso a partir do Tempo de Movimento" },
  "calc.cylinder-stroke-from-time.desc": { en: "Calculate maximum stroke length for a given travel time and speed.", pt: "Calcule o curso máximo para um dado tempo de movimento e velocidade." },
  "calc.air-consumption.name": { en: "Air Consumption", pt: "Consumo de Ar" },
  "calc.air-consumption.desc": { en: "Estimate air consumption rate of a pneumatic cylinder per cycle.", pt: "Estime o consumo de ar de um cilindro pneumático por ciclo." },
  "calc.pipe-pressure-drop.name": { en: "Pipe Pressure Drop", pt: "Perda de Carga na Tubagem" },
  "calc.pipe-pressure-drop.desc": { en: "Calculate pressure drop in a pneumatic pipe run.", pt: "Calcule a perda de carga numa tubagem pneumática." },
  "calc.compressor-capacity.name": { en: "Compressor Capacity", pt: "Capacidade do Compressor" },
  "calc.compressor-capacity.desc": { en: "Estimate required compressor capacity for your pneumatic system.", pt: "Estime a capacidade do compressor necessária para o seu sistema pneumático." },

  // Calculation categories
  "cat.Cylinder": { en: "Cylinder", pt: "Cilindro" },
  "cat.Consumption": { en: "Consumption", pt: "Consumo" },
  "cat.Piping": { en: "Piping", pt: "Tubagem" },
  "cat.Compressor": { en: "Compressor", pt: "Compressor" },

  // Param labels
  "param.bore": { en: "Bore Diameter", pt: "Diâmetro do Êmbolo" },
  "param.pressure": { en: "Operating Pressure", pt: "Pressão de Operação" },
  "param.force": { en: "Required Force", pt: "Força Necessária" },
  "param.flowRate": { en: "Flow Rate", pt: "Caudal" },
  "param.rod": { en: "Rod Diameter", pt: "Diâmetro da Haste" },
  "param.speed": { en: "Desired Speed", pt: "Velocidade Desejada" },
  "param.stroke": { en: "Stroke Length", pt: "Comprimento do Curso" },
  "param.pistonSpeed": { en: "Piston Speed", pt: "Velocidade do Pistão" },
  "param.time": { en: "Available Time", pt: "Tempo Disponível" },
  "param.cycles": { en: "Cycles per Minute", pt: "Ciclos por Minuto" },
  "param.pipeLength": { en: "Pipe Length", pt: "Comprimento da Tubagem" },
  "param.pipeDiameter": { en: "Pipe Inner Diameter", pt: "Diâmetro Interior da Tubagem" },
  "param.inletPressure": { en: "Inlet Pressure", pt: "Pressão de Entrada" },
  "param.totalConsumption": { en: "Total Air Consumption", pt: "Consumo Total de Ar" },
  "param.usageFactor": { en: "Usage Factor", pt: "Fator de Utilização" },
  "param.leakageFactor": { en: "Leakage Allowance", pt: "Margem de Fugas" },

  // Result labels
  "result.force": { en: "Theoretical Force", pt: "Força Teórica" },
  "result.bore": { en: "Required Bore Diameter", pt: "Diâmetro do Êmbolo Necessário" },
  "result.pressure": { en: "Required Pressure", pt: "Pressão Necessária" },
  "result.advanceSpeed": { en: "Advance Speed", pt: "Velocidade de Avanço" },
  "result.retractSpeed": { en: "Retract Speed", pt: "Velocidade de Recuo" },
  "result.flowRate": { en: "Required Flow Rate", pt: "Caudal Necessário" },
  "result.travelTime": { en: "Travel Time", pt: "Tempo de Movimento" },
  "result.stroke": { en: "Maximum Stroke", pt: "Curso Máximo" },
  "result.airConsumption": { en: "Air Consumption", pt: "Consumo de Ar" },
  "result.pressureDrop": { en: "Pressure Drop", pt: "Perda de Carga" },
  "result.compressorCapacity": { en: "Required Compressor Capacity", pt: "Capacidade do Compressor Necessária" },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getSavedLang);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "pt" : "en";
      localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.en || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

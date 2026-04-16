import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, toggleLang } = useI18n();

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
      aria-label={lang === "en" ? "Switch to Portuguese" : "Mudar para Inglês"}
      title={lang === "en" ? "Mudar para Português" : "Switch to English"}
    >
      {lang === "en" ? (
        <>
          <span className="text-base leading-none">🇬🇧</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">EN</span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">🇵🇹</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">PT</span>
        </>
      )}
    </button>
  );
}

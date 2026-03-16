import { useUiLanguage } from "@/features/i18n/useUiLanguage";
import { cn } from "@/lib/utils";

const localeOptions = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
] as const;

type UiLanguageSwitchProps = {
  className?: string;
};

export function UiLanguageSwitch({ className }: UiLanguageSwitchProps) {
  const { locale, setLocale, t } = useUiLanguage();
  const isEnglish = locale === "en";

  return (
    <div
      className={cn(
        "relative inline-grid w-fit grid-cols-2 overflow-hidden rounded-full border border-white/12 bg-slate-900/72 p-1 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78",
        className,
      )}
      role="group"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full border border-white/14 bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_24px_-18px_rgba(15,23,42,0.9)] transition-transform duration-300 ease-out dark:border-white/10 dark:bg-white/12"
        style={{
          transform: isEnglish ? "translateX(100%)" : "translateX(0)",
        }}
      />
      {localeOptions.map((option) => {
        const isActive = locale === option.value;
        const title =
          option.value === "es" ? t.uiLanguage.spanish : t.uiLanguage.english;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={title}
            aria-pressed={isActive}
            title={title}
            onClick={() => setLocale(option.value)}
            className={cn(
              "relative z-10 inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-full px-3 text-[11px] font-semibold tracking-[0.24em] transition-colors duration-300 ease-out",
              isActive ? "text-white" : "text-white/52 hover:text-white/78",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

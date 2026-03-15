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

  return (
    <div
      className={cn(
        "theme-switch relative inline-grid w-fit grid-cols-2 rounded-xl border border-white/38 bg-white/24 p-1 backdrop-blur-xl dark:border-white/12 dark:bg-white/7",
        className,
      )}
      data-mode={locale}
    >
      <span
        aria-hidden="true"
        className="theme-switch-thumb pointer-events-none absolute inset-y-1 left-1 w-8 rounded-lg bg-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_12px_30px_-18px_rgba(91,33,182,0.34)] dark:bg-white/14 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_36px_-24px_rgba(0,0,0,0.5)]"
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
              "relative z-10 inline-flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-[color,transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isActive
                ? "text-foreground"
                : "text-muted-foreground/90 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

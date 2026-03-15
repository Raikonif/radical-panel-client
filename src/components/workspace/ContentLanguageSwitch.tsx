import { Button } from "@/components/ui/button";
import type { ContentLanguage } from "@/features/content/types";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";
import { cn } from "@/lib/utils";

const languageOptions: Array<{ value: ContentLanguage; label: string }> = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

type ContentLanguageSwitchProps = {
  value: ContentLanguage;
  onChange: (language: ContentLanguage) => void;
  className?: string;
};

export function ContentLanguageSwitch({
  value,
  onChange,
  className,
}: ContentLanguageSwitchProps) {
  const { t } = useUiLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-white/38 bg-white/24 p-1 backdrop-blur-xl dark:border-white/12 dark:bg-white/7",
        className,
      )}
    >
      {languageOptions.map((option) => {
        const isActive = value === option.value;
        const detail =
          option.value === "es" ? t.uiLanguage.spanish : t.uiLanguage.english;

        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "min-w-18 rounded-lg px-2.5 transition-all duration-500",
              isActive
                ? "bg-white/72 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_10px_24px_-18px_rgba(91,33,182,0.28)] dark:bg-white/14"
                : "text-muted-foreground hover:bg-white/34 hover:text-foreground dark:hover:bg-white/10",
            )}
            onClick={() => onChange(option.value)}
          >
            <span>{option.label}</span>
            <span className="text-[9px] uppercase tracking-[0.16em] opacity-70">
              {detail}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

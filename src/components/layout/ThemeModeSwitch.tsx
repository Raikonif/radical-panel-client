import { Desktop, MoonStars, Sun } from "@phosphor-icons/react";
import { type ThemeMode } from "@/features/theme/theme-context";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";
import { useTheme } from "@/features/theme/useTheme";
import { cn } from "@/lib/utils";

const themeOptions: Array<{
  value: ThemeMode;
  icon: typeof Sun;
}> = [
  { value: "light", icon: Sun },
  { value: "dark", icon: MoonStars },
  { value: "system", icon: Desktop },
];

type ThemeModeSwitchProps = {
  className?: string;
};

export function ThemeModeSwitch({ className }: ThemeModeSwitchProps) {
  const { mode, setMode } = useTheme();
  const { t } = useUiLanguage();

  const labels = {
    light: t.theme.light,
    dark: t.theme.dark,
    system: t.theme.system,
  } as const;

  return (
    <div
      className={cn(
        "theme-switch relative inline-grid w-fit grid-cols-3 rounded-xl border border-white/38 bg-white/24 p-1 backdrop-blur-xl dark:border-white/12 dark:bg-white/7",
        className,
      )}
      data-mode={mode}
    >
      <span
        aria-hidden="true"
        className="theme-switch-thumb pointer-events-none absolute inset-y-1 left-1 w-8 rounded-lg bg-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_12px_30px_-18px_rgba(91,33,182,0.34)] dark:bg-white/14 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_36px_-24px_rgba(0,0,0,0.5)]"
      />
      {themeOptions.map(({ value, icon: Icon }) => {
        const isActive = mode === value;
        const label = labels[value];

        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            onClick={() => setMode(value)}
            className={cn(
              "relative z-10 inline-flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-[color,transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isActive
                ? "text-foreground"
                : "text-muted-foreground/90 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isActive ? "scale-105" : "scale-100",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

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
  const thumbOffset =
    mode === "light" ? "0%" : mode === "dark" ? "100%" : "200%";

  const labels = {
    light: t.theme.light,
    dark: t.theme.dark,
    system: t.theme.system,
  } as const;

  return (
    <div
      className={cn(
        "relative inline-grid w-fit grid-cols-3 overflow-hidden rounded-full border border-white/12 bg-slate-900/72 p-1 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78",
        className,
      )}
      role="group"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full border border-white/14 bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_24px_-18px_rgba(15,23,42,0.9)] transition-transform duration-300 ease-out dark:border-white/10 dark:bg-white/12"
        style={{
          transform: `translateX(${thumbOffset})`,
        }}
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
              "relative z-10 inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-full px-3 text-xs font-medium transition-colors duration-300 ease-out",
              isActive ? "text-white" : "text-white/52 hover:text-white/78",
            )}
          >
            <Icon
              className={cn(
                "size-3.5 transition-transform duration-300 ease-out",
                isActive ? "scale-105" : "scale-100",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

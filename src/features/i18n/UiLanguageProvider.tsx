import { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { createContext } from "react";
import {
  messages,
  type Messages,
  type UiLocale,
} from "@/features/i18n/messages";

const UI_LANGUAGE_STORAGE_KEY = "radical-panel-ui-language";

type UiLanguageContextValue = {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
  t: Messages;
};

const UiLanguageContext = createContext<UiLanguageContextValue | null>(null);

function readStoredLocale(): UiLocale {
  if (typeof window === "undefined") {
    return "es";
  }

  const storedLocale = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
  return storedLocale === "en" ? "en" : "es";
}

export function UiLanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<UiLocale>(() => readStoredLocale());

  function setLocale(locale: UiLocale) {
    setLocaleState(locale);
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, locale);
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: messages[locale],
    }),
    [locale],
  );

  return (
    <UiLanguageContext.Provider value={value}>
      {children}
    </UiLanguageContext.Provider>
  );
}

export { UiLanguageContext };

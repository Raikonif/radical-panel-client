import { useContext } from "react";
import { UiLanguageContext } from "@/features/i18n/UiLanguageProvider";

export function useUiLanguage() {
  const context = useContext(UiLanguageContext);

  if (!context) {
    throw new Error("useUiLanguage must be used inside UiLanguageProvider.");
  }

  return context;
}

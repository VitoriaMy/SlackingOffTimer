import { useCallback } from "react";
import { TEXT } from "../i18n";
import { useSettingsStore } from "../store/settingsStore";

type I18nKey = keyof (typeof TEXT)["zh"];

export function usei18n() {
  const { language } = useSettingsStore();
  const locale = TEXT[language];

  return useCallback((key: I18nKey) => locale[key], [locale]);
}

export const useI18n = usei18n;

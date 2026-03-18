import { useCallback, useMemo } from "react";
import { t, type LocaleText } from "_/i18";
import { useSettingsStore } from "@/store";

type LocaleKey = keyof LocaleText;

export function usei18n() {
  const { language } = useSettingsStore();
  const text = useMemo(() => t(language), [language]);

  return useCallback(
    <K extends LocaleKey>(key: K) => text[key],
    [text],
  );
}
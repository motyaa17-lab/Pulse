'use client';

import { useMemo } from 'react';
import { en, type I18nKey } from './en';
import { ru } from './ru';
import { useLanguageStore, type Language } from '@/stores/language-store';

const dict = { en, ru } as const;

export function t(key: I18nKey, language?: Language): string {
  const lang = language ?? useLanguageStore.getState().language;
  const table = dict[lang] ?? dict.en;
  return (table as Record<string, string>)[key] ?? (dict.en as Record<string, string>)[key] ?? key;
}

export function useT() {
  const language = useLanguageStore((s) => s.language);
  return useMemo(() => {
    return (key: I18nKey) => t(key, language);
  }, [language]);
}

export type { I18nKey };


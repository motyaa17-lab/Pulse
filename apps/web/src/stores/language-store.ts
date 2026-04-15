'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ru' | 'en';

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'pulse-language' },
  ),
);


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLocales } from 'expo-localization';
import { dictionaries, Locale } from './i18n/locales';

const STORAGE_KEY = 'sat_gg_language';
const SUPPORTED: Locale[] = ['en', 'ru', 'kk'];

function detectSystemLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  if (code && SUPPORTED.includes(code as Locale)) return code as Locale;
  return 'en';
}

// Reaches into dictionaries.<locale> by dot path, e.g. "profile.logout" -> dictionaries.en.profile.logout.
// Falls back to English, then to the raw key, so a missing translation never crashes the screen.
function lookup(locale: Locale, path: string): string | undefined {
  const parts = path.split('.');
  let node: any = dictionaries[locale];
  for (const part of parts) {
    if (node == null) return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'en' || stored === 'ru' || stored === 'kk') setLocaleState(stored);
        else setLocaleState(detectSystemLocale());
      })
      .finally(() => setReady(true));
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    const raw = lookup(locale, key) ?? lookup('en', key) ?? key;
    if (!vars) return raw;
    return Object.entries(vars).reduce((acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)), raw);
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  if (!ready) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
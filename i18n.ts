import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['az', 'en', 'ru', 'es'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  az: 'Azərbaycan',
  en: 'English',
  ru: 'Русский',
  es: 'Español',
};

export const defaultLocale: Locale = 'az';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

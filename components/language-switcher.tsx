"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // Remove current locale from pathname
    const segments = pathname.split('/');
    const currentLocaleInPath = segments[1];

    // Check if first segment is a locale
    const isLocaleInPath = locales.includes(currentLocaleInPath as Locale);

    let newPathname: string;
    if (isLocaleInPath) {
      // Replace current locale with new locale
      segments[1] = newLocale;
      newPathname = segments.join('/');
    } else {
      // Add new locale to beginning
      newPathname = `/${newLocale}${pathname}`;
    }

    router.push(newPathname);
    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[160px] gap-2">
        <Languages className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { getLang, setLang, getLocales, getLocaleDate, pluralize } from '@/locale';
import insertKeys from '@/utils/insertKeys';
import type { ProximaLocales } from '../types.d';

export const useProximaLocale = (componentLocales?: ProximaLocales) => {
  const getLocaleToken = (name: string, keys?: number | any[] | Record<string, any>) => {
    const locales = getLocales();
    const currentLang = getLang();
    const fallbackLang = 'en';
    const [baseLang] = currentLang.split('-');

    const componentTokens = componentLocales?.[name] || {};

    const globalLocaleTokens =
      locales[currentLang] ||
      locales[baseLang] ||
      locales[fallbackLang];

    const token =
      globalLocaleTokens?.[name] ||
      componentTokens[currentLang] ||
      componentTokens[baseLang] ||
      componentTokens[fallbackLang] ||
      name;

    if (typeof keys === 'number') {
      return pluralize(token, keys);
    }
    if (!keys) {
      return token;
    }
    return insertKeys(token, keys);
  };

  return {
    getLang,
    setLang,
    getLocaleToken,
    getLocaleDate,
    insertKeys,
  };
};

export default useProximaLocale;

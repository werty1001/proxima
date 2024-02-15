import { ref, unref } from 'vue';
import type { ProximaLocales } from '../types.d';
import en from './en';

let pluralRules: Intl.PluralRules | null = null;
let dateFormatter: Intl.DateTimeFormat | null = null;
let dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
  timeStyle: 'short',
};

const proximaLang = ref('en');
const proximaLocales = ref<ProximaLocales>({ en });

export const getLang = () => unref(proximaLang);
export const getLocales = () => unref(proximaLocales);

export const setLang = (lang: string) => {
  const value = lang.toLowerCase();
  if (value) {
    proximaLang.value = value;
    dateFormatter = null;
    pluralRules = null;
    return;
  }
  console.warn(`Proxima WARN: Empty lang value!`);
};

// Locales

export const setLocales = (locales: ProximaLocales) => {
  if (locales) {
    proximaLocales.value = { en, ...locales };
    return;
  }
  console.warn(`Proxima WARN: Empty locales value!`);
};

// Pluralize

export const pluralize = (str: string, n: number) => {
  if (!pluralRules) {
    pluralRules = new Intl.PluralRules(getLang());
  }
  const rules = str.split('|').map((el) => el.trim());
  const insertCount = (value: string) => (value || '').replace('{n}', String(n));
  const { pluralCategories } = pluralRules.resolvedOptions();
  const [hasZero, hasTwo, hasFew] = [
    Number(pluralCategories.includes('zero')),
    Number(pluralCategories.includes('two')),
    Number(pluralCategories.includes('few')),
  ];
  switch (pluralRules.select(n)) {
    case 'zero': return insertCount(rules[0]);
    case 'one': return insertCount(rules[0 + hasZero]);
    case 'two': return insertCount(rules[1 + hasZero]);
    case 'few': return insertCount(rules[1 + hasZero + hasTwo]);
    case 'many': return insertCount(rules[1 + hasZero + hasTwo + hasFew]);
    case 'other': return insertCount(rules[rules.length - 1]);
    default: return '';
  }
};

// Pretty date

export const setDateTimeFormatOptions = (options: Intl.DateTimeFormatOptions) => {
  dateTimeFormatOptions = options;
};

export const getLocaleDate = (date: string | number | Date, hasTime = true) => {
  if (!dateFormatter) {
    dateFormatter = new Intl.DateTimeFormat(getLang(), dateTimeFormatOptions);
  }

  let timestamp: number;

  if (typeof date === 'string') {
    const parsedDate = Date.parse(date);
    timestamp = Number.isNaN(parsedDate) ? parseInt(date) : parsedDate;
  } else {
    timestamp = Number(date);
  }

  if (Number.isNaN(timestamp)) {
    console.warn(`Proxima WARN: getLocaleDate parse failed!`, date);
    return '';
  }

  const parts = dateFormatter.formatToParts(timestamp);
  const result = parts.map(({ value }) => value).join('');

  if (hasTime) {
    return result;
  }

  const hourIndex = parts.findIndex(({ type }) => type === 'hour') - 1;

  return hourIndex >= 0
    ? parts.slice(0, hourIndex).map(({ value }) => value).join('')
    : result;
};

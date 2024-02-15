import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import useLocale from '@/composables/locale';

type UsedLocale = ReturnType<typeof useLocale>;

describe('composables/locale', () => {
  let getLocaleToken: UsedLocale['getLocaleToken'];
  let getLang: UsedLocale['getLang'];
  let setLang: UsedLocale['setLang'];

  const locales = {
    label: {
      ru: 'Русский',
      en: 'English',
      fr: 'French',
      hr: 'Croatian',
      ga: 'Irish',
      ko: 'Korean',
      lv: 'Latvian',
      dsb: 'Lower Sorbian',
    },
    plural: {
      ru: '{n} билет | {n} билета | {n} билетов',
      en: '{n} ticket | {n} tickets',
      fr: '{n} jour | {n} de jours | {n} jours',
      hr: '{n} sat | {n} sata | {n} sati',
      ga: '{n} cheann | {n} cheann | {n} cinn | {n} gcinn | {n} ceann',
      ko: '{n} 일',
      lv: '{n} diennakšu | {n} diennakts | {n} diennaktis',
      dsb: '{n} źeń | {n} dnja | {n} dny | {n} dnjow'
    },
  };

  const Component = defineComponent({
    setup() {
      ({ getLocaleToken, getLang, setLang } = useLocale(locales));
      return () => h('div');
    },
  });

  const wrapper = mount(Component);

  // one few many other
  it('Check ru', () => {
    const lang = 'ru';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 билетов');
    expect(getLocaleToken('plural', 1)).toBe('1 билет');
    expect(getLocaleToken('plural', 2)).toBe('2 билета');
    expect(getLocaleToken('plural', 3)).toBe('3 билета');
    expect(getLocaleToken('plural', 5)).toBe('5 билетов');
    expect(getLocaleToken('plural', 130)).toBe('130 билетов');
  });

  // one other
  it('Check en', () => {
    const lang = 'en';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 tickets');
    expect(getLocaleToken('plural', 1)).toBe('1 ticket');
    expect(getLocaleToken('plural', 2)).toBe('2 tickets');
    expect(getLocaleToken('plural', 3)).toBe('3 tickets');
    expect(getLocaleToken('plural', 5)).toBe('5 tickets');
    expect(getLocaleToken('plural', 130)).toBe('130 tickets');
  });

  // one many other
  it('Check fr', () => {
    const lang = 'fr';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 jour');
    expect(getLocaleToken('plural', 1)).toBe('1 jour');
    expect(getLocaleToken('plural', 2)).toBe('2 jours');
    expect(getLocaleToken('plural', 3)).toBe('3 jours');
    expect(getLocaleToken('plural', 5)).toBe('5 jours');
    expect(getLocaleToken('plural', 130)).toBe('130 jours');
    expect(getLocaleToken('plural', 1000000)).toBe('1000000 de jours');
  });

  // one few other
  it('Check hr', () => {
    const lang = 'hr';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 sati');
    expect(getLocaleToken('plural', 1)).toBe('1 sat');
    expect(getLocaleToken('plural', 2)).toBe('2 sata');
    expect(getLocaleToken('plural', 3)).toBe('3 sata');
    expect(getLocaleToken('plural', 5)).toBe('5 sati');
    expect(getLocaleToken('plural', 130)).toBe('130 sati');
  });

  // one two few many other
  it('Check ga', () => {
    const lang = 'ga';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 ceann');
    expect(getLocaleToken('plural', 1)).toBe('1 cheann');
    expect(getLocaleToken('plural', 2)).toBe('2 cheann');
    expect(getLocaleToken('plural', 3)).toBe('3 cinn');
    expect(getLocaleToken('plural', 5)).toBe('5 cinn');
    expect(getLocaleToken('plural', 8)).toBe('8 gcinn');
    expect(getLocaleToken('plural', 130)).toBe('130 ceann');
  });

  // other
  it('Check ko', () => {
    const lang = 'ko';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 일');
    expect(getLocaleToken('plural', 1)).toBe('1 일');
    expect(getLocaleToken('plural', 2)).toBe('2 일');
    expect(getLocaleToken('plural', 3)).toBe('3 일');
    expect(getLocaleToken('plural', 5)).toBe('5 일');
    expect(getLocaleToken('plural', 8)).toBe('8 일');
    expect(getLocaleToken('plural', 130)).toBe('130 일');
  });

  // zero one other
  it('Check lv', () => {
    const lang = 'lv';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 diennakšu');
    expect(getLocaleToken('plural', 1)).toBe('1 diennakts');
    expect(getLocaleToken('plural', 2)).toBe('2 diennaktis');
    expect(getLocaleToken('plural', 3)).toBe('3 diennaktis');
    expect(getLocaleToken('plural', 5)).toBe('5 diennaktis');
    expect(getLocaleToken('plural', 8)).toBe('8 diennaktis');
    expect(getLocaleToken('plural', 10)).toBe('10 diennakšu');
    expect(getLocaleToken('plural', 15)).toBe('15 diennakšu');
    expect(getLocaleToken('plural', 21)).toBe('21 diennakts');
    expect(getLocaleToken('plural', 130)).toBe('130 diennakšu');
  });

  // one two few other
  it('Check dsb', () => {
    const lang = 'dsb';
    setLang(lang);
    expect(getLang()).toBe(lang);
    expect(getLocaleToken('label')).toBe(locales.label[lang]);
    expect(getLocaleToken('plural', 0)).toBe('0 dnjow');
    expect(getLocaleToken('plural', 1)).toBe('1 źeń');
    expect(getLocaleToken('plural', 2)).toBe('2 dnja');
    expect(getLocaleToken('plural', 3)).toBe('3 dny');
    expect(getLocaleToken('plural', 5)).toBe('5 dnjow');
    expect(getLocaleToken('plural', 8)).toBe('8 dnjow');
    expect(getLocaleToken('plural', 10)).toBe('10 dnjow');
    expect(getLocaleToken('plural', 15)).toBe('15 dnjow');
    expect(getLocaleToken('plural', 21)).toBe('21 dnjow');
    expect(getLocaleToken('plural', 130)).toBe('130 dnjow');
  });
});

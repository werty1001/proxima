import { setLang, setLocales, setDateTimeFormatOptions } from '@/locale';
import type { ProximaDefaultProps, ProximaSetupOptions } from './types.d';
import type { Plugin } from 'vue';


// SSR

let ssr = false;

const setSSR = (flag: boolean) => (ssr = flag);
export const isSSR = () => ssr;


// Props options

let defaultProps: Partial<ProximaDefaultProps> = {};

export const setDefaultProps = (props: Partial<ProximaDefaultProps>) => {
  const everyone = props.everyone || {};
  defaultProps = Object.keys(props).reduce((acc, key) => {
    // @ts-ignore
    acc[key] = { ...everyone, ...props[key] };
    return acc;
  }, {});
};

export const getDefaultProps = <
  Name extends keyof ProximaDefaultProps,
  Props extends ProximaDefaultProps[Name]
>(name: Name) => <
  Key extends keyof Props,
  Value extends Props[Key]
>(key: Key, fallback?: Value) => (defaultProps?.[name] as Props)?.[key] || fallback;


/**
 * @example
 * ```js
 * // main.js
 *
 * import { createApp } from 'vue';
 * import proxima from 'proxima-vue/index';
 * 
 * const app = createApp(App);
 * 
 * const locales = {
 *   ru: {
 *     formFieldRequired: 'Заполните поле', 
 *   },
 * };
 * 
 * app.use(proxima, { lang: 'ru', locales });
 * 
 * app.mount('#app');
 * ```
 */

export default {
  install: (app, options) => {
    if (options?.lang) {
      setLang(options.lang);
    }
    if (options?.locales) {
      setLocales(options.locales);
    }
    if (options?.dateTimeFormatOptions) {
      setDateTimeFormatOptions(options.dateTimeFormatOptions);
    }
    if (options?.defaultProps) {
      setDefaultProps(options.defaultProps);
    }
    if (options?.ssr) {
      setSSR(true);
    }
  },
} as Plugin<ProximaSetupOptions>;

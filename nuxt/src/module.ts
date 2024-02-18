import {
  defineNuxtModule,
  addComponent,
  addImports,
  addPluginTemplate,
  normalizeTemplate,
} from '@nuxt/kit';

export interface ProximaNuxtOptions {
  injectStyles?: boolean
  injectComponents?: boolean
  injectComposables?: boolean
}

export const styles = [
  'proxima-vue/styles/accessibility.css',
  'proxima-vue/styles/ghost.css',
  'proxima-vue/styles/keyframes.css',
  'proxima-vue/styles/scrollbar.css',
  'proxima-vue/styles/typography.css',
];

export const composables = [
  'proxima-vue/composables/colorScheme.mjs|useProximaColorScheme',
  'proxima-vue/composables/flySearch.mjs|useProximaFlySearch',
  'proxima-vue/composables/locale.mjs|useProximaLocale',
  'proxima-vue/composables/mediaquery.mjs|useProximaMedia',
  'proxima-vue/composables/pending.mjs|useProximaPending',
  'proxima-vue/composables/timeout.mjs|useProximaTimeout',
];

export const components = [
  'proxima-vue/button/button.mjs|ProximaButton',
  'proxima-vue/button/close.mjs|ProximaButtonClose',
  'proxima-vue/button/delete.mjs|ProximaButtonDelete',
  'proxima-vue/button/plus.mjs|ProximaButtonPlus',
  'proxima-vue/checkbox/checkbox.mjs|ProximaCheckbox',
  'proxima-vue/checkbox/radiogroup.mjs|ProximaRadioGroup',
  // 'proxima-vue/chip/chip.mjs',
  // 'proxima-vue/effect/effect.mjs',
  'proxima-vue/field/date.mjs|ProximaDate',
  'proxima-vue/field/combobox.mjs|ProximaCombobox',
  'proxima-vue/field/email.mjs|ProximaEmail',
  'proxima-vue/field/field.mjs|ProximaField',
  'proxima-vue/field/multiselect.mjs|ProximaMultiselect',
  'proxima-vue/field/numeric.mjs|ProximaNumeric',
  // 'proxima-vue/field/option.mjs',
  'proxima-vue/field/password.mjs|ProximaPassword',
  'proxima-vue/field/phone.mjs|ProximaPhone',
  // 'proxima-vue/field/popup.mjs',
  'proxima-vue/field/select.mjs|ProximaSelect',
  'proxima-vue/field/textarea.mjs|ProximaTextarea',
  'proxima-vue/form/field.mjs|ProximaFormField',
  'proxima-vue/form/fieldset.mjs|ProximaFormFieldset',
  'proxima-vue/form/form.mjs|ProximaForm',
  'proxima-vue/icon/arrow.mjs|ProximaIconArrow',
  'proxima-vue/icon/check.mjs|ProximaIconCheck',
  'proxima-vue/icon/cross.mjs|ProximaIconCross',
  'proxima-vue/icon/delete.mjs|ProximaIconDelete',
  'proxima-vue/icon/icon.mjs|ProximaIcon',
  'proxima-vue/icon/important.mjs|ProximaIconImportant',
  'proxima-vue/icon/plus.mjs|ProximaIconPlus',
  'proxima-vue/icon/search.mjs|ProximaIconSearch',
  'proxima-vue/modal/modal.mjs|ProximaModal',
  'proxima-vue/notification/notification.mjs|ProximaNotification',
  // 'proxima-vue/popup/popup.mjs',
  'proxima-vue/spinner/spinner.mjs|ProximaSpinner',
  'proxima-vue/switch/switch.mjs|ProximaSwitch',
  'proxima-vue/toggle/toggle.mjs|ProximaToggle',
];

// https://nuxt.com/docs/guide/going-further/modules
export default defineNuxtModule<ProximaNuxtOptions>({
  meta: {
    name: 'proxima-vue',
    configKey: 'proxima',
    compatibility: {
      nuxt: '^3.10.0'
    },
  },
  defaults: {
    injectStyles: false,
    injectComponents: true,
    injectComposables: true,
  },
  hooks: {},
  async setup(options, nuxt) {
    nuxt.options.build.transpile.push('proxima-vue');

    // Set options

    addPluginTemplate(normalizeTemplate({
      filename: 'setup.proxima.mjs',
      getContents() {
        return `
          import { defineNuxtPlugin } from '#app';
          import proxima from 'proxima-vue';

          export default defineNuxtPlugin(({ vueApp }) => {
            vueApp.use(proxima, ${JSON.stringify({ ...options, ssr: true })});
          });
        `;
      },
    }));

    // Inject styles

    if (options.injectStyles) {
      nuxt.options.css.push(...styles);
    }

    // Inject components

    if (options.injectComponents) {
      components.forEach((item) => {
        const [filePath, name] = item.split('|');
        addComponent({ filePath, name });
      });
    }

    // Inject composables

    if (options.injectComposables) {
      composables.forEach((item) => {
        const [from, name] = item.split('|');
        addImports({ from, name, as: name });
      });
    }
  },
});

<template>
  <ProximaField
    ref="field"
    v-bind="fieldProps"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, updateByEvent, onFocus, onBlur
    }">
      <input
        class="field__input field__el"
        type="email"
        inputmode="email"
        :list="`list-${fieldAttrs.id}`"
        :placeholder="placeholder"
        :value="fieldValue"
        v-bind="fieldAttrs"
        @input="updateByEvent"
        @focus="onFocus"
        @blur="onBlur"
      >
      <datalist v-if="hasAutocomplete" :id="`list-${fieldAttrs.id}`">
        <option
          v-for="item in domainList"
          :key="`list-${fieldAttrs.id}-${item}`"
          v-text="item"
        />
      </datalist>
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts">
import { ref, useAttrs, computed } from 'vue';

import ProximaField from '@/field/field.vue';
import useFieldExpose from '@/field/useExpose';
import { isEmail } from '@/utils/validations';

const field = ref({} as InstanceType<typeof ProximaField>);
const attrs = useAttrs();

const props = withDefaults(defineProps<ProximaEmailProps>(), {
  domains: () => getDefaultProp('domains', emailDomains) as [],
  hasAutocomplete: () => getDefaultProp('hasAutocomplete', true) as true,
});

// Domains

const domainList = computed(() => {
  const list = String(attrs.modelValue).split(',');
  const email = list.pop() || '';
  if (email.length > 1 && email.includes('@')) {
    const [name] = email.split('@');
    return props.domains
      .map((domain) => [name, domain].join('@'))
      .filter((item) => item !== email);
  }
  return [];
});

// Props

const fieldProps = computed(() => ({
  validator: (value: string) => value.split(',').every((str) => isEmail(str.trim())),
  errorCreator: () => 'fieldBadEmail',
}));

// Expose

defineExpose(useFieldExpose(field));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export interface ProximaEmailProps {
  domains?: string[]
  hasAutocomplete?: boolean
}

export const emailDomains = ['gmail.com', 'googlemail.com', 'yandex.ru', 'mail.ru', 'icloud.com', 'yandex.com', 'rambler.ru', 'ya.ru', 'bk.ru', 'list.ru', 'inbox.ru','yahoo.com', 'protonmail.com', 'protonmail.ch', 'outlook.com', 'hotmail.com', 'zoho.com', 'aol.com', 'aim.com', 'mail.com', 'email.com', 'gmx.com', 'gmx.us'];

export const componentName = 'ProximaEmail';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/email) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/email.vue)
 *
 * @example
 * ```html
 * <ProximaEmail
 *   label="Email"
 *   v-model="email"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaEmail from 'proxima-vue/field/email';
 *
 * const email = ref('');
 * ```
 *
 * @prop domains `array` — Domains list (default `['gmail.com', 'icloud.com', ...and more]`)
 * @prop hasAutocomplete `boolean` — Adds address autocomplete (default `true`)
 *
 * @prop id `string` — Field id (default `field-[hash]`)
 * @prop inputAttrs `InputHTMLAttributes` — Input attributes (default `{}`)
 * @prop modelValue `string` or `number` — Field value (default `''`)
 * @prop label `string` — Label text
 * @prop labelPosition `string` — Label position: `above` / `inside` / `aside` (default `above`)
 * @prop describedby `string` — [aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) attribute (default `''`)
 * @prop autocomplete `string` — [autocomplete](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute) attribute (default `''`)
 * @prop placeholder `string` — placeholder attribute (default `''`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop readonly `boolean` — readonly attribute (default `false`)
 * @prop required `boolean` — required attribute (default `false`)
 * @prop autofocus `boolean` — autofocus attribute (default `false`)
 * @prop minlength `number` — minlength attribute (default `1`)
 * @prop maxlength `number` — maxlength attribute (default `Infinity`)
 * @prop validityStyle `string` — Adds validity style: `invalid` / `valid` / `both` / `none` (default `invalid`)
 * @prop validityStatus `string` — Adds validity icon: `invalid` / `valid` / `both` / `none` (default `invalid`)
 * @prop actions `array` — Custom actions (default `[]`)
 * @prop actionsVisibility `string` — Actions visibility: `hover` / `always` (default `hover`)
 * @prop hasClearButton `boolean` — Adds clear button (default `false`)
 * @prop width `string` — Width by characters length or max width: `max` / `12` (default `max`)
 * @prop validator `function` — Func checks value validity (default `null`)
 * @prop emptyChecker `function` — Func checks value empty or not (default `null`)
 * @prop parseValue `function` — Func parse value (default `(value: any) => String(value)`)
 * @prop view `string` — Field view: `plain` / `line` (default `plain`)
 * @prop size `string` — Field size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Field radius: `soft` / `full` / `none` (default `soft`)
 * @prop shadow `string` — Field shadow: `soft` / `none` (default `soft`)
 * @prop theme `string` — Field theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

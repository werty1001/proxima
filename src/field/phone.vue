<template>
  <ProximaField
    ref="field"
    autocomplete="tel"
    v-bind="fieldProps"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, updateByEvent, onFocus, onBlur
    }">
      <input
        class="field__input field__el field__el_masked"
        type="tel"
        inputmode="numeric"
        :value="fieldValue"
        v-bind="fieldAttrs"
        @beforeinput="mask.parseInput"
        @keydown="mask.parseKeydown"
        @input="updateByEvent"
        @focus="onFocus"
        @blur="onBlur"
      >
      <input
        :value="createMaskPlaceholder(placeholder, fieldValue)"
        disabled
        aria-hidden="true"
        autocomplete="off"
        :name="`${fieldAttrs.id}-mask`"
        class="field__input field__el field__mask"
      >
      <div :id="unexpectedId" v-text="unexpectedMessage" class="field__visually-hidden" />
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts">
import { ref, unref, computed, watch, nextTick } from 'vue';

import ProximaField from '@/field/field.vue';
import useFieldExpose from '@/field/useExpose';
import useUnexpected from '@/field/useUnexpected';
import useBlink from '@/field/useBlink';
import useMask from '@/field/useMask';
import useLocale from '@/composables/locale';
import type { ParseInputEvent } from '../types.d';

const field = ref({} as InstanceType<typeof ProximaField>);

const props = withDefaults(defineProps<ProximaPhoneProps>(), {
  format: () => getDefaultProp('format', '') as '',
  maskChar: () => getDefaultProp('maskChar', '_') as '_',
  minlength: 1,
  maxlength: Infinity,
  describedby: '',
  unexpectedLabel: '',
  hasInvalidBlink: () => getDefaultProp('hasInvalidBlink', true) as true,
});

const emit = defineEmits<{
  'unexpected:input': [event: ParseInputEvent, target: HTMLInputElement]
}>();

// Locale

const { getLocaleToken } = useLocale();

const unexpectedLocale =
  computed(() => getLocaleToken(props.unexpectedLabel || 'fieldUnexpectedUseNumber'));

// Format

const format = computed(() => getLocaleToken(props.format || 'fieldPhoneFormat'));

const getFormatPrefix = (format: string) => {
  const [prefix = ''] = format.split(/[^0-9+]/);
  return prefix;
};

// Mask

const blink = useBlink();

const {
  unexpectedId,
  unexpectedMessage,
  setUnexpectedMessage,
} = useUnexpected();

const mask = useMask({
  format,
  validSymbols: '0-9',
  beforeParse: (payload) => {
    if (payload.selectionStart !== payload.selectionEnd) return;

    const maskLength = (payload.format || '').replace(/[^0-9*]/g, '').length;
    const dataLength = getRawPhone(payload.inputData).length;
    const prefix = getFormatPrefix(payload.format || '');

    if (maskLength === dataLength && payload.currentValue === prefix) {
      payload.currentValue = '';
    }
  },
  onUnexpectedInput: (target, event) => {
    if (props.hasInvalidBlink) {
      blink(target);
    }
    setUnexpectedMessage(unref(unexpectedLocale));
    emit('unexpected:input', event, target);
  },
});

watch(format, (nextFormat, prevFormat) => {
  const target = unref(field).getElement();
  const value = unref(field).getValue();
  mask.clearHistory();
  if (target && value) {
    const prefix = getFormatPrefix(prevFormat);
    const rawValue = value.substring(value.startsWith(prefix) ? prefix.length : 0);
    const validData = getRawPhone(rawValue);
    nextTick(() => {
      const prefix = getFormatPrefix(nextFormat);
      const data = validData || prefix;
      target.value = validData ? prefix : '';
      target.dispatchEvent(new InputEvent('beforeinput', { data, inputType: 'insertText' }));
    });
  }
});

// Placeholder

const createMaskPlaceholder = (placeholder = '', value = '') => {
  if (!value && placeholder) {
    return placeholder;
  }
  const postfix = unref(format)
    .replace(/\*/g, props.maskChar.charAt(0))
    .substring(value.length);
  return value + postfix;
};

// Empty checker

const emptyChecker = (value: string) => {
  const prefix = getFormatPrefix(unref(format));
  return !value || value === prefix;
};

// Props

const fieldProps = computed(() => ({
  minlength: unref(format).length,
  maxlength: unref(format).length,
  describedby: [unexpectedId, props.describedby].filter(Boolean).join(' '),
  parseValue: mask.parseValue,
  errorCreator: () => 'fieldBadPhone',
  emptyChecker,
}));

// Expose

defineExpose(useFieldExpose(field));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export interface ProximaPhoneProps {
  format?: string
  maskChar?: string
  minlength?: number
  maxlength?: number
  describedby?: string
  unexpectedLabel?: string
  hasInvalidBlink?: boolean
}

export const getRawPhone = (phone: string) => phone.replace(/\D/g, '');

export const componentName = 'ProximaPhone';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/phone) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/phone.vue)
 *
 * @example
 * ```html
 * <ProximaPhone
 *   label="Phone"
 *   format="+1 (***) ***-****"
 *   width="17"
 *   v-model="phone"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaPhone from 'proxima-vue/field/phone';
 *
 * const phone = ref('');
 * ```
 *
 * @prop format `string` — Phone format (default `''`, when prop is empty will be used locale value)
 * @prop maskChar `string` — Mask char (default `'_'`)
 * @prop unexpectedLabel `string` — Message for assistive technologies on unexpected input (default `''`, when prop is empty will be used locale value)
 * @prop hasInvalidBlink `boolean` — Adds blink effect on invalid input (default `true`)
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

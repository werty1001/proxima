<template>
  <ProximaField
    ref="field"
    v-bind="fieldProps"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, updateByEvent, onFocus, onBlur
    }">
      <input
        class="field__input field__el field__el_masked"
        type="text"
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
import parseDate from '@/utils/parseDate';

import type { ParseInputEvent } from '../types.d';

const field = ref({} as InstanceType<typeof ProximaField>);

const props = withDefaults(defineProps<ProximaDateProps>(), {
  format: () => getDefaultProp('format', '') as '',
  maskChar: () => getDefaultProp('maskChar', '') as '',
  min: '',
  max: '',
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

const { getLang, getLocaleToken } = useLocale();

const unexpectedLocale =
  computed(() => getLocaleToken(props.unexpectedLabel || 'fieldUnexpectedUseNumber'));

// Format

const NOW = 'now';

const format = computed(() => {
  if (props.format) return props.format;
  const date = new Intl.DateTimeFormat(getLang()).format(Date.parse('1990-10-15'));
  const langFormat = date
    .replace(/\u200f/g, '')
    .replace('15', 'dd')
    .replace('10', 'mm')
    .replace('1990', 'yyyy');
  const parts = ['yyyy', 'mm', 'dd'];
  const isFormatValid = parts.every((el) => langFormat.includes(el));
  return isFormatValid ? langFormat : parts.join('-');
});

const formatText = computed(() => {
  const [year, month, day] = getLocaleToken('fieldIsoDate').split(' ');
  return unref(format)
    .replace(/[^dmy]/g, ' ')
    .replace('dd', day)
    .replace('mm', month)
    .replace('yyyy', year);
});

const maskFormat = computed(() => unref(format).replace(/[dmy]/g, '*'));

const formatDate = (day: string, month: string, year: string) => unref(format)
  .replace('dd', day)
  .replace('mm', month)
  .replace('yyyy', year);

// Mask

const blink = useBlink();

const {
  unexpectedId,
  unexpectedMessage,
  setUnexpectedMessage,
} = useUnexpected();

const mask = useMask({
  format: maskFormat,
  validSymbols: '0-9',
  beforeParse: (payload) => {
    const parsedDate = parseDate(payload.inputData);
    if (parsedDate) {
      const [year, month, day] = parsedDate.split('-');
      payload.inputData = formatDate(day, month, year);
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

watch(format, (_, prevFormat) => {
  const target = unref(field).getElement();
  const value = unref(field).getValue();
  const data = getISOString(value, prevFormat);
  mask.clearHistory();
  if (target && data) {
    nextTick(() => {
      target.value = '';
      target.dispatchEvent(new InputEvent('beforeinput', { data, inputType: 'insertText' }));
    });
  }
});

// Placeholder

const createMaskPlaceholder = (placeholder = '', value = '') => {
  if (!value && placeholder) {
    return placeholder;
  }
  if (props.maskChar) {
    const postfix = unref(maskFormat)
      .replace(/\*/g, props.maskChar.charAt(0))
      .substring(value.length);
    return value + postfix;
  }
  const postfix = unref(format).substring(value.length);
  return value + postfix;
};

// Validator

const min = computed(() => {
  if (props.min === NOW) return Date.now();
  return Date.parse(props.min) || Date.parse(getISOString(props.min, unref(format)));
});

const max = computed(() => {
  if (props.max === NOW) return Date.now();
  return Date.parse(props.max) || Date.parse(getISOString(props.max, unref(format)));
});

const validator = (value: string) => {
  const iso = getISOString(value, unref(format));
  const [year, month, day] = iso.split('-');
  const date = new Date(iso);
  const timestamp = Number(date);
  return date instanceof Date && !Number.isNaN(timestamp) &&
    (
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
    ) &&
    (Number.isNaN(unref(min)) || timestamp >= unref(min)) &&
    (Number.isNaN(unref(max)) || timestamp <= unref(max));
};

const errorCreator = (value: string) => {
  const iso = getISOString(value, unref(format));
  const [year, month, day] = iso.split('-');
  if (value.length < unref(format).length) {
    return getLocaleToken('fieldBadDate', { format: unref(formatText) });
  }
  if (Number(month) > 12 || month === '00') {
    return getLocaleToken('fieldBadMonth', { month });
  }
  const timestamp = Date.parse(iso);
  if (!Number.isNaN(unref(min)) && timestamp < unref(min)) {
    const date = props.min === NOW ? new Date().toLocaleDateString() : props.min;
    return getLocaleToken('fieldDateUnderflow', { date });
  }
  if (!Number.isNaN(unref(max)) && timestamp > unref(max)) {
    const date = props.max === NOW ? new Date().toLocaleDateString() : props.max;
    return getLocaleToken('fieldDateOverflow', { date });
  }
  const maxDay = new Date(Number(year), Number(month), 0).getDate();
  if (Number(day) > maxDay || day === '00') {
    return getLocaleToken('fieldBadDay', { day, max: String(maxDay) });
  }
  return '';
};

// Props

const fieldProps = computed(() => ({
  minlength: unref(format).length,
  maxlength: unref(format).length,
  describedby: [unexpectedId, props.describedby].filter(Boolean).join(' '),
  parseValue: mask.parseValue,
  validator,
  errorCreator,
}));

// Expose

const fieldExpose = useFieldExpose(field);

defineExpose({
  ...fieldExpose,
  getISOString: () => getISOString(fieldExpose.getValue(), unref(format)),
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export interface ProximaDateProps {
  format?: string
  maskChar?: string
  min?: string
  max?: string
  minlength?: number
  maxlength?: number
  describedby?: string
  unexpectedLabel?: string
  hasInvalidBlink?: boolean
}

export const componentName = 'ProximaDate';

const getDefaultProp = getDefaultProps(componentName);

export const getISOString = (value: string, format: string) => {
  const [dayIndex, monthIndex, yearIndex] = [
    format.indexOf('dd'),
    format.indexOf('mm'),
    format.indexOf('yyyy'),
  ];
  return [
    value.substring(yearIndex, yearIndex + 4),
    value.substring(monthIndex, monthIndex + 2),
    value.substring(dayIndex, dayIndex + 2),
  ].join('-');
};

/**
 * [Live Demo](https://proxima.wiki/field/date) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/date.vue)
 *
 * @example
 * ```html
 * <ProximaDate
 *   label="Birthday"
 *   format="yyyy-mm-dd"
 *   v-model="birth"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaDate from 'proxima-vue/field/date';
 *
 * const birth = ref('');
 * ```
 *
 * @prop format `string` — Date format (default `''`, when prop is empty will be used locale value)
 * @prop maskChar `string` — Mask char (default `''`, when prop is empty will be used `yyyy` `mm` `dd`)
 * @prop unexpectedLabel `string` — Message for assistive technologies on unexpected input (default `''`, when prop is empty will be used locale value)
 * @prop hasInvalidBlink `boolean` — Adds blink effect on invalid input (default `true`)
 * @prop min `string` — Min date, prop will be used as `Date.parse` argument for validation (default `''`)
 * @prop max `string` — Max date, prop will be used as `Date.parse` argument for validation (default `''`)
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

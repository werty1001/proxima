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
        type="text"
        inputmode="numeric"
        :placeholder="placeholder"
        :value="fieldValue"
        v-bind="fieldAttrs"
        @beforeinput="mask.parseInput"
        @keydown="mask.parseKeydown"
        @input="updateByEvent"
        @focus="onFocus"
        @blur="onBlur"
      >
      <div :id="unexpectedId" v-text="unexpectedMessage" class="field__visually-hidden" />
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts">
import { ref, unref, computed } from 'vue';

import ProximaField from '@/field/field.vue';
import useFieldExpose from '@/field/useExpose';
import useUnexpected from '@/field/useUnexpected';
import useBlink from '@/field/useBlink';
import useMask from '@/field/useMask';
import useLocale from '@/composables/locale';

import type { ParseInputEvent } from '../types.d';

const field = ref({} as InstanceType<typeof ProximaField>);

const props = withDefaults(defineProps<ProximaNumericProps>(), {
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

// Mask

const blink = useBlink();

const {
  unexpectedId,
  unexpectedMessage,
  setUnexpectedMessage,
} = useUnexpected();

const mask = useMask({
  validSymbols: '0-9',
  onUnexpectedInput: (target, event) => {
    if (props.hasInvalidBlink) {
      blink(target);
    }
    setUnexpectedMessage(unref(unexpectedLocale));
    emit('unexpected:input', event, target);
  },
});

// Props

const fieldProps = computed(() => ({
  describedby: [unexpectedId, props.describedby].filter(Boolean).join(' '),
  parseValue: mask.parseValue,
}));

// Expose

defineExpose(useFieldExpose(field));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export interface ProximaNumericProps {
  describedby?: string
  unexpectedLabel?: string
  hasInvalidBlink?: boolean
}

export const componentName = 'ProximaNumeric';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/numeric) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/numeric.vue)
 *
 * @example
 * ```html
 * <ProximaNumeric
 *   label="Code"
 *   width="4"
 *   v-model="code"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaNumeric from 'proxima-vue/field/numeric';
 *
 * const code = ref('');
 * ```
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

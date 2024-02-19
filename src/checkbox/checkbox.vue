<template>
  <div ref="container" class="checkbox" :class="modifiers">
    <input
      ref="el"
      v-bind="attributes"
      class="checkbox__input"
      @change="updateByEvent"
      @focus="onFocus"
      @blur="onBlur"
    >
    <label class="checkbox__content" :for="id">
      <slot name="prepend" v-bind="slotProps" />
      <span class="checkbox__indicator" aria-hidden="true" data-ghost-item>
        <slot name="icon" v-bind="slotProps">
          <svg viewBox="0 0 16 16" width="16" height="16" class="checkbox__icon">
            <line v-if="isIndeterminate" x1="4.5" y1="8" x2="11.5" y2="8" />
            <circle v-if="type === 'radio'" cx="8" cy="8" r="3.5" />
            <path v-else d="m3 8 3.25 3.5 7-7" />
          </svg>
        </slot>
        <ProximaEffect
          v-if="hasEffect && !disabled"
          :type="effect"
          class="checkbox__effect"
        />
      </span>
      <span
        v-if="hasLabel"
        class="checkbox__label"
        :class="{ 'visually-hidden': labelVisuallyHidden }"
        data-ghost-text
      >
        <slot name="label" v-bind="slotProps">
          {{ label }}
        </slot>
      </span>
      <slot v-bind="slotProps" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, unref, toRaw, computed, useSlots, onMounted, watch, type InputHTMLAttributes } from 'vue';
import ProximaEffect from '@/effect/effect.vue';
import useLocale from '@/composables/locale';
import useId from '@/composables/id';

import type { ProximaSize, ProximaShadow, ProximaClickEffect } from '../types.d';

export interface ProximaCheckboxProps {
  id?: string
  type?: 'checkbox' | 'radio'
  inputAttrs?: InputHTMLAttributes
  trueValue?: any
  falseValue?: any
  modelValue?: any
  label?: string
  labelVisuallyHidden?: boolean
  describedby?: string
  disabled?: boolean
  required?: boolean
  indeterminate?: boolean
  view?: 'plain' | 'outline' | 'line'
  size?: ProximaSize
  shadow?: ProximaShadow
  effect?: ProximaClickEffect
  theme?: string
}

const props = withDefaults(defineProps<ProximaCheckboxProps>(), {
  type: 'checkbox',
  trueValue: true,
  falseValue: (props: ProximaCheckboxProps) => {
    if (typeof props.trueValue === 'string') return '';
    if (typeof props.trueValue === 'number') return 0;
    if (typeof props.trueValue === 'object') return null;
    return false;
  },
  modelValue: false,
  label: '',
  labelVisuallyHidden: false,
  describedby: '',
  disabled: false,
  required: false,
  indeterminate: false,
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  shadow: () => getDefaultProp('shadow', 'none') as 'none',
  effect: () => getDefaultProp('effect', 'none') as 'none',
  theme: () => getDefaultProp('theme', '') as '',
});

const id = useId(props.id, 'checkbox');

const emit = defineEmits<{
  'update:modelValue': [modelValue: ProximaCheckboxProps['modelValue']]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>();

const slots = useSlots();
const { getLocaleToken } = useLocale();

const hasLabel = computed(() => Boolean(props.label || slots.label));
const hasEffect = computed(() => Boolean(props.effect && props.effect !== 'none'));

const isIndeterminate = computed(() => props.indeterminate && props.type === 'checkbox');
const isMultiple = computed(() => Array.isArray(props.modelValue));

const isChecked = computed(() => {
  if (unref(isMultiple)) {
    const modelValue = props.modelValue as any[];
    const item = modelValue.find((el: any) => toRaw(el) === toRaw(props.trueValue));
    return Boolean(item);
  } else {
    return toRaw(props.modelValue) === toRaw(props.trueValue);
  }
});

const modifiers = computed(() => ({
  checkbox_focused: unref(isFocused),
  checkbox_checked: unref(isChecked),
  checkbox_unchecked: !unref(isChecked),
  checkbox_indeterminate: unref(isIndeterminate),
  checkbox_required: props.required,
  checkbox_disabled: props.disabled,
  checkbox_enabled: !props.disabled,
  checkbox_has_label: unref(hasLabel),
  checkbox_has_effect: unref(hasEffect),
  [`checkbox_effect_${props.effect}`]: Boolean(props.effect),
  [`checkbox_type_${props.type}`]: Boolean(props.type),
  [`checkbox_view_${props.view}`]: Boolean(props.view),
  [`checkbox_size_${props.size}`]: Boolean(props.size),
  [`checkbox_shadow_${props.shadow}`]: Boolean(props.shadow),
  [`checkbox_theme_${props.theme}`]: Boolean(props.theme),
}));

const attributes = computed(() => ({
  ...props.inputAttrs,
  id: unref(id) || undefined,
  type: props.type,
  disabled: props.disabled,
  required: props.required,
  checked: unref(isChecked),
  value: ['number', 'string', 'boolean'].includes(typeof props.trueValue) ? props.trueValue : undefined,
  'aria-describedby': props.describedby || undefined,
}));

const isValid = computed(() => !props.required || unref(isChecked));
const errorMessage = computed(() => unref(isValid) ? '' : getLocaleToken('checkboxRequired'));

const isFocused = ref(false);
const setFocus = (flag: boolean) => (isFocused.value = flag);

const updateByEvent = () => {
  if (unref(isMultiple)) {
    const modelValue = props.modelValue as any[];
    const value = unref(isChecked)
      ? modelValue.filter((el: any) => toRaw(el) !== toRaw(props.trueValue))
      : [...modelValue, props.trueValue];
    emit('update:modelValue', value);
  } else {
    const value = unref(isChecked) ? props.falseValue : props.trueValue;
    const shouldSendTrue = props.type === 'radio' || unref(isIndeterminate);
    emit('update:modelValue', shouldSendTrue ? props.trueValue : value);
  }
};

const onBlur = (event: FocusEvent) => {
  setFocus(false);
  emit('blur', event);
};

const onFocus = (event: FocusEvent) => {
  setFocus(true);
  emit('focus', event);
};


// Methods

const container = ref<HTMLDivElement | null>(null);
const el = ref<HTMLInputElement | null>(null);

const getErrorMessage = () => unref(errorMessage);
const getContainer = () => unref(container);
const getElement = () => unref(el);
const getValue = () => props.modelValue;
const getId = () => unref(id);

const checkValidity = () => unref(isValid);
const checkFocus = () => unref(isFocused);
const checked = () => unref(isChecked);

const focus = () => unref(el)?.focus?.();
const blur = () => unref(el)?.blur?.();


// Indeterminate

const setInputIndeterminate = () => {
  const input = unref(el);
  if (input && props.type === 'checkbox') {
    input.indeterminate = props.indeterminate;
  }
};

watch(() => props.indeterminate, setInputIndeterminate);

onMounted(setInputIndeterminate);


// Slot props

const slotProps = computed(() => ({
  id: unref(id),
  hasEffect: unref(hasEffect),
  hasLabel: unref(hasLabel),
  isIndeterminate: unref(isIndeterminate),
  isMultiple: unref(isMultiple),
  isChecked: unref(isChecked),
  isFocused: unref(isFocused),
  isValid: unref(isValid),
  errorMessage: unref(errorMessage),
  value: props.modelValue,
  focus,
  blur,
}));


// Expose

defineExpose({
  getErrorMessage,
  getContainer,
  getElement,
  getValue,
  getId,
  checkValidity,
  checkFocus,
  checked,
  focus,
  blur,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaCheckbox';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/checkbox) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/checkbox/checkbox.vue)
 *
 * @example
 * ```html
 * <ProximaCheckbox
 *   label="Check me"
 *   size="s"
 *   v-model="value"
 * />
 * ```
 *
 * @prop id `string` — Checkbox id (default `checkbox-[hash]`)
 * @prop type `string` — Checkbox type: `checkbox` or `radio` (default `checkbox`)
 * @prop inputAttrs `InputHTMLAttributes` — Input attributes (default `{}`)
 * @prop trueValue `any` — Checked value (default `true`)
 * @prop falseValue `any` — Unchecked value (default `false`)
 * @prop modelValue `any` — Current value (default `false`)
 * @prop label `string` — Label text
 * @prop labelVisuallyHidden `boolean` — allowing label to be exposed only to assistive technologies (default `false`)
 * @prop describedby `string` — [aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) attribute (default `''`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop required `boolean` — required attribute (default `false`)
 * @prop indeterminate `boolean` — Indeterminate state (default `false`)
 * @prop view `string` — Checkbox view: `plain` / `outline` / `line` (default `plain`)
 * @prop size `string` — Checkbox size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop shadow `string` — Checkbox shadow: `none` / `soft` (default `none`)
 * @prop effect `string` — Click effect: `none` / `ripple` / `pulse` (default `none`)
 * @prop theme `string` — Checkbox theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.checkbox {

  .checkbox {
    display: flex;
    box-sizing: border-box;

    --base-checkbox-size: var(--checkbox-size, 1.25rem);
    --base-checkbox-padding: var(--checkbox-padding, 0.125rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size, 0.875rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width, 2.5);

    --base-checkbox-background:
      var(--checkbox-background, var(--app-field-background, #fff));

    --base-checkbox-border-width: var(--checkbox-border-width, 1.5px);
    --base-checkbox-border-color:
      var(--checkbox-border-color, var(--app-field-border-color, #cfd4d9));

    --base-checkbox-accent-color:
      var(--checkbox-accent-color, var(--app-accent-color, #0071e3));

    --base-checkbox-icon-tick-transition:
      var(--checkbox-icon-tick-transition, stroke-dashoffset 300ms ease-in-out);
  }

  .checkbox *,
  .checkbox *:before,
  .checkbox *:after {
    box-sizing: inherit;
  }

  .checkbox__content {
    max-width: 100%;
    display: flex;
    align-items: normal;
    justify-content: flex-start;
    gap: var(--checkbox-gap, calc(var(--base-checkbox-size) / 2.5));
    border-radius: var(--checkbox-content-border-radius, calc(
      var(--base-checkbox-size) / 4
    ));
    user-select: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .checkbox__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    border: 0;
    padding: 0;
    clip-path: inset(100%);
    clip: rect(0 0 0 0);
    overflow: hidden;
  }

  /*
    Effect
  */

  .checkbox_has_effect {
    --checkbox-has-effect: 1;

    --effect-pulse-color:
      var(--checkbox-effect-pulse-color, var(--base-checkbox-accent-color));
    --effect-ripple-color:
      var(--checkbox-effect-ripple-color, #000);

    --effect-pulse-size: calc(var(--base-checkbox-size) / 4);
  }

  .checkbox__effect {
    position: absolute;
    inset: 0;
    z-index: var(--checkbox-effect-z-index, 4);
  }

  /*
    Label
  */

  .checkbox__label {
    display: block;
    align-self: var(--checkbox-label-align-self, center);
    font-size: var(--base-checkbox-label-font-size);
    line-height: var(--checkbox-label-line-height, 1.3);
    color: var(--checkbox-label-color, var(--app-label-color, #6c757d));
  }

  /*
    Indicator
  */

  .checkbox__indicator {
    position: relative;
    display: block;
    flex-shrink: 0;
    width: var(--base-checkbox-size);
    height: var(--base-checkbox-size);
    padding: var(--base-checkbox-padding);
    border-radius: var(--checkbox-border-radius, inherit);
  }

  .checkbox__indicator:after {
    content: "";
    display: block;
    position: absolute;
    inset: 0;
    background: var(--base-checkbox-background);
    border-width: var(--base-checkbox-border-width);
    border-style: var(--checkbox-border-style, solid);
    border-color: var(--base-checkbox-border-color);
    border-radius: inherit;
    transition: var(--checkbox-transition, background-color 200ms, border-color 200ms);
    z-index: var(--checkbox-indicator-z-index, 1);
  }

  /*
    Icon
  */

  .checkbox__icon {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    color: var(--base-checkbox-icon-color, transparent);
    z-index: 2;
  }

  .checkbox__icon circle {
    fill: currentColor;
    opacity: var(--checkbox-is-checked, 0);
  }

  .checkbox__icon line,
  .checkbox__icon path {
    stroke-width: var(--base-checkbox-icon-stroke-width);
    stroke-linecap: var(--checkbox-icon-stroke-linecap, round);
    stroke-linejoin: var(--checkbox-icon-stroke-linejoin, round);
    stroke: currentColor;
    fill: none;
  }

  .checkbox__icon path {
    stroke-dasharray: var(--checkbox-icon-stroke-dasharray, 15);
    stroke-dashoffset: var(--checkbox-icon-stroke-dashoffset, calc(
      15px * max(var(--checkbox-is-indeterminate, 0), var(--checkbox-is-unchecked, 0))
    ));
    transition: var(--base-checkbox-icon-tick-transition);
  }

  /*
    Sizes
  */

  .checkbox_size_xxs {
    --base-checkbox-size: var(--checkbox-size-xxs, 0.875rem);
    --base-checkbox-padding: var(--checkbox-padding-xxs, 0.0625rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-xxs, 0.75rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-xxs, 2.5);
  }

  .checkbox_size_xs {
    --base-checkbox-size: var(--checkbox-size-xs, 1rem);
    --base-checkbox-padding: var(--checkbox-padding-xs, 0.0625rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-xs, 0.8125rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-xs, 2.5);
  }

  .checkbox_size_s {
    --base-checkbox-size: var(--checkbox-size-s, 1.125rem);
    --base-checkbox-padding: var(--checkbox-padding-s, 0.125rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-s, 0.875rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-s, 2.5);
  }

  .checkbox_size_m {
    --base-checkbox-size: var(--checkbox-size-m, 1.375rem);
    --base-checkbox-padding: var(--checkbox-padding-m, 0.125rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-m, 1rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-m, 2.25);
  }

  .checkbox_size_l {
    --base-checkbox-size: var(--checkbox-size-l, 1.5rem);
    --base-checkbox-padding: var(--checkbox-padding-l, 0.125rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-l, 1.125rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-l, 2);
  }

  .checkbox_size_xl {
    --base-checkbox-size: var(--checkbox-size-xl, 1.75rem);
    --base-checkbox-padding: var(--checkbox-padding-xl, 0.125rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-xl, 1.25rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-xl, 2);
  }

  .checkbox_size_xxl {
    --base-checkbox-size: var(--checkbox-size-xxl, 2rem);
    --base-checkbox-padding: var(--checkbox-padding-xxl, 0.125rem);
    --base-checkbox-label-font-size: var(--checkbox-label-font-size-xxl, 1.25rem);
    --base-checkbox-icon-stroke-width: var(--checkbox-icon-stroke-width-xxl, 2);
  }

  /*
    Shadow
  */

  .checkbox_shadow_soft {
    --base-checkbox-box-shadow-soft-size:
      var(--checkbox-box-shadow-soft-size, 0 0.0625rem 0.25rem);
    --base-checkbox-box-shadow-soft-color:
      var(--checkbox-box-shadow-soft-color, rgba(0, 0, 0, var(--app-field-box-shadow-opacity, 0.1)));
  }

  .checkbox_shadow_soft:not(.checkbox_disabled) .checkbox__indicator:after {
    box-shadow:
      var(--base-checkbox-box-shadow-soft-size)
      var(--base-checkbox-box-shadow-soft-color);
  }

  .checkbox_shadow_soft.checkbox_view_line {
    --base-checkbox-box-shadow-soft-size:
      var(--checkbox-view-line-box-shadow-soft-size, 0);
  }

  /*
    Radio
  */

  .checkbox_type_radio {
    --checkbox-is-radio: 1;
  }

  .checkbox_type_radio .checkbox__indicator  {
    padding: 0;
    border-radius: 100rem;
  }

  /*
    States
  */

  .checkbox_indeterminate {
    --checkbox-is-indeterminate: 1;
    --base-checkbox-icon-tick-transition: none;
  }

  .checkbox_indeterminate .checkbox__indicator  {
    padding: 0;
  }

  .checkbox_unchecked {
    --checkbox-is-unchecked: 1;
  }

  .checkbox_checked {
    --checkbox-is-checked: 1;
  }

  .checkbox_view_plain {
    --checkbox-is-view-plain: 1;
  }

  .checkbox_view_outline {
    --checkbox-is-view-outline: 1;
  }

  .checkbox_view_line {
    --checkbox-is-view-line: 1;
    --base-checkbox-border-width: 0 0 var(--checkbox-border-width, 1.5px) 0;
    --base-checkbox-background: var(--checkbox-view-line-background, transparent);
  }

  .checkbox_view_line .checkbox__content {
    border-radius: 0;
  }

  .checkbox_indeterminate,
  .checkbox_checked {
    --base-checkbox-border-color:
      var(--checkbox-checked-border-color, var(--base-checkbox-accent-color));
    --base-checkbox-icon-color:
      var(--checkbox-checked-icon-color, var(--base-checkbox-accent-color));
  }

  .checkbox_view_plain.checkbox_indeterminate,
  .checkbox_view_plain.checkbox_checked {
    --base-checkbox-background:
      var(--checkbox-view-plain-checked-background, var(--base-checkbox-accent-color));
    --base-checkbox-icon-color:
      var(--checkbox-view-plain-checked-icon-color, #fff);
  }

  /*
    Focus
  */

  .checkbox_focused {
    --checkbox-is-focus: 1;

    --base-checkbox-border-color:
      var(--checkbox-focus-border-color, var(--base-checkbox-accent-color));
  }

  .checkbox_focused .checkbox__indicator {
    outline-offset: var(--checkbox-highlight-offset, var(--app-highlight-offset, 0.0625rem));
    outline-style: var(--checkbox-highlight-style, var(--app-highlight-style, solid));
    outline-width: var(--checkbox-highlight-size, var(--app-highlight-size, 0.1875rem));
    outline-color: var(--checkbox-highlight-color, var(--app-highlight-color, var(--base-checkbox-highlight-color-mix, rgba(0, 0, 0, 0.1))));
  }

  .checkbox_effect_pulse .checkbox__indicator:hover,
  .checkbox__input:focus-visible ~ .checkbox__content .checkbox__indicator {
    outline-color: transparent;
  }

  .checkbox__input:focus-visible ~ .checkbox__content {
    outline-offset: var(--checkbox-outline-offset, var(--app-outline-offset, 0.1875rem));
    outline:
      var(--checkbox-outline-size, var(--app-outline-size, 0.25rem))
      var(--checkbox-outline-style, var(--app-outline-style, solid))
      var(--checkbox-outline-color, var(--app-outline-color, rgba(0, 61, 255, 0.7)));
  }

  /*
    Hover
  */

  @media (hover: hover) {
    .checkbox_enabled .checkbox__content:hover {
      --checkbox-is-hover: 1;

      --base-checkbox-border-color:
        var(--checkbox-hover-border-color, var(--base-checkbox-accent-color));
    }
  }

  /*
    Disabled
  */

  .checkbox_disabled {
    --checkbox-is-disabled: 1;

    opacity: var(--checkbox-disabled-opacity, var(--app-disabled-opacity, 0.6));
  }

  .checkbox_disabled .checkbox__content {
    cursor: not-allowed;
  }

  /*
    Color mix
  */

  @supports (outline-color: color-mix(in srgb, red, blue)) {
    .checkbox {
      --base-checkbox-highlight-color-mix: color-mix(in srgb,
        var(--base-checkbox-accent-color), transparent calc(
          100% - (var(--app-highlight-opacity, 0.2) * 100%)
        )
      );
    }
  }
}
</style>

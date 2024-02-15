<template>
  <div ref="container" class="switch" :class="modifiers">
    <input
      ref="el"
      role="switch"
      type="checkbox"
      v-bind="attributes"
      class="switch__input"
      @change="updateByEvent"
      @focus="onFocus"
      @blur="onBlur"
    >
    <label class="switch__content" :for="id">
      <slot name="prepend" v-bind="slotProps" />
      <span class="switch__indicator" aria-hidden="true" data-ghost-item>
        <span
          v-if="hasValues"
          class="switch__values"
        >
          <span v-if="hasCheckedValue" class="switch__value switch__value_checked">
            <slot name="checked" v-bind="slotProps">
              <svg v-if="hasStateIcons && !isSliderView" viewBox="0 0 16 16" width="16" height="16" class="switch__icon switch__icon_on" aria-hidden="true">
                <line x1="8" x2="8" y1="1" y2="15" />
              </svg>
            </slot>
          </span>
          <span v-if="hasUncheckedValue" class="switch__value switch__value_unchecked">
            <slot name="unchecked" v-bind="slotProps">
              <svg v-if="hasStateIcons && !isSliderView" viewBox="0 0 16 16" width="16" height="16" class="switch__icon switch__icon_off" aria-hidden="true">
                <circle cx="8" cy="8" r="7" />
              </svg>
            </slot>
          </span>
        </span>
        <span class="switch__thumb">
          <slot name="thumb" v-bind="slotProps" />
        </span>
        <ProximaEffect
          v-if="hasEffect && !disabled"
          :type="effect"
          class="switch__effect"
        />
      </span>
      <span
        v-if="hasLabel"
        class="switch__label"
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
import { ref, unref, toRaw, computed, useSlots, type InputHTMLAttributes } from 'vue';
import ProximaEffect from '@/effect/effect.vue';
import useLocale from '@/composables/locale';
import getRandomId from '@/utils/randomId';

import type {
  ProximaSize,
  ProximaRound,
  ProximaShadow,
  ProximaAlign,
  ProximaClickEffect,
} from '../types.d';

export interface ProximaSwitchProps {
  id?: string
  inputAttrs?: InputHTMLAttributes
  trueValue?: any
  falseValue?: any
  modelValue?: any
  label?: string
  labelPosition?: 'before' | 'after'
  labelVisuallyHidden?: boolean
  describedby?: string
  hasStateIcons?: boolean
  disabled?: boolean
  required?: boolean
  indeterminate?: boolean
  align?: ProximaAlign
  view?: 'plain' | 'slider'
  size?: ProximaSize
  round?: ProximaRound
  shadow?: ProximaShadow
  effect?: ProximaClickEffect
  theme?: string
}

const props = withDefaults(defineProps<ProximaSwitchProps>(), {
  id: () => getRandomId('switch'),
  trueValue: true,
  falseValue: (props: ProximaSwitchProps) => {
    if (typeof props.trueValue === 'string') return '';
    if (typeof props.trueValue === 'number') return 0;
    if (typeof props.trueValue === 'object') return null;
    return false;
  },
  modelValue: false,
  label: '',
  labelPosition: 'after',
  labelVisuallyHidden: false,
  describedby: '',
  hasStateIcons: () => getDefaultProp('hasStateIcons', false) as false,
  disabled: false,
  required: false,
  indeterminate: false,
  align: 'start',
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  round: () => getDefaultProp('round', 'full') as 'full',
  shadow: () => getDefaultProp('shadow', 'none') as 'none',
  effect: () => getDefaultProp('effect', 'none') as 'none',
  theme: () => getDefaultProp('theme', '') as '',
});

const emit = defineEmits<{
  'update:modelValue': [modelValue: ProximaSwitchProps['modelValue']]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>();

const slots = useSlots();
const { getLocaleToken } = useLocale();

const hasLabel = computed(() => Boolean(props.label || slots.label));
const hasUncheckedValue = computed(() => Boolean(props.hasStateIcons || slots.unchecked));
const hasCheckedValue = computed(() => Boolean(props.hasStateIcons || slots.checked));
const hasValues = computed(() => unref(hasUncheckedValue) || unref(hasCheckedValue));
const hasEffect = computed(() => Boolean(props.effect && props.effect !== 'none'));

const isMultiple = computed(() => Array.isArray(props.modelValue));
const isSliderView = computed(() => props.view === 'slider');

const isChecked = computed(() => {
  if (unref(isMultiple)) {
    const modelValue = props.modelValue as any[];
    const item = modelValue.find((el: any) => toRaw(el) === toRaw(props.trueValue))
    return Boolean(item);
  } else {
    return toRaw(props.modelValue) === toRaw(props.trueValue);
  }
});

const modifiers = computed(() => ({
  switch_focused: unref(isFocused),
  switch_checked: unref(isChecked),
  switch_unchecked: !unref(isChecked),
  switch_indeterminate: props.indeterminate,
  switch_required: props.required,
  switch_disabled: props.disabled,
  switch_enabled: !props.disabled,
  switch_has_label: unref(hasLabel),
  switch_has_effect: unref(hasEffect),
  [`switch_effect_${props.effect}`]: Boolean(props.effect),
  [`switch_view_${props.view}`]: Boolean(props.view),
  [`switch_size_${props.size}`]: Boolean(props.size),
  [`switch_round_${props.round}`]: Boolean(props.round),
  [`switch_label_${props.labelPosition}`]: unref(hasLabel) && Boolean(props.labelPosition),
  [`switch_shadow_${props.shadow}`]: Boolean(props.shadow),
  [`switch_align_${props.align}`]: Boolean(props.align),
  [`switch_theme_${props.theme}`]: Boolean(props.theme),
}));

const attributes = computed(() => ({
  ...props.inputAttrs,
  id: props.id,
  disabled: props.disabled,
  required: props.required,
  checked: unref(isChecked),
  value: ['number', 'string', 'boolean'].includes(typeof props.trueValue) ? props.trueValue : undefined,
  'aria-describedby': props.describedby || undefined,
}));

const isValid = computed(() => !props.required || unref(isChecked));
const errorMessage = computed(() => unref(isValid) ? '' : getLocaleToken('switchRequired'));

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
    emit('update:modelValue', value);
  }
  // Safari does not set focus
  if (document.activeElement?.id !== props.id) {
    focus();
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
const getId = () => props.id;

const checkValidity = () => unref(isValid);
const checkFocus = () => unref(isFocused);
const checked = () => unref(isChecked);

const focus = () => unref(el)?.focus?.();
const blur = () => unref(el)?.blur?.();


// Slot props

const slotProps = computed(() => ({
  id: props.id,
  hasEffect: unref(hasEffect),
  hasLabel: unref(hasLabel),
  hasUncheckedValue: unref(hasUncheckedValue),
  hasCheckedValue: unref(hasCheckedValue),
  hasStateIcons: props.hasStateIcons,
  isIndeterminate: props.indeterminate,
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

export const componentName = 'ProximaSwitch';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/switch) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/switch/switch.vue)
 *
 * @example
 * ```html
 * <ProximaSwitch
 *   label="Check me"
 *   label-position="before"
 *   size="s"
 *   v-model="value"
 * />
 * ```
 *
 * @prop id `string` — Switch id (default `switch-[hash]`)
 * @prop inputAttrs `InputHTMLAttributes` — Input attributes (default `{}`)
 * @prop trueValue `any` — Checked value (default `true`)
 * @prop falseValue `any` — Unchecked value (default `false`)
 * @prop modelValue `any` — Current value (default `false`)
 * @prop label `string` — Label text
 * @prop labelVisuallyHidden `boolean` — allowing label to be exposed only to assistive technologies (default `false`)
 * @prop labelPosition `string` — Label position: `before` or `after` (default `after`)
 * @prop describedby `string` — [aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) attribute (default `''`)
 * @prop hasStateIcons `boolean` — Adds state icons (default `false`)
 * @prop disabled `boolean` — disabled state (default `false`)
 * @prop required `boolean` — required attribute (default `false`)
 * @prop indeterminate `boolean` — Indeterminate value (default `false`)
 * @prop view `string` — Switch view: `plain` / `slider` (default `plain`)
 * @prop size `string` — Switch size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Switch radius: `full` / `soft` / `none` (default `full`)
 * @prop shadow `string` — Switch shadow: `none` / `soft` (default `none`)
 * @prop align `string` — Horizontal align: `start` / `center` / `end` (default `start`)
 * @prop effect `string` — Click effect: `none` / `ripple` / `pulse` (default `none`)
 * @prop theme `string` — Switch theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.switch {

  .switch {
    display: flex;
    box-sizing: border-box;

    --base-switch-size: var(--switch-size, 1.375rem);
    --base-switch-padding: var(--switch-padding, 0.125rem);
    --base-switch-thumb-size: calc(
      var(--base-switch-size) - (var(--base-switch-padding) * 2)
    );

    --base-switch-thumb-offset: calc(
      (100% - var(--base-switch-thumb-size) - (var(--base-switch-padding) * 2))
      * var(--switch-is-checked, 0)
    );

    --base-switch-inert-background: var(--switch-background, #bfbfbf);
    --base-switch-background: var(--base-switch-inert-background);

    --base-switch-inert-value-color: var(--switch-value-color, #fff);
    --base-switch-value-color: var(--base-switch-inert-value-color);

    --base-switch-inert-thumb-background: var(--switch-thumb-background, #fff);
    --base-switch-thumb-background: var(--base-switch-inert-thumb-background);

    --base-switch-inert-thumb-color: var(--switch-thumb-color, #000);
    --base-switch-thumb-color: var(--base-switch-inert-thumb-color);

    --base-switch-accent-color:
      var(--switch-accent-color, var(--app-accent-color, #0071e3));

    --base-switch-label-font-size: var(--switch-label-font-size, 0.875rem);
    --base-switch-value-font-size: var(--switch-value-font-size, 0.75em);
    --base-switch-state-icon-size: var(--switch-state-icon-size, 0.625rem);

    --spinner-size: var(--switch-spinner-size, 72%);
    --icon-size: var(--switch-icon-size, 80%);
  }

  .switch *,
  .switch *:before,
  .switch *:after {
    box-sizing: inherit;
  }

  [dir="rtl"] .switch {
    --switch-direction: -1;
  }

  .switch__content {
    max-width: 100%;
    display: flex;
    align-items: normal;
    justify-content: flex-start;
    gap: var(--switch-gap, calc(var(--base-switch-size) / 2));
    border-radius: var(--switch-border-radius, calc(var(--base-switch-size) / 4));
    user-select: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .switch__input {
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
    Align
  */

  .switch_align_start {
    justify-content: flex-start;
  }

  .switch_align_center {
    justify-content: center;
  }

  .switch_align_end {
    justify-content: flex-end;
  }

  /*
    Effect
  */

  .switch_has_effect {
    --switch-has-effect: 1;

    --effect-pulse-color:
      var(--switch-effect-pulse-color, var(--base-switch-background));
    --effect-ripple-color:
      var(--switch-effect-ripple-color, #000);

    --effect-pulse-size: calc(var(--base-switch-size) / 4);
  }

  .switch__effect {
    position: absolute;
    inset: 0;
    z-index: var(--switch-effect-z-index, 2);
  }

  /*
    Label
  */

  .switch__label {
    display: block;
    align-self: var(--switch-label-align-self, center);
    font-size: var(--base-switch-label-font-size);
    line-height: var(--switch-label-line-height, 1.3);
    color: var(--switch-label-color, var(--app-label-color, #6c757d));
  }

  /*
    Indicator
  */

  .switch__indicator {
    position: relative;
    display: block;
    flex-shrink: 0;
    width: auto;
    height: var(--base-switch-size);
    min-width: var(--switch-min-width, calc(
      var(--base-switch-size) *
      var(--switch-min-width-multiplier, 1.85) -
      var(--base-switch-padding)
    ));
    border-radius: inherit;
  }

  .switch__indicator::before {
    content: "";
    display: block;
    position: absolute;
    inset-block: var(--switch-track-margin-y, 0);
    inset-inline: var(--switch-track-margin-x, 0);
    background: var(--base-switch-background);
    border-width: var(--switch-border-width, 0);
    border-style: var(--switch-border-style, solid);
    border-color: var(--switch-border-color, transparent);
    box-shadow: var(--base-switch-box-shadow, none);
    transition: var(--switch-transition, background-color 200ms ease);
    border-radius: inherit;
  }

  /*
    Thumb
  */

  .switch__thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: var(--base-switch-thumb-offset, 0);
    width: var(--base-switch-thumb-size);
    height: var(--base-switch-thumb-size);
    padding: var(--switch-thumb-padding, 0);
    color: var(--base-switch-thumb-color);
    margin: var(--base-switch-padding);
    border-radius: var(--switch-thumb-border-radius, inherit);
    transition: var(--switch-thumb-transition,
      inset 250ms cubic-bezier(0.22, 1, 0.36, 1)
    );
    z-index: 1;
  }

  .switch__thumb:before {
    content: "";
    display: block;
    position: absolute;
    inset-block: 0;
    inset-inline:
      calc(-40% * var(--switch-is-active, 0) * var(--switch-is-checked, 0))
      calc(-40% * var(--switch-is-active, 0) * var(--switch-is-unchecked, 0));
    background: var(--base-switch-thumb-background);
    border-radius: inherit;
    box-shadow: var(--switch-thumb-box-shadow, 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.2));
    transition: inherit;
    z-index: -1;
  }

  /*
    Values
  */

  .switch__values {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;
    padding-inline-start: calc(var(--base-switch-thumb-size) * var(--switch-is-unchecked, 0));
    padding-inline-end: calc(var(--base-switch-thumb-size) * var(--switch-is-checked, 0));
    z-index: 1;
  }

  .switch__value {
    --base-switch-value-offset: calc(
      var(--base-switch-thumb-size) / 3
      * var(--switch-is-active, 0)
      * var(--switch-direction, 1)
    );

    --base-switch-value-padding: calc(
      var(--switch-value-padding-x, 1em) / var(--switch-value-padding-divider, 1.5)
    );

    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: var(--base-switch-value-font-size);
    color: var(--base-switch-value-color);
    padding-inline: var(--switch-value-padding-x, 1em);
    padding-block: var(--switch-value-padding-y, 0);
    opacity: calc(1 - var(--switch-is-indeterminate, 0));
    transition: var(--switch-value-transition,
      transform 250ms cubic-bezier(0.22, 1, 0.36, 1)
    );
  }

  .switch__value_unchecked {
    padding-inline-start: var(--base-switch-value-padding);
    margin-inline-start: calc(var(--switch-is-checked, 0) * 100%);
    margin-inline-end: calc(var(--switch-is-checked, 0) * -100%);
    transform: translate3d(calc(
      (var(--switch-is-checked, 0) * 100% * var(--switch-direction, 1))
      + var(--base-switch-value-offset)
    ), -100%, 0);
  }

  .switch__value_checked {
    padding-inline-end: var(--base-switch-value-padding);
    margin-inline-start: calc(var(--switch-is-unchecked, 0) * -100%);
    margin-inline-end: calc(var(--switch-is-unchecked, 0) * 100%);
    transform: translate3d(calc(
      (var(--switch-is-unchecked, 0) * -100% * var(--switch-direction, 1))
      - var(--base-switch-value-offset)
    ), 0, 0);
  }

  .switch__icon {
    display: block;
    width: var(--base-switch-state-icon-size);
    height: var(--base-switch-state-icon-size);
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .switch__icon_on {
    margin-inline: -0.5em 0;
  }

  .switch__icon_off {
    margin-inline: 0 -0.5em;
  }

  /*
    View
  */

  .switch_view_plain {
    --switch-is-view-plain: 1;
  }

  .switch_view_slider {
    --switch-is-view-slider: 1;
    --switch-track-margin-y: 25%;
    --switch-track-margin-x: var(--base-switch-padding);
  }

  /*
    Label
  */

  .switch_label_before .switch__label {
    order: -1;
  }

  /*
    Round
  */

  .switch_round_none .switch__indicator {
    border-radius: 0;
  }

  .switch_round_full .switch__indicator {
    border-radius: 100rem;
  }

  /*
    Sizes
  */

  .switch_size_xxs {
    --base-switch-size: var(--switch-size-xxs, 1rem);
    --base-switch-padding: var(--switch-padding-xxs, 0.125rem);
    --base-switch-label-font-size: var(--switch-label-font-size-xxs, 0.75rem);
    --base-switch-value-font-size: var(--switch-value-font-size-xxs, 0.625rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-xxs, 0.5rem);
  }

  .switch_size_xs {
    --base-switch-size: var(--switch-size-xs, 1.125rem);
    --base-switch-padding: var(--switch-padding-xs, 0.125rem);
    --base-switch-label-font-size: var(--switch-label-font-size-xs, 0.8125rem);
    --base-switch-value-font-size: var(--switch-value-font-size-xs, 0.625rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-xs, 0.5rem);
  }

  .switch_size_s {
    --base-switch-size: var(--switch-size-s, 1.25rem);
    --base-switch-padding: var(--switch-padding-s, 0.125rem);
    --base-switch-label-font-size: var(--switch-label-font-size-s, 0.875rem);
    --base-switch-value-font-size: var(--switch-value-font-size-s, 0.625rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-s, 0.5rem);
  }

  .switch_size_m {
    --base-switch-size: var(--switch-size-m, 1.625rem);
    --base-switch-padding: var(--switch-padding-m, 0.1875rem);
    --base-switch-label-font-size: var(--switch-label-font-size-m, 1rem);
    --base-switch-value-font-size: var(--switch-value-font-size-m, 0.875rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-m, 0.625rem);
  }

  .switch_size_l {
    --base-switch-size: var(--switch-size-l, 1.875rem);
    --base-switch-padding: var(--switch-padding-l, 0.25rem);
    --base-switch-label-font-size: var(--switch-label-font-size-l, 1.125rem);
    --base-switch-value-font-size: var(--switch-value-font-size-l, 0.875rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-l, 0.75rem);
  }

  .switch_size_xl {
    --base-switch-size: var(--switch-size-xl, 2.25rem);
    --base-switch-padding: var(--switch-padding-xl, 0.25rem);
    --base-switch-label-font-size: var(--switch-label-font-size-xl, 1.25rem);
    --base-switch-value-font-size: var(--switch-value-font-size-xl, 1rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-xl, 0.875rem);
  }

  .switch_size_xxl {
    --base-switch-size: var(--switch-size-xxl, 2.5rem);
    --base-switch-padding: var(--switch-padding-xxl, 0.25rem);
    --base-switch-label-font-size: var(--switch-label-font-size-xxl, 1.375rem);
    --base-switch-value-font-size: var(--switch-value-font-size-xxl, 1.125rem);
    --base-switch-state-icon-size: var(--switch-state-icon-size-xxl, 1rem);
  }

  /*
    Shadow
  */

  .switch_shadow_soft {
    --base-switch-box-shadow:
      var(--switch-box-shadow-soft-size, 0 0.0625rem 0.25rem)
      var(--switch-box-shadow-soft-color, rgba(0, 0, 0, 0.15));
  }

  /*
    States
  */

  .switch_indeterminate {
    --switch-is-indeterminate: 1;
    --base-switch-thumb-offset: calc(
      50% - var(--base-switch-padding) - (var(--base-switch-thumb-size) / 2)
    );
  }

  .switch_enabled .switch__content:active {
    --switch-is-active: 1;
  }

  .switch_unchecked {
    --switch-is-unchecked: 1;
  }

  .switch_checked {
    --switch-is-checked: 1;

    --base-switch-inert-background:
      var(--switch-checked-background, var(--base-switch-accent-color));

    --base-switch-inert-value-color:
      var(--switch-checked-value-color, var(--switch-value-color, #fff));

    --base-switch-inert-thumb-background:
      var(--switch-checked-thumb-background, var(--switch-thumb-background, #fff));

    --base-switch-inert-thumb-color:
      var(--switch-checked-thumb-color, var(--switch-thumb-color, #000));
  }

  /*
    Focus
  */

  .switch_focused {
    --switch-is-focus: 1;
  }

  .switch_focused .switch__indicator {
    outline-offset: var(--switch-highlight-offset, var(--app-highlight-offset, 0.0625rem));
    outline-style: var(--switch-highlight-style, var(--app-highlight-style, solid));
    outline-width: var(--switch-highlight-size, var(--app-highlight-size, 0.1875rem));
    outline-color: var(--switch-highlight-color, var(--app-highlight-color, var(--base-switch-highlight-color-mix, rgba(0, 0, 0, 0.1))));
  }

  .switch_effect_pulse .switch__indicator:hover,
  .switch__input:focus-visible ~ .switch__content .switch__indicator {
    outline-color: transparent;
  }

  .switch__input:focus-visible ~ .switch__content {
    outline-offset: var(--switch-outline-offset, var(--app-outline-offset, 0.1875rem));
    outline:
      var(--switch-outline-size, var(--app-outline-size, 0.25rem))
      var(--switch-outline-style, var(--app-outline-style, solid))
      var(--switch-outline-color, var(--app-outline-color, rgba(0, 61, 255, 0.7)));
  }

  /*
    Hover
  */

  @media (hover: hover) {
    .switch_enabled .switch__content:hover {
      --switch-is-hover: 1;

      --base-switch-background: var(--switch-hover-background, var(--base-switch-hover-background-mix, var(--base-switch-inert-background)));
    }
  }

  /*
    Disabled
  */

  .switch_disabled {
    --switch-is-disabled: 1;
    --base-switch-box-shadow: none;

    --base-switch-background:
      var(--switch-disabled-background, var(--base-switch-inert-background));

    --base-switch-thumb-background:
      var(--switch-disabled-thumb-background, var(--base-switch-inert-thumb-background));

    opacity: var(--switch-disabled-opacity, var(--app-disabled-opacity, 0.6));
  }

  .switch_disabled .switch__content {
    cursor: not-allowed;
  }

  /*
    Color mix
  */

  @supports (outline-color: color-mix(in srgb, red, blue)) {
    .switch {
      --base-switch-highlight-color-mix: color-mix(in srgb,
        var(--base-switch-background), transparent calc(
          100% - (var(--app-highlight-opacity, 0.2) * 100%)
        )
      );
    }
  }

  @supports (color: color-mix(in srgb, red, blue)) {
    .switch {
      --base-switch-hover-background-mix: color-mix(in srgb,
        var(--base-switch-inert-background), var(--switch-hover-mix-color, #000) calc(
          var(--switch-hover-mix-opacity, 0.1) * 100%
        )
      );
    }
  }
}
</style>

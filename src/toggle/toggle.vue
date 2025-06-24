<template>
  <fieldset ref="container" class="toggle" :class="modifiers">
    <slot name="prepend" v-bind="slotProps" />
    <legend
      v-if="hasHeader"
      class="toggle__header"
      :class="{ 'visually-hidden': labelVisuallyHidden }"
    >
      <slot name="label" v-bind="slotProps">
        <span
          v-if="label"
          class="toggle__label"
          data-ghost-text
          v-text="label"
          @click="focus"
        />
      </slot>
      <slot name="header" v-bind="slotProps" />
    </legend>
    <div class="toggle__content" data-ghost-item>
      <div
        v-for="(item, i) in optionsList"
        :key="`${id}-item-${i}`"
        class="toggle__item"
      >
        <input
          :type="isMultiple ? 'checkbox' : 'radio'"
          :name="id"
          :id="generateItemId(id, i)"
          :value="getSimpleValue(item)"
          :checked="checkStatus(item)"
          :disabled="item.disabled || disabled"
          :required="isMultiple ? undefined : required"
          v-bind="item.inputAttrs"
          class="toggle__input"
          @change="updateByEvent($event, item)"
          @focus="onFocus"
          @blur="onBlur"
        />
        <label
          :for="generateItemId(id, i)"
          class="toggle__button"
          :class="{
            [`toggle__button_theme_${item.theme}`]: Boolean(item.theme),
            toggle__button_checked: checkStatus(item),
            toggle__button_enabled: !(item.disabled || disabled),
            toggle__button_disabled: item.disabled || disabled,
            toggle__button_indeterminate: !(item.disabled || disabled) && indeterminate,
          }"
        >
          <slot
            name="option-icon"
            :option="item"
            :checked="checkStatus(item)"
            v-bind="slotProps"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              v-bind="item.iconProps"
              class="toggle__icon"
            />
          </slot>
          <slot
            name="option-label"
            :option="item"
            :checked="checkStatus(item)"
            v-bind="slotProps"
          >
            <span
              v-if="item.label"
              v-text="item.label"
              class="toggle__text"
              :class="{ 'visually-hidden': item.labelVisuallyHidden }"
            />
          </slot>
          <ProximaEffect
            v-if="hasEffect && !(item.disabled || disabled)"
            :type="effect"
            class="toggle__effect"
          />
        </label>
      </div>
      <slot name="content" v-bind="slotProps" />
    </div>
    <slot v-bind="slotProps" />
  </fieldset>
</template>

<script setup lang="ts">
import { ref, unref, computed, useSlots, toRaw, useId } from 'vue';
import ProximaEffect from '@/effect/effect.vue';
import useLocale from '@/composables/locale';

import type {
  ProximaSize,
  ProximaRound,
  ProximaShadow,
  ProximaClickEffect,
  ProximaDynamicComponent,
  ProximaDynamicProps,
  ProximaDynamicAttrs,
} from '../types.d';

export interface ProximaToggleOption {
  value: any
  label?: string
  labelVisuallyHidden?: boolean
  icon?: ProximaDynamicComponent
  iconProps?: ProximaDynamicProps
  inputAttrs?: ProximaDynamicAttrs
  disabled?: boolean
  theme?: string
}

export interface ProximaToggleProps {
  id?: string
  modelValue?: any
  options?: ProximaToggleOption[] | string[] | number[]
  label?: string
  labelPosition?: 'above' | 'aside'
  labelVisuallyHidden?: boolean
  disabled?: boolean
  required?: boolean
  indeterminate?: boolean
  view?: 'plain' | 'line'
  size?: ProximaSize
  round?: ProximaRound
  shadow?: ProximaShadow
  effect?: ProximaClickEffect
  theme?: string
}

const props = withDefaults(defineProps<ProximaToggleProps>(), {
  modelValue: '',
  options: () => [],
  label: '',
  labelPosition: () => getDefaultProp('labelPosition', 'above') as 'above',
  labelVisuallyHidden: false,
  disabled: false,
  required: false,
  indeterminate: false,
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  round: () => getDefaultProp('round', 'soft') as 'soft',
  shadow: () => getDefaultProp('shadow', 'none') as 'none',
  effect: () => getDefaultProp('effect', 'none') as 'none',
  theme: () => getDefaultProp('theme', '') as '',
});

const id = props.id || useId();
const generateItemId = (id: string, index: number) => id ? `${id}-item-${index}` : undefined;

const emit = defineEmits<{
  'update:modelValue': [modelValue: ProximaToggleProps['modelValue']]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>();

const slots = useSlots();
const { getLocaleToken } = useLocale();

const hasLabel = computed(() => Boolean(props.label || slots.label));
const hasHeader = computed(() => Boolean(unref(hasLabel) || slots.header));
const hasEffect = computed(() => Boolean(props.effect && props.effect !== 'none'));

const isMultiple = computed(() => Array.isArray(props.modelValue));

const modifiers = computed(() => ({
  toggle_focused: unref(isFocused),
  toggle_has_label: unref(hasLabel),
  toggle_required: props.required,
  toggle_disabled: props.disabled,
  toggle_enabled: !props.disabled,
  toggle_multiple: unref(isMultiple),
  toggle_indeterminate: props.indeterminate,
  toggle_has_effect: unref(hasEffect),
  [`toggle_effect_${props.effect}`]: Boolean(props.effect),
  [`toggle_label_${props.labelPosition}`]: unref(hasLabel) && Boolean(props.labelPosition),
  [`toggle_view_${props.view}`]: Boolean(props.view),
  [`toggle_size_${props.size}`]: Boolean(props.size),
  [`toggle_theme_${props.theme}`]: Boolean(props.theme),
  [`toggle_round_${props.round}`]: Boolean(props.round),
  [`toggle_shadow_${props.shadow}`]: Boolean(props.shadow),
}));

const optionsList = computed(() => props.options.map((el) => {
  if (typeof el === 'number' || typeof el === 'string') {
    return { label: String(el), value: el };
  }
  return el;
}));

const firstCheckedIndex = computed(() => unref(optionsList).findIndex(checkStatus));
const firstEnabledIndex = computed(() => {
  if (props.disabled) return -1;
  return unref(optionsList).findIndex((el) => !el.disabled);
});

const getSimpleValue = (option: ProximaToggleOption) =>
  ['number', 'string', 'boolean'].includes(typeof option.value) ? option.value : undefined;

const checkStatus = (option: ProximaToggleOption) => {
  if (unref(isMultiple)) {
    const modelValue = props.modelValue as any[];
    const item = modelValue.find((el: any) => toRaw(el) === toRaw(option.value))
    return Boolean(item);
  } else {
    return toRaw(props.modelValue) === toRaw(option.value);
  }
};

const updateByEvent = (event: Event, option: ProximaToggleOption) => {
  if (unref(isMultiple)) {
    const modelValue = props.modelValue as any[];
    const value = checkStatus(option)
      ? modelValue.filter((el: any) => toRaw(el) !== toRaw(option.value))
      : [...modelValue, option.value];
    emit('update:modelValue', value);
  } else {
    emit('update:modelValue', option.value);
  }
};

const isValid = computed(() => !props.required || Boolean(props.modelValue));
const errorMessage = computed(() => unref(isValid) ? '' : getLocaleToken('selectRequired'));


// Focus

const isFocused = ref(false);
const setFocus = (flag: boolean) => (isFocused.value = flag);

const onFocus = (event: FocusEvent) => {
  setFocus(true);
  emit('focus', event);
};

const onBlur = (event: FocusEvent) => {
  const relatedName = (event.relatedTarget as HTMLInputElement)?.name || '';
  const targetName = (event.target as HTMLInputElement)?.name || '';
  if (!relatedName || relatedName !== targetName) {
    setFocus(false);
    emit('blur', event);
  }
};


// Methods

const container = ref<HTMLFieldSetElement | null>(null);

const getErrorMessage = () => unref(errorMessage);
const getContainer = () => unref(container);
const getValue = () => props.modelValue;
const getId = () => unref(id);

const checkValidity = () => unref(isValid);
const checkFocus = () => unref(isFocused);

const getFirstCheckedElement = () => {
  const index = unref(firstCheckedIndex);
  if (index >= 0) {
    return document.getElementById(`${getId()}-item-${index}`);
  }
  return null;
}

const getFirstEnabledElement = () => {
  const index = unref(firstEnabledIndex);
  if (index >= 0) {
    return document.getElementById(`${getId()}-item-${index}`);
  }
  return null;
}

const focus = () => {
  const el = getFirstCheckedElement() || getFirstEnabledElement();
  el?.focus?.();
};

const blur = () => {
  const el = document.activeElement as HTMLInputElement;
  if (el?.name === getId()) {
    el.blur?.();
  }
};


// Slot props

const slotProps = computed(() => ({
  id: unref(id),
  hasLabel: unref(hasLabel),
  hasHeader: unref(hasHeader),
  isValid: unref(isValid),
  isFocused: unref(isFocused),
  isMultiple: unref(isMultiple),
  isDisabled: props.disabled,
  firstCheckedIndex: unref(firstCheckedIndex),
  firstEnabledIndex: unref(firstEnabledIndex),
  options: unref(optionsList),
  errorMessage: unref(errorMessage),
  value: props.modelValue,
  focus,
  blur,
}));


// Expose

defineExpose({
  getErrorMessage,
  getContainer,
  getValue,
  getId,
  getFirstCheckedElement,
  getFirstEnabledElement,
  checkValidity,
  checkFocus,
  focus,
  blur,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaToggle';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/toggle) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/toggle/toggle.vue)
 *
 * @example
 * ```html
 * <ProximaToggle
 *   size="s"
 *   v-model="value"
 * />
 * ```
 *
 * @prop id `string` — Toggle id (default `toggle-[hash]`)
 * @prop modelValue `any` — Checked value (default `''`)
 * @prop options `array` — Options list (default `[]`)
 * @prop label `string` — Label text
 * @prop labelPosition `string` — Label position: `above` / `aside` (default `above`)
 * @prop labelVisuallyHidden `boolean` — allowing label to be exposed only to assistive technologies (default `false`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop required `boolean` — required attribute (default `false`)
 * @prop indeterminate `boolean` — Indeterminate state (default `false`)
 * @prop view `string` — Toggle view: `plain` / `line` (default `plain`)
 * @prop size `string` — Toggle size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Toggle radius: `soft` / `full` / `none` (default `soft`)
 * @prop shadow `string` — Toggle shadow: `soft` / `none` (default `soft`)
 * @prop effect `string` — Click effect: `none` / `ripple` / `pulse` (default `none`)
 * @prop theme `string` — Toggle theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.toggle {
  .toggle {
    display: block;
    box-sizing: border-box;
    user-select: none;
    padding: 0;
    margin: 0;
    border: none;
    border-radius: var(--toggle-border-radius, calc(
      var(--base-toggle-size) / var(--toggle-border-radius-divider, 16)
    ));

    --base-toggle-size: var(--toggle-size, 2.75rem);
    --base-toggle-font-size: var(--toggle-font-size, 1rem);

    --base-toggle-padding-x: var(--toggle-padding-x, calc(
      var(--base-toggle-size) / var(--toggle-padding-x-divider, 2.25)
    ));

    --base-toggle-label-font-size: var(--toggle-label-font-size, 0.875rem);

    /* Colors */

    --base-toggle-label-color:
      var(--toggle-label-color, var(--app-label-color, #6c757d));
  }

  .toggle *,
  .toggle *:before,
  .toggle *:after {
    box-sizing: inherit;
  }

  .toggle__input {
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

  .toggle_has_effect {
    --toggle-has-effect: 1;
    --effect-ripple-size: calc(var(--base-toggle-size) * 4);
    --effect-pulse-size: calc(var(--base-toggle-size) / 6);
  }

  .toggle__effect {
    position: absolute;
    inset: 0;
    z-index: var(--toggle-effect-z-index, 0);

    --effect-pulse-color: var(--base-toggle-accent-color);
  }

  /*
    Header
  */

  .toggle__header {
    display: block;
    width: var(--base-toggle-header-width, auto);
    padding-inline: var(--toggle-header-padding-x, 0);
    margin-block-end: var(--toggle-header-margin-y-end, calc(
      var(--base-toggle-label-font-size) * 0.375
    ));
    border: none;
  }

  .toggle__label {
    font-size: var(--base-toggle-label-font-size);
    letter-spacing: var(--toggle-label-letter-spacing, normal);
    line-height: var(--toggle-label-line-height, 1.2);
    color: var(--base-toggle-label-color);
    cursor: var(--toggle-label-cursor, pointer);
  }

  /*
    Content
  */

  .toggle__content {
    display: inline-flex;
    vertical-align: top;
    border-radius: inherit;
    padding: var(--toggle-content-padding, 0);
    gap: var(--toggle-gap, 0rem);
  }

  .toggle__item {
    position: relative;
  }

  .toggle__item:not(:first-child) {
    margin-inline-start: calc(
      var(--base-toggle-border-width) * var(--toggle-is-view-plain, 0) * -1
    );
  }

  .toggle__item:first-child {
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
  }

  .toggle__item:last-child {
    border-start-end-radius: inherit;
    border-end-end-radius: inherit;
  }

  /*
    Button
  */

  .toggle__button {
    position: relative;
    display: flex;
    align-items: var(--toggle-button-align-items, center);
    justify-content: var(--toggle-button-justify-content, center);
    flex-direction: var(--toggle-button-flex-direction, row);
    gap: var(--toggle-button-gap, 0.375em);
    font-family: var(--toggle-font-family, inherit);
    font-size: var(--base-toggle-font-size);
    font-weight: var(--toggle-font-weight, 400);
    text-transform: var(--toggle-text-transform, none);
    letter-spacing: var(--toggle-letter-spacing, normal);
    width: var(--toggle-button-width, auto);
    height: var(--base-toggle-size);
    color: var(--base-toggle-text-color);
    padding-inline: var(--base-toggle-padding-x);
    padding-block: var(--toggle-padding-y, 0);
    background: var(--base-toggle-background);
    border-style: var(--toggle-border-style, solid);
    border-width: var(--base-toggle-border-width);
    border-color: var(--base-toggle-border-color);
    border-radius: inherit;
    cursor: pointer;
    transition: var(--toggle-transition,
      color 200ms,
      background-color 200ms,
      border-color 200ms
    );

    --base-toggle-inert-background: var(--toggle-background, var(--app-field-background, #fff));
    --base-toggle-background: var(--base-toggle-inert-background);

    --base-toggle-border-color:
      var(--toggle-border-color, var(--app-field-border-color, #cfd4d9));

    --base-toggle-text-color: var(--toggle-text-color, var(--app-field-color, #212529));

    --base-toggle-accent-color:
      var(--toggle-accent-color, var(--app-accent-color, #0071e3));
  }

  .toggle__icon {
    --icon-size: var(--toggle-icon-size, 1em);
  }

  /*
    States
  */

  .toggle__button_indeterminate {
    --toggle-is-indeterminate: 1;

    background: var(--toggle-indeterminate-background, var(--base-toggle-background));

    border-color:
      var(--toggle-indeterminate-border-color, var(--base-toggle-indeterminate-border-color-mix, rgba(207, 212, 217, 0.75)));

    color:
      var(--toggle-indeterminate-text-color, var(--base-toggle-indeterminate-text-color-mix, #8c8e90));
  }

  .toggle__button_checked {
    --toggle-is-checked: 1;

    --base-toggle-background:
      var(--toggle-checked-background, var(--base-toggle-checked-background-mix, var(--base-toggle-inert-background)));

    --base-toggle-border-color:
      var(--toggle-checked-border-color, var(--base-toggle-accent-color));

    --base-toggle-text-color:
      var(--toggle-checked-text-color, var(--base-toggle-accent-color));

    z-index: var(--toggle-checked-z-index, 2);
  }

  .toggle__button_disabled {
    --toggle-is-disabled: 1;

    border-color: var(--toggle-disabled-border-color, var(--base-toggle-border-color));
    background: var(--toggle-disabled-background, var(--base-toggle-background));
    color: var(--toggle-disabled-text-color, var(--base-toggle-text-color));

    opacity: var(--toggle-disabled-opacity, var(--app-disabled-opacity, 0.6));
  }

  .toggle__input:disabled ~ .toggle__button {
    cursor: not-allowed;
  }

  .toggle__input:focus ~ .toggle__button {
    --toggle-is-focus: 1;

    border-color: var(--toggle-focus-border-color, var(--base-toggle-accent-color));

    outline-offset: var(--toggle-highlight-offset, var(--app-highlight-offset, 0.0625rem));
    outline-style: var(--toggle-highlight-style, var(--app-highlight-style, solid));
    outline-width: var(--toggle-highlight-size, var(--app-highlight-size, 0.1875rem));
    outline-color: var(--toggle-highlight-color, var(--app-highlight-color, var(--base-toggle-highlight-color-mix, rgba(0, 0, 0, 0.1))));
    z-index: var(--toggle-focus-z-index, 3);
  }

  .toggle_effect_pulse:hover .toggle__button {
    outline-color: transparent;
  }

  .toggle_multiple .toggle__input:focus-visible ~ .toggle__button {
    z-index: var(--toggle-focus-z-index, 3);
  }

  .toggle:not(.toggle_multiple) .toggle__content:has(:focus-visible),
  .toggle_multiple .toggle__input:focus-visible ~ .toggle__button {
    outline-offset: var(--toggle-outline-offset, var(--app-outline-offset, 0.1875rem));
    outline:
      var(--toggle-outline-size, var(--app-outline-size, 0.25rem))
      var(--toggle-outline-style, var(--app-outline-style, solid))
      var(--toggle-outline-color, var(--app-outline-color, rgba(0, 61, 255, 0.7)));
  }

  @media (hover: hover) {
    .toggle__button_enabled:hover {
      --toggle-is-hover: 1;

      border-color: var(--toggle-hover-border-color, var(--base-toggle-accent-color));
      background: var(--toggle-hover-background, var(--base-toggle-background));
      color: var(--toggle-hover-text-color, var(--base-toggle-accent-color));

      z-index: var(--toggle-hover-z-index, 1);
    }
  }

  /*
    Labels
  */

  .toggle_label_above {
    --toggle-is-label-above: 1;
  }

  .toggle_label_aside {
    --toggle-is-label-aside: 1;

    --base-toggle-header-width: var(--toggle-label-aside-width, calc(
      var(--base-toggle-label-font-size) * var(--toggle-label-aside-width-multiplier, 10)
    ));

    position: relative;
    padding-inline-start: var(--base-toggle-header-width);
  }

  .toggle_label_aside .toggle__header {
    position: absolute;
    inset-block: 0;
    inset-inline: 0 auto;
    display: flex;
    align-items: center;
    margin-block-end: 0;
  }


  /*
    Views
  */

  .toggle_view_plain {
    --toggle-is-view-plain: 1;
    --base-toggle-border-width: var(--toggle-border-width, 1px);
  }

  .toggle_view_line {
    --toggle-is-view-line: 1;

    --base-toggle-border-width: 0 0 var(--toggle-border-width, 1px) 0;
  }

  .toggle_view_line .toggle__button {
    background: var(--toggle-view-line-background, transparent);
  }

  /*
    Round
  */

  .toggle_round_none {
    border-radius: 0;
  }

  .toggle_round_full {
    --toggle-is-full-round: 1;
    border-radius: 100rem;
  }

  /*
    Shadow
  */

  .toggle_shadow_soft {
    --base-toggle-box-shadow-soft-size:
      var(--toggle-box-shadow-soft-size, 0.0625rem 0.0625rem 0.25rem);
    --base-toggle-box-shadow-soft-color:
      var(--toggle-box-shadow-soft-color, rgba(0, 0, 0, var(--app-field-box-shadow-opacity, 0.1)));
  }

  .toggle_shadow_soft:not(.toggle_disabled) .toggle__content {
    box-shadow:
      var(--base-toggle-box-shadow-soft-size)
      var(--base-toggle-box-shadow-soft-color);
  }

  .toggle_shadow_soft.toggle_view_line {
    --base-toggle-box-shadow-soft-size:
      var(--toggle-view-line-box-shadow-soft-size, 0);
  }

  /*
    Sizes
  */

  .toggle_size_xxs {
    --base-toggle-size: var(--toggle-size-xxs, 1.875rem);
    --base-toggle-font-size: var(--toggle-font-size-xxs, 0.75rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-xxs, 0.75rem);
  }

  .toggle_size_xs {
    --base-toggle-size: var(--toggle-size-xs, 2.25rem);
    --base-toggle-font-size: var(--toggle-font-size-xs, 0.875rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-xs, 0.8125rem);
  }

  .toggle_size_s {
    --base-toggle-size: var(--toggle-size-s, 2.5rem);
    --base-toggle-font-size: var(--toggle-font-size-s, 0.875rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-s, 0.875rem);
  }

  .toggle_size_m {
    --base-toggle-size: var(--toggle-size-m, 3rem);
    --base-toggle-font-size: var(--toggle-font-size-m, 1rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-m, 1rem);
  }

  .toggle_size_l {
    --base-toggle-size: var(--toggle-size-l, 3.375rem);
    --base-toggle-font-size: var(--toggle-font-size-l, 1.125rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-l, 1rem);
  }

  .toggle_size_xl {
    --base-toggle-size: var(--toggle-size-xl, 3.75rem);
    --base-toggle-font-size: var(--toggle-font-size-xl, 1.25rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-xl, 1.125rem);
  }

  .toggle_size_xxl {
    --base-toggle-size: var(--toggle-size-xxl, 4.125rem);
    --base-toggle-font-size: var(--toggle-font-size-xxl, 1.375rem);
    --base-toggle-label-font-size: var(--toggle-label-font-size-xxl, 1.25rem);
  }

  /*
    Disabled
  */

  .toggle_disabled .toggle__label {
    cursor: not-allowed;
  }

  /*
    Color mix
  */

  @supports (outline-color: color-mix(in srgb, red, blue)) {
    .toggle__button {
      --base-toggle-highlight-color-mix: color-mix(in srgb,
        var(--base-toggle-accent-color), transparent calc(
          100% - (var(--app-highlight-opacity, 0.2) * 100%)
        )
      );
    }
  }

  @supports (color: color-mix(in srgb, red, blue)) {
    .toggle__button {
      --base-toggle-checked-background-mix: color-mix(in srgb,
        var(--base-toggle-accent-color), transparent calc(
          100% - (var(--toggle-checked-background-opacity, 0.08) * 100%)
        )
      );
      --base-toggle-indeterminate-border-color-mix: color-mix(in srgb,
        var(--base-toggle-border-color), transparent 25%
      );
      --base-toggle-indeterminate-text-color-mix: color-mix(in srgb,
        var(--base-toggle-text-color), #fff 40%
      );
    }
  }
}
</style>

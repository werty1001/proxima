<template>
  <div ref="container" class="field" :class="modifiers" :style="{
    '--field-width-length': width !== 'max' ? width : undefined,
    '--field-actions-length': fieldActions.length - Number(hasArrowButton),
  }">
    <div
      v-if="hasHeader"
      class="field__header"
    >
      <slot name="label" v-bind="slotProps">
        <label
          v-if="label"
          :for="id"
          class="field__label"
          data-ghost-text
        >
          {{ label }}
          <span
            v-if="required && !isValid"
            v-text="'*'"
            aria-hidden="true"
            class="field__label-required"
          />
        </label>
      </slot>
      <slot name="header" v-bind="slotProps" />
    </div>
    <div class="field__content" data-ghost-item>

      <div v-if="hasPrepend" class="field__prepend">
        <slot name="prepend" v-bind="slotProps" />
      </div>

      <slot name="field" v-bind="slotProps">
        <input
          class="field__input field__el"
          type="text"
          :placeholder="placeholder"
          :value="fieldValue"
          v-bind="attributes"
          @input="updateByEvent"
          @focus="onFocus"
          @blur="onBlur"
        >
      </slot>

      <div v-if="hasActions" class="field__actions">
        <a
          v-for="item in fieldActions"
          :key="`field-action-${item.id}`"
          class="field__action"
          :class="{
            [`field__action_${item.id}`]: true,
            field__action_pressed: Boolean(item.pressed)
          }"
          :data-stop-blur="item.shouldPreventBlur ? id : undefined"
          tabindex="-1"
          aria-hidden="true"
          v-html="item.html"
          @click="item.onClick"
        />
      </div>

      <div v-if="hasValidStatus" class="field__status field__status_valid" aria-hidden="true">
        <slot name="status-valid" v-bind="slotProps">
          <svg viewBox="0 0 16 16" width="16" height="16" stroke="currentColor">
            <path d="m2 8 4 4 8-8" />
          </svg>
        </slot>
      </div>

      <div v-if="hasInvalidStatus" class="field__status field__status_invalid" aria-hidden="true">
        <slot name="status-invalid" v-bind="slotProps">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M8 1c1.5 0 2.75 1.5 2.75 3 0 1.333-.383 3.267-1.15 5.8-.223.725-.85 1.2-1.599 1.2S6.6 10.549 6.4 9.8C5.633 7.267 5.25 5.333 5.25 4 5.25 2.5 6.5 1 8 1Z"/>
            <circle cx="8" cy="14" r="1.5" />
          </svg>
        </slot>
      </div>

      <slot name="content" v-bind="slotProps" />
    </div>
    <div v-if="hasFooter" class="field__footer">
      <slot name="footer" v-bind="slotProps" />
    </div>
    <slot v-bind="slotProps" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, unref, onMounted, watch, nextTick, useId } from 'vue';
import useLocale from '@/composables/locale';

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from 'vue';

import type {
  ProximaSize,
  ProximaRound,
  ProximaShadow,
} from '../types.d';

export type ProximaFieldModelModifiers = {
  lazy?: boolean
  trim?: boolean
  number?: boolean
}

export type ProximaFieldModelValue = string | number

export interface ProximaFieldAction {
  id: string
  html: string
  shouldPreventBlur?: boolean
  pressed?: boolean
  onClick: () => void
}

export interface ProximaFieldProps {
  id?: string
  inputAttrs?: InputHTMLAttributes | TextareaHTMLAttributes | SelectHTMLAttributes
  modelModifiers?: ProximaFieldModelModifiers
  modelValue?: ProximaFieldModelValue
  label?: string
  labelPosition?: 'above' | 'inside' | 'aside'
  describedby?: string
  autocomplete?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  autofocus?: boolean
  minlength?: number
  maxlength?: number
  validityStyle?: 'none' | 'valid' | 'invalid' | 'both'
  validityStatus?: 'none' | 'valid' | 'invalid' | 'both'
  formError?: string
  actions?: ProximaFieldAction[]
  actionsVisibility?: 'hover' | 'always'
  hasClearButton?: boolean
  hasArrowButton?: boolean
  width?: string
  validator?: (value: string, props?: ProximaFieldProps) => boolean
  emptyChecker?: (value: string) => boolean
  parseValue?: (value: any, currentValue: string) => string
  errorCreator?: (value: string) => string
  view?: 'plain' | 'line'
  size?: ProximaSize
  round?: ProximaRound
  shadow?: ProximaShadow
  theme?: string
}

const props = withDefaults(defineProps<ProximaFieldProps>(), {
  modelModifiers: () => ({}),
  modelValue: '',
  label: '',
  labelPosition: () => getDefaultProp('labelPosition', 'above') as 'above',
  describedby: '',
  autocomplete: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  autofocus: false,
  minlength: 1,
  maxlength: Infinity,
  validityStyle: () => getDefaultProp('validityStyle', 'invalid') as 'invalid',
  validityStatus: () => getDefaultProp('validityStatus', 'invalid') as 'invalid',
  formError: '',
  actions: () => getDefaultProp('actions', []) as [],
  actionsVisibility: () => getDefaultProp('actionsVisibility', 'hover') as 'hover',
  hasClearButton: false,
  hasArrowButton: false,
  width: 'max',
  parseValue: (value: any) => String(value),
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  round: () => getDefaultProp('round', 'soft') as 'soft',
  shadow: () => getDefaultProp('shadow', 'soft') as 'soft',
  theme: () => getDefaultProp('theme', '') as '',
});

const id = props.id || useId();

const emit = defineEmits<{
  'click:arrow': []
  'update:modelValue': [modelValue: ProximaFieldModelValue]
  'complete': [modelValue: ProximaFieldModelValue]
  'change': [modelValue: ProximaFieldModelValue]
  'clear': [clearedValue: string]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>();

const slots = useSlots();
const { getLocaleToken } = useLocale();

const fieldValue = ref('');
const setValue = (value = '') =>
  (fieldValue.value = String(value).substring(0, props.maxlength));

const isFocused = ref(false);
const setFocus = (flag: boolean) => (isFocused.value = flag);

const hasLabel = computed(() => Boolean(props.label || slots.label));
const hasHeader = computed(() => Boolean(unref(hasLabel) || slots.header));
const hasFooter = computed(() => Boolean(slots.footer));
const hasPrepend = computed(() => Boolean(slots.prepend));
const hasActions = computed(() => unref(fieldActions).length > 0);

const hasValidStyle = computed(() =>
  !unref(isEmpty) && !props.disabled && ['valid', 'both'].includes(props.validityStyle));

const hasInvalidStyle = computed(() =>
  !unref(isEmpty) && !props.disabled && ['invalid', 'both'].includes(props.validityStyle));


// Validity

const isCorrectLength = computed(() => {
  const length = unref(fieldValue).length;
  return length >= props.minlength && length <= props.maxlength;
});

const isEmpty = computed(() => {
  const value = unref(fieldValue);
  if (typeof props.emptyChecker === 'function') {
    return props.emptyChecker(value);
  }
  return value === '';
});

const isValid = computed(() => {
  if (props.formError) return false;
  const value = unref(fieldValue);
  if (props.disabled || (!props.required && unref(isEmpty))) return true;
  if (typeof props.validator === 'function') {
    return unref(isCorrectLength) && props.validator(value, props);
  }
  return unref(isCorrectLength);
});

const errorMessage = computed(() => {
  if (unref(isValid)) return '';
  if (unref(isEmpty)) {
    return getLocaleToken('fieldRequired');
  }
  if (typeof props.errorCreator === 'function') {
    return props.errorCreator(unref(fieldValue));
  }
  if (!unref(isCorrectLength)) {
    return getLocaleToken('fieldBadLength', {
      minlength: props.minlength,
      count: unref(fieldValue).length,
    });
  }
  return getLocaleToken('fieldInvalid');
});


// Actions

const fieldActions = computed(() => {
  const actions = [];
  if (props.hasClearButton) {
    actions.push({
      id: 'clear',
      html: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M13 13 3 3m10 0L3 13" fill="none" stroke-width="1.75" stroke="currentColor" /></svg>`,
      shouldPreventBlur: true,
      onClick: clear,
    });
  }
  actions.push(...props.actions);
  if (props.hasArrowButton) {
    actions.push({
      id: 'arrow',
      html: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m2 5 6 6 6-6" fill="none" stroke-width="1.75" stroke="currentColor" /></svg>',
      onClick: () => emit('click:arrow'),
    });
  }
  return actions;
});


// Status

const hasValidityStatus = computed(() =>
  props.validityStatus !== 'none' && !unref(isEmpty) && !props.disabled);

const hasValidStatus = computed(() =>
  unref(isValid) && unref(hasValidityStatus) && ['valid', 'both'].includes(props.validityStatus));

const hasInvalidStatus = computed(() =>
  !unref(isValid) && unref(hasValidityStatus) && ['invalid', 'both'].includes(props.validityStatus));


// Modifiers

const modifiers = computed(() => ({
  field_focused: unref(isFocused),
  field_has_label: unref(hasLabel),
  field_has_prepend: unref(hasPrepend),
  field_has_value: Boolean(unref(fieldValue)),
  field_has_arrow: props.hasArrowButton,
  field_has_status: props.validityStatus !== 'none',
  field_has_actions: unref(hasActions),
  [`field_actions_${props.actionsVisibility}`]: Boolean(props.actionsVisibility),
  field_invalid: unref(hasInvalidStyle) && !unref(isValid),
  field_valid: unref(hasValidStyle) && unref(isValid),
  field_required: props.required,
  field_readonly: props.readonly,
  field_disabled: props.disabled,
  field_enabled: !(props.disabled || props.readonly),
  [`field_label_${props.labelPosition}`]: Boolean(unref(hasLabel) && props.labelPosition),
  [`field_view_${props.view}`]: Boolean(props.view),
  [`field_size_${props.size}`]: Boolean(props.size),
  [`field_theme_${props.theme}`]: Boolean(props.theme),
  [`field_round_${props.round}`]: Boolean(props.round),
  [`field_shadow_${props.shadow}`]: Boolean(props.shadow),
}));

const attributes = computed(() => ({
  name: props.autocomplete !== 'off' ? props.autocomplete : undefined,
  ...props.inputAttrs,
  id: unref(id) || undefined,
  readonly: props.readonly,
  disabled: props.disabled,
  required: props.required,
  autofocus: props.autofocus,
  autocomplete: props.autocomplete || undefined,
  minlength: props.minlength,
  maxlength: props.maxlength === Infinity ? undefined : props.maxlength,
  'aria-invalid': unref(isEmpty) || props.disabled ? undefined : !unref(isValid),
  'aria-describedby': props.describedby || undefined,
}));


// Methods

const container = ref<HTMLElement | null>(null);
const el = ref<HTMLInputElement | null>(null);

const getErrorMessage = () => unref(errorMessage);
const getContainer = () => unref(container);
const getElement = () => unref(el);
const getLengthRange = () => [props.minlength, props.maxlength];
const getValue = () => unref(fieldValue);
const getId = () => unref(id);

const checkEmpty = () => unref(isEmpty);
const checkFocus = () => unref(isFocused);
const checkLength = () => unref(isCorrectLength);
const checkValidity = () => unref(isValid);

const select = () => unref(el)?.select?.();
const focus = () => unref(el)?.focus?.();
const blur = () => unref(el)?.blur?.();

const setElement = () => nextTick(() => {
  el.value = document.getElementById(getId()) as HTMLInputElement;
});

onMounted(setElement);


// Emits

const getModifiedValue = () => {
  let value: string | number = unref(fieldValue);
  if (props.modelModifiers.trim) {
    value = value.trim();
  }
  if (props.modelModifiers.number) {
    const number = parseFloat(value);
    value = isNaN(number) ? value : number;
  }
  return value;
};

const emitUpdate = () => emit('update:modelValue', getModifiedValue());
const emitChange = () => emit('change', getModifiedValue());
const emitComplete = () => unref(isValid) && !unref(isEmpty)
  ? emit('complete', getModifiedValue())
  : undefined;


// Clear

const clear = () => {
  const value = unref(fieldValue);
  setValue('');
  focus();
  if (!props.modelModifiers.lazy) {
    emitUpdate();
  }
  emit('clear', value);
};

const updateByEvent = (event: Event) => {
  const target = (event.target as HTMLInputElement);
  setValue(target.value);
  if (!props.modelModifiers.lazy) {
    emitUpdate();
  }
  emitComplete();
};

const checkBlurInterrupt = (event: FocusEvent) => {
  const target = event.target as HTMLElement;
  const related = event.relatedTarget as HTMLElement;
  if (!target || !related) return false;
  return target.id === related.getAttribute('data-stop-blur');
};

const onBlur = (event: FocusEvent) => {
  if (checkBlurInterrupt(event)) return;
  const isValueUpdated = props.modelValue !== unref(fieldValue);
  if (isValueUpdated && props.modelModifiers.lazy) {
    emitUpdate();
  }
  if (isValueUpdated) {
    emitChange();
  }
  setFocus(false);
  emit('blur', event);
};

const onFocus = (event: FocusEvent) => {
  setFocus(true);
  emit('focus', event);
};


// Watch value

watch(() => props.modelValue, (val: any) => {
  const currentValue = unref(fieldValue);
  const modelValue = String(val);
  if (modelValue !== currentValue) {
    const value = props.parseValue(modelValue, currentValue);
    setValue(value);
    if (value !== val) {
      emitUpdate();
      emitComplete();
    }
  }
}, { immediate: true });


// Slot props

const slotProps = computed(() => ({
  id: unref(id),
  label: props.label,
  placeholder: props.placeholder,
  fieldValue: unref(fieldValue),
  fieldAttrs: unref(attributes),
  isFocused: unref(isFocused),
  isCorrectLength: unref(isCorrectLength),
  isEmpty: unref(isEmpty),
  isValid: unref(isValid),
  hasLabel: unref(hasLabel),
  hasHeader: unref(hasHeader),
  hasFooter: unref(hasFooter),
  hasPrepend: unref(hasPrepend),
  hasActions: unref(hasActions),
  hasValidStyle: unref(hasValidStyle),
  hasInvalidStyle: unref(hasInvalidStyle),
  hasValidStatus: unref(hasValidStatus),
  hasInvalidStatus: unref(hasInvalidStatus),
  updateByEvent,
  onBlur,
  onFocus,
  select,
  clear,
  focus,
  blur,
}));


// Expose

defineExpose({
  getErrorMessage,
  getContainer,
  getElement,
  getLengthRange,
  getValue,
  getId,
  checkEmpty,
  checkFocus,
  checkLength,
  checkValidity,
  select,
  clear,
  focus,
  blur,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaField';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/field.vue)
 *
 * @example
 * ```html
 * <ProximaField
 *   label="Username"
 *   width="10"
 *   v-model="value"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaField from 'proxima-vue/field';
 *
 * const value = ref('');
 * ```
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
 * @prop hasArrowButton `boolean` — Adds arrow button (default `false`)
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

<style>
@layer proxima.field {
  .field {
    display: block;
    box-sizing: border-box;
    border-radius: var(--field-border-radius, calc(
      var(--base-field-size) / var(--field-border-radius-divider, 16)
    ));

    --base-field-size: var(--field-size, 2.75rem);
    --base-field-font-size: var(--field-font-size, 1rem);
    --base-field-label-font-size: var(--field-label-font-size, 0.875rem);

    /* Prepend */

    --base-field-prepend-font-size: var(--field-prepend-font-size, calc(
      var(--base-field-font-size) * 1.25
    ));
    --base-field-prepend-width: var(--field-prepend-width, var(--base-field-size));
    --base-field-prepend-height: var(--field-prepend-height, 100%);

    /* Padding */

    --base-field-padding-x: calc(
      (var(--base-field-size) * 0.25) + (0.375rem * var(--field-is-full-round, 0))
    );

    --base-field-start-padding: calc(
      var(--base-field-prepend-width) * var(--field-has-prepend, 0)
    );

    --base-field-end-padding: calc(
      (var(--base-field-action-size) * var(--field-actions-length, 0)) +
      (var(--base-field-arrow-width) * var(--field-has-arrow, 0))
    );

    --base-field-padding-x-start: max(
      var(--field-padding-x-start, var(--base-field-padding-x)),
      var(--base-field-start-padding, 0rem)
    );

    --base-field-padding-x-end: max(
      var(--field-padding-x-end, var(--base-field-padding-x)),
      var(--base-field-end-padding, 0rem)
    );

    /* Background */

    --base-field-empty-background:
      var(--field-background, var(--app-field-background, #fff));

    --base-field-inert-background: var(--base-field-empty-background);

    --base-field-background: var(--base-field-inert-background);

    /* Border */

    --base-field-border-width: var(--field-border-width, 1px);

    --base-field-inert-border-color:
      var(--field-border-color, var(--app-field-border-color, #cfd4d9));

    --base-field-border-color: var(--base-field-inert-border-color);

    /* Placeholder */

    --base-field-inert-placeholder-color: var(--field-placeholder-color, #6c757d);

    --base-field-placeholder-color: var(--base-field-inert-placeholder-color);
    --base-field-mask-color: var(--field-mask-color, var(--base-field-placeholder-color));

    /* Colors */

    --base-field-color: var(--field-color, var(--app-field-color, #212529));
    --base-field-autofill-color: var(--field-autofill-color, #e8f0fe);

    --base-field-accent-color:
      var(--field-accent-color, var(--app-accent-color, #0071e3));

    --base-field-invalid-color:
      var(--field-invalid-color, var(--app-invalid-color, #dc3545));

    --base-field-valid-color:
      var(--field-valid-color, var(--app-valid-color, #03a10e));

    /* Status */

    --base-field-status-size: var(--field-status-size, var(--base-field-font-size));

    /* Action */

    --base-field-action-size: var(--field-action-size, var(--base-field-size));
    --base-field-action-icon-size: var(--field-action-icon-size, 0.875rem);
    --base-field-arrow-width: calc(var(--base-field-action-size) / 4 * 2.5);

    --base-field-view-line-actions-offset: calc(
      (var(--base-field-action-size) - var(--base-field-action-icon-size)) / 2.5
    );

    /* Width */

    --base-field-max-width: var(--field-max-width, calc(
      var(--base-field-padding-x-start) +
      var(--base-field-padding-x-end) + (
        var(--field-width-length) *
        var(--field-width-length-multiplier, calc(var(--base-field-font-size) * 0.61))
      )
    ));
  }

  [dir="rtl"] .field {
    --field-direction: -1;
  }

  .field *,
  .field *:before,
  .field *:after {
    box-sizing: inherit;
  }

  .field_has_prepend {
    --field-has-prepend: 1;
  }

  .field_has_actions {
    --field-has-actions: 1;
  }

  .field_has_label {
    --field-has-label: 1;
  }

  .field_has_value {
    --field-has-value: 1;
  }

  .field_has_status {
    --field-has-status: 1;
  }

  .field_has_arrow {
    --field-has-arrow: 1;
  }

  .field_enabled {
    --field-is-enabled: 1;
  }

  .field_label_above {
    --field-is-label-above: 1;
  }

  .field_actions_hover {
    --field-is-actions-hover: 1;
  }

  .field_actions_always {
    --field-is-actions-always: 1;
  }

  /*
    Header
  */

  .field__header {
    margin-block-end: var(--field-header-margin-y-end, calc(
      var(--base-field-label-font-size) * 0.375
    ));
  }

  /*
    Label
  */

  .field__label {
    font-size: var(--base-field-label-font-size);
    letter-spacing: var(--field-label-letter-spacing, normal);
    line-height: var(--field-label-line-height, 1.2);
    color: var(--field-label-color, var(--app-label-color, #6c757d));
    cursor: pointer;
  }

  .field__label-required {
    display: var(--field-label-required-display, inline);
    color: var(--field-label-required-color, inherit);
  }

  /*
    Content
  */

  .field__content {
    position: relative;
    width: var(--base-field-max-width);
    height: var(--base-field-size);
    border-radius: inherit;
    transition: var(--field-transition, background-color 200ms, border-color 200ms);

    --field-is-hover-or-focus: max(
      var(--field-is-focus, 0),
      var(--field-is-hover, 0)
    );
  }

  /*
    Prepend
  */

  .field__prepend {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--base-field-prepend-font-size);
    background: var(--field-prepend-background, none);
    color: var(--field-prepend-color, var(--base-field-color));
    width: var(--base-field-prepend-width);
    height: var(--base-field-prepend-height);
    padding-inline: var(--field-prepend-padding-x, 0);
    padding-block: var(--field-prepend-padding-y, 0);
    border-style: var(--field-prepend-border-style, var(--field-border-style, solid));
    border-width: var(--field-prepend-border-width, 0);
    border-color: var(--field-prepend-border-color, var(--base-field-border-color));
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
    pointer-events: var(--field-prepend-pointer-events, none);
    z-index: var(--field-prepend-z-index, 2);
    transition: inherit;
  }

  /*
    Footer
  */

  .field__footer {
    max-width: var(--field-footer-max-width, none);
    margin-block-start: var(--field-footer-margin-y-start, 0.5rem);
  }

  /*
    Element
  */

  .field__input {
    font-size: var(--base-field-font-size);
    font-family: var(--field-font-family, inherit);
    font-weight: var(--field-font-weight, 400);
    font-style: var(--field-font-style, normal);
    text-transform: var(--field-text-transform, none);
    text-align: var(--field-text-align, start);
    line-height: var(--field-line-height, normal);
    color: var(--base-field-color);
    caret-color: var(--field-caret-color, auto);
    appearance: none;
    outline: none;
    opacity: 1;
  }

  .field:not(.field_focused) .field__content:not(:hover) .field__input:not([type="password"]) {
    text-overflow: var(--field-text-overflow, ellipsis);
  }

  .field__input::placeholder {
    font-family: var(--field-placeholder-font-family, inherit);
    font-size: var(--field-placeholder-font-size, inherit);
    font-weight: var(--field-placeholder-font-weight, inherit);
    font-style: var(--field-placeholder-font-style, normal);
    line-height: var(--field-placeholder-line-height, normal);
    opacity: var(--field-placeholder-opacity, 1);
    color: var(--base-field-placeholder-color);
  }

  .field__input:placeholder-shown {
    text-overflow: ellipsis;
  }

  .field__input::-webkit-strong-password-auto-fill-button {
    font-size: 0.75em;
  }

  .field__input::-webkit-contacts-auto-fill-button {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 100%;
    margin-inline-start: 0.5rem;
    transform: translate(0, -50%);
    cursor: pointer;
    z-index: 6;
  }

  .field__input[list]::-webkit-calendar-picker-indicator {
    opacity: 0;
    pointer-events: none;
  }

  .field__input[list]::-webkit-list-button {
    opacity: 0;
    pointer-events: none;
  }

  .field__input:-webkit-autofill {
    box-shadow:
      inset 0 0 0 var(--base-field-size) var(--base-field-autofill-color) !important;
  }

  .field__input:autofill {
    box-shadow:
      inset 0 0 0 var(--base-field-size) var(--base-field-autofill-color) !important;
  }

  .field__input:-webkit-autofill ~ .field__status,
  .field__input:autofill ~ .field__status {
    --base-field-background: var(--base-field-autofill-color);
  }

  .field__el {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    padding-block: var(--field-padding-y, 0);
    padding-inline-start: var(--base-field-padding-x-start);
    padding-inline-end: var(--base-field-padding-x-end);
    background: var(--base-field-background);
    border-style: var(--field-border-style, solid);
    border-width: var(--base-field-border-width);
    border-color: var(--base-field-border-color);
    border-radius: inherit;
    transition: inherit;
  }

  .field__el_masked {
    position: relative;
    background: none;
    z-index: 1;
  }

  .field__mask {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    border-color: transparent;
    pointer-events: none;
    user-select: none;
    color: var(--base-field-mask-color);
    -webkit-text-fill-color: var(--base-field-mask-color);
  }

  .field__visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    border: 0;
    padding: 0;
    white-space: nowrap;
    clip-path: inset(100%);
    clip: rect(0 0 0 0);
    overflow: hidden;
  }

  /*
    Status
  */

  .field__status {
    --base-field-status-opacity:
      var(--field-status-opacity, calc(1 - var(--field-is-hover-or-focus)));

    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset-block: 0;
    inset-inline-end: max(
      (var(--base-field-padding-x-end) - var(--base-field-action-size) / 2.5) * var(--field-is-actions-always, 0) * var(--field-has-actions, 0),
      var(--base-field-arrow-width) * var(--field-has-arrow, 0)
    );
    width: var(--base-field-action-size);
    height: var(--base-field-action-size);
    pointer-events: none;
    border-radius: inherit;
    overflow: hidden;
    margin-inline-end: calc(
      var(--base-field-view-line-actions-offset) *
      var(--field-is-view-line, 0) *
      (var(--field-has-arrow, 0) - 1)
    );
    z-index: var(--field-status-z-index, 3);
  }

  .field__status:before {
    content: "";
    display: var(--field-status-background-display, block);
    position: absolute;
    inset: var(--base-field-border-width);
    inset-inline-start: -0.5rem;
    background: var(--field-status-background, linear-gradient(
      calc(90deg * var(--field-direction, 1)), transparent, var(--base-field-background) 50%
    ));
    opacity: var(--base-field-status-opacity);
    border-radius: inherit;
    z-index: -1;
  }

  .field__status svg {
    display: block;
    width: var(--base-field-status-size);
    height: var(--base-field-status-size);
    opacity: var(--base-field-status-opacity);
    transform: var(--field-status-transform, translate3d(
      0, calc(var(--field-is-hover-or-focus) * -25%), 0
    ));
    transition: var(--field-status-transition,
      opacity 250ms ease-out,
      transform 250ms cubic-bezier(0, 0.55, 0.45, 1)
    );
  }

  .field__status [stroke] {
    fill: none;
    stroke-width: var(--field-status-icon-stroke-width, 2);
    stroke-linecap: var(--field-status-icon-stroke-linecap, round);
    stroke-linejoin: var(--field-status-icon-stroke-linejoin, round);
  }

  .field__status_invalid {
    color: var(--field-status-invalid-color, var(--base-field-invalid-color));
  }

  .field__status_valid {
    color: var(--field-status-valid-color, var(--base-field-valid-color));
  }

  /*
    Actions
  */

  .field__actions {
    display: flex;
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    pointer-events: none;
    border-radius: inherit;
    visibility: hidden;
    overflow: hidden;
    z-index: var(--field-actions-z-index, 2);
  }

  .field_enabled .field__actions {
    visibility: visible;
  }

  .field__action {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--base-field-action-size);
    height: var(--base-field-action-size);
    padding: var(--field-action-padding, 0);
    color: var(--field-action-color, #787a7d);
    text-decoration: none;
    pointer-events: auto;
    cursor: pointer;
    border-radius: inherit;
    transition: var(--field-action-transition, color 200ms, opacity 300ms);
  }

  .field__action_pressed {
    color: var(--field-action-pressed-color, var(--base-field-accent-color));
  }

  .field__action:not(:first-child):not(.field__action_arrow):after {
    content: "";
    display: var(--field-action-sep-display, block);
    position: absolute;
    inset-inline-start: 0;
    inset-block: 30%;
    border-inline-start:
      var(--field-action-sep-style, dotted)
      var(--field-action-sep-width, 1px)
      var(--field-action-sep-color, rgba(107, 107, 107, 0.5));
  }

  .field__action svg {
    display: block;
    width: var(--base-field-action-icon-size);
    height: var(--base-field-action-icon-size);
    pointer-events: none;
  }

  .field__action [stroke-width] {
    stroke-width: var(--field-action-icon-stroke-width, revert-layer);
    stroke-linecap: var(--field-action-icon-stroke-linecap, round);
    stroke-linejoin: var(--field-action-icon-stroke-linejoin, round);
  }

  .field__action_arrow {
    width: var(--base-field-arrow-width);
    justify-content: flex-start;
    pointer-events: var(--field-arrow-pointer-events, none);
  }

  .field__action_arrow svg {
    transform: rotateX(calc(180deg * var(--field-is-arrow-flipped, 0)));
    transition: var(--field-arrow-transition,
      transform 200ms cubic-bezier(.455, .03, .515, .955)
    );
  }

  .field_actions_hover .field__action:not(.field__action_arrow) {
    transform: translate3d(0, calc(100% * (1 - var(--field-is-hover-or-focus))), 0);
    opacity: var(--field-is-hover-or-focus);
  }

  .field__action:last-child:not(.field__action_arrow) {
    margin-inline-end: calc(
      var(--base-field-view-line-actions-offset) * var(--field-is-view-line, 0) * -1
    );
  }

  .field_enabled:not(.field_has_value) .field__action_clear {
    display: none;
  }

  /*
    Views
  */

  .field_view_plain {
    --field-is-view-plain: 1;
  }

  .field_view_line {
    --field-is-view-line: 1;
    --base-field-padding-x: var(--field-view-line-padding-x, 0rem);
    --base-field-background: var(--field-view-line-background, transparent);
    --base-field-arrow-width: var(--base-field-action-icon-size);
    border-radius: var(--field-view-line-border-radius, 0);
  }

  .field_view_line .field__el,
  .field_view_line .field__prepend {
    border-width: 0 0 var(--base-field-border-width) 0;
  }

  /*
    Label aside
  */

  .field_label_aside {
    --field-is-label-aside: 1;

    --base-field-label-aside-header-max-width: var(--field-label-aside-header-max-width,
      calc(var(--base-field-label-font-size) * var(--field-label-aside-width-multiplier, 10))
    );

    display: flex;
    flex-wrap: wrap;
  }

  .field_label_aside .field__header {
    display: flex;
    align-items: center;
    justify-content: var(--field-label-aside-header-justify-content, flex-start);
    flex-grow: 1;
    flex-basis: 0;
    max-width: var(--base-field-label-aside-header-max-width);
    padding-inline-end: var(--field-label-aside-header-padding-x-end, 1rem);
    margin-block-end: 0;
  }

  .field_label_aside .field__content {
    flex-grow: 1;
    flex-basis: 0;
    max-width: min(
      var(--base-field-max-width, 100%),
      100% - var(--base-field-label-aside-header-max-width, 0)
    );
  }

  .field_label_aside .field__footer {
    padding-inline-start: var(--base-field-label-aside-header-max-width);
  }

  /*
    Label inside
  */

  .field_label_inside {
    --field-is-label-inside: 1;

    position: relative;
  }

  .field_label_inside .field__header {
    position: absolute;
    display: flex;
    align-items: center;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: 100%;
    height: var(--base-field-size);
    font-size: var(--base-field-font-size);
    padding-inline-start: var(--base-field-padding-x-start);
    padding-block-end: calc(
      (var(--base-field-border-width) + 0.25rem) * var(--field-is-view-line, 0)
    );
    border-inline-start: solid transparent calc(
      var(--base-field-border-width) * var(--field-is-view-plain, 0)
    );
    border-radius: inherit;
    user-select: none;
    pointer-events: none;
    margin-block-end: 0;
    z-index: var(--field-label-inside-header-z-index, 5);
  }

  .field_label_inside .field__label {
    font-size: 1em;
    white-space: nowrap;
    text-overflow: ellipsis;
    transform-origin: top left;
    overflow: hidden;
    transition: var(--field-label-inside-label-transition, transform 200ms);
  }

  [dir="rtl"] .field_label_inside .field__label {
    transform-origin: top right;
  }

  .field_label_inside.field_focused .field__label,
  .field_label_inside.field_has_value .field__label {
    transform: var(--field-label-inside-label-transform,
      scale(.8) translateY(calc((33% + (var(--base-field-size) / 10)) * -1))
    );
  }

  .field_label_inside .field__el {
    padding-block-start: var(--field-label-inside-padding-y-start, calc(
      var(--base-field-size) / 3.5
    ));
  }

  .field_label_inside:not(.field_focused):not(.field_has_value) {
    --base-field-placeholder-color: transparent;
    --base-field-mask-color: transparent;
  }

  /*
    Round
  */

  .field_round_none {
    border-radius: 0;
  }

  .field_round_full {
    --field-is-full-round: 1;
    border-radius: 100rem;
  }

  /*
    Shadow
  */

  .field_shadow_soft {
    --base-field-box-shadow-soft-size:
      var(--field-box-shadow-soft-size, 0.0625rem 0.0625rem 0.25rem);
    --base-field-box-shadow-soft-color:
      var(--field-box-shadow-soft-color, rgba(0, 0, 0, var(--app-field-box-shadow-opacity, 0.1)));
  }

  .field_shadow_soft:not(.field_disabled) .field__el:not(.field__el_masked) {
    box-shadow:
      var(--base-field-box-shadow-soft-size)
      var(--base-field-box-shadow-soft-color);
  }

  .field_shadow_soft.field_view_line {
    --base-field-box-shadow-soft-size:
      var(--field-view-line-box-shadow-soft-size, 0);
  }

  .field_focused.field_shadow_soft {
    --base-field-box-shadow-soft-color: transparent;
  }

  /*
    Sizes
  */

  .field_size_xxs {
    --base-field-size: var(--field-size-xxs, 1.875rem);
    --base-field-font-size: var(--field-font-size-xxs, 0.8125rem);
    --base-field-label-font-size: var(--field-label-font-size-xxs, 0.75rem);
    --base-field-action-icon-size: var(--field-action-icon-size-xxs, 0.75rem);
  }

  .field_size_xs {
    --base-field-size: var(--field-size-xs, 2.25rem);
    --base-field-font-size: var(--field-font-size-xs, 0.875rem);
    --base-field-label-font-size: var(--field-label-font-size-xs, 0.8125rem);
    --base-field-action-icon-size: var(--field-action-icon-size-xs, 0.75rem);
  }

  .field_size_s {
    --base-field-size: var(--field-size-s, 2.5rem);
    --base-field-font-size: var(--field-font-size-s, 1rem);
    --base-field-label-font-size: var(--field-label-font-size-s, 0.875rem);
    --base-field-action-icon-size: var(--field-action-icon-size-s, 0.875rem);
  }

  .field_size_m {
    --base-field-size: var(--field-size-m, 3rem);
    --base-field-font-size: var(--field-font-size-m, 1rem);
    --base-field-label-font-size: var(--field-label-font-size-m, 0.875rem);
    --base-field-action-icon-size: var(--field-action-icon-size-m, 0.875rem);
  }

  .field_size_l {
    --base-field-size: var(--field-size-l, 3.375rem);
    --base-field-font-size: var(--field-font-size-l, 1.125rem);
    --base-field-label-font-size: var(--field-label-font-size-l, 1rem);
    --base-field-action-icon-size: var(--field-action-icon-size-l, 1rem);
  }

  .field_size_xl {
    --base-field-size: var(--field-size-xl, 3.75rem);
    --base-field-font-size: var(--field-font-size-xl, 1.25rem);
    --base-field-label-font-size: var(--field-label-font-size-xl, 1.125rem);
    --base-field-action-icon-size: var(--field-action-icon-size-xl, 1.125rem);
  }

  .field_size_xxl {
    --base-field-size: var(--field-size-xxl, 4.125rem);
    --base-field-font-size: var(--field-font-size-xxl, 1.375rem);
    --base-field-label-font-size: var(--field-label-font-size-xxl, 1.25rem);
    --base-field-action-icon-size: var(--field-action-icon-size-xxl, 1.125rem);
  }

  /*
    Invalid
  */

  .field_invalid {
    --field-is-invalid: 1;

    --base-field-inert-background:
      var(--field-invalid-background, var(--base-field-empty-background));

    --base-field-inert-border-color:
      var(--field-invalid-border-color, var(--base-field-invalid-color));
  }

  .field_invalid:not(.field_focused) {
    --base-field-mask-color: var(--field-invalid-mask-color, var(--base-field-invalid-mask-color-mix, #e9868f));
  }

  /*
    Valid
  */

  .field_valid {
    --field-is-valid: 1;

    --base-field-inert-background:
      var(--field-valid-background, var(--base-field-empty-background));

    --base-field-inert-border-color:
      var(--field-valid-border-color, var(--base-field-valid-color));
  }

  /*
    Focus
  */

  .field_focused {
    --field-is-focus: 1;

    --base-field-placeholder-color:
      var(--field-focus-placeholder-color, var(--base-field-focus-placeholder-color-mix, var(--base-field-inert-placeholder-color)));

    --base-field-background:
      var(--field-focus-background, var(--base-field-inert-background));

    --base-field-border-color:
      var(--field-focus-border-color, var(--base-field-accent-color));
  }

  .field_focused .field__el {
    outline-offset: var(--field-highlight-offset, var(--app-highlight-offset, 0.0625rem));
    outline-style: var(--field-highlight-style, var(--app-highlight-style, solid));
    outline-width: var(--field-highlight-size, var(--app-highlight-size, 0.25rem));
    outline-color: var(--field-highlight-color, var(--app-highlight-color, var(--base-field-highlight-color-mix, rgba(0, 113, 227, var(--app-highlight-opacity, 0.2)))));
  }

  .field_focused.field_view_line .field__el {
    outline-offset: var(--field-view-line-highlight-offset, 0.25rem);
  }

  /*
    Hover
  */

  @media (hover: hover) {
    .field_enabled .field__content:hover {
      --field-is-hover: 1;
    }

    .field_enabled:not(.field_focused) .field__content:hover {
      --base-field-background:
        var(--field-hover-background, var(--base-field-inert-background));

      --base-field-border-color:
        var(--field-hover-border-color, var(--base-field-accent-color));
    }

    .field__action:hover {
      color: var(--field-action-hover-color, var(--base-field-color));
    }
  }

  /*
    Disabled
  */

  .field_disabled {
    --field-is-disabled: 1;

    opacity: var(--field-disabled-opacity, var(--app-disabled-opacity, 0.6));
  }

  .field_disabled .field__el,
  .field_disabled .field__label {
    cursor: not-allowed;
  }

  /*
    Color mix
  */

  @supports (outline-color: color-mix(in srgb, red, blue)) {
    .field {
      --base-field-highlight-color-mix: color-mix(in srgb,
        var(--base-field-accent-color), transparent calc(
          100% - (var(--app-highlight-opacity, 0.2) * 100%)
        )
      );
    }
  }

  @supports (color: color-mix(in srgb, red, blue)) {
    .field {
      --base-field-focus-placeholder-color-mix: color-mix(in srgb,
        var(--base-field-inert-placeholder-color), transparent 40%
      );
      --base-field-invalid-mask-color-mix: color-mix(
        in srgb, var(--base-field-invalid-color), #fff 50%
      );
    }
  }
}
</style>

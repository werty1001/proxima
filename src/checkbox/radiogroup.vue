<template>
  <fieldset ref="container" class="radiogroup" :class="modifiers">
    <slot name="group-prepend" v-bind="slotProps" />
    <legend
      v-if="hasHeader"
      class="radiogroup__header"
      :class="{ 'visually-hidden': labelVisuallyHidden }"
    >
      <slot name="group-label" v-bind="slotProps">
        <span
          v-if="label"
          class="radiogroup__label"
          data-ghost-text
          v-text="label"
          @click="focus"
        />
      </slot>
      <slot name="group-header" v-bind="slotProps" />
    </legend>
    <div class="radiogroup__content">
      <ProximaCheckbox
        v-for="(item, i) in optionsList"
        :key="`${id}-item-${i}`"
        :id="`${id}-item-${i}`"
        :input-attrs="{
          ...item.inputAttrs,
          name: isMultiple ? undefined : id,
        }"
        :type="isMultiple ? 'checkbox' : 'radio'"
        :label="item.label"
        :label-visually-hidden="item.labelVisuallyHidden"
        :describedby="item.describedby"
        :true-value="item.value"
        :model-value="modelValue"
        :required="required"
        :indeterminate="isMultiple ? undefined : indeterminate"
        :disabled="item.disabled || disabled"
        :view="view"
        :size="size"
        :shadow="shadow"
        :effect="effect"
        :theme="item.theme || theme"
        class="radiogroup__item"
        @update:modelValue="onChange(item)"
        @focus="onFocus"
        @blur="onBlur"
      >
        <template v-for="(_, name) in $slots" #[name]="itemSlotProps">
          <slot
            :name="name"
            :option="item"
            :optionProps="itemSlotProps"
            v-bind="slotProps"
          />
        </template>
      </ProximaCheckbox>
      <slot name="group-content" v-bind="slotProps" />
    </div>
    <slot name="group-append" v-bind="slotProps" />
  </fieldset>
</template>

<script setup lang="ts">
import { ref, unref, toRaw, computed, useSlots } from 'vue';
import getRandomId from '@/utils/randomId';
import useLocale from '@/composables/locale';
import ProximaCheckbox from '@/checkbox/checkbox.vue';

import type {
  ProximaSize,
  ProximaShadow,
  ProximaClickEffect,
  ProximaDynamicAttrs,
} from '../types.d';

export interface ProximaRadioOption {
  value: any
  label?: string
  labelVisuallyHidden?: boolean
  inputAttrs?: ProximaDynamicAttrs
  describedby?: string
  disabled?: boolean
  theme?: string
}

export interface ProximaRadioGroupProps {
  id?: string
  modelValue?: any
  options?: ProximaRadioOption[] | string[] | number[]
  label?: string
  labelPosition?: 'above' | 'aside'
  labelVisuallyHidden?: boolean
  disabled?: boolean
  required?: boolean
  indeterminate?: boolean
  view?: 'plain' | 'outline' | 'line'
  size?: ProximaSize
  shadow?: ProximaShadow
  effect?: ProximaClickEffect
  theme?: string
}

const props = withDefaults(defineProps<ProximaRadioGroupProps>(), {
  id: () => getRandomId('radiogroup'),
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
  shadow: () => getDefaultProp('shadow', 'none') as 'none',
  effect: () => getDefaultProp('effect', 'none') as 'none',
  theme: () => getDefaultProp('theme', '') as '',
});

const emit = defineEmits<{
  'update:modelValue': [modelValue: ProximaRadioGroupProps['modelValue']]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>();

const slots = useSlots();
const { getLocaleToken } = useLocale();

const hasLabel = computed(() => Boolean(props.label || slots['group-label']));
const hasHeader = computed(() => Boolean(unref(hasLabel) || slots['group-header']));
const isMultiple = computed(() => Array.isArray(props.modelValue));

const modifiers = computed(() => ({
  radiogroup_focused: unref(isFocused),
  radiogroup_required: props.required,
  radiogroup_disabled: props.disabled,
  radiogroup_enabled: !props.disabled,
  radiogroup_multiple: unref(isMultiple),
  radiogroup_indeterminate: props.indeterminate,
  radiogroup_has_label: unref(hasLabel),
  [`radiogroup_label_${props.labelPosition}`]: unref(hasLabel) && Boolean(props.labelPosition),
  [`radiogroup_size_${props.size}`]: Boolean(props.size),
  [`radiogroup_theme_${props.theme}`]: Boolean(props.theme),
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

const checkStatus = (option: ProximaRadioOption) => {
  if (unref(isMultiple)) {
    const modelValue = props.modelValue as any[];
    const item = modelValue.find((el: any) => toRaw(el) === toRaw(option.value))
    return Boolean(item);
  } else {
    return toRaw(props.modelValue) === toRaw(option.value);
  }
};

const onChange = (option: ProximaRadioOption) => {
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
const getId = () => props.id;

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
  id: props.id,
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

export const componentName = 'ProximaRadioGroup';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/radiogroup) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/checkbox/radiogroup.vue)
 *
 * @example
 * ```html
 * <ProximaRadioGroup
 *   size="s"
 *   v-model="value"
 * />
 * ```
 *
 * @prop id `string` — RadioGroup id (default `radiogroup-[hash]`)
 * @prop modelValue `any` — Checked value (default `''`)
 * @prop options `array` — Options list (default `[]`)
 * @prop label `string` — Label text
 * @prop labelPosition `string` — Label position: `above` / `aside` (default `above`)
 * @prop labelVisuallyHidden `boolean` — allowing label to be exposed only to assistive technologies (default `false`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop required `boolean` — required attribute (default `false`)
 * @prop indeterminate `boolean` — Indeterminate state (default `false`)
 * @prop view `string` — RadioGroup view: `plain` / `line` (default `plain`)
 * @prop size `string` — RadioGroup size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop shadow `string` — RadioGroup shadow: `none` / `soft` (default `none`)
 * @prop effect `string` — Click effect: `none` / `ripple` / `pulse` (default `none`)
 * @prop theme `string` — RadioGroup theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.radiogroup {
  .radiogroup {
    display: block;
    box-sizing: border-box;
    user-select: none;
    padding: 0;
    margin: 0;
    border: none;

    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size, 0.875rem);

    --base-radiogroup-label-color:
      var(--radiogroup-label-color, var(--app-label-color, #6c757d));

    --base-radiogroup-gap: var(--radiogroup-gap, 0.875rem);
  }

  .radiogroup *,
  .radiogroup *:before,
  .radiogroup *:after {
    box-sizing: inherit;
  }

  .radiogroup__content {
    display: flex;
    flex-wrap: wrap;
    gap: var(--base-radiogroup-gap);
  }

  .radiogroup__item {
    flex: var(--radiogroup-item-flex, 0 0 100%);
  }


  /*
    Header
  */

  .radiogroup__header {
    display: var(--radiogroup-header-display, block);
    width: var(--base-radiogroup-header-width, auto);
    padding-inline: var(--radiogroup-header-padding-x, 0);
    margin-block-end: var(--radiogroup-header-margin-y-end, var(--base-radiogroup-label-font-size));
    border: none;
  }

  .radiogroup__label {
    font-size: var(--base-radiogroup-label-font-size);
    letter-spacing: var(--radiogroup-label-letter-spacing, normal);
    line-height: var(--radiogroup-label-line-height, 1.2);
    color: var(--base-radiogroup-label-color);
    cursor: var(--radiogroup-label-cursor, pointer);
  }


  /*
    Labels
  */

  .radiogroup_label_above {
    --radiogroup-is-label-above: 1;
  }

  .radiogroup_label_aside {
    --radiogroup-is-label-aside: 1;

    --base-radiogroup-header-width: var(--radiogroup-label-aside-width, calc(
      var(--base-radiogroup-label-font-size) *
      var(--radiogroup-label-aside-width-multiplier, 10)
    ));

    position: relative;
    padding-inline-start: var(--base-radiogroup-header-width);
  }
  .radiogroup_label_aside .radiogroup__header {
    position: absolute;
    inset-block: 0;
    inset-inline: 0 auto;
    margin-block-end: 0;
  }


  /*
    Sizes
  */

  .radiogroup_size_xxs {
    --base-radiogroup-gap: var(--radiogroup-gap-xxs, 0.75rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-xxs, 0.75rem);
  }

  .radiogroup_size_xs {
    --base-radiogroup-gap: var(--radiogroup-gap-xs, 0.875rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-xs, 0.75rem);
  }

  .radiogroup_size_s {
    --base-radiogroup-gap: var(--radiogroup-gap-s, 0.875rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-s, 0.875rem);
  }

  .radiogroup_size_m {
    --base-radiogroup-gap: var(--radiogroup-gap-m, 1rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-m, 1rem);
  }

  .radiogroup_size_l {
    --base-radiogroup-gap: var(--radiogroup-gap-l, 1.125rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-l, 1rem);
  }

  .radiogroup_size_xl {
    --base-radiogroup-gap: var(--radiogroup-gap-xl, 1.25rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-xl, 1.125rem);
  }

  .radiogroup_size_xxl {
    --base-radiogroup-gap: var(--radiogroup-gap-xxl, 1.375rem);
    --base-radiogroup-label-font-size: var(--radiogroup-label-font-size-xxl, 1.25rem);
  }
}

@layer proxima {
  .radiogroup__item .checkbox__label {
    color: var(--radiogroup-checkbox-label-color, inherit);
  }
}
</style>

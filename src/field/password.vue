<template>
  <ProximaField
    ref="field"
    :actions="fieldActions"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, updateByEvent, onFocus, onBlur
    }">
      <input
        class="field__input field__el"
        :type="isHidden ? 'password' : 'text'"
        inputmode="text"
        :placeholder="placeholder"
        :value="fieldValue"
        v-bind="fieldAttrs"
        @input="updateByEvent"
        @focus="onFocus"
        @blur="onBlur"
      >
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts">
import { ref, unref, computed, nextTick } from 'vue';

import ProximaField from '@/field/field.vue';
import useFieldExpose from '@/field/useExpose';
import useId from '@/composables/id';

import type { ProximaFieldAction } from '../types.d';

const field = ref({} as InstanceType<typeof ProximaField>);

const props = withDefaults(defineProps<ProximaPasswordProps>(), {
  hasEyeButton: () => getDefaultProp('hasEyeButton', false) as false,
  actions: () => getDefaultProp('actions', []) as [],
});

// Type

const isHidden = ref(true);

const toggleType = () => {
  const el = unref(field)?.getElement();
  if (el) {
    const { selectionStart, selectionEnd } = el; // Save selection before change type
    isHidden.value = !unref(isHidden);
    nextTick(() => {
      el.setSelectionRange(selectionStart, selectionEnd);
      el.focus();
    });
  }
};

// Actions

const id = useId();

const fieldActions = computed(() => {
  if (!props.hasEyeButton) return props.actions;
  const attr = unref(isHidden) ? '' : ` mask="url(#${unref(id)})"`;
  return [
    ...props.actions,
    {
      id: 'eye',
      html: `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><mask id="${unref(id)}"><rect x="0" y="0" width="100%" height="100%" fill="white" /><circle cx="6" cy="6.5" r="2" fill="black" /></mask><ellipse cx="8" cy="8" rx="7" ry="5" fill="none" stroke-width="1" stroke="currentColor" /><circle cx="8" cy="8" r="2.5" fill="none" stroke-width="1" stroke="currentColor" stroke-dasharray="4"${attr} /></svg>`,
      shouldPreventBlur: true,
      pressed: !unref(isHidden),
      onClick: toggleType,
    },
  ];
});

// Expose

defineExpose(useFieldExpose(field));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export interface ProximaPasswordProps {
  hasEyeButton?: boolean
  actions?: ProximaFieldAction[]
}

export const componentName = 'ProximaPassword';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/password) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/password.vue)
 *
 * @example
 * ```html
 * <ProximaPassword
 *   label="Enter your password"
 *   v-model="password"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaPassword from 'proxima-vue/field/password';
 *
 * const password = ref('');
 * ```
 *
 * @prop hasEyeButton `boolean` — Adds type toggle action (default `true`)
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

<style>
@layer proxima.field {

  .field__input::-webkit-credentials-auto-fill-button {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 100%;
    margin-inline-start: 0.5em;
    transform: translate(0, -50%);
    cursor: pointer;
    z-index: 6;
  }

  .field__action_eye svg {
    transform: var(--field-action-eye-transform, scale(1.35));
  }

  .field__action_eye [mask] {
    stroke-dasharray: 0;
    fill: currentColor;
  }
}
</style>

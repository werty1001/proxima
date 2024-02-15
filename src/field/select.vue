<template>
  <ProximaField
    ref="field"
    has-arrow-button
    class="field_select"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, updateByEvent, onFocus, onBlur,
    }">
      <select
        class="field__input field__el"
        :value="fieldValue"
        v-bind="fieldAttrs"
        @change="updateByEvent"
        @focus="onFocus"
        @blur="onBlur"
      >
        <option
          v-if="placeholder"
          value=""
          :disabled="isPlaceholderOptionDisabled"
          v-text="placeholder"
        />
        <option
          v-for="(item, i) in optionsList"
          :key="`${fieldAttrs.id}-option-${i}`"
          :value="item.value === item.label ? null : item.value"
          :disabled="item.disabled"
          v-text="item.label"
        />
        <slot name="options" />
      </select>
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import ProximaField from '@/field/field.vue';
import useFieldExpose from '@/field/useExpose';

const field = ref({} as InstanceType<typeof ProximaField>);

const props = withDefaults(defineProps<ProximaSelectProps>(), {
  options: () => [],
  isPlaceholderOptionDisabled: true,
});

const optionsList = computed(() => props.options.map((el) => {
  if (typeof el === 'number' || typeof el === 'string') {
    return { label: String(el), value: el };
  }
  return el;
}));

// Expose

defineExpose(useFieldExpose(field));
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export interface ProximaSelectOption {
  value: string | number
  label?: string
  disabled?: boolean
}

export interface ProximaSelectProps {
  options?: ProximaSelectOption[] | string[] | number[]
  isPlaceholderOptionDisabled?: boolean
}

export const componentName = 'ProximaSelect';

/**
 * [Live Demo](https://proxima.wiki/field/select) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/select.vue)
 *
 * @example
 * ```html
 * <ProximaSelect
 *   label="Select country"
 *   v-model="country"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaSelect from 'proxima-vue/field/select';
 *
 * const country = ref('');
 * ```
 *
 * @prop options `array` — Options list (default `[]`)
 * @prop isPlaceholderOptionDisabled `boolean` — First option will be disabled (default `true`)
 *
 * @prop id `string` — Field id (default `field-[hash]`)
 * @prop inputAttrs `SelectHTMLAttributes` — Select attributes (default `{}`)
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
 * @prop hasArrowButton `boolean` — Adds arrow button (default `true`)
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
  .field_select {
    --field-is-arrow-flipped: var(--field-is-focus, 0);
  }

  .field_select .field__el {
    cursor: pointer;
  }

  .field_select:not(.field_has_value) .field__input {
    color: var(--base-field-placeholder-color);
  }

  .field_select option {
    color: initial;
  }

  .field_select optgroup {
    font-weight: 700;
  }
}
</style>

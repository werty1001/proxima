<template>
  <ProximaField
    ref="field"
    :style="styles"
    class="field_textarea"
    :class="{
      field_autoresize: autoresize,
    }"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, updateByEvent, onFocus, onBlur
    }">
      <textarea
        class="field__input field__el"
        :class="{
          'pretty-scrollbar': scrollbar !== 'native',
          'pretty-scrollbar_hover': scrollbar === 'pretty-hover',
        }"
        :rows="minRows"
        :placeholder="placeholder"
        :value="fieldValue"
        v-bind="fieldAttrs"
        @input="updateByEvent"
        @focus="onFocus"
        @blur="onBlur"
      />
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts">
import { ref, computed, watch, unref, useAttrs, nextTick, onMounted } from 'vue';

import ProximaField from '@/field/field.vue';
import useFieldExpose from '@/field/useExpose';
import type { ProximaScrollbar } from '../types.d';

const field = ref({} as InstanceType<typeof ProximaField>);
const attrs = useAttrs();

const props = withDefaults(defineProps<ProximaTextareaProps>(), {
  minRows: () => getDefaultProp('minRows', '3') as '3',
  maxRows: () => getDefaultProp('maxRows', '12') as '12',
  scrollbar: () => getDefaultProp('scrollbar', 'pretty') as 'pretty',
  autoresize: () => getDefaultProp('autoresize', true) as true,
});

const height = ref('auto');
const setHeight = (val: string) => (height.value = val);

const styles = computed(() => ({
  '--field-textarea-max-rows': props.maxRows,
  '--field-textarea-min-rows': props.minRows,
  '--field-textarea-inner-height': height.value,
}));

const setFieldHeight = () => {
  if (!props.autoresize) return;
  const el = unref(field)?.getElement();
  if (el) {
    setHeight('auto');
    nextTick(() => {
      if (!el) return;
      setHeight(`${Math.max(el.offsetHeight, el.clientHeight, el.scrollHeight)}px`);
    });
  }
};

watch(() => attrs.modelValue, setFieldHeight);

onMounted(setFieldHeight);

// Expose

defineExpose(useFieldExpose(field));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export interface ProximaTextareaProps {
  minRows?: string
  maxRows?: string
  scrollbar?: ProximaScrollbar
  autoresize?: boolean
}

export const componentName = 'ProximaTextarea';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/textarea) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/textarea.vue)
 *
 * @example
 * ```html
 * <ProximaTextarea
 *   label="Description"
 *   min-rows="5"
 *   v-model="text"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaTextarea from 'proxima-vue/field/textarea';
 *
 * const text = ref('');
 * ```
 *
 * @prop minRows `string` — Min rows (default `3`)
 * @prop maxRows `string` — Max rows (default `12`)
 * @prop scrollbar `string` — Scrollbar type: `pretty` / `pretty-hover` / `native` (default `pretty`)
 * @prop autoresize `boolean` — Height autoresize (default `true`)
 *
 * @prop id `string` — Field id (default `field-[hash]`)
 * @prop inputAttrs `TextareaHTMLAttributes` — Textarea attributes (default `{}`)
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
@layer proxima.textarea {
  .field_textarea {
    --base-field-textarea-line-height: var(--field-textarea-line-height, 1.25em);

    --base-field-textarea-padding-y-end: var(--field-textarea-padding-y-end, 0.5em);
    --base-field-textarea-padding-y-start: calc(
      (var(--base-field-size) / 3.5) * var(--field-is-label-inside, 0) +
      var(--field-textarea-padding-y-start, 0.5em)
    );

    --base-field-textarea-border-sum: calc(var(--base-field-border-width) * 2);

    --base-field-textarea-padding-and-border-sum: calc(
      var(--base-field-textarea-padding-y-start) +
      var(--base-field-textarea-padding-y-end) +
      var(--base-field-textarea-border-sum)
    );

    --base-field-textarea-min-height: var(--field-textarea-min-height, calc(
      var(--field-textarea-min-rows) *
      var(--base-field-textarea-line-height) +
      var(--base-field-textarea-padding-and-border-sum)
    ));

    --base-field-textarea-max-height: var(--field-textarea-max-height, calc(
      var(--field-textarea-max-rows) *
      var(--base-field-textarea-line-height) +
      var(--base-field-textarea-padding-and-border-sum)
    ));
  }

  .field_textarea .field__content {
    height: auto;
  }

  .field_textarea .field__actions {
    inset-block-end: auto;
  }

  .field_textarea .field__status:before {
    display: none;
  }

  .field_textarea .field__el {
    height: auto;
    line-height: var(--base-field-textarea-line-height);
    min-height: var(--base-field-textarea-min-height);
    max-height: var(--base-field-textarea-max-height);
    padding-block-start: var(--base-field-textarea-padding-y-start);
    padding-block-end: var(--base-field-textarea-padding-y-end);
    overflow-x: var(--field-textarea-overflow-x, hidden);
    overflow-y: var(--field-textarea-overflow-y, scroll);
    resize: var(--field-textarea-resize, vertical);
  }

  .field_autoresize .field__el {
    height: calc(var(--base-field-textarea-border-sum) + var(--field-textarea-inner-height));
    resize: none;
  }

  .field_textarea.field_label_aside .field__header {
    align-items: flex-start;
    padding-block-start: calc(
      var(--base-field-font-size) -
      var(--base-field-label-font-size) +
      var(--base-field-textarea-padding-y-start)
    );
  }

  .field_textarea.field_label_inside.field_readonly .field__header {
    background: transparent;
  }

  .field_textarea.field_label_inside .field__header {
    inset-block-start: calc(var(--base-field-border-width) * var(--field-is-view-plain, 0));
    inset-inline-start: calc(var(--base-field-border-width) * var(--field-is-view-plain, 0));
    width: calc(100% - var(--base-field-padding-x-end));
    background: linear-gradient(180deg,
      var(--base-field-background) 0,
      var(--base-field-background) 50%,
      transparent 50%
    );
  }

  .field_textarea.field_round_full {
    border-radius: calc(var(--base-field-size) / 2);
  }
}
</style>

<template>
  <ProximaButton
    ref="el"
    :icon="IconDelete"
    theme="danger"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </ProximaButton>
</template>

<script setup lang="ts">
import { ref, unref } from 'vue';
import ProximaButton from '@/button/button.vue';
import IconDelete from '@/icon/delete.vue';

// Expose

const el = ref({} as InstanceType<typeof ProximaButton>);

defineExpose({
  focus: () => unref(el)?.focus?.(),
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaButtonDelete';

/**
 * [Live Demo](https://proxima.wiki/button/delete) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/button/delete.vue)
 *
 * @example
 * ```html
 * <ProximaButtonDelete size="s" />
 * ```
 *
 * @prop text `string` — Button text (default `''`)
 * @prop href `string` — Button would be a link (default `''`)
 * @prop icon `object` — Icon component (default `IconDelete`)
 * @prop iconProps `object` — Icon props (default `{}`)
 * @prop iconPosition `string` — Icon position: `before` / `after` (default `before`)
 * @prop textVisuallyHidden `boolean` — allowing text to be exposed only to assistive technologies (default `false`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop width `string` — Button width: `auto` / `max` / `sym` (default `auto`)
 * @prop view `string` — Button view: `plain` / `text` / `outline` (default `plain`)
 * @prop size `string` — Button size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Button radius: `soft` / `full` / `none` (default `'soft'`)
 * @prop shadow `string` — Button shadow: `soft` / `wide` (default `''`)
 * @prop effect `string` — Click effect: `none` / `ripple` / `pulse` (default `none`)
 * @prop theme `string` — Button theme (default `'danger'`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.button {
  .button_theme_danger {
    --button-theme-color: var(--app-danger-color, #dc3545);
  }
}
</style>

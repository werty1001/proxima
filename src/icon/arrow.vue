<template>
  <ProximaIcon>
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor">
      <path stroke-width="1.5" :d="d" />
    </svg>
  </ProximaIcon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProximaIcon from '@/icon/icon.vue';

export interface ProximaIconArrowProps {
  direction?: 'top' | 'right' | 'bottom' | 'left'
}

const props = withDefaults(defineProps<ProximaIconArrowProps>(), {
  direction: 'bottom',
});

const d = computed(() => {
  switch (props.direction) {
    case 'top': {
      return 'M14 11 8 5l-6 6';
    }
    case 'right': {
      return 'm6 2 6 6-6 6';
    }
    case 'bottom': {
      return 'm2 5 6 6 6-6';
    }
    default: {
      return 'M10 2 4 8l6 6';
    }
  }
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaIconArrow';

/**
 * [Live Demo](https://proxima.wiki/icon) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/icon/arrow.vue)
 *
 * ```html
 * <ProximaIconArrow direction="right" />
 * ```
 *
 * @prop direction `string` — Icon size: `top` / `right` / `bottom` / `left` (default `bottom`)
 *
 * @prop tag `string` — Icon tag (default `span`)
 * @prop color `string` — Icon color mode: `mono` / `multi` (default `mono`)
 * @prop view `string` — Icon view: `plain` / `outline` / `rect` (default `plain`)
 * @prop size `string` — Icon size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Icon radius: `soft` / `full` / `none` (default `'soft'`)
 * @prop theme `string` — Icon theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

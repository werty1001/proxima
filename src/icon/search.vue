<template>
  <ProximaIcon>
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="7.5" cy="7.5" r="6.25" />
      <line x1="15" y1="15" x2="12" y2="12" />
    </svg>
  </ProximaIcon>
</template>

<script setup lang="ts">
import ProximaIcon from '@/icon/icon.vue';
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaIconSearch';

/**
 * [Live Demo](https://proxima.wiki/icon) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/icon/search.vue)
 *
 * ```html
 * <ProximaIconSearch size="xl" />
 * ```
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

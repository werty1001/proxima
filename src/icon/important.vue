<template>
  <ProximaIcon>
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 1c1.5 0 2.75 1.5 2.75 3 0 1.333-.383 3.267-1.15 5.8-.223.725-.85 1.2-1.599 1.2S6.6 10.549 6.4 9.8C5.633 7.267 5.25 5.333 5.25 4 5.25 2.5 6.5 1 8 1Z"/>
      <circle cx="8" cy="14" r="1.5" />
    </svg>
  </ProximaIcon>
</template>

<script setup lang="ts">
import ProximaIcon from '@/icon/icon.vue';
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaIconImportant';

/**
 * [Live Demo](https://proxima.wiki/icon) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/icon/important.vue)
 *
 * ```html
 * <ProximaIconImportant size="xl" />
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

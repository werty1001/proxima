<template>
  <ProximaIcon>
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor">
      <path stroke-width="1.5" d="M1.5 8h13M8 1.5v13"/>
    </svg>
  </ProximaIcon>
</template>

<script setup lang="ts">
import ProximaIcon from '@/icon/icon.vue';
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaIconPlus';

/**
 * [Live Demo](https://proxima.wiki/icon) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/icon/plus.vue)
 *
 * ```html
 * <ProximaIconPlus size="xl" />
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

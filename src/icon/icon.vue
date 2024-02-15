<template>
  <component
    :is="tag"
    class="icon"
    :class="modifiers"
    aria-hidden="true"
    data-ghost-item
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProximaSize, ProximaRound } from '../types.d';

export interface ProximaIconProps {
  tag?: string
  color?: 'mono' | 'multi'
  view?: 'plain' | 'outline' | 'rect'
  size?: ProximaSize
  round?: ProximaRound
  theme?: string
}

const props = withDefaults(defineProps<ProximaIconProps>(), {
  tag: () => getDefaultProp('tag', 'span') as 'span',
  color: () => getDefaultProp('color', 'mono') as 'mono',
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  round: () => getDefaultProp('round', 'soft') as 'soft',
  theme: () => getDefaultProp('theme', '') as '',
});

const modifiers = computed(() => ({
  [`icon_color_${props.color}`]: Boolean(props.color),
  [`icon_view_${props.view}`]: Boolean(props.view),
  [`icon_size_${props.size}`]: Boolean(props.size),
  [`icon_round_${props.round}`]: Boolean(props.round),
  [`icon_theme_${props.theme}`]: Boolean(props.theme),
}));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaIcon';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/icon) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/icon/icon.vue)
 *
 * @example
 * ```html
 * <ProximaIcon
 *   size="xl"
 * >
 *   <svg>...</svg>
 * </ProximaIcon>
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

<style>
@layer proxima.icon {
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: var(--icon-vertical-align, middle);
    width: var(--icon-width, var(--base-icon-size));
    height: var(--icon-height, var(--base-icon-size));
    color: var(--icon-color, inherit);
    box-sizing: border-box;
    border-radius: var(--icon-border-radius, calc(
      var(--base-icon-size) / var(--icon-border-radius-divider, 8)
    ));

    --base-icon-size: var(--icon-size, 1em);
    --base-icon-padding: var(--icon-padding, 0.09375em);
    --base-icon-border-width: var(--icon-border-width, 0.09375em);
  }

  .icon svg {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: inherit;
    stroke-linecap: var(--icon-stroke-linecap, round);
    stroke-linejoin: var(--icon-stroke-linejoin, round);
  }

  .icon [stroke-width] {
    stroke-width: var(--icon-stroke-width, revert-layer);
  }

  /*
    View
  */

  .icon_view_rect {
    padding: var(--base-icon-padding);
    background: var(--icon-view-rect-background, none);
  }

  .icon_view_outline {
    padding: var(--base-icon-padding);
    background: var(--icon-view-outline-background, none);
    border-width: var(--base-icon-border-width);
    border-style: var(--icon-border-style, solid);
    border-color: var(--icon-border-color, currentColor);
  }

  /*
    Round
  */

  .icon_round_none {
    border-radius: 0;
  }

  .icon_round_full {
    --icon-is-full-round: 1;
    border-radius: 100rem;
  }

  /*
    Multicolor
  */

  .icon_color_multi [data-stroke="primary"] {
    stroke: var(--icon-primary-color, currentColor);
  }

  .icon_color_multi [data-stroke="secondary"] {
    stroke: var(--icon-secondary-color, currentColor);
  }

  .icon_color_multi [data-stroke="tertiary"] {
    stroke: var(--icon-tertiary-color, currentColor);
  }

  .icon_color_multi [data-fill="primary"] {
    fill: var(--icon-primary-color, currentColor);
  }

  .icon_color_multi [data-fill="secondary"] {
    fill: var(--icon-secondary-color, currentColor);
  }

  .icon_color_multi [data-fill="tertiary"] {
    fill: var(--icon-tertiary-color, currentColor);
  }

  /*
    Sizes
  */

  .icon_size_xxs {
    --base-icon-size: var(--icon-size-xxs, 0.625em);
    --base-icon-padding: var(--icon-padding-xxs, 0.0625em);
    --base-icon-border-width: var(--icon-border-width-xxs, 0.0625em);
  }

  .icon_size_xs {
    --base-icon-size: var(--icon-size-xs, 0.75em);
    --base-icon-padding: var(--icon-padding-xs, 0.0625em);
    --base-icon-border-width: var(--icon-border-width-xs, 0.0625em);
  }

  .icon_size_s {
    --base-icon-size: var(--icon-size-s, 0.875em);
    --base-icon-padding: var(--icon-padding-s, 0.0625em);
    --base-icon-border-width: var(--icon-border-width-s, 0.0625em);
  }

  .icon_size_m {
    --base-icon-size: var(--icon-size-m, 1.25em);
    --base-icon-padding: var(--icon-padding-m, 0.125em);
    --base-icon-border-width: var(--icon-border-width-m, 0.125em);
  }

  .icon_size_l {
    --base-icon-size: var(--icon-size-l, 1.5em);
    --base-icon-padding: var(--icon-padding-l, 0.1875em);
    --base-icon-border-width: var(--icon-border-width-l, 0.125em);
  }

  .icon_size_xl {
    --base-icon-size: var(--icon-size-xl, 2em);
    --base-icon-padding: var(--icon-padding-xl, 0.25em);
    --base-icon-border-width: var(--icon-border-width-xl, 0.125em);
  }

  .icon_size_xxl {
    --base-icon-size: var(--icon-size-xxl, 3em);
    --base-icon-padding: var(--icon-padding-xxl, 0.5em);
    --base-icon-border-width: var(--icon-border-width-xxl, 0.1875em);
  }
}
</style>

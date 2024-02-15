<template>
  <div class="spinner" :class="modifiers">
    <slot name="prepend" />
    <svg viewBox="0 0 32 32" class="spinner__indicator">
      <defs>
        <clipPath :id="`header_${id}`">
          <rect
            x="0"
            y="0"
            width="100%"
            height="50%"
          />
        </clipPath>
        <clipPath :id="`footer_${id}`">
          <rect
            x="0"
            y="50%"
            width="100%"
            height="50%"
          />
        </clipPath>
        <linearGradient :id="`gradient_header_${id}`">
          <stop
            offset="0"
            stop-color="currentColor"
            stop-opacity="0.5"
          />
          <stop
            offset="100%"
            stop-color="currentColor"
            stop-opacity="1"
          />
        </linearGradient>
        <linearGradient :id="`gradient_footer_${id}`">
          <stop
            offset="0"
            stop-color="currentColor"
            stop-opacity="0.5"
          />
          <stop
            offset="30%"
            stop-color="currentColor"
            stop-opacity="0.3"
          />
          <stop
            offset="90%"
            stop-color="currentColor"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="14"
        :stroke="`url(#gradient_header_${id})`"
        :clip-path="`url(#header_${id})`"
      />
      <circle
        cx="16"
        cy="16"
        r="14"
        :stroke="`url(#gradient_footer_${id})`"
        :clip-path="`url(#footer_${id})`"
      />
    </svg>
    <div
      v-if="hasLabel"
      class="spinner__label"
      :class="{ 'visually-hidden': labelVisuallyHidden }"
    >
      <slot name="label" :label="label">
        {{ label }}
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, unref, useSlots } from 'vue';
import getRandomId from '@/utils/randomId';
import type { ProximaSize } from '../types.d';

export interface ProximaSpinnerProps {
  id?: string
  label?: string
  labelPosition?: 'under' | 'aside'
  labelVisuallyHidden?: boolean
  size?: ProximaSize
  theme?: string
}

const props = withDefaults(defineProps<ProximaSpinnerProps>(), {
  id: () => getRandomId('spinner'),
  label: '',
  labelPosition: () => getDefaultProp('labelPosition', 'under') as 'under',
  labelVisuallyHidden: false,
  size: () => getDefaultProp('size', 'normal') as 'normal',
  theme: () => getDefaultProp('theme', '') as '',
});

const slots = useSlots();
const hasLabel = computed(() => Boolean(props.label || slots.label));

const modifiers = computed(() => ({
  spinner_has_label: unref(hasLabel),
  [`spinner_label_${props.labelPosition}`]: unref(hasLabel) && Boolean(props.labelPosition),
  [`spinner_size_${props.size}`]: Boolean(props.size),
  [`spinner_theme_${props.theme}`]: Boolean(props.theme),
}));
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaSpinner';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/spinner) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/spinner/spinner.vue)
 *
 * @example
 * ```html
 * <ProximaSpinner
 *   label="Sending data"
 *   label-position="aside"
 *   size="m"
 * />
 * ```
 *
 * @prop label `string` — Label text
 * @prop labelPosition `string` — Label position: `aside` or `under` (default `under`)
 * @prop labelVisuallyHidden `boolean` — allowing label to be exposed only to assistive technologies (default `false`)
 * @prop size `string` — Spinner size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop theme `string` — Spinner theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.spinner {

  @keyframes ProximaSpinnerAnimation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    width: auto;
    height: auto;
    background: none;
    color: inherit;
    pointer-events: none;
    gap:
      calc(var(--base-spinner-label-font-size) / 2)
      var(--base-spinner-label-font-size);

    --base-spinner-label-font-size: var(--spinner-label-font-size, 1rem);
    --base-spinner-size: var(--spinner-size, 2rem);
  }

  .spinner__indicator {
    display: block;
    width: var(--base-spinner-size);
    height: var(--base-spinner-size);
    color: var(--spinner-color, inherit);
    animation: ProximaSpinnerAnimation 1.5s linear infinite;
  }

  .spinner__indicator circle {
    fill: none;
    stroke-width: var(--spinner-stroke-width, 3);
  }

  .spinner__label {
    flex: 0 0 100%;
    font-size: var(--base-spinner-label-font-size);
    line-height: var(--spinner-label-line-height, 1.2);
    text-align: var(--spinner-label-text-align, center);
    color: var(--spinner-label-color, inherit);
  }

  /*
    Aside label
  */

  .spinner_label_aside {
    flex-flow: row nowrap;
  }

  .spinner_label_aside .spinner__label {
    flex: 0 0 auto;
  }


  /*
    Sizes
  */

  .spinner_size_xxs {
    --base-spinner-size: var(--spinner-size-xxs, 1rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-xxs, 0.75rem);
  }

  .spinner_size_xs {
    --base-spinner-size: var(--spinner-size-xs, 1.25rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-xs, 0.75rem);
  }

  .spinner_size_s {
    --base-spinner-size: var(--spinner-size-s, 1.5rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-s, 0.875rem);
  }

  .spinner_size_m {
    --base-spinner-size: var(--spinner-size-m, 2.25rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-m, 1.125rem);
  }

  .spinner_size_l {
    --base-spinner-size: var(--spinner-size-l, 2.5rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-l, 1.25rem);
  }

  .spinner_size_xl {
    --base-spinner-size: var(--spinner-size-xl, 3rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-xl, 1.5rem);
  }

  .spinner_size_xxl {
    --base-spinner-size: var(--spinner-size-xxl, 4rem);
    --base-spinner-label-font-size: var(--spinner-label-font-size-xxl, 2rem);
  }
}
</style>

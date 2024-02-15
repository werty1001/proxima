<template>
  <component
    :is="tag"
    class="chip"
    data-ghost-item
  >
    <slot>
      <span
        v-if="text"
        v-text="text"
        data-ghost-text
        class="chip__text"
      />
    </slot>
    <button
      type="button"
      tabindex="-1"
      class="chip__delete"
      @click.stop="emit('delete')"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="chip__cross">
        <path d="M13 13 3 3m10 0L3 13" />
      </svg>
    </button>
  </component>
</template>

<script setup lang="ts">
import type { ProximaSize, ProximaRound } from '../types.d';

export interface ProximaChipProps {
  tag?: string
  text?: string
  hasDeleteButton?: boolean
  view?: 'plain' | 'outline'
  size?: ProximaSize
  round?: ProximaRound
  theme?: string
}

const props = withDefaults(defineProps<ProximaChipProps>(), {
  tag: () => getDefaultProp('tag', 'span') as 'span',
  text: '',
  hasDeleteButton: false,
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  round: () => getDefaultProp('round', 'soft') as 'soft',
  theme: () => getDefaultProp('theme', '') as '',
});

const emit = defineEmits<{
  'delete': []
}>();
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaChip';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/chip) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/chip/chip.vue)
 *
 * @example
 * ```html
 * <ProximaChip
 *   size="m"
 * />
 * ```
 *
 * @prop tag `string` — Chip tag (default `'span'`)
 * @prop text `string` — Chip text (default `''`)
 * @prop hasDeleteButton `boolean` — Adds delete button (default `true`)
 * @prop view `string` — Chip view: `plain` / `outline` (default `plain`)
 * @prop size `string` — Chip size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Chip radius: `soft` / `full` / `none` (default `'soft'`)
 * @prop theme `string` — Chip theme (default `''`)
 *
 * @since v0.2.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.chip {
  .chip {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    background-color: var(--chip-background-color, #eee);
    border-radius: 0.25rem;
    pointer-events: auto;
    user-select: none;
  }

  .chip__text {
    padding-inline: var(--chip-padding-x, 0.75em);
  }

  .chip__delete {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    width: var(--chip-delete-size, 2em);
    height: var(--chip-delete-size, 2em);
    background: rgba(0, 0, 0, calc(0.05 + (0.05 * var(--chip-is-hover, 0))));
    border-radius: inherit;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  .chip__cross {
    display: block;
    width: 1em;
    height: 1em;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (hover: hover) {
    .chip:hover {
      --chip-is-hover: 1;
    }
  }
}
</style>

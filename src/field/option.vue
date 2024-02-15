<template>
  <li
    :data-descendant-index="index"
    :aria-selected="isSelected"
    :aria-posinset="index + 1"
    :aria-disabled="isDisabled"
    :aria-describedby="describedby || undefined"
    role="option"
    class="field__option"
    :class="{
      field__option_hover: isHovered,
      field__option_pinned: isPinned,
      field__option_selected: isSelected,
      field__option_disabled: isDisabled,
      field__option_create: isCreateButton,
    }"
  >
    <slot v-bind="slotProps">
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        :class="`field__option-${isCreateButton ? 'plus' : 'tick'}`"
      >
        <path :d="isCreateButton ? 'M1.5 8h13M8 1.5v13' : 'm3 8 3.25 3.5 7-7'" />
      </svg>
      <span v-text="label" data-ghost-text />
    </slot>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ProximaFieldOptionProps {
  index: number
  label?: string
  describedby?: string
  isPinned?: boolean
  isSelected?: boolean
  isDisabled?: boolean
  isHovered?: boolean
  isCreateButton?: boolean
}

const props = withDefaults(defineProps<ProximaFieldOptionProps>(), {
  label: '',
  describedby: '',
  isPinned: false,
  isSelected: false,
  isDisabled: false,
  isHovered: false,
  isCreateButton: false,
});

const slotProps = computed(() => ({
  index: props.index,
  label: props.label,
  describedby: props.describedby,
  isPinned: props.isPinned,
  isSelected: props.isSelected,
  isDisabled: props.isDisabled,
  isHovered: props.isHovered,
  isCreateButton: props.isCreateButton,
}));
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaFieldOption';

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.field {

  .field__option {
    display: flex;
    align-items: center;
    padding-inline: var(--base-field-option-padding-x);
    padding-block: var(--base-field-option-padding-y);
    gap: var(--field-option-gap, 1em);
    border-radius: var(--field-option-border-radius, 0.375rem);
    cursor: pointer;
  }

  .field__option_hover {
    --field-option-is-hover: 1;

    background: var(--field-option-hover-background, #f6f6f6);
  }

  .field__option_create {
    justify-content: center;
    padding-inline: var(--field-option-create-padding-x, 1.25em);
    color: var(--field-option-create-color, var(--base-field-accent-color));
  }

  .field__option_disabled {
    --field-option-is-disabled: 1;
    cursor: not-allowed;
  }

  .field__option_disabled * {
    opacity: var(--field-option-disabled-opacity, 0.4);
  }

  .field__option_selected {
    --field-option-is-selected: 1;
    color: var(--field-option-selected-color, var(--base-field-accent-color));
  }

  .field__option-tick,
  .field__option-plus {
    display: block;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
  }

  .field__option-tick {
    order: var(--field-option-tick-order, 1);
    width: var(--field-option-tick-size, 1.125em);
    height: var(--field-option-tick-size, 1.125em);
    stroke-width: var(--field-option-tick-stroke-width, 2);
    stroke-dasharray: 15;
    stroke-dashoffset: calc(15px * (1 - var(--field-option-is-selected, 0)));
    transition: stroke-dashoffset 250ms ease-in-out;
    margin-inline-start: var(--field-option-tick-margin-x-start, auto);
    opacity: calc(var(--field-option-is-selected, 0) - var(--field-is-list-pending, 0));
  }

  .field__option-plus {
    width: var(--field-option-plus-size, 1em);
    height: var(--field-option-plus-size, 1em);
    stroke-width: var(--field-option-plus-stroke-width, 1.25);
    margin-inline-start: var(--field-option-plus-margin-x-start, -0.375em);
    opacity: calc(1 - var(--field-is-list-pending, 0));
  }
}
</style>

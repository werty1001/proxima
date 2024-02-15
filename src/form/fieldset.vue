<template>
  <fieldset class="form__fieldset">
    <legend
      v-if="$slots.legend || legend"
      data-ghost-text
      class="form__legend"
    >
      <slot name="legend">
        {{ legend }}
      </slot>
    </legend>
    <div class="form__fields">
      <slot />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
export interface ProximaFormFieldsetProps {
  legend?: string
}

withDefaults(defineProps<ProximaFormFieldsetProps>(), {
  legend: '',
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaFormFieldset';

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.form {

  .form__fieldset {
    flex: var(--form-fieldset-flex, 0 0 100%);
    max-width: var(--form-fieldset-max-width, 100%);
    padding: 0;
    border: 0;
    margin: 0;
  }

  .form__fieldset + .form__fieldset {
    margin-block-start: var(--form-fieldset-margin-y-start, 2rem);
  }

  .form__legend {
    font-family: var(--form-legend-font-family, inherit);
    font-size: var(--form-legend-font-size, 1rem);
    font-weight: var(--form-legend-font-weight, 700);
    line-height: var(--form-legend-line-height, 1.25);
    letter-spacing: var(--form-legend-letter-spacing, normal);
    text-transform: var(--form-legend-text-transform, none);
    text-align: var(--form-legend-text-align, inherit);
    color: var(--form-legend-color, inherit);
    word-break: normal;
    padding: 0;
    border: 0;
    margin-block-start: var(--form-legend-margin-y-start, 0);
    margin-block-end: var(--form-legend-margin-y-end, 0.75rem);
  }

  .form__fields {
    display: flex;
    flex-wrap: wrap;
    justify-content: stretch;
    gap: var(--form-gap, 0.625rem);
  }
}
</style>

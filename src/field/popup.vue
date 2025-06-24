<template>
  <ProximaPopup
    ref="popup"
    aria-live="polite"
    :data-ghost="isPending"
    :inert="isPending"
    class="field__popup"
  >
    <slot name="popup-prepend" />

    <ul
      v-if="optionsCount > 0"
      role="listbox"
      :id="id"
      :aria-multiselectable="multiselectable"
      :aria-describedby="describedId"
      class="field__options"
      @mouseover="emit('mouse:over', $event)"
      @mouseout="emit('mouse:out', $event)"
      @mousedown.prevent="emit('mouse:down', $event)"
    >
      <slot name="options" />
    </ul>

    <template #footer>
      <slot name="popup-footer" :id="describedId">
        <slot name="popup-footer-prepend" :id="describedId"></slot>
        <p
          v-if="filterResults"
          v-text="filterResults"
          :id="describedId"
          :key="`${id}-${filterValue}`"
          class="text text_dim"
        />
        <slot name="popup-footer-append" :id="describedId"></slot>
      </slot>
    </template>

    <slot name="popup" />
  </ProximaPopup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProximaPopup from '@/popup/popup.vue';
import usePopupExpose from '@/popup/useExpose';

export interface ProximaFieldPopupProps {
  id: string
  multiselectable?: boolean
  filterValue?: string
  optionsCount?: number
  filterResults?: string
  isPending?: boolean
}

const props = withDefaults(defineProps<ProximaFieldPopupProps>(), {
  multiselectable: false,
  filterValue: '',
  optionsCount: 0,
  filterResults: '',
  isPending: false,
});

const emit = defineEmits<{
  'mouse:over': [event: MouseEvent]
  'mouse:out': [event: MouseEvent]
  'mouse:down': [event: MouseEvent]
}>();

const describedId = `${props.id}-description`;

// Expose

const popup = ref({} as InstanceType<typeof ProximaPopup>);

defineExpose(usePopupExpose(popup));
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaFieldPopup';

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.field {

  .field_popup_opened {
    --field-is-popup-opened: 1;
  }

  .field_list_pending {
    --field-is-list-pending: 1;
  }

  .field__popup {
    --popup-font-size: var(--field-popup-font-size, 0.875rem);

    --popup-background: var(--field-popup-background, var(--field-background, var(--app-field-background)));
    --popup-color: var(--field-popup-color, var(--field-color, var(--app-field-color)));

    --popup-overflow-y: var(--field-popup-overflow-y, auto);
    --popup-scroll-padding-y-start: var(--field-popup-scroll-padding-y-start, 0.25rem);
    --popup-scroll-padding-y-end: var(--field-popup-scroll-padding-y-end, 6rem);

    --base-field-options-padding-x: var(--field-options-padding-x, 0.25rem);
    --base-field-options-padding-y: var(--field-options-padding-y, 0.25rem);
    --base-field-option-padding-x: var(--field-option-padding-x, 0.875em);
    --base-field-option-padding-y: var(--field-option-padding-y, 0.75em);

    --popup-footer-max-width: var(--field-popup-footer-max-width, 24em);
    --popup-footer-border-block-start: solid
      var(--field-popup-footer-border-size, 1px)
      var(--field-popup-footer-border-color, #eee);

    --popup-footer-padding-x: calc(
      var(--base-field-options-padding-x) + var(--base-field-option-padding-x)
    );

    --popup-footer-padding-y: calc(
      var(--base-field-options-padding-y) + var(--base-field-option-padding-y)
    );

    margin-block-start: var(--field-popup-margin-y-start, -0.25rem);
    margin-inline-start: var(--field-popup-margin-x-start, calc(
      var(--base-field-padding-x-start) - var(--field-popup-margin-offset, 1em)
    ));
  }

  .field__options {
    position: relative;
    display: block;
    list-style: none;
    padding-inline: var(--base-field-options-padding-x);
    padding-block: var(--base-field-options-padding-y);
    margin: 0;
    z-index: var(--field-options-z-index, 1);
  }

  .field_size_xxs .field__popup {
    --popup-font-size: var(--field-popup-font-size-xxs, 0.75rem);
    --field-popup-margin-offset: calc(0.8125em + (0.125em * var(--field-is-view-line, 0)));
  }

  .field_size_xs .field__popup {
    --popup-font-size: var(--field-popup-font-size-xs, 0.8125rem);
    --field-popup-margin-offset: calc(0.875em + (0.125em * var(--field-is-view-line, 0)));
  }

  .field_size_s .field__popup {
    --popup-font-size: var(--field-popup-font-size-s, 0.875rem);
  }

  .field_size_m .field__popup {
    --popup-font-size: var(--field-popup-font-size-m, 0.875rem);
  }

  .field_size_l .field__popup {
    --popup-font-size: var(--field-popup-font-size-l, 1rem);
    --field-popup-margin-offset: 1.0625em;
  }

  .field_size_xl .field__popup {
    --popup-font-size: var(--field-popup-font-size-xl, 1.125rem);
    --field-popup-margin-offset: 1.125em;
  }

  .field_size_xxl .field__popup {
    --popup-font-size: var(--field-popup-font-size-xxl, 1.25rem);
    --field-popup-margin-offset: 1.25em;
  }
}
</style>

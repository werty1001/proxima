<template>
  <span
    class="effect"
    :class="modifiers"
    :style="isTypeRipple ? styles : null"
    aria-hidden="true"
    @click="onClick"
    @animationend="setPressed(false)"
  />
</template>

<script setup lang="ts">
import { ref, unref, computed } from 'vue';
import type { ProximaClickEffect } from '../types.d';

export interface ProximaEffectProps {
  type?: ProximaClickEffect
}

const props = withDefaults(defineProps<ProximaEffectProps>(), {
  type: 'ripple',
});

const modifiers = computed(() => ({
  effect_pressed: unref(isPressed),
  [`effect_type_${props.type}`]: Boolean(props.type),
}));

const styles = computed(() => ({
  '--effect-x': unref(x),
  '--effect-y': unref(y),
}));

const isTypeRipple = computed(() => props.type === 'ripple');

const isPressed = ref(false);
const setPressed = (flag: boolean) => (isPressed.value = flag);

const x = ref('0px');
const y = ref('0px');

const onClick = (event: MouseEvent) => {
  x.value = `${event.offsetX}px`;
  y.value = `${event.offsetY}px`;
  setPressed(true);
};
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export const componentName = 'ProximaEffect';

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.effect {

  @keyframes ProximaRippleAnimation {
    0% {
      transform: scale(0);
      opacity: var(--effect-ripple-opacity, 0.4);
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }

  @keyframes ProximaPulseAnimation {
    0% {
      box-shadow: 0 0 0 0 currentColor;
    }
    70% {
      box-shadow: 0 0 0 var(--effect-pulse-size, 0.375rem) transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  .effect {
    display: block;
    overflow: var(--effect-overflow, hidden);
    border-radius: inherit;
  }

  .effect_type_pulse {
    opacity: var(--effect-pulse-opacity, 0.5);
    color: var(--effect-pulse-color, inherit);
  }

  .effect_type_ripple {
    color: var(--effect-ripple-color, inherit);

    --base-effect-ripple-size: var(--effect-ripple-size, 4rem);
    --base-effect-ripple-offset: calc(var(--base-effect-ripple-size) / 2 * -1);
  }

  .effect_type_ripple:before {
    content: "";
    display: block;
    position: absolute;
    inset-block-start: var(--effect-y, 0);
    inset-inline-start: var(--effect-x, 0);
    width: var(--base-effect-ripple-size);
    height: var(--base-effect-ripple-size);
    background: currentColor;
    border-radius: var(--effect-ripple-border-radius, 100%);
    margin-block-start: var(--base-effect-ripple-offset);
    margin-inline-start: var(--base-effect-ripple-offset);
    pointer-events: none;
    transform: scale(0);
  }

  .effect_type_ripple.effect_pressed:before {
    animation: var(--effect-ripple-animation, ProximaRippleAnimation);
    animation-timing-function: var(--effect-ripple-animation-timing, cubic-bezier(0.61, 1, 0.88, 1));
    animation-duration: var(--effect-ripple-animation-duration, 500ms);
  }

  .effect_type_pulse.effect_pressed {
    animation: var(--effect-pulse-animation, ProximaPulseAnimation);
    animation-timing-function: var(--effect-pulse-animation-timing, cubic-bezier(0.22, 1, 0.36, 1));
    animation-duration: var(--effect-pulse-animation-duration, 900ms);
  }
}
</style>

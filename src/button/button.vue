<template>
  <component
    :is="tag"
    ref="el"
    v-bind="attributes"
    class="button"
    :class="modifiers"
    data-ghost-item
  >
    <slot name="prepend" v-bind="slotProps" />
    <slot name="icon" v-bind="slotProps">
      <component
        :is="icon"
        v-if="icon"
        v-bind="iconProps"
        :class="`button__icon button__icon_${iconPosition}`"
      />
    </slot>
    <slot name="text" v-bind="slotProps">
      <span
        v-if="text"
        v-html="text"
        class="button__text"
        :class="{ 'visually-hidden': textVisuallyHidden }"
        :data-ghost-text="textVisuallyHidden ? undefined : true"
      />
    </slot>
    <ProximaEffect
      v-if="hasEffect && !disabled"
      :type="effect"
      class="button__effect"
    />
    <slot v-bind="slotProps" />
  </component>
</template>

<script setup lang="ts">
import { ref, unref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import ProximaEffect from '@/effect/effect.vue';

import type {
  ProximaSize,
  ProximaRound,
  ProximaShadow,
  ProximaDynamicComponent,
  ProximaDynamicProps,
  ProximaClickEffect,
} from '../types.d';

export interface ProximaButtonProps {
  text?: string
  href?: string
  icon?: ProximaDynamicComponent
  iconProps?: ProximaDynamicProps
  iconPosition?: 'before' | 'after'
  textVisuallyHidden?: boolean
  disabled?: boolean
  width?: 'auto' | 'max' | 'sym'
  view?: 'plain' | 'text' | 'outline'
  size?: ProximaSize
  round?: ProximaRound
  shadow?: ProximaShadow | 'wide'
  effect?: ProximaClickEffect
  theme?: string
}

const props = withDefaults(defineProps<ProximaButtonProps>(), {
  text: '',
  href: '',
  icon: '',
  iconPosition: 'before',
  textVisuallyHidden: false,
  disabled: false,
  width: 'auto',
  view: () => getDefaultProp('view', 'plain') as 'plain',
  size: () => getDefaultProp('size', 'normal') as 'normal',
  round: () => getDefaultProp('round', 'soft') as 'soft',
  shadow: () => getDefaultProp('shadow', 'none') as 'none',
  effect: () => getDefaultProp('effect', 'none') as 'none',
  theme: () => getDefaultProp('theme', '') as '',
});

const isInternalLink = computed(() =>
  !(/^(?:https?:)?\/\//i.test(props.href) ||
  props.href.startsWith('#') ||
  props.href.startsWith('tel:') ||
  props.href.startsWith('mailto:')
));

const tag = computed(() => props.href ? (unref(isInternalLink) ? RouterLink : 'a') : 'button');

const isButton = computed(() => unref(tag) === 'button');
const hasEffect = computed(() => Boolean(props.effect && props.effect !== 'none'));

const modifiers = computed(() => ({
  [`button_theme_${props.theme}`]: Boolean(props.theme),
  [`button_view_${props.view}`]: Boolean(props.view),
  [`button_size_${props.size}`]: Boolean(props.size),
  [`button_shadow_${props.shadow}`]: Boolean(props.shadow),
  [`button_round_${props.round}`]: Boolean(props.round),
  [`button_width_${props.width}`]: Boolean(props.width),
  [`button_effect_${props.effect}`]: Boolean(props.effect),
  button_has_effect: unref(hasEffect),
  button_disabled: props.disabled,
  button_enabled: !props.disabled,
  button_external_link: !unref(isInternalLink),
}));

const attributes = computed(() => ({
  type: unref(isButton) ? 'button' : undefined,
  disabled: unref(isButton) && props.disabled ? true : undefined,
  tabindex: !unref(isButton) && props.disabled ? '-1' : undefined,
  'aria-disabled': !unref(isButton) && props.disabled ? 'true' : undefined,
  [unref(isInternalLink) ? 'to' : 'href']: !unref(isButton) && !props.disabled
    ? props.href : undefined,
}));


// Focus

const el = ref<HTMLButtonElement | null>(null);

const focus = () => unref(el)?.focus?.();


// Slot props

const slotProps = computed(() => ({
  text: props.text,
  href: props.href,
  textVisuallyHidden: props.textVisuallyHidden,
  isInternalLink: unref(isInternalLink),
  isButton: unref(isButton),
  hasEffect: unref(hasEffect),
  disabled: props.disabled,
  focus,
}));


// Expose

defineExpose({
  focus,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaButton';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/button) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/button/button.vue)
 *
 * @example
 * ```html
 * <ProximaButton
 *   text="Click me"
 *   view="outline"
 *   size="xl"
 * />
 * ```
 *
 * @prop text `string` — Button text (default `''`)
 * @prop href `string` — Will turn the button into a link (default `''`)
 * @prop icon `object` — Icon component (default `''`)
 * @prop iconProps `object` — Icon props (default `{}`)
 * @prop iconPosition `string` — Icon position: `before` / `after` (default `before`)
 * @prop textVisuallyHidden `boolean` — allowing text to be exposed only to assistive technologies (default `false`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop width `string` — Button width: `auto` / `max` / `sym` (default `auto`)
 * @prop view `string` — Button view: `plain` / `text` / `outline` (default `plain`)
 * @prop size `string` — Button size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Button radius: `soft` / `full` / `none` (default `'soft'`)
 * @prop shadow `string` — Button shadow: `soft` / `wide` / `none` (default `none`)
 * @prop effect `string` — Click effect: `none` / `ripple` / `pulse` (default `none`)
 * @prop theme `string` — Button theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.button {

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--button-gap, 0.375em);
    vertical-align: middle;
    font-family: var(--button-font-family, inherit);
    font-size: var(--base-button-font-size);
    font-weight: var(--button-font-weight, 400);
    text-decoration: none;
    text-align: center;
    text-transform: var(--button-text-transform, none);
    letter-spacing: var(--button-letter-spacing, 0.0125em);
    line-height: var(--button-line-height, 1);
    width: var(--button-width, auto);
    height: var(--base-button-size);
    max-width: 100%;
    padding-inline: var(--button-padding-x, calc(
      var(--base-button-size) / var(--button-padding-x-divider, 2.25)
    ));
    padding-block: var(--button-padding-y, 0);
    background: var(--base-button-background);
    color: var(--base-button-color);
    user-select: none;
    touch-action: manipulation;
    cursor: pointer;
    appearance: button;
    outline: none;
    border: 0;
    border-radius: var(--button-border-radius, calc(
      var(--base-button-size) / var(--button-border-radius-divider, 8)
    ));
    transition: var(--button-transition,
      color 200ms,
      background-color 200ms,
      border-color 200ms
    );

    --base-button-size: var(--button-size, 2.75rem);
    --base-button-font-size: var(--button-font-size, 1rem);

    --base-button-background-opacity: var(--button-transparent-background-opacity, 0);
    --base-button-box-shadow-opacity: var(--button-box-shadow-opacity, 0.2);
    --base-button-border-opacity: var(--button-border-opacity, 0.5);
    --base-button-inert-color: var(--button-theme-color, #0071e3);
    --base-button-theme-color: var(--base-button-inert-color);
  }

  /*
    Effect
  */

  .button_has_effect {
    --button-has-effect: 1;
    --effect-ripple-size: var(--button-effect-ripple-size, calc(var(--base-button-size) * 4));
    --effect-pulse-size: calc(var(--base-button-size) / 6);
    --effect-pulse-color: var(--button-effect-pulse-color, var(--base-button-theme-color));

    position: relative;
  }

  .button__effect {
    position: absolute;
    inset: 0;
    z-index: var(--button-effect-z-index, 0);
  }

  /*
    Sizes
  */

  .button_size_xxs {
    --base-button-size: var(--button-size-xxs, 1.875rem);
    --base-button-font-size: var(--button-font-size-xxs, 0.75rem);
  }

  .button_size_xs {
    --base-button-size: var(--button-size-xs, 2.25rem);
    --base-button-font-size: var(--button-font-size-xs, 0.875rem);
  }

  .button_size_s {
    --base-button-size: var(--button-size-s, 2.5rem);
    --base-button-font-size: var(--button-font-size-s, 0.875rem);
  }

  .button_size_m {
    --base-button-size: var(--button-size-m, 3rem);
    --base-button-font-size: var(--button-font-size-m, 1rem);
  }

  .button_size_l {
    --base-button-size: var(--button-size-l, 3.375rem);
    --base-button-font-size: var(--button-font-size-l, 1.125rem);
  }

  .button_size_xl {
    --base-button-size: var(--button-size-xl, 3.75rem);
    --base-button-font-size: var(--button-font-size-xl, 1.25rem);
  }

  .button_size_xxl {
    --base-button-size: var(--button-size-xxl, 4.125rem);
    --base-button-font-size: var(--button-font-size-xxl, 1.375rem);
  }

  /*
    Round
  */

  .button_round_none {
    border-radius: 0;
  }

  .button_round_full {
    --button-is-full-round: 1;
    border-radius: 100rem;
  }

  /*
    Width
  */

  .button_width_max {
    display: flex;
    width: 100%;
  }

  .button_width_sym {
    width: var(--base-button-size);
    height: var(--base-button-size);
    padding: var(--button-width-sym-padding, 0);
  }

  /*
    Shadow
  */

  .button_shadow_soft {
    box-shadow:
      var(--button-box-shadow-soft-size, 0 0.25em 0.25em 0)
      var(--button-box-shadow-soft-color, var(--button-box-shadow-color, var(--base-button-box-shadow-color-mix, rgba(0, 0, 0, 0.15))));
  }

  .button_shadow_wide {
    box-shadow:
      var(--button-box-shadow-wide-size, 0 0.5em 1em 0)
      var(--button-box-shadow-wide-color, var(--button-box-shadow-color, var(--base-button-box-shadow-color-mix, rgba(0, 0, 0, 0.15))));
  }

  /*
    View
  */

  .button_enabled {
    --button-is-enabled: 1;
  }

  .button_view_plain {
    --button-is-view-plain: 1;

    --base-button-background: var(--base-button-theme-color);
    --base-button-color: var(--button-color, #fff);
  }

  .button_view_text {
    --button-is-view-text: 1;
  }

  .button_view_outline {
    --button-is-view-outline: 1;

    --base-border-style: var(--button-border-style, solid);
    --base-border-color: var(--button-border-color, var(--base-button-border-color-mix, var(--base-button-theme-color)));

    border-width: var(--button-border-width, 1px);
    border-style: var(--base-border-style);
    border-color: var(--base-border-color);
  }

  .button_view_text,
  .button_view_outline {
    --base-button-background: var(--button-transparent-background, var(--base-button-transparent-background-mix, transparent));
    --base-button-color: var(--base-button-theme-color);
  }

  /*
    Active
  */

  .button_enabled:active {
    --button-is-active: 1;
  }

  /*
    Focus
  */

  .button_enabled:focus {
    --button-is-focus: 1;

    --base-button-theme-color: var(--button-focus-theme-color, var(--base-button-inert-color));

    border-style: var(--button-focus-border-style, var(--base-border-style));
    outline-offset: var(--button-highlight-offset, var(--app-highlight-offset, 0.0625rem));
    outline-style: var(--button-highlight-style, var(--app-highlight-style, solid));
    outline-width: var(--button-highlight-size, var(--app-highlight-size, 0.1875rem));
    outline-color: var(--button-highlight-color, var(--app-highlight-color, var(--base-button-highlight-color-mix, rgba(0, 0, 0, 0.1))));
  }

  .button_effect_pulse:hover {
    outline-color: transparent;
  }

  .button_enabled[autofocus]:focus,
  .button_enabled:focus-visible {
    outline-offset: var(--button-outline-offset, var(--app-outline-offset, 0.1875rem));
    outline:
      var(--button-outline-size, var(--app-outline-size, 0.25rem))
      var(--button-outline-style, var(--app-outline-style, solid))
      var(--button-outline-color, var(--app-outline-color, rgba(0, 61, 255, 0.7)));
  }

  /*
    Hover
  */

  @media (hover: hover) {
    .button_enabled:hover {
      --button-is-hover: 1;

      --base-button-theme-color:
        var(--button-hover-theme-color, var(--base-button-hover-theme-color-mix, var(--base-button-inert-color)));

      --base-button-background-opacity:
        var(--button-hover-transparent-background-opacity, 0.08);

      --base-button-box-shadow-opacity: var(--button-hover-box-shadow-opacity, 0.3);
      --base-button-border-opacity: var(--button-hover-border-opacity, 1);

      border-style: var(--button-hover-border-style, var(--base-border-style));
      border-color: var(--button-hover-border-color, var(--base-border-color));
    }
    .button_enabled.button_view_plain:hover {
      color: var(--button-hover-color, var(--base-button-color));
    }
  }

  /*
    Disabled
  */

  .button_disabled {
    --button-is-disabled: 1;

    --base-button-theme-color: var(--button-disabled-theme-color, var(--base-button-inert-color));

    opacity: var(--button-disabled-opacity, var(--app-disabled-opacity, 0.6));
    cursor: not-allowed;
    box-shadow: none;
  }

  /*
    Color mix
  */

  @supports (outline-color: color-mix(in srgb, red, blue)) {
    .button {
      --base-button-highlight-color-mix: color-mix(in srgb,
        var(--base-button-inert-color), transparent calc(
          100% - (var(--app-highlight-opacity, 0.2) * 100%)
        )
      );
    }
  }

  @supports (color: color-mix(in srgb, red, blue)) {
    .button {
      --base-button-hover-theme-color-mix: color-mix(in srgb,
        var(--base-button-inert-color), var(--button-hover-mix-color, #000) calc(
          var(--button-hover-mix-opacity, 0.12) * 100%
        )
      );
      --base-button-border-color-mix: color-mix(in srgb,
        var(--base-button-theme-color), transparent calc(
          100% - (var(--base-button-border-opacity) * 100%)
        )
      );
      --base-button-transparent-background-mix: color-mix(in srgb,
        var(--base-button-theme-color), transparent calc(
          100% - (var(--base-button-background-opacity) * 100%)
        )
      );
      --base-button-box-shadow-color-mix: color-mix(in srgb,
        var(--base-button-theme-color), transparent calc(
          100% - (var(--base-button-box-shadow-opacity) * 100%)
        )
      );
    }
  }
}

@layer proxima {
  .button__icon {
    flex-shrink: 0;
    --icon-size: var(--button-icon-size, 1em);
  }
  .button__icon_before {
    order: 0;
  }
  .button__icon_after {
    order: 1;
  }
}
</style>

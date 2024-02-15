<template>
  <div
    class="popup"
    :class="modifiers"
    :style="popupStyle"
  >
    <div
      ref="content"
      class="popup__content"
      :class="{
        'pretty-scrollbar': scrollbar !== 'native',
        'pretty-scrollbar_hover': scrollbar === 'pretty-hover',
      }"
    >
      <slot />
      <div class="popup__footer">
        <slot name="footer" />
      </div>
    </div>
    <div v-if="hasArrow" class="popup__arrow" />
  </div>
</template>

<script setup lang="ts">
import { ref, unref, computed, onBeforeMount } from 'vue';
import { checkRTL } from '@/utils/platform';
import type { ProximaScrollbar } from '../types.d';

export type PopupStyle = Record<string, string>

export interface ProximaPopupProps {
  hasArrow?: boolean
  alignX?: 'start' | 'end'
  alignY?: 'above' | 'under'
  scrollbar?: ProximaScrollbar
  bindTo?: string | HTMLElement | null
}

const props = withDefaults(defineProps<ProximaPopupProps>(), {
  hasArrow: true,
  alignX: 'start',
  alignY: 'under',
  scrollbar: () => getDefaultProp('scrollbar', 'pretty') as 'pretty',
  bindTo: null,
});

const popupStyle = ref<PopupStyle>({});
const setStyle = (style: PopupStyle) => (popupStyle.value = style);

const modifiers = computed(() => ({
  popup_has_arrow: props.hasArrow,
  [`popup_${props.alignX}`]: Boolean(props.alignX),
  [`popup_${props.alignY}`]: Boolean(props.alignY),
}));

const setPosition = () => {
  const anchor = typeof props.bindTo === 'string'
    ? document.querySelector(props.bindTo)
    : props.bindTo;

  if (!anchor) {
    console.warn(`Anchor element "${props.bindTo}" not found!`);
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const style: PopupStyle = {};
  const isRtl = checkRTL();

  const right = document.documentElement.clientWidth - rect.right;
  const bottom = document.documentElement.clientHeight - rect.bottom;

  const { offsetParent, offsetLeft = 0, offsetWidth = 0 } = anchor as HTMLElement;

  if (offsetParent) {
    const offsetRight = offsetParent.clientWidth - (offsetLeft + offsetWidth);
    style['--popup-anchor-offset'] = `${isRtl ? offsetRight : offsetLeft}px`;
  }

  style['--popup-anchor-width'] = `${rect.width}px`;
  style['--popup-anchor-height'] = `${rect.height}px`;
  style['--popup-anchor-top'] = `${rect.top}px`;
  style['--popup-anchor-right'] = `${right}px`;
  style['--popup-anchor-bottom'] = `${bottom}px`;
  style['--popup-anchor-left'] = `${rect.left}px`;
  style['--popup-anchor-start'] = `${isRtl ? right : rect.left}px`;
  style['--popup-anchor-end'] = `${isRtl ? rect.left : right}px`;

  setStyle(style);
};

const content = ref<HTMLElement | null>(null);

const scrollTop = () => {
  const el = unref(content);
  el?.scrollTo(0, 0);
};

onBeforeMount(setPosition);

defineExpose({
  setPosition,
  scrollTop,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaPopup';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/popup) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/popup/popup.vue)
 *
 * ```html
 * <ProximaPopup
 *   v-if="isPopupVisible"
 *   align-y="above"
 *   align-x="end"
 *   bind-to=".myclass"
 * >
 *   content
 * </ProximaPopup>
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaPopup from 'proxima-vue/popup';
 *
 * const isPopupVisible = ref(false);
 * const showPopup = () => (isPopupVisible.value = true);
 * const hidePopup = () => (isPopupVisible.value = false);
 * ```
 *
 * @prop hasArrow `boolean` — Adds arrow (default `true`)
 * @prop alignX `string` — Horizontal align : `start` or `end` (default `start`)
 * @prop alignY `string` — Vertical align : `under` or `above` (default `under`)
 * @prop scrollbar `string` — Scrollbar type: `pretty` / `pretty-hover` / `native` (default `pretty`)
 * @prop bindTo `string` or `HTMLElement` — Selector or HTMLElement (default `null`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.popup {

  @keyframes ProximaPopupAnimation {
    from {
      transform: translate3d(0, var(--popup-animation-translate), 0);
      opacity: 0;
    }
    to {
      transform: translateZ(0);
      opacity: 1;
    }
  }

  .popup {
    display: flex;
    position: absolute;
    width: var(--popup-width, 80rem);
    animation: var(--popup-animation, ProximaPopupAnimation 200ms ease);
    z-index: var(--popup-z-index, 30);

    --base-popup-background: var(--popup-background, #fff);
    --base-popup-border-radius: var(--popup-border-radius, 0.375em);

    --popup-animation-translate: calc(0.5rem * var(--popup-direction-y, 1));
  }

  .popup_has_arrow {
    --popup-has-arrow: 1;
  }

  .popup_above {
    --popup-is-above: 1;
    --popup-direction-y: 1;

    inset-block-end: 100%;
    flex-direction: column;
  }

  .popup_under {
    --popup-is-under: 1;
    --popup-direction-y: -1;

    inset-block-start: 100%;
    flex-direction: column-reverse;
  }

  .popup_start {
    --popup-to-start: 1;
    --popup-direction-x: -1;

    inset-inline-start: 0;
    justify-content: flex-start;
    align-items: flex-start;
    max-width: calc(
      var(--popup-anchor-end, 0) + var(--popup-anchor-width, 0) - 0.5rem
    );
  }

  .popup_end {
    --popup-to-end: 1;
    --popup-direction-x: 1;

    inset-inline-end: calc(100% - var(--popup-anchor-width));
    justify-content: flex-end;
    align-items: flex-end;
    max-width: calc(
      var(--popup-anchor-start, 0) + var(--popup-anchor-width, 0) - 0.5rem
    );
  }

  /*
    Content
  */

  .popup__content {
    max-width: 100%;
    min-width: var(--popup-min-width, 12rem);
    max-height: var(--popup-max-height, 16em);
    padding: var(--popup-padding, 0);
    font-size: var(--popup-font-size, 1rem);
    background: var(--base-popup-background);
    color: var(--popup-color, inherit);
    scroll-padding-block-start: var(--popup-scroll-padding-y-start, 0);
    scroll-padding-block-end: var(--popup-scroll-padding-y-end, 0);
    overflow-x: var(--popup-overflow-x, visible);
    overflow-y: var(--popup-overflow-y, visible);
    overscroll-behavior-y: var(--popup-overscroll-behavior-y, contain);
    border-inline-style: var(--popup-border-inline-style, solid);
    border-inline-color: var(--popup-border-inline-color, currentColor);
    border-inline-width:
      calc(var(--popup-border-inline-width, 0px) * var(--popup-to-end, 0))
      calc(var(--popup-border-inline-width, 0px) * var(--popup-to-start, 0));
    border-radius: var(--base-popup-border-radius);
    box-shadow: var(--popup-box-shadow, 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15));
  }

  .popup__content:empty,
  .popup__content:empty ~ .popup__arrow {
    visibility: hidden;
  }

  /*
    Footer
  */

  .popup__footer {
    position: sticky;
    inset-block-end: 0;
    max-width: var(--popup-footer-max-width, 100%);
    font-size: max(var(--popup-footer-font-size, 0.875em), 0.75rem);
    text-align: center;
    background: inherit;
    padding-inline: var(--popup-footer-padding-x);
    padding-block: var(--popup-footer-padding-y);
    border-block-start: var(--popup-footer-border-block-start, none);
    border-end-start-radius: inherit;
    border-end-end-radius: inherit;
    margin-block-start: var(--popup-footer-margin-y-start, 0);
    z-index: var(--popup-footer-z-index, 3);
  }

  .popup__footer:first-child {
    border-color: transparent;
    background: none;
  }

  .popup__footer:empty {
    display: none;
  }

  /*
    Arrow
  */

  .popup__arrow {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border: solid transparent;
    border-block-color: var(--popup-arrow-color, var(--base-popup-background));
    border-inline-width: var(--popup-arrow-border-inline, 0.625rem);
    border-block-start-width: calc(
      var(--popup-arrow-border-block, 0.5rem) * var(--popup-is-above, 0)
    );
    border-block-end-width: calc(
      var(--popup-arrow-border-block, 0.5rem) * var(--popup-is-under, 0)
    );
    margin-block-start: calc(
      var(--popup-arrow-margin-block, 0.125rem) * -1 * var(--popup-is-above, 0)
    );
    margin-block-end: calc(
      var(--popup-arrow-margin-block, 0.125rem) * -1 * var(--popup-is-under, 0)
    );
    margin-inline: var(--popup-arrow-margin-inline, 0.25rem);
    z-index: var(--popup-arrow-z-index, 0);
  }

  .popup_start.popup_under {
    --popup-border-start-start-radius: var(--popup-arrow-border-inline, 0.625rem);
  }

  .popup_start.popup_above {
    --popup-border-end-start-radius: var(--popup-arrow-border-inline, 0.625rem);
  }

  .popup_end.popup_under {
    --popup-border-start-end-radius: var(--popup-arrow-border-inline, 0.625rem);
  }

  .popup_end.popup_above {
    --popup-border-end-end-radius: var(--popup-arrow-border-inline, 0.625rem);
  }

  .popup_has_arrow .popup__content {
    border-start-start-radius: var(--popup-border-start-start-radius, var(--base-popup-border-radius));
    border-start-end-radius: var(--popup-border-start-end-radius, var(--base-popup-border-radius));
    border-end-start-radius: var(--popup-border-end-start-radius, var(--base-popup-border-radius));
    border-end-end-radius: var(--popup-border-end-end-radius, var(--base-popup-border-radius));
  }
}
</style>

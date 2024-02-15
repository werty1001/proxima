<template>
  <dialog
    ref="el"
    class="modal"
    :class="modifiers"
    v-bind="a11yAttrs"
    @close="onModalClose"
    @cancel="onModalCancel"
  >
    <div class="modal__inner" @click="onModalClick">
      <article class="modal__dialog">
        <header v-if="hasHeader" class="modal__header">
          <h6
            v-if="title"
            v-text="title"
            class="title modal__title"
          />
          <slot name="header" v-bind="slotProps" />
        </header>
        <div v-if="hasContent" class="modal__content">
          <slot v-bind="slotProps" />
        </div>
        <footer
          v-if="hasFooter"
          class="modal__footer"
          :class="{
            [`modal__footer_to_${footerAlign}`]: Boolean(footerAlign),
          }"
        >
          <slot name="footer" v-bind="slotProps" />
        </footer>
        <aside v-if="hasAside" class="modal__aside">
          <div v-if="hasActions" class="modal__actions">
            <ProximaButtonClose
              v-if="hasCloseButton"
              width="sym"
              view="outline"
              round="full"
              size="xxs"
              v-bind="closeButtonProps"
              class="modal__close"
              :aria-label="closeLabel"
              @click="hideModal"
            />
            <slot name="actions" v-bind="slotProps" />
          </div>
          <slot name="aside" v-bind="slotProps" />
        </aside>
        <slot name="dialog" v-bind="slotProps" />
      </article>
      <slot name="inner" v-bind="slotProps" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, unref, computed, onBeforeUnmount, useSlots } from 'vue';
import { lockScrollbar, unlockScrollbar } from '@/utils/scrollbar';
import ProximaButtonClose from '@/button/close.vue';
import usePolyfill from '@/modal/usePolyfill';
import useLocale from '@/composables/locale';

import type { ProximaAlign, ProximaDynamicProps } from '../types.d';

export interface ProximaModalProps {
  title?: string
  shouldCloseOnEsc?: boolean
  shouldCloseOnBackdrop?: boolean
  shouldLockScrollbar?: boolean
  stickyHeader?: boolean
  stickyFooter?: boolean
  stickyActions?: boolean
  hasCloseButton?: boolean
  closeAriaLabel?: string
  closeButtonProps?: ProximaDynamicProps
  footerAlign?: ProximaAlign
  view?: 'plain' | 'fullscreen'
  theme?: string
}

const props = withDefaults(defineProps<ProximaModalProps>(), {
  title: '',
  shouldCloseOnEsc: () => getDefaultProp('shouldCloseOnEsc', true) as true,
  shouldCloseOnBackdrop: () => getDefaultProp('shouldCloseOnBackdrop', true) as true,
  shouldLockScrollbar: () => getDefaultProp('shouldLockScrollbar', true) as true,
  stickyHeader: () => getDefaultProp('stickyHeader', false) as false,
  stickyFooter: () => getDefaultProp('stickyFooter', false) as false,
  stickyActions: () => getDefaultProp('stickyActions', false) as false,
  hasCloseButton: () => getDefaultProp('hasCloseButton', true) as true,
  closeAriaLabel: () => getDefaultProp('closeAriaLabel', '') as '',
  footerAlign: () => getDefaultProp('footerAlign', 'end') as 'end',
  view: () => getDefaultProp('view', 'plain') as 'plain',
  theme: () => getDefaultProp('theme', '') as '',
});

const slots = useSlots();

const emit = defineEmits<{
  'open': []
  'close': [event: Event]
  'cancel': [event: Event]
  'before:open': []
  'before:close': []
}>();

// Locales

const { getLocaleToken } = useLocale();

const closeLabel =
  computed(() => getLocaleToken(props.closeAriaLabel || 'modalCloseAriaLabel'));

const hasHeader = computed(() => Boolean(slots.header || props.title));
const hasContent = computed(() => Boolean(slots.default));
const hasFooter = computed(() => Boolean(slots.footer));
const hasActions = computed(() => Boolean(props.hasCloseButton || slots.actions));
const hasAside = computed(() => Boolean(unref(hasActions) || slots.aside));


// Polyfill

const el = ref<HTMLDialogElement | null>(null);
const isOpen = ref(false);

const { isNativeDialog, a11yAttrs } = usePolyfill(el, isOpen);

const modifiers = computed(() => ({
  modal_inactive_backdrop: !props.shouldCloseOnBackdrop,
  modal_ignore_esc: !props.shouldCloseOnEsc,
  modal_not_native: !unref(isNativeDialog),
  modal_opened: unref(isOpen),
  modal_has_header: unref(hasHeader),
  modal_has_footer: unref(hasFooter),
  modal_has_aside: unref(hasAside),
  modal_sticky_header: props.stickyHeader,
  modal_sticky_footer: props.stickyFooter,
  modal_sticky_actions: props.stickyActions,
  [`modal_view_${props.view}`]: Boolean(props.view),
  [`modal_theme_${props.theme}`]: Boolean(props.theme),
}));

const showModal = () => {
  emit('before:open');
  unref(el)?.showModal();
  onModalOpen();
};

const hideModal = () => {
  emit('before:close');
  unref(el)?.close();
};

const onModalOpen = () => {
  isOpen.value = true;
  if (props.shouldLockScrollbar) {
    lockScrollbar?.();
  }
  scrollTop();
  emit('open');
};

const onModalClose = (event: Event) => {
  isOpen.value = false;
  if (props.shouldLockScrollbar) {
    unlockScrollbar?.();
  }
  emit('close', event);
};

const onModalCancel = (event: Event) => {
  if (!props.shouldCloseOnEsc) {
    event.preventDefault();
  }
  emit('cancel', event);
};

const onModalClick = (event: Event) => {
  const isSelfClick = event.target === event.currentTarget;
  if (isSelfClick && props.shouldCloseOnBackdrop) {
    hideModal();
  }
};

const scrollTop = () => {
  const modal = unref(el);
  if (modal) {
    modal.scrollTop = 0;
  }
};

const checkOpen = () => unref(isOpen);

onBeforeUnmount(hideModal);


// Slot props

const slotProps = computed(() => ({
  title: props.title,
  closeAriaLabel: unref(closeLabel),
  isOpen: unref(isOpen),
  isNativeDialog: unref(isNativeDialog),
  hasHeader: unref(hasHeader),
  hasContent: unref(hasContent),
  hasFooter: unref(hasFooter),
  hasActions: unref(hasActions),
  hasAside: unref(hasAside),
  showModal,
  hideModal,
  scrollTop,
}));


// Expose

defineExpose({
  showModal,
  hideModal,
  scrollTop,
  checkOpen,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaModal';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/modal) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/modal/modal.vue)
 *
 * @example
 * ```html
 * <ProximaModal ref="modal">
 *   Content
 * </ProximaModal>
 * ```
 * ```js
 * import { ref, unref } from 'vue';
 * import ProximaModal from 'proxima-vue/modal';
 *
 * const modal = ref({});
 * const showModal = () => unref(modal).showModal();
 * const hideModal = () => unref(modal).hideModal();
 * ```
 *
 * @prop title `string` — Header title (default `''`)
 * @prop shouldCloseOnEsc `boolean` — Close modal on esc key (default `true`)
 * @prop shouldCloseOnBackdrop `boolean` — Close modal on backdrop click (default `true`)
 * @prop shouldLockScrollbar `boolean` — Lock page scrollbar (default `true`)
 * @prop stickyHeader `boolean` — Header will be sticky (default `false`)
 * @prop stickyFooter `boolean` — Footer will be sticky (default `false`)
 * @prop stickyActions `boolean` — Actions will be sticky (default `false`)
 * @prop hasCloseButton `boolean` — Adds close button (default `true`)
 * @prop closeAriaLabel `string` — [aria-label](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) on close button (default `''`, when prop is empty will be used locale value)
 * @prop closeButtonProps `object` — Close button props (default `{}`)
 * @prop footerAlign `string` — Horizontal align for footer items: `start` / `center` / `end` (default `end`)
 * @prop view `string` — Modal view: `plain` / `fullscreen` (default `plain`)
 * @prop theme `string` — Modal theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.modal {

  @keyframes ProximaModalAnimation {
    from {
      transform: translate3d(
        var(--modal-dialog-animation-translate-x, 0),
        var(--modal-dialog-animation-translate-y, 1rem),
      0);
      opacity: 0;
    }
    to {
      transform: translateZ(0);
      opacity: 1;
    }
  }

  .modal {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    background: var(--modal-backdrop, rgba(0, 0, 0, 0.5));
    color: inherit;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0;
    margin: 0;
    border: 0;
    box-sizing: border-box;
    user-select: none;

    --base-modal-dialog-padding-y: var(--modal-dialog-padding-y, 1.375rem);
    --base-modal-dialog-padding-x: var(--modal-dialog-padding-x, 1.625rem);
  }

  .modal *,
  .modal *:before,
  .modal *:after {
    box-sizing: inherit;
  }

  .modal::backdrop {
    display: none;
  }

  .modal_not_native {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--modal-z-index, 999);
    outline: none;
  }

  .modal_not_native[data-open="true"] {
    display: block;
  }

  .modal__inner {
    display: flex;
    width: 100%;
    min-height: 100%;
    padding-inline: var(--modal-inner-padding-x, 0.5rem);
    padding-block: var(--modal-inner-padding-y, 0.5rem);
  }

  @media (orientation: landscape) {
    .modal__inner {
      padding-block: var(--modal-inner-padding-y, 2rem calc(10vh + 2rem));
    }
  }


  /*
    Sticky
  */

  .modal_sticky_header {
    --modal-header-position: sticky;
    --modal-header-inset-block-start: 0;
    --modal-header-z-index: 10;
  }

  .modal_sticky_footer {
    --modal-footer-position: sticky;
    --modal-footer-inset-block-end: 0;
    --modal-footer-z-index: 10;
  }

  .modal_sticky_actions {
    --modal-actions-position: sticky;
    --modal-actions-inset-block-start: var(--modal-aside-padding-y, 1rem);
  }


  /*
    Dialog
  */

  .modal__dialog {
    position: relative;
    width: var(--modal-dialog-width, 30rem);
    max-width: 100%;
    background: var(--modal-dialog-background, #fff);
    color: var(--modal-dialog-color, inherit);
    padding: 0;
    border: var(--modal-dialog-border, none);
    box-shadow: var(--modal-dialog-box-shadow, 0 0.5rem 1rem rgba(0, 0, 0, 0.1));
    border-radius: var(--modal-dialog-border-radius, 0.5em);
    user-select: text;
    margin-inline: var(--modal-dialog-margin-x, auto);
    margin-block: var(--modal-dialog-margin-y, auto);
    margin-block-start: var(--modal-dialog-margin-y-start, auto);
    animation: var(--modal-dialog-animation, ProximaModalAnimation 300ms ease);
  }


  /*
    Fullscreen
  */

  .modal_view_fullscreen .modal__inner {
    padding: 0;
  }

  .modal_view_fullscreen .modal__dialog {
    width: 100%;
    min-height: var(--app-viewport-height, min(100svh, 100vh));
    border-radius: 0;
    box-shadow: none;
    margin: 0;

    --modal-dialog-animation-translate-x:
      var(--modal-view-fullscreen-dialog-animation-translate-x, -2rem);
    --modal-dialog-animation-translate-y: 0;
  }


  /*
    Dialog inner
  */

  .modal__header {
    position: var(--modal-header-position, static);
    inset: var(--modal-header-inset-block-start, auto);
    display: var(--modal-header-display, flex);
    align-items: var(--modal-header-align-items, center);
    justify-content: var(--modal-header-justify-content, start);
    gap: var(--modal-header-gap, 1em);
    background: var(--modal-header-background, inherit);
    border-block-end: var(--modal-header-border-bottom, none);
    margin-block-end: var(--modal-header-margin-y-end, 0em);
    padding-inline: var(--modal-header-padding-x, var(--base-modal-dialog-padding-x));
    padding-block: var(--modal-header-padding-y, var(--base-modal-dialog-padding-y));
    border-top-right-radius: var(--modal-header-border-top-right-radius, inherit);
    border-top-left-radius: var(--modal-header-border-top-left-radius, inherit);
    -webkit-backdrop-filter: var(--modal-header-backdrop-filter, none);
    backdrop-filter: var(--modal-header-backdrop-filter, none);
    z-index: var(--modal-header-z-index, auto);
  }

  .modal__content {
    display: block;
    background: var(--modal-content-background, none);
    padding-inline: var(--modal-content-padding-x, var(--base-modal-dialog-padding-x));
    padding-block: var(--modal-content-padding-y, var(--base-modal-dialog-padding-x));
  }

  .modal_has_aside .modal__header,
  .modal_has_aside .modal__content {
    padding-inline-end: var(--modal-dialog-padding-from-aside, calc(
      var(--base-modal-dialog-padding-x) + var(--modal-aside-width, 3em)
    ));
  }

  .modal_has_header .modal__content {
    padding-block-start: 0;
    padding-inline-end: var(--modal-content-padding-x, var(--base-modal-dialog-padding-x));
  }

  .modal_has_footer .modal__content {
    padding-block-end: 0;
  }

  .modal__footer {
    position: var(--modal-footer-position, static);
    inset: var(--modal-footer-inset-block-end, auto);
    display: var(--modal-footer-display, flex);
    align-items: var(--modal-footer-align-items, center);
    justify-content: var(--modal-footer-justify-content, normal);
    gap: var(--modal-footer-gap, 0.5em);
    background: var(--modal-footer-background, inherit);
    border-block-start: var(--modal-footer-border-top, none);
    margin-block-start: var(--modal-footer-margin-y-start, 0em);
    padding-inline: var(--modal-footer-padding-x, var(--base-modal-dialog-padding-x));
    padding-block: var(--modal-footer-padding-y, calc(var(--base-modal-dialog-padding-y) * 0.75));
    border-bottom-right-radius: var(--modal-footer-border-bottom-right-radius, inherit);
    border-bottom-left-radius: var(--modal-footer-border-bottom-left-radius, inherit);
    -webkit-backdrop-filter: var(--modal-footer-backdrop-filter, none);
    backdrop-filter: var(--modal-footer-backdrop-filter, none);
    z-index: var(--modal-footer-z-index, auto);
  }

  .modal__footer_to_start {
    justify-content: flex-start;
  }

  .modal__footer_to_center {
    justify-content: center;
  }

  .modal__footer_to_end {
    justify-content: flex-end;
  }

  .modal__aside {
    position: var(--modal-aside-position, absolute);
    inset: var(--modal-aside-inset, 0);
    display: var(--modal-aside-display, flex);
    align-items: var(--modal-aside-align-items, flex-start);
    justify-content: var(--modal-aside-justify-content, flex-end);
    width: var(--modal-aside-width, auto);
    height: var(--modal-aside-height, auto);
    padding-inline: var(--modal-aside-padding-x, 1rem);
    padding-block: var(--modal-aside-padding-y, 1rem);
    margin-inline: var(--modal-aside-margin-x, 0);
    margin-block: var(--modal-aside-margin-y, 0);
    pointer-events: var(--modal-aside-pointer-events, none);
    z-index: var(--modal-aside-z-index, 11);
  }

  .modal__actions {
    position: var(--modal-actions-position, static);
    inset: var(--modal-actions-inset-block-start, auto);
    pointer-events: auto;
  }

  @media (prefers-reduced-transparency: reduce) {
    .modal__header,
    .modal__footer {
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
    .modal__header {
      background: var(--modal-header-reduced-transparency-background, inherit);
    }
    .modal__footer {
      background: var(--modal-footer-reduced-transparency-background, inherit);
    }
  }
}

@layer proxima {
  .modal__title {
    font-size: var(--modal-title-font-size, 1.25em);
  }
  .modal__spinner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: var(--modal-spinner-background, var(--modal-dialog-background, #fff));
    z-index: var(--modal-spinner-z-index, 15);
    pointer-events: auto;
    border-radius: inherit;
  }
}
</style>

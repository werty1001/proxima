<template>
  <teleport
    v-for="(item, i) in notifications"
    :key="item.id"
    :to="item.teleport"
    :disabled="!item.teleport"
  >
    <article
      :id="item.id"
      role="alert"
      class="notification"
      :class="getModifiers(item)"
      :data-position="item.position"
      :style="{
        '--notification-position-index': getPositionIndex(item),
      }"
      v-bind="item.attrs"
    >
      <div class="notification__content">
        <slot
          name="notification"
          :notification="item"
          :index="i"
          :hide="() => closeNotificationById(item.id)"
        >
          <div
            v-if="item.icon"
            class="notification__side"
          >
            <component
              :is="item.icon"
              :size="item.isToast ? 'l' : 'xl'"
              view="outline"
              round="full"
              v-bind="item.iconProps"
              class="notification__icon"
            />
          </div>
          <div class="notification__main">
            <b
              v-if="item.title"
              v-html="item.title"
              class="title notification__title"
            />
            <div
              v-if="!item.isToast && item.description"
              v-html="item.description"
              class="text notification__description"
            />
            <div v-if="item.actions.length > 0" class="notification__actions">
              <component
                v-for="(action, i) in item.actions"
                :is="action.is"
                :key="`notification-${item.id}-action-${i}`"
                v-bind="action.props"
                class="notification__action"
              />
            </div>
          </div>
          <ProximaButtonClose
            v-if="item.hasCloseButton"
            view="text"
            width="sym"
            size="xs"
            v-bind="item.closeButtonProps"
            class="notification__close"
            @click="closeNotificationById(item.id)"
          />
        </slot>
      </div>
    </article>
  </teleport>
</template>

<script lang="ts">
import { ref, unref, markRaw, defineComponent } from 'vue';
import ProximaButtonClose from '@/button/close.vue';
import IconImportant from '@/icon/important.vue';
import IconCheck from '@/icon/check.vue';
import IconCross from '@/icon/cross.vue';
import getRandomId from '@/utils/randomId';

import type {
  ProximaDynamicComponent,
  ProximaDynamicProps,
  ProximaDynamicAttrs,
  ProximaDynamicAction,
} from '../types.d';

export interface ProximaNotification {
  id: string
  isToast: boolean
  view: 'plain' | 'toast',
  position: 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'
  theme?: 'error' | 'success' | 'warning'
  title?: string
  description?: string
  teleport?: string
  icon?: ProximaDynamicComponent
  iconProps?: ProximaDynamicProps
  hasCloseButton: boolean
  closeButtonProps?: ProximaDynamicProps
  onClose?: (notification: ProximaNotification) => void
  autoCloseDelay: number
  additionalClass?: string
  attrs?: ProximaDynamicAttrs
  actions: ProximaDynamicAction[]
}

export type ProximaNotificationOptions = string | Partial<ProximaNotification>

enum ProximaNotificationTypes {
  Toast = 'toast',
  Plain = 'plain',
}

enum ProximaNotificationThemes {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}

const notifications = ref<ProximaNotification[]>([]);


// Timeouts

const timeouts = new Map<string, Function>();

const clearTimeouts = () => {
  for (const clear of timeouts.values()) {
    clear?.();
  }
};

const addTimeout = (cb: Function, ms: number, ...args: any[]) => {
  const timeoutId = setTimeout(cb, ms, ...args);
  return () => clearTimeout(timeoutId);
};


// Clear

export const clearNotifications = () => {
  unref(notifications).forEach((el) => closeNotificationById(el.id));
};

export const clearPlainNotifications = () => {
  unref(notifications)
    .filter((el) => el.view === ProximaNotificationTypes.Plain)
    .forEach((el) => closeNotificationById(el.id));
};

export const clearToastNotifications = () => {
  unref(notifications)
    .filter((el) => el.view === ProximaNotificationTypes.Toast)
    .forEach((el) => closeNotificationById(el.id));
};


// Actions

export const closeNotificationById = (id: ProximaNotification['id']) => {
  const clearNotificationTimeout = timeouts.get(id);
  if (clearNotificationTimeout) {
    clearNotificationTimeout?.();
    timeouts.delete(id);
  }
  const index = unref(notifications).findIndex((el) => el.id === id);
  if (index > -1) {
    const [removedItem] = unref(notifications).splice(index, 1);
    removedItem?.onClose?.(removedItem);
  }
};

export const checkNotificationById = (id: ProximaNotification['id']) => {
  const index = unref(notifications).findIndex((el) => el.id === id);
  return index >= 0;
};

export const addNotification = (payload: Partial<ProximaNotification>) => {
  const isToast = payload.view === ProximaNotificationTypes.Toast;

  const notification: ProximaNotification = {
    id: getRandomId('notification'),
    view: ProximaNotificationTypes.Plain,
    position: isToast ? 'top-center' : 'top-end',
    title: '',
    hasCloseButton: true,
    additionalClass: '',
    actions: [],
    autoCloseDelay: 3000,
    ...payload,
    isToast,
  };

  const close = () => closeNotificationById(notification.id);

  if (checkNotificationById(notification.id)) {
    return close;
  }

  if (notification.autoCloseDelay > 0) {
    const clearNotificationTimeout = addTimeout(close, notification.autoCloseDelay);
    timeouts.set(notification.id, clearNotificationTimeout);
  }

  if (isToast) {
    clearToastNotifications(); // Only one toast per time
  }

  unref(notifications).push(notification);

  return close;
};


const parseOptions = (options: ProximaNotificationOptions) =>
  typeof options === 'string' ? { title: options } : options;

// Toast

export const showToast = (options: ProximaNotificationOptions) => addNotification({
  ...parseOptions(options),
  view: ProximaNotificationTypes.Toast,
});

export const showSuccessToast = (options: ProximaNotificationOptions) => showToast({
  theme: ProximaNotificationThemes.Success,
  icon: markRaw(IconCheck),
  ...parseOptions(options),
});

export const showErrorToast = (options: ProximaNotificationOptions) => showToast({
  theme: ProximaNotificationThemes.Error,
  icon: markRaw(IconCross),
  ...parseOptions(options),
});

export const showWarningToast = (options: ProximaNotificationOptions) => showToast({
  theme: ProximaNotificationThemes.Warning,
  icon: markRaw(IconImportant),
  ...parseOptions(options),
});

// Plain

export const showNotification = (options: ProximaNotificationOptions) => addNotification({
  ...parseOptions(options),
  view: ProximaNotificationTypes.Plain,
});

export const showSuccessNotification = (options: ProximaNotificationOptions) => showNotification({
  theme: ProximaNotificationThemes.Success,
  icon: markRaw(IconCheck),
  autoCloseDelay: 2000,
  ...parseOptions(options),
});

export const showErrorNotification = (options: ProximaNotificationOptions) => showNotification({
  theme: ProximaNotificationThemes.Error,
  icon: markRaw(IconCross),
  autoCloseDelay: 5000,
  ...parseOptions(options),
});

export const showWarningNotification = (options: ProximaNotificationOptions) => showNotification({
  theme: ProximaNotificationThemes.Warning,
  icon: markRaw(IconImportant),
  autoCloseDelay: 4000,
  ...parseOptions(options),
});


// Helpers

const getModifiers = (item: ProximaNotification) => ({
  [`notification_theme_${item.theme}`]: Boolean(item.theme),
  [`notification_view_${item.view}`]: Boolean(item.view),
  app__notification: item.view === ProximaNotificationTypes.Plain,
  app__toast: item.view === ProximaNotificationTypes.Toast,
  [String(item.additionalClass)]: Boolean(item.additionalClass)
});

const getPositionIndex = (item: ProximaNotification) => {
  const samePositions = unref(notifications).filter((el) => el.position === item.position);
  const index = samePositions.findIndex((el) => el.id === item.id);
  return (samePositions.length - 1) - index;
};

export const componentName = 'ProximaNotification';

/**
 * [Live Demo](https://proxima.wiki/notification) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/notification/notification.vue)
 *
 * @example
 * ```html
 * <app>
 *   <ProximaNotification />
 * </app>
 * ```
 * ```js
 * // mycomponent.vue
 *
 * import { showErrorNotification } from 'proxima-vue/notification';
 *
 * showErrorNotification({
 *   title: 'Access denied',
 *   description: 'Sorry, you Are not allowed to access this page',
 * });
 * ```
 *
 * @since v0.1.0
 */

export default defineComponent({
  name: componentName,
  components: {
    ProximaButtonClose,
  },
  setup() {
    return {
      notifications,
      getModifiers,
      getPositionIndex,
      closeNotificationById,
    };
  },
  beforeUnmount() {
    clearTimeouts();
  },
});
</script>

<style>
@layer proxima.notification {

  @keyframes ProximaNotificationAnimation {
    from {
      transform: translate3d(
        var(--notification-animation-translate-x, 0),
        var(--notification-animation-translate-y, -1rem),
      0);
      opacity: 0;
    }
    to {
      transform: translateZ(0);
      opacity: 1;
    }
  }

  .notification {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    padding-inline: var(--notification-margin-x, 1.25rem);
    padding-block: var(--notification-margin-y, 1.25rem);
    pointer-events: none;
    user-select: none;
  }

  .notification *,
  .notification *:before,
  .notification *:after {
    box-sizing: inherit;
  }

  /*
    Theme
  */

  .notification_theme_error {
    --base-notification-icon-color:
      var(--notification-error-icon-color, var(--app-invalid-color, #dc3545));
    --base-notification-toast-icon-color:
      var(--notification-toast-error-icon-color, #dca1a1);
  }

  .notification_theme_success {
    --base-notification-icon-color:
      var(--notification-success-icon-color, var(--app-valid-color, #03a10e));
    --base-notification-toast-icon-color:
      var(--notification-toast-success-icon-color, #00b662);
  }

  .notification_theme_warning {
    --base-notification-icon-color:
      var(--notification-warning-icon-color, var(--app-warning-color, #ea9106));
    --base-notification-toast-icon-color:
      var(--notification-toast-warning-icon-color, #ffc107);
  }

  /*
    Content
  */

  .notification__content {
    display: flex;
    gap: var(--notification-gap, 0.75rem);
    width: var(--notification-width, fit-content);
    border-radius: var(--notification-border-radius, 0.5rem);
    pointer-events: auto;
  }

  .notification__main {
    user-select: text;
    align-self: center;
  }

  .notification__side,
  .notification__close {
    flex-shrink: 0;
  }

  .notification__actions {
    display: flex;
    align-items: center;
    gap: var(--notification-actions-gap, 0.5rem);
  }


  /*
    Plain
  */

  .notification_view_plain .notification__content {
    align-items: normal;
    max-width: var(--notification-max-width, min(100%, 30rem));
    min-width: var(--notification-min-width, auto);
    padding-inline: var(--notification-padding-x, 1.25rem);
    padding-block: var(--notification-padding-y, 1.25rem);
    background: var(--notification-background, #fff);
    color: var(--notification-color, inherit);
    box-shadow:
      var(--notification-box-shadow-size, 0 0.5rem 0.75rem 0)
      var(--notification-box-shadow-color, rgba(0, 0, 0, 0.1));
    animation: var(--notification-animation,
      ProximaNotificationAnimation 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
    );

    --base-notification-title-font-size: var(--notification-title-font-size, 1.125em);
    --base-notification-title-font-weight: var(--notification-title-font-weight, 700);

    --base-notification-close-size: var(--notification-close-size, 2.5rem);
    --base-notification-close-margin-y-start: var(--notification-close-offset, -0.875rem);
    --base-notification-close-margin-x-end: var(--notification-close-offset, -0.875rem);
  }

  .notification_view_plain .notification__side {
    color: var(--base-notification-icon-color);
  }

  .notification_view_plain .notification__actions {
    margin-block-start: var(--notification-actions-margin-y-start, 1rem);
  }

  /*
    Toast
  */

  .notification_view_toast .notification__content {
    white-space: nowrap;
    align-items: center;
    max-width: 100%;
    height: var(--notification-toast-height, 2.5rem);
    padding-inline: var(--notification-toast-padding-x, 0.875rem);
    background: var(--notification-toast-background, rgba(0, 0, 0, 0.8));
    color: var(--notification-toast-color, #fff);
    -webkit-backdrop-filter: var(--notification-toast-backdrop-filter, blur(5px));
    backdrop-filter: var(--notification-toast-backdrop-filter, blur(5px));
    animation: var(--notification-toast-animation,
      ProximaNotificationAnimation 250ms cubic-bezier(0.33, 1, 0.68, 1)
    );

    --base-notification-title-font-size: var(--notification-toast-title-font-size, 0.875rem);
    --base-notification-title-font-weight: var(--notification-toast-title-font-weight, 400);

    --base-notification-close-size: var(--notification-toast-height, 2.5rem);
    --base-notification-close-margin-y-start: 0;
    --base-notification-close-margin-x-end: calc(
      var(--notification-toast-padding-x, 0.875rem) * -1
    );
  }

  @media (prefers-reduced-transparency: reduce) {
    .notification_view_toast .notification__content {
      background: var(--notification-toast-reduced-transparency-background, #000);
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }
  }

  .notification_view_toast .notification__side {
    color: var(--base-notification-toast-icon-color);
  }

  .notification_view_toast .notification__main {
    display: flex;
    align-items: center;
    gap: var(--notification-gap, 0.75rem);
    max-width: var(--notification-toast-max-width, 44ch);
  }

  /*
    Group
  */

  .notification[data-position^=top] {
    inset-block-start: 0;
  }

  .notification[data-position^=bottom] {
    inset-block-end: 0;
    --notification-animation-translate-y: 1rem;
  }

  .notification[data-position="top-start"],
  .notification[data-position="bottom-start"] {
    justify-content: flex-start;
  }

  .notification[data-position="top-end"],
  .notification[data-position="bottom-end"] {
    justify-content: flex-end;
  }

  .app__toast,
  .app__notification {
    position: fixed;
    inset-inline: 0;
    z-index: var(--notification-z-index, 1000);
  }

  .app__notification {
    opacity: calc(1 - (var(--notification-position-index, 0) * 0.05));
    transform:
      scale(calc(1 - (var(--notification-position-index, 0) * 0.05)))
      translate(0, calc(0.75rem * var(--notification-position-index, 0)));
    transition: var(--notification-transition,
      transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)
    );
    z-index: calc(
      var(--notification-z-index, 1000) - var(--notification-position-index, 0)
    );
  }
}

@layer proxima {
  .notification__title {
    display: block;
    font-size: var(--base-notification-title-font-size);
    font-weight: var(--base-notification-title-font-weight);
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .notification__description {
    font-size: var(--notification-description-font-size, 1em);
    margin-block-start: var(--notification-description-margin-y-start, 0.25rem);
  }

  .notification__close {
    --button-size: var(--base-notification-close-size);

    margin-block-start: var(--base-notification-close-margin-y-start);
    margin-inline-end: var(--base-notification-close-margin-x-end);
    border-radius: inherit;
  }
}
</style>

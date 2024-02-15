import { ref, unref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';

export default (el: Ref<HTMLDialogElement | null>, isOpen: Ref<Boolean>) => {
  const isNativeDialog = ref(true);

  const a11yAttrs = computed(() => (unref(isNativeDialog) ? {} : {
    tabindex: -1,
    'aria-hidden': !unref(isOpen) ? true : undefined,
    'aria-modal': unref(isOpen) ? true : undefined,
    role: unref(isOpen) ? 'dialog' : undefined,
  }));

  onMounted(() => {
    if (window.HTMLDialogElement !== undefined) {
      return;
    }

    const modal = unref(el);

    if (!modal) {
      console.warn('Dialog polyfill not applied, dialog element not founded!');
      return;
    }

    isNativeDialog.value = false;

    const focusableSelector = ['button', 'input', 'keygen', 'select', 'textarea']
      .map((tag) => `${tag}:not([disabled])`).join(', ');

    let activeElement: Element | null;

    (window as any)._openedModalList = (window as any)._openedModalList || [];

    modal.showModal = () => {
      activeElement = document.activeElement;
      let focusElement = modal.querySelector('[autofocus]:not([disabled])');
      focusElement = focusElement || modal.querySelector(`${focusableSelector}, [tabindex]:not([disabled]):not([tabindex=""])`);
      modal?.setAttribute('data-open', 'true');
      (focusElement as HTMLElement)?.focus();
      (window as any)._openedModalList.push(modal);
    };

    modal.close = () => {
      const closeEvent = new CustomEvent('close', { bubbles: false, cancelable: false });
      modal?.setAttribute('data-open', 'false');
      modal?.dispatchEvent(closeEvent);
      (activeElement as HTMLElement)?.focus();
      (window as any)._openedModalList
        = (window as any)._openedModalList.filter((item: any) => item !== modal);
    };

    const onKeydown = (event: KeyboardEvent) => {
      if (!unref(isOpen)) return;
      if (event.code === 'Escape') {
        const target = (event.target as HTMLInputElement);
        const isSearchCancel =
          target.tagName === 'INPUT' &&
          target.type === 'search' &&
          target.value !== '';
        const isCurrentModal = [...(window as any)._openedModalList].pop() === modal;
        if (!isSearchCancel && isCurrentModal) {
          event.preventDefault();
          event.stopPropagation();
          const cancelEvent = new CustomEvent('cancel', { bubbles: false, cancelable: true });
          const result = modal?.dispatchEvent(cancelEvent);
          if (result) {
            modal.close();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeydown);
    onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
  });

  return {
    isNativeDialog,
    a11yAttrs,
  };
};

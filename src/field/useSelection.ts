import { ref, unref, computed, type Ref, type ComputedRef } from 'vue';
import type { ProximaField } from '../types.d';
import useTimeout from '@/composables/timeout';

export default (
  field: Ref<InstanceType<typeof ProximaField>>,
  visibleOptions: ComputedRef<any[]>
) => {
  const optionIndex = ref(-1);
  const setOptionIndex = (index: number) => (optionIndex.value = index);
  const hasOptionIndex = computed(() => unref(optionIndex) >= 0);

  const { addDebounce } = useTimeout();

  let isPointerDisabled = false;

  const enablePointer = addDebounce(() => (isPointerDisabled = false), 400);

  const disablePointer = () => {
    isPointerDisabled = true;
    enablePointer();
  }

  const scrollToOption = () => {
    if (!unref(hasOptionIndex)) return;
    const index = unref(optionIndex);
    const container = unref(field)?.getContainer();
    const el = container?.querySelector(`[data-descendant-index="${index}"]`)
    el?.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest',
    });
    disablePointer();
  };

  const setPrevIndex = () => {
    if (!unref(hasOptionIndex)) return;
    const index = unref(optionIndex) === 0
      ? unref(visibleOptions).length
      : unref(optionIndex);
    setOptionIndex(index - 1);
    scrollToOption();
  };

  const setNextIndex = () => {
    if (!unref(hasOptionIndex)) return;
    const index = unref(optionIndex) >= unref(visibleOptions).length - 1
      ? -1
      : unref(optionIndex);
    setOptionIndex(index + 1);
    scrollToOption();
  };

  const setFirstIndex = () => {
    setOptionIndex(0);
    scrollToOption();
  };

  const onListPointerover = (event: MouseEvent) => {
    if (isPointerDisabled) return;
    const target = event.target as HTMLElement;
    const item = target?.closest('li') as HTMLLIElement;
    const index = Number(item?.getAttribute('data-descendant-index') || '-1');
    if (index >= 0) {
      setOptionIndex(index);
    }
  };

  const onListPointerout = () => {
    if (isPointerDisabled) return;
    setOptionIndex(-1);
  };

  return {
    optionIndex,
    hasOptionIndex,
    disablePointer,
    scrollToOption,
    setPrevIndex,
    setNextIndex,
    setFirstIndex,
    setOptionIndex,
    onListPointerover,
    onListPointerout,
  };
};

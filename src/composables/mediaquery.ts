import { ref, readonly, onMounted, onBeforeUnmount } from 'vue';

export const useProximaMedia = (mediaQuery: string, onChange?: (isMatched: boolean) => void) => {
  const isMediaMatched = ref(false);
  const setMatch = (value: boolean) => (isMediaMatched.value = value);

  const change = (isMatched: boolean) => {
    setMatch(isMatched);
    onChange?.(isMatched);
  };

  onMounted(() => {
    const match = window.matchMedia(mediaQuery);
    const onMediaChange = (event: MediaQueryListEvent) => change(event.matches);
    match.addEventListener('change', onMediaChange);
    change(match.matches);
    onBeforeUnmount(() => match.removeEventListener('change', onMediaChange));
  });

  return readonly(isMediaMatched);
};

export default useProximaMedia;

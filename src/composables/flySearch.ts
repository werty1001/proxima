import { ref, type Ref } from 'vue';
import useTimeout from '@/composables/timeout';

export const useProximaFlySearch = <T>(fn: (query: string) => PromiseLike<T[]>, delay = 800): {
  isFlySearchPending: Ref<boolean>
  onFlySearchUpdate: (query: string) => void
  flySearchResults: Ref<T[]>
  clearFlySearchResults: () => void
} => {
  const { addTimeout } = useTimeout();

  const isFlySearchPending = ref(false);
  const showPending = () => (isFlySearchPending.value = true);
  const hidePending = () => (isFlySearchPending.value = false);

  const flySearchResults = ref<T[]>([] as T[]) as Ref<T[]>;
  const setResults = (data: T[]) => (flySearchResults.value = data);

  let clearSearchTimeout: ReturnType<typeof addTimeout>;

  const onFlySearchUpdate = (query: string) => {
    clearSearchTimeout?.();
    if (!query) {
      hidePending();
      return;
    }
    showPending();
    clearSearchTimeout = addTimeout(async () => {
      const result = await fn(query);
      setResults(result);
      hidePending();
    }, delay);
  };

  const clearFlySearchResults = () => setResults([]);

  return {
    isFlySearchPending,
    onFlySearchUpdate,
    flySearchResults,
    clearFlySearchResults,
  };
};

export default useProximaFlySearch;

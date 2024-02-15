import { onBeforeUnmount } from 'vue';

export const useProximaTimeout = () => {
  const ids = new Set<ReturnType<typeof setTimeout>>();

  function addTimeout<T extends  (...args: any[]) => any>(fn: T, delay: number, ...args: Parameters<T>) {
    const timeoutId = setTimeout(fn, delay, ...args);
    ids.add(timeoutId);
    return () => {
      clearTimeout(timeoutId);
      ids.delete(timeoutId);
    };
  }

  function addThrottle<T extends (...args: Parameters<T>) => any>(this: ThisParameterType<T>, fn: T, delay = 200) {
    let isPending = false;
    let result: ReturnType<T>;
    return (...args: Parameters<T>) => {
      if (!isPending) {
        result = fn.apply(this, args);
        isPending = true;
        addTimeout(() => (isPending = false), delay);
      }
      return result;
    }
  }

  function addDebounce<T extends (...args: Parameters<T>) => void>(this: ThisParameterType<T>, fn: T, delay = 300) {
    let clearCurrentTimeout: ReturnType<typeof addTimeout>;
    return (...args: Parameters<T>) => {
      clearCurrentTimeout?.();
      clearCurrentTimeout = addTimeout(() => fn.apply(this, args), delay);
      return clearCurrentTimeout;
    }
  }

  onBeforeUnmount(() => {
    for (const id of ids) clearTimeout(id);
    ids.clear();
  });

  return {
    addTimeout,
    addThrottle,
    addDebounce,
  };
};

export default useProximaTimeout;

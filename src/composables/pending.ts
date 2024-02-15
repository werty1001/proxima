import { reactive } from 'vue';

export const useProximaPending = (initial: Record<string, boolean> = {}) => {
  const pendings = reactive<Record<string, boolean>>(initial);

  const isPending = (name: string) => Boolean(pendings[name]);
  const showPending = (name: string) => (pendings[name] = true);
  const hidePending = (name: string) => (pendings[name] = false);
  const togglePending = (name: string) => isPending(name)
    ? hidePending(name)
    : showPending(name);

  return {
    isPending,
    showPending,
    hidePending,
    togglePending,
  };
};

export default useProximaPending;

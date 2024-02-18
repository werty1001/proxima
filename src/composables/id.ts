import { ref, unref, onMounted } from 'vue';
import getRandomId from '@/utils/randomId';
import { isSSR } from '@/index';

export const useId = (externalId?: string, prefix = 'random') => {
  const id = ref(externalId || isSSR() ? '' : getRandomId(prefix));

  onMounted(() => {
    if (unref(id)) return;
    id.value = getRandomId(prefix);
  });

  return id;
};

export default useId;

import { ref, unref } from 'vue';
import useTimeout from '@/composables/timeout';
import useId from '@/composables/id';

export default () => {
  const unexpectedId = useId();
  const unexpectedMessage = ref('');

  const setMessage = (val: string) => (unexpectedMessage.value = val);

  const { addTimeout } = useTimeout();

  const setUnexpectedMessage = (val: string, delay = 4000) => {
    if (unref(unexpectedMessage)) return;
    setMessage(val);
    addTimeout(() => setMessage(''), delay);
  };

  return {
    unexpectedId,
    unexpectedMessage,
    setUnexpectedMessage,
  };
};

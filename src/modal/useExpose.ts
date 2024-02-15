import { unref, type Ref } from 'vue';
import type { ProximaModal } from '../types.d';

export default (el: Ref<InstanceType<typeof ProximaModal>>) => ({
  showModal: () => unref(el)?.showModal(),
  hideModal: () => unref(el)?.hideModal(),
  scrollTop: () => unref(el)?.scrollTop(),
  checkOpen: () => unref(el)?.checkOpen(),
});

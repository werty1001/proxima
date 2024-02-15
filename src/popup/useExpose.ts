import { unref, type Ref } from 'vue';
import type { ProximaPopup } from '../types.d';

export default (el: Ref<InstanceType<typeof ProximaPopup>>) => ({
  setPosition: () => unref(el)?.setPosition?.(),
  scrollTop: () => unref(el)?.scrollTop?.(),
});

import { unref, type Ref } from 'vue';
import type { ProximaField } from '../types.d';

export default (el: Ref<InstanceType<typeof ProximaField>>) => ({
  getErrorMessage: () => unref(el)?.getErrorMessage(),
  getContainer: () => unref(el)?.getContainer(),
  getElement: () => unref(el)?.getElement(),
  getLengthRange: () => unref(el)?.getLengthRange(),
  getValue: () => unref(el)?.getValue(),
  getId: () => unref(el)?.getId(),
  checkEmpty: () => unref(el)?.checkEmpty(),
  checkFocus: () => unref(el)?.checkFocus(),
  checkValidity: () => unref(el)?.checkValidity(),
  select: () => unref(el)?.select(),
  clear: () => unref(el)?.clear(),
  focus: () => unref(el)?.focus(),
  blur: () => unref(el)?.blur(),
});

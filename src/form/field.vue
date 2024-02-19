<template>
  <div ref="container" class="form__field" :class="modifiers">
    <component
      ref="el"
      :is="is"
      :id="id"
      :modelModifiers="modelModifiers"
      :modelValue="value"
      :disabled="disabled"
      :required="required"
      :describedby="`${errorId} ${describedby}`"
      :form-error="error"
      v-bind="attrs"
      @update:modelValue="onFieldUpdate"
      @focus="onFieldFocus"
      @blur="onFieldBlur"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </component>
    <div class="form__message" aria-live="polite">
      <slot name="form-field-error" :error="error" :id="errorId">
        <span
          v-if="error && errorView === 'plain'"
          v-text="error"
          :id="errorId || undefined"
          class="form__error"
        />
      </slot>
      <slot name="form-field-error-popup" :error="error" :id="errorId">
        <ProximaPopup
          v-if="error && errorView === 'popup' && isFocused"
          align-y="above"
          :align-x="isPopupAlignToStart ? 'start' : 'end'"
          v-bind="popupProps"
          :bind-to="`#${focusId}`"
          class="form__popup"
        >
          <span v-if="error" v-text="error" :id="errorId || undefined" />
        </ProximaPopup>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, unref, computed, useAttrs, inject, onMounted, onBeforeUnmount } from 'vue';

import { formProvideKey } from '@/form/form.vue';

import ProximaField from '@/field/field.vue';
import ProximaPopup from '@/popup/popup.vue';
import useLocale from '@/composables/locale';
import useId from '@/composables/id';

import type {
  ProximaDynamicProps,
  ProximaDynamicComponent,
  ProximaFormFieldExposed,
} from '../types.d';

export interface ProximaFormEvent<Values> {
  name: keyof Values
  value: any
  errorMessage: string
  validity: boolean
  field: ProximaFormFieldExposed
}

export interface ProximaFormFieldProps<Values> {
  id?: string
  is?: ProximaDynamicComponent
  name: keyof Values
  modelValue: Values
  modelModifiers?: Record<string, boolean>
  errors?: Partial<Record<keyof Values, string>>
  errorView?: 'popup' | 'plain'
  errorCreator?: (value: any) => string
  customValidator?: (value: any) => boolean
  popupProps?: ProximaDynamicProps
  describedby?: string
  required?: boolean
  disabled?: boolean
  part?: 'half' | 'third' | 'quarter'
}

const props = withDefaults(defineProps<ProximaFormFieldProps<T>>(), {
  is: ProximaField,
  errorView: () => getDefaultProp('errorView', 'popup') as 'popup',
  describedby: '',
  disabled: false,
  required: true,
});

const id = useId(props.id, 'form-field');
const errorId = computed(() => unref(id) ? `${unref(id)}-error` : '');

const attrs = useAttrs();

const modifiers = computed(() => ({
  [`form__field_${props.part}`]: Boolean(props.part),
  form__field_focused: unref(isFocused),
}));

const emit = defineEmits<{
  'update:modelValue': [modelValue: T]
  'update:errors': [modelValue: Partial<Record<keyof T, string>>]
  'update': [event: ProximaFormEvent<T>]
  'focus': [event: ProximaFormEvent<T>]
  'blur': [event: ProximaFormEvent<T>]
}>();


// Value

const value = computed(() => props.modelValue?.[props.name]);
const error = computed(() => props.errors?.[props.name]);


// Append to form

const [addFormField, removeFormField] = inject(formProvideKey, [() => 0, () => 0]);

onMounted(() => addFormField?.(props.name as string, expose as ProximaFormFieldExposed));
onBeforeUnmount(() => removeFormField?.(props.name as string));


// Locales

const { getLocaleToken } = useLocale();


// Error

const createErrorMessage = (value: any) => {
  if (typeof props.errorCreator === 'function') {
    return getLocaleToken(props.errorCreator(value));
  }

  const el = getElement();
  const error = el?.getErrorMessage?.();

  if (error) {
    return getLocaleToken(error);
  }

  return getLocaleToken(value ? 'fieldInvalid' : 'fieldRequired');
};


// Actions

const isPopupAlignToStart = ref(false);
const setPopupAlignToStart = (val: boolean) => (isPopupAlignToStart.value = val);

const focusId = ref('');
const setFocusId = (id: string) => (focusId.value = id);

const isFocused = ref(false);
const setFocus = (flag: boolean) => (isFocused.value = flag);

const getEventPayload = (value: any) => {
  const name = props.name;
  const validity = checkValidity(value);
  const errorMessage = validity ? '' : createErrorMessage(value);
  const field = expose;
  return { name, value, errorMessage, validity, field } as ProximaFormEvent<T>;
};

const onFieldUpdate = (value: any) => {
  emit('update:modelValue', { ...props.modelValue, [props.name]: value } as T);
  emit('update:errors', { ...props.errors, [props.name]: '' });
  emit('update', getEventPayload(value));
};

const onFieldFocus = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement;
  setPopupAlignToStart(['radio', 'checkbox'].includes(target?.type));
  setFocusId(target.id);
  setFocus(true);
  emit('focus', getEventPayload(getValue()));
};

const onFieldBlur = () => {
  setFocus(false);
  const payload = getEventPayload(getValue());
  if (payload.errorMessage && payload.value) {
    emit('update:errors', { ...props.errors, [payload.name]: payload.errorMessage });
  }
  emit('blur', payload);
};


// Methods

const container = ref<HTMLDivElement | null>(null);
const el = ref({} as any);

const getContainer = () => unref(container);
const getElement = () => unref(el);
const getValue = () => unref(value);
const getName = () => props.name;
const getErrorMessage = () => unref(error);

const checkFocus = () => unref(isFocused);
const checkDisabled = () => props.disabled;
const checkRequired = () => props.required;

const checkValidity = (value: any) => {
  if (typeof props.customValidator === 'function') {
    return props.customValidator(value);
  }
  const el = getElement();
  if (typeof el?.checkValidity === 'function') {
    return Boolean(el.checkValidity());
  }
  return !checkRequired() || Boolean(getValue());
};

const emitError = () => {
  const payload = getEventPayload(getValue());
  emit('update:errors', { ...props.errors, [payload.name]: payload.errorMessage });
}

const focus = () => getElement()?.focus?.();
const blur = () => getElement()?.blur?.();


// Expose

const expose = {
  getErrorMessage,
  getContainer,
  getElement,
  getValue,
  getName,
  checkFocus,
  checkDisabled,
  checkRequired,
  checkValidity: () => checkValidity(getValue()),
  emitError,
  focus,
  blur,
};

defineExpose(expose);
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaFormField';

const getDefaultProp = getDefaultProps(componentName);


export default defineComponent({
  name: componentName,
  inheritAttrs: false,
});
</script>

<style>
@layer proxima.form {

  .form__field {
    position: relative;
    flex: var(--form-field-flex, 0 0 100%);
    max-width: var(--form-field-max-width, 100%);
  }

  .form__field_half {
    max-width: calc(50% - var(--form-gap, 0.625rem) / 2);
  }

  .form__field_third {
    max-width: calc(33.333333333% - var(--form-gap, 0.625rem) / 3);
  }

  .form__field_quarter {
    max-width: calc(25% - var(--form-gap, 0.625rem) / 4);
  }

  .form__message {
    min-height: var(--form-message-min-height, auto);
  }

  /* TODO remove workaround */
  .form__field .field_label_above ~ .form__message .popup_above {
    margin-block-end: -1.25rem;
  }

  .form__error {
    display: block;
    font-size: var(--form-error-font-size, 0.875rem);
    line-height: var(--form-error-line-height, 1.25);
    color: var(--base-form-error-color);
    padding-block-start: var(--form-error-padding-y-start, 0.25rem);
  }

  .form__popup {
    margin-block-end: 0.125rem;

    margin-inline-start: calc(-0.875rem * var(--popup-has-arrow, 0));
    margin-inline-end: calc(-0.875rem * var(--popup-has-arrow, 0));

    --popup-background: var(--field-popup-background, var(--field-background, var(--app-field-background)));

    --popup-padding: var(--form-popup-padding, 1rem 1.5rem);
    --popup-box-shadow: var(--form-popup-box-shadow, 0 0.25rem 1rem rgba(0, 0, 0, 0.15));

    --popup-border-inline-width: var(--form-popup-border-inline-width, 0.25rem);
    --popup-border-inline-color:
      var(--form-popup-border-inline-color, var(--base-form-error-color));
  }
}
</style>

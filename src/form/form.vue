<template>
  <form
    method="POST"
    class="form"
    novalidate
    @submit.prevent="onFormSubmit"
  >
    <div v-if="$slots.header" class="form__header">
      <slot name="header" />
    </div>
    <div class="form__content">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="form__footer"
      :class="`form__footer_to_${footerAlign}`"
    >
      <slot name="footer" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import type { ProximaFormFieldExposed } from '../types.d';

export type AddFormField = (name: string, field: ProximaFormFieldExposed) => void
export type RemoveFormField = (name: string) => void

export interface ProximaFormProps {
  shouldFocusOnSubmitFailed?: boolean
  shouldCheckValidity?: boolean
  footerAlign?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<ProximaFormProps>(), {
  shouldFocusOnSubmitFailed: true,
  shouldCheckValidity: true,
  footerAlign: 'end',
});

const emit = defineEmits<{
  'submit': []
}>();


// Provide

const fields = {} as Record<string, ProximaFormFieldExposed>;
const addFormField: AddFormField = (name, field) => (fields[name] = field);
const removeFormField: RemoveFormField = (name) => (delete fields[name]);

provide(formProvideKey, [addFormField, removeFormField]);


// Actions

const onFormSubmit = () => {
  blur();
  if (!props.shouldCheckValidity || checkValidity()) {
    emit('submit');
  }
};


// Methods

const getField = (name: string) => fields[name];

const checkValidity = () => {
  const invalidField = Object.values(fields)
    .find((field) => !field.checkDisabled() && !field.checkValidity());
  if (invalidField) {
    invalidField.emitError();
    if (props.shouldFocusOnSubmitFailed) {
      invalidField.focus();
    }
    return false;
  }
  return true;
};

const checkFieldValidity = (name: string) => {
  const field = getField(name);
  return Boolean(field?.checkValidity());
};

const focusField = (name: string) => {
  const field = getField(name);
  field?.focus();
};

const focus = () => {
  const firstField = Object.values(fields)
    .find((field) => !field.checkDisabled());
  firstField?.focus();
};

const blur = () => {
  if (document?.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};


// Expose

defineExpose({
  getField,
  focusField,
  checkFieldValidity,
  checkValidity,
  focus,
  blur,
});
</script>

<script lang="ts">
import { defineComponent, type InjectionKey } from 'vue';

export const formProvideKey = Symbol('proxima-form-provide') as
 InjectionKey<[AddFormField, RemoveFormField]>;

export const componentName = 'ProximaForm';

/**
 * [Live Demo](https://proxima.wiki/form) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/form/form.vue)
 *
 * @example
 * ```html
 * <ProximaForm v-on:submit="onFormSubmit">
 *   <ProximaFormField
 *     name="login"
 *     label="Login"
 *     v-model="formValues"
 *     v-model:errors="formErrors"
 *   />
 *   <ProximaFormField
 *     :is="ProximaPassword"
 *     name="password"
 *     label="Password"
 *     :minlength="6"
 *     v-model="formValues"
 *     v-model:errors="formErrors"
 *   />
 *   <template #footer>
 *     <ProximaButton type="submit" text="Send" />
 *   </template>
 * </ProximaForm>
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaForm from 'proxima-vue/form';
 * import ProximaFormField from 'proxima-vue/form/field';
 * import ProximaPassword from 'proxima-vue/field/password';
 * import ProximaButton from 'proxima-vue/button';
 *
 * const formValues = ref({
 *   login: '',
 *   password: '',
 * });
 *
 * const formErrors = ref({});
 *
 * const onFormSubmit = () => {
 *   // The form is valid, you can post the values to the server.
 * };
 * ```
 *
 * @prop shouldCheckValidity `boolean` — Check validity on submit (default `true`)
 * @prop shouldFocusOnSubmitFailed `boolean` — Focus invalid field on submit (default `true`)
 * @prop footerAlign `string` — Horizontally align for footer actions: `start` / `center` / `end` (default `end`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.form {

  .form {
    --base-form-error-color: var(--form-error-color, var(--app-invalid-color, #dc3545));
  }

  .form__header {
    margin-block-end: var(--form-header-margin-y-end, 1rem);
  }

  .form__content {
    display: var(--form-content-display, flex);
    flex-wrap: var(--form-content-flex-wrap, wrap);
    justify-content: var(--form-content-justify-content, stretch);
    gap: var(--form-gap, 0.625rem);
  }

  .form__footer {
    display: flex;
    gap: var(--form-footer-gap, 0.5rem);
    margin-block-start: var(--form-footer-margin-y-start, 2rem);
  }

  .form__footer_to_start {
    justify-content: flex-start;
  }

  .form__footer_to_center {
    justify-content: center;
  }

  .form__footer_to_end {
    justify-content: flex-end;
  }
}
</style>

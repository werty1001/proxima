<template>
  <ProximaField
    ref="field"
    class="field_combobox"
    :class="modifiers"
    :has-arrow-button="!isFlySearch"
    autocomplete="off"
    v-bind="fieldProps"
    @clear="onFieldClear"
    @focus="onFieldFocus"
    @blur="onFieldBlur"
  >
    <template #field="{
      placeholder, fieldValue, fieldAttrs, onFocus, onBlur, isFocused,
    }">
      <input
        class="field__input field__el"
        type="text"
        spellcheck="false"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="isPopupOpened"
        :aria-controls="`${fieldAttrs.id}-listbox`"
        :aria-activedescendant="hasOptionIndex ? `${fieldAttrs.id}-listbox-${optionIndex}` : ''"
        :placeholder="placeholder || undefined"
        :value="isFocused ? filterValue : fieldValue"
        v-bind="fieldAttrs"
        @keydown="onFilterKeydown"
        @input="onFilterUpdate"
        @click="tryToShowPopup"
        @focus="onFocus"
        @blur="onBlur"
      >
      <ProximaFieldPopup
        v-if="isPopupOpened"
        v-bind="popupProps"
        ref="popup"
        :bind-to="`#${fieldAttrs.id}`"
        :id="`${fieldAttrs.id}-listbox`"
        :options-count="visibleOptions.length"
        :filter-value="filterValue"
        :filter-results="filterResults"
        :is-pending="isListPending"
        @mouse:over="onListPointerover"
        @mouse:out="onListPointerout"
        @mouse:down="pickOptionByIndex"
      >
        <template #options>
          <ProximaFieldOption
            v-for="(item, i) in visibleOptions"
            :key="`${fieldAttrs.id}-listbox-${getOptionLabel(item) || i}`"
            :id="`${fieldAttrs.id}-listbox-${i}`"
            :index="i"
            :label="getOptionLabel(item)"
            :is-pinned="checkOptionPinned(item)"
            :is-selected="checkOptionSelected(item)"
            :is-disabled="checkOptionDisabled(item)"
            :is-hovered="i === optionIndex"
            :is-create-button="checkCreateButton(item)"
            :describedby="checkCreateButton(item) ? `${fieldAttrs.id}-create` : ''"
            :aria-setsize="filteredOptions.length || undefined"
          >
            <template #default="slotdata">
              <slot name="option" v-bind="{ option: item, ...slotdata, ...slotProps }" />
            </template>
          </ProximaFieldOption>
        </template>
        <template v-for="name in popupSlots" #[name]="slotdata">
          <slot :name="name" v-bind="{ ...slotdata, ...slotProps }" />
        </template>
      </ProximaFieldPopup>
      <div
        v-if="hasCreateButton"
        :id="`${fieldAttrs.id}-create`"
        v-text="createDescription"
        class="field__visually-hidden"
      />
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotdata">
      <slot :name="name" v-bind="slotdata" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts" generic="T">
import { ref, unref, computed, watch, nextTick, toRaw } from 'vue';

import ProximaField from '@/field/field.vue';
import ProximaFieldPopup from '@/field/popup.vue';
import ProximaFieldOption from '@/field/option.vue';
import useFieldExpose from '@/field/useExpose';
import useSelection from '@/field/useSelection';
import useLocale from '@/composables/locale';
import prepareToCompare from '@/utils/prepareToCompare';

import type { ProximaDynamicProps } from '../types.d';

export interface ProximaComboboxProps<Option> {
  mode?: 'local' | 'fetch'
  filterKey?: string
  modelValue?: Option
  options?: Option[]
  required?: boolean
  maxVisibleOptions?: number
  notfoundLabel?: string
  countLabel?: string
  createLabel?: string
  createDescription?: string
  pinFilter?: (option: Option) => boolean
  searchFilter?: (option: Option, query: string) => boolean
  disableFilter?: (option: Option, modelValue?: Option) => boolean
  selectChecker?: (option: Option, modelValue?: Option) => boolean
  popupProps?: ProximaDynamicProps
  hasCreateButton?: boolean
  hasCountLabel?: boolean
  isListPending?: boolean
}

const props = withDefaults(defineProps<ProximaComboboxProps<T>>(), {
  mode: 'local',
  filterKey: () => getDefaultProp('filterKey', 'name') as 'name',
  options: () => [],
  required: false,
  maxVisibleOptions: () => getDefaultProp('maxVisibleOptions', 15) as 15,
  notfoundLabel: () => getDefaultProp('notfoundLabel', '') as '',
  countLabel: () => getDefaultProp('countLabel', '') as '',
  createLabel: () => getDefaultProp('createLabel', '') as '',
  createDescription: () => getDefaultProp('createDescription', '') as '',
  hasCreateButton: () => getDefaultProp('hasCreateButton', false) as false,
  hasCountLabel: () => getDefaultProp('hasCountLabel', true) as true,
  isListPending: false,
});

const emit = defineEmits<{
  'update:modelValue': [modelValue: ProximaComboboxProps<T>['modelValue'] | string]
  'update:filterValue': [filterValue: string]
  'create': [value: string]
}>();

const CREATE_BUTTON_KEY = 'isProximaCreateButton';

const field = ref({} as InstanceType<typeof ProximaField>);
const popup = ref({} as InstanceType<typeof ProximaFieldPopup>);

const modifiers = computed(() => ({
  [`field_mode_${props.mode}`]: Boolean(props.mode),
  field_list_pending: props.isListPending,
  field_popup_opened: unref(isPopupOpened),
}));


// Locales

const { getLocaleToken } = useLocale();

const notfoundLabel =
  computed(() => getLocaleToken(props.notfoundLabel || 'fieldNotfoundLabel'));

const createLabel =
  computed(() => getLocaleToken(props.createLabel || 'fieldCreateLabel', {
    query: unref(filterValue),
  }));

const createDescription =
  computed(() => getLocaleToken(props.createDescription || 'fieldCreateDescription', {
    query: unref(filterValue),
  }));

const countLabel =
  computed(() => getLocaleToken(props.countLabel || 'fieldFilterCountLabel', {
    visibleCount: props.maxVisibleOptions,
    totalCount: unref(filteredOptions).length,
  }));


// Option

const visibleOptions = computed(() => {
  const options = unref(filteredOptions).slice(0, props.maxVisibleOptions);
  if (unref(isCreateButtonVisible)) {
    options.push({
      [`${props.filterKey}`]: unref(createLabel),
      [CREATE_BUTTON_KEY]: true,
    } as T);
  }
  if (options.length === 0 && props.isListPending) {
    return Array.from(Array(3)).map((_, i) => `Option ${i} is loading`);
  }
  return options;
});

const {
  optionIndex,
  hasOptionIndex,
  disablePointer,
  scrollToOption,
  setPrevIndex,
  setNextIndex,
  setFirstIndex,
  setOptionIndex,
  onListPointerover,
  onListPointerout,
} = useSelection(field, visibleOptions);

const getOptionLabel = (option: any) => {
  if (typeof option === 'string') return option;

  const value = props.filterKey.split('.')
    .reduce((acc, key) => acc?.[key] || acc, option);

  return typeof value === 'string' ? value : '';
};

const selectedLabel = computed(() => getOptionLabel(props.modelValue));
const hasValue = computed(() => Boolean(props.modelValue));

const filterResults = computed(() => {
  if (unref(isFilterCountVisible)) {
    return unref(countLabel);
  }
  if (unref(isNotfoundVisible)) {
    return unref(notfoundLabel);
  }
  return '';
});

const isFilterCountVisible = computed(() => Boolean(
  props.hasCountLabel &&
  unref(filteredOptions).length > props.maxVisibleOptions
));

const isNotfoundVisible = computed(() => Boolean(
  !props.isListPending &&
  unref(filterValue) &&
  unref(visibleOptions).length === Number(unref(isCreateButtonVisible))
));

const isFlySearch = computed(() => props.mode === 'fetch');

const isCreateButtonVisible = computed(() => {
  if (props.isListPending || !props.hasCreateButton || !unref(filterValue)) return false;
  const query = prepareToCompare(unref(filterValue));
  const option = unref(filteredOptions)
    .slice(0, props.maxVisibleOptions)
    .find((option) => prepareToCompare(getOptionLabel(option)) === query);
  return !option;
});


// Actions

const checkOptionSelected = (option: any) => {
  if (typeof props.selectChecker === 'function') {
    return props.selectChecker(option, props.modelValue);
  }
  return toRaw(option) === toRaw(props.modelValue);
};

const checkOptionDisabled = (option: any) => {
  if (typeof props.disableFilter === 'function') {
    return props.disableFilter(option, props.modelValue);
  }
  return Boolean(option?.disabled);
};

const checkOptionPinned = (option: any) => {
  const item = unref(pinnedOptions).find((el: any) => toRaw(el) === toRaw(option));
  return Boolean(item);
};

const checkCreateButton = (option: any) => Boolean(option?.[CREATE_BUTTON_KEY]);

const pickOption = (option: any) => {
  emit('update:modelValue', option);
  setFilterValue(getOptionLabel(option));
  hidePopup();
};

const pickOptionByIndex = () => {
  const index = unref(optionIndex);
  const option = unref(visibleOptions)[index];
  if (checkCreateButton(option)) {
    emit('create', unref(filterValue));
    hidePopup();
    return;
  }
  if (option && !checkOptionDisabled(option)) {
    pickOption(option);
  }
};

const onFilterUpdate = (event: Event) => {
  const target = (event.target as HTMLInputElement);
  emit('update:modelValue', '');
  emit('update:filterValue', target.value);
  setFilterValue(target.value);
  setOptionIndex(unref(isFlySearch) ? -1 : 0);
  showPopup();
};

const onFieldClear = () => {
  emit('update:modelValue', '');
  setFilterValue('');
};


// Filter

const filterValue = ref('');
const setFilterValue = (str: string) => (filterValue.value = str);

watch(filterValue, (value) => {
  if (unref(isFlySearch) && !value && unref(visibleOptions).length === 0) {
    hidePopup();
  }
  disablePointer();
  nextTick(() => unref(popup)?.scrollTop?.());
});

watch(() => props.modelValue, (option) => {
  const label = getOptionLabel(option);
  if (!unref(isPopupOpened) && label !== unref(filterValue)) {
    setFilterValue(label);
  }
});

const pinnedOptions = computed(() => {
  const items = [];
  if (unref(hasValue)) {
    items.push(props.modelValue);
  }
  if (typeof props.pinFilter === 'function') {
    const pinnedItems = props.options
      .filter((el) => !checkOptionSelected(el) && props.pinFilter?.(el));
    items.push(...pinnedItems);
  }
  return items;
});

const unpinnedOptions = computed(() => {
  if (unref(pinnedOptions).length === 0) return props.options;
  return props.options.filter((el) => !checkOptionPinned(el));
});

const filteredOptions = computed(() => {
  const isSelected = unref(selectedLabel) === unref(filterValue);
  const query = prepareToCompare(unref(filterValue));
  if (unref(isFlySearch) || !query || isSelected) {
    return [
      ...unref(pinnedOptions),
      ...unref(unpinnedOptions),
    ];
  }
  return props.options.filter((option) => {
    if (typeof props.searchFilter === 'function') {
      return props.searchFilter(option, unref(filterValue));
    }
    const label = prepareToCompare(getOptionLabel(option));
    return label.includes(query);
  });
});


// Popup

const isPopupOpened = ref(false);
const showPopup = () => (isPopupOpened.value = true);
const hidePopup = () => (isPopupOpened.value = false);

watch(isPopupOpened, (isVisible: boolean) => {
  if (isVisible) {
    disablePointer();
    setOptionIndex(0);
  } else {
    setOptionIndex(-1);
  }
});

watch(() => props.isListPending, (isPending: boolean) => setOptionIndex(isPending ? -1 : 0));


// Focus

const tryToPickOption = () => {
  if (unref(hasValue) || !unref(filterValue)) return;
  const query = prepareToCompare(unref(filterValue));
  const option = props.options
    .find((option) => prepareToCompare(getOptionLabel(option)) === query);
  if (option) {
    pickOption(option);
  }
};

const tryToShowPopup = () => {
  if (!unref(isPopupOpened) && (unref(filterResults) || unref(visibleOptions).length > 0)) {
    showPopup();
  }
};

const onFieldFocus = () => {
  tryToShowPopup();
  nextTick(() => unref(field)?.select());
};

const onFieldBlur = () => {
  hidePopup();
  tryToPickOption();
};


// Keydown

const onArrowDown = (cb: typeof setNextIndex | typeof setPrevIndex, isAltKey: boolean) => {
  if (!unref(isPopupOpened)) {
    disablePointer();
    showPopup();
    if (isAltKey) {
      nextTick(() => setOptionIndex(-1));
    }
    return true;
  }
  if (unref(visibleOptions).length <= 1 && unref(hasOptionIndex)) {
    return false;
  }
  if (unref(hasOptionIndex)) {
    cb();
  } else {
    setFirstIndex();
  }
  return true;
};

const onFilterKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.shiftKey || props.isListPending) return;

  let shouldStopEvent = true;

  switch (event.key) {
    case 'Down':
    case 'ArrowDown': {
      shouldStopEvent = onArrowDown(setNextIndex, event.altKey);
      break;
    }
    case 'Up':
    case 'ArrowUp': {
      shouldStopEvent = onArrowDown(setPrevIndex, event.altKey);
      break;
    }
    case 'Enter': {
      if (unref(hasOptionIndex)) {
        pickOptionByIndex();
      } else {
        shouldStopEvent = false;
      }
      break;
    }
    case 'Esc':
    case 'Escape': {
      if (unref(isPopupOpened)) {
        hidePopup();
      } else {
        onFieldClear();
      }
      break;
    }
    case 'Home': {
      const el = unref(field)?.getElement();
      el?.setSelectionRange(0, 0);
      break;
    }
    case 'End': {
      const el = unref(field)?.getElement();
      const index = unref(filterValue).length;
      el?.setSelectionRange(index, index);
      break;
    }
    default: {
      shouldStopEvent = false;
    }
  }

  if (shouldStopEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
};


// Props

const fieldProps = computed(() => ({
  required: props.required,
  modelValue: unref(selectedLabel) || unref(filterValue),
  validator: () => props.required ? Boolean(props.modelValue) : true,
}));


// Slot props

const popupSlots = ['popup', 'popup-prepend', 'popup-footer'];

const slotProps = computed(() => ({
  maxVisibleOptions: props.maxVisibleOptions,
  filterValue: unref(filterValue),
  pinnedOptions: unref(pinnedOptions),
  unpinnedOptions: unref(unpinnedOptions),
  filteredOptions: unref(filteredOptions),
  visibleOptions: unref(visibleOptions),
  optionIndex: unref(optionIndex),
  notfoundLabel: unref(notfoundLabel),
  countLabel: unref(countLabel),
  selectedLabel: unref(selectedLabel),
  hasValue: unref(hasValue),
  isNotfoundVisible: unref(isNotfoundVisible),
  isFilterCountVisible: unref(isFilterCountVisible),
  isPopupOpened: unref(isPopupOpened),
  isFlySearch: unref(isFlySearch),
}));


// Expose

defineExpose({
  ...useFieldExpose(field),
  checkOptionPinned,
  checkOptionSelected,
  checkOptionDisabled,
  pickOption,
  pickOptionByIndex,
  scrollToOption,
  setOptionIndex,
  setPrevIndex,
  setNextIndex,
  setFirstIndex,
  setFilterValue,
  showPopup,
  hidePopup,
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { getDefaultProps } from '@/index';

export const componentName = 'ProximaCombobox';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/combobox) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/combobox.vue)
 *
 * @example
 * ```html
 * <ProximaCombobox
 *   label="Select item"
 *   :options="['one', 'two']"
 *   v-model="item"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaCombobox from 'proxima-vue/field/combobox';
 *
 * const value = ref('');
 * ```
 *
 * @prop mode `string` — Search within local options or fetch an external list: `local` / `fetch` (default `local`)
 * @prop filterKey `string` — Filter key (default `name`)
 * @prop options `array` — Options list (default `[]`)
 * @prop maxVisibleOptions `number` — Max visible options (default `15`)
 * @prop popupProps `object` — Popup props (default `{}`)
 * @prop hasCreateButton `boolean` — Adds create button to the popup (default `false`)
 * @prop hasCountLabel `boolean` — Adds total count label to the popup footer (default `true`)
 * @prop isListPending `boolean` — Loading state for fetch mode (default `false`)
 * @prop searchFilter `function` — Search filter (default `undefined`)
 * @prop pinFilter `function` — Pin filter (default `undefined`)
 * @prop disableFilter `function` — Check is option disabled (default `undefined`)
 * @prop selectChecker `function` — Check is option selected (default `undefined`)
 * @prop notfoundLabel `string` — Notfound message (default `''`, when prop is empty will be used locale value)
 * @prop countLabel `string` — Total count message (default `''`, when prop is empty will be used locale value)
 * @prop createLabel `string` — Create button label (default `''`, when prop is empty will be used locale value)
 * @prop createDescription `string` — Create button description for assistive technologies (default `''`, when prop is empty will be used locale value)
 *
 * @prop id `string` — Field id (default `field-[hash]`)
 * @prop inputAttrs `InputHTMLAttributes` — Select attributes (default `{}`)
 * @prop modelValue `string` or `number` — Field value (default `''`)
 * @prop label `string` — Label text
 * @prop labelPosition `string` — Label position: `above` / `inside` / `aside` (default `above`)
 * @prop describedby `string` — [aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) attribute (default `''`)
 * @prop autocomplete `string` — [autocomplete](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute) attribute (default `''`)
 * @prop placeholder `string` — placeholder attribute (default `''`)
 * @prop disabled `boolean` — disabled attribute (default `false`)
 * @prop readonly `boolean` — readonly attribute (default `false`)
 * @prop required `boolean` — required attribute (default `false`)
 * @prop autofocus `boolean` — autofocus attribute (default `false`)
 * @prop validityStyle `string` — Adds validity style: `invalid` / `valid` / `both` / `none` (default `invalid`)
 * @prop validityStatus `string` — Adds validity icon: `invalid` / `valid` / `both` / `none` (default `invalid`)
 * @prop actions `array` — Custom actions (default `[]`)
 * @prop actionsVisibility `string` — Actions visibility: `hover` / `always` (default `hover`)
 * @prop hasClearButton `boolean` — Adds clear button (default `false`)
 * @prop hasArrowButton `boolean` — Adds arrow button (default `true`)
 * @prop width `string` — Width by characters length or max width: `max` / `12` (default `max`)
 * @prop validator `function` — Func checks value validity (default `null`)
 * @prop emptyChecker `function` — Func checks value empty or not (default `null`)
 * @prop parseValue `function` — Func parse value (default `(value: any) => String(value)`)
 * @prop view `string` — Field view: `plain` / `line` (default `plain`)
 * @prop size `string` — Field size: `xxs` / `xs` / `s` / `normal` / `m` / `l` / `xl` / `xxl` (default `normal`)
 * @prop round `string` — Field radius: `soft` / `full` / `none` (default `soft`)
 * @prop shadow `string` — Field shadow: `soft` / `none` (default `soft`)
 * @prop theme `string` — Field theme (default `''`)
 *
 * @since v0.1.0
 */

export default defineComponent({ name: componentName });
</script>

<style>
@layer proxima.field {
  .field_combobox {
    --field-is-arrow-flipped: var(--field-is-popup-opened, 0);
  }
}
</style>

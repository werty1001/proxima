<template>
  <ProximaField
    ref="field"
    class="field_multiselect"
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
        aria-haspopup="listbox"
        :aria-expanded="isPopupOpened"
        :aria-controls="`${fieldAttrs.id}-listbox`"
        :aria-activedescendant="hasOptionIndex ? `${fieldAttrs.id}-listbox-${optionIndex}` : ''"
        :placeholder="placeholder || undefined"
        :value="isFocused ? filterValue : fieldValue"
        :title="hasChips ? undefined : valueLabel"
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
        multiselectable
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
      <div
        :id="selectedId || undefined"
        v-text="`${selectedLabel}: ${valueLabel}`"
        class="field__visually-hidden"
      />
    </template>
    <template #footer="{ fieldAttrs }">
      <slot v-if="hasChips" name="chips" v-bind="slotProps">
        <ul class="field__chips" tabindex="-1">
          <template v-for="(item, i) in modelValue">
            <slot name="chip" :index="i" :chip="item" v-bind="slotProps">
              <ProximaChip
                tag="li"
                :key="`${fieldAttrs.id}-tokens-${getOptionLabel(item) || i}`"
                :text="getOptionLabel(item)"
                has-delete-button
                @click="emit('click:chip', item)"
                @delete="pickOption(item)"
              />
            </slot>
          </template>
        </ul>
      </slot>
    </template>
    <template v-for="(_, name) in $slots" #[name]="slotdata">
      <slot :name="name" v-bind="slotdata" />
    </template>
  </ProximaField>
</template>

<script setup lang="ts" generic="T">
import { ref, unref, computed, watch, nextTick } from 'vue';

import ProximaField from '@/field/field.vue';
import ProximaFieldPopup from '@/field/popup.vue';
import ProximaFieldOption from '@/field/option.vue';
import ProximaChip from '@/chip/chip.vue';
import useFieldExpose from '@/field/useExpose';
import useSelection from '@/field/useSelection';
import useLocale from '@/composables/locale';
import prepareToCompare from '@/utils/prepareToCompare';
import useId from '@/composables/id';

import type { ProximaDynamicProps } from '../types.d';

export interface ProximaMultiselectProps<Option> {
  mode?: 'local' | 'fetch'
  filterKey?: string
  trackKey?: string
  modelValue?: Option[]
  options?: Option[]
  describedby?: string
  required?: boolean
  minlength?: number
  maxlength?: number
  maxVisibleOptions?: number
  notfoundLabel?: string
  countLabel?: string
  createLabel?: string
  createDescription?: string
  selectedLabel?: string
  pinFilter?: (option: Option) => boolean
  searchFilter?: (option: Option, query: string) => boolean
  selectChecker?: (option: Option, modelValue: Option[]) => boolean
  disableChecker?: (option: Option, modelValue: Option[]) => boolean
  popupProps?: ProximaDynamicProps
  hasCreateButton?: boolean
  hasChips?: boolean
  hasCountLabel?: boolean
  isListPending?: boolean
}

const props = withDefaults(defineProps<ProximaMultiselectProps<T>>(), {
  mode: 'local',
  filterKey: () => getDefaultProp('filterKey', 'name') as 'name',
  trackKey: () => getDefaultProp('trackKey', 'name') as 'name',
  modelValue: () => [],
  options: () => [],
  describedby: '',
  required: false,
  minlength: 1,
  maxlength: Infinity,
  maxVisibleOptions: () => getDefaultProp('maxVisibleOptions', 15) as 15,
  notfoundLabel: () => getDefaultProp('notfoundLabel', '') as '',
  countLabel: () => getDefaultProp('countLabel', '') as '',
  createLabel: () => getDefaultProp('createLabel', '') as '',
  createDescription: () => getDefaultProp('createDescription', '') as '',
  selectedLabel: () => getDefaultProp('selectedLabel', '') as '',
  hasCreateButton: () => getDefaultProp('hasCreateButton', false) as false,
  hasChips: () => getDefaultProp('hasChips', false) as false,
  hasCountLabel: () => getDefaultProp('hasCountLabel', true) as true,
  isListPending: false,
});

const emit = defineEmits<{
  'update:modelValue': [modelValue: ProximaMultiselectProps<T>['modelValue']]
  'update:filterValue': [filterValue: string]
  'click:chip': [option: T]
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

const selectedLabel = computed(() => getLocaleToken(props.selectedLabel || 'fieldSelectedLabel', props.modelValue.length));


// Option

const maxVisibleOptions = computed(() => Math.max(
  props.maxVisibleOptions,
  unref(selectedTrackKeys).length + 3,
));

const visibleOptions = computed(() => {
  const options = unref(filteredOptions).slice(0, unref(maxVisibleOptions));
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


const valueLabel = computed(() => props.modelValue.map(getOptionLabel).join(', '));
const hasValue = computed(() => props.modelValue.length > 0);

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

const selectedTrackKeys = ref<any[]>([]);
const setSelectedTrackKeys = (keys: any[]) => (selectedTrackKeys.value = keys);

const checkWasSelected = (option: any) =>
  unref(selectedTrackKeys).includes(getOptionTrack(option));

const checkOptionSelected = (option: any) => {
  if (typeof props.selectChecker === 'function') {
    return props.selectChecker(option, props.modelValue);
  }
  const trackKeys = props.modelValue.map(getOptionTrack);
  return trackKeys.includes(getOptionTrack(option));
};

const checkOptionDisabled = (option: any) => {
  if (typeof props.disableChecker === 'function') {
    return props.disableChecker(option, props.modelValue);
  }
  return Boolean(option?.disabled);
};

const checkOptionPinned = (option: any) => {
  const trackKeys = unref(pinnedOptions).map(getOptionTrack);
  return trackKeys.includes(getOptionTrack(option))
};

const checkCreateButton = (option: any) => Boolean(option?.[CREATE_BUTTON_KEY]);

const getOptionLabel = (option: any) => {
  if (option?.[props.filterKey]) {
    return option[props.filterKey];
  }
  if (['string', 'number'].includes(typeof option)) {
    return option;
  }
  return '';
};

const getOptionTrack = (option: any) => {
  if (option?.[props.trackKey]) {
    return option[props.trackKey];
  }
  if (['string', 'number'].includes(typeof option)) {
    return option;
  }
  return '';
};


// Actions

const pickOption = (option: any) => {
  if (checkOptionSelected(option)) {
    const value = props.modelValue
      .filter((el) => getOptionTrack(el) !== getOptionTrack(option));
    emit('update:modelValue', value);
  } else {
    emit('update:modelValue', [...props.modelValue, option]);
  }
};

const pickOptionByIndex = () => {
  const index = unref(optionIndex);
  const option = unref(visibleOptions)[index];
  if (checkCreateButton(option)) {
    emit('create', unref(filterValue));
    nextTick(() => setFilterValue(''));
    return;
  }
  if (option && !checkOptionDisabled(option)) {
    pickOption(option);
  }
};

const onFilterUpdate = (event: Event) => {
  const target = (event.target as HTMLInputElement);
  emit('update:filterValue', target.value);
  setFilterValue(target.value);
  setOptionIndex(unref(isFlySearch) ? -1 : 0);
  showPopup();
};

const onFieldClear = () => {
  emit('update:modelValue', []);
  setFilterValue('');
};


// Filter

const filterValue = ref('');
const setFilterValue = (str: string) => (filterValue.value = str);

watch(filterValue, (value) => {
  if (unref(isFlySearch) && !value && unref(visibleOptions).length === 0) {
    hidePopup();
  }
  if (!value) {
    setSelectedTrackKeys(props.modelValue.map(getOptionTrack));
  }
  disablePointer();
  nextTick(() => unref(popup)?.scrollTop());
});

const pinnedOptions = computed(() => {
  const optionsKeys = props.options.map(getOptionTrack);
  const selectedItems = props.modelValue
    .filter((el) => !optionsKeys.includes(getOptionTrack(el)));
  const items = [...props.options, ...selectedItems].filter(checkWasSelected);
  if (typeof props.pinFilter === 'function') {
    const pinnedItems = props.options
      .filter((el) => !checkWasSelected(el) && props.pinFilter?.(el));
    items.push(...pinnedItems);
  }
  return items;
});

const unpinnedOptions = computed(() => {
  const pinnedKeys = unref(pinnedOptions).map(getOptionTrack);
  if (pinnedKeys.length === 0) return props.options;
  return props.options.filter((el) => !pinnedKeys.includes(getOptionTrack(el)));
});

const filteredOptions = computed(() => {
  const query = prepareToCompare(unref(filterValue));
  if (unref(isFlySearch) && query) {
    return props.options;
  }
  if (!query) {
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

watch(visibleOptions, (options) => {
  if (options.length === 0 && !unref(filterResults)) {
    hidePopup();
  }
});


// Popup

const isPopupOpened = ref(false);
const showPopup = () => (isPopupOpened.value = true);
const hidePopup = () => (isPopupOpened.value = false);

watch(isPopupOpened, (isVisible: boolean) => {
  if (isVisible) {
    setSelectedTrackKeys(props.modelValue.map(getOptionTrack));
    disablePointer();
    setOptionIndex(0);
  } else {
    setOptionIndex(-1);
  }
});

watch(() => props.isListPending, (isPending: boolean) => setOptionIndex(isPending ? -1 : 0));


// Focus

const tryToShowPopup = () => {
  if (!unref(isPopupOpened) && (unref(filterResults) || unref(visibleOptions).length > 0)) {
    showPopup();
  }
};

const onFieldFocus = () => {
  nextTick(() => unref(field)?.select());
  tryToShowPopup();
};

const onFieldBlur = () => {
  hidePopup();
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
      if (unref(filterValue)) {
        setFilterValue('');
      } else if (unref(isPopupOpened)) {
        hidePopup();
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

const selectedId = useId();

const fieldProps = computed(() => ({
  required: props.required,
  describedby: [unref(selectedId), props.describedby].filter(Boolean).join(' '),
  modelValue: props.hasChips
    ? (unref(hasValue) ? unref(selectedLabel) : unref(filterValue))
    : unref(valueLabel) || unref(filterValue),
  validator: () => {
    if (!props.required) return true;
    const length = props.modelValue.length;
    return length >= props.minlength && length <= props.maxlength;
  },
}));


// Slot props

const popupSlots = ['popup', 'popup-prepend', 'popup-footer'];

const slotProps = computed(() => ({
  maxVisibleOptions: unref(maxVisibleOptions),
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

export const componentName = 'ProximaMultiselect';

const getDefaultProp = getDefaultProps(componentName);


/**
 * [Live Demo](https://proxima.wiki/field/multiselect) | [Code on Github](https://github.com/werty1001/proxima/blob/main/src/field/multiselect.vue)
 *
 * @example
 * ```html
 * <ProximaMultiselect
 *   label="Select items"
 *   v-model="items"
 * />
 * ```
 * ```js
 * import { ref } from 'vue';
 * import ProximaMultiselect from 'proxima-vue/field/multiselect';
 *
 * const items = ref([]);
 * ```
 *
 * @prop mode `string` — Search within local options or fetch an external list: `local` / `fetch` (default `local`)
 * @prop filterKey `string` — Filter key (default `name`)
 * @prop trackKey `string` — Track key (default `name`)
 * @prop options `array` — Options list (default `[]`)
 * @prop maxVisibleOptions `number` — Max visible options (default `15`)
 * @prop popupProps `object` — Popup props (default `{}`)
 * @prop hasCreateButton `boolean` — Adds create button to the popup (default `false`)
 * @prop hasChips `boolean` — Adds selected values as chips to the field footer (default `false`)
 * @prop hasCountLabel `boolean` — Adds total count label to the popup footer (default `true`)
 * @prop isListPending `boolean` — Loading state for fetch mode (default `false`)
 * @prop searchFilter `function` — Search filter (default `null`)
 * @prop pinFilter `function` — Pin filter (default `null`)
 * @prop selectChecker `function` — Check is option selected (default `null`)
 * @prop disableChecker `function` — Check is option disabled (default `null`)
 * @prop notfoundLabel `string` — Notfound message (default `''`, when prop is empty will be used locale value)
 * @prop countLabel `string` — Total count message (default `''`, when prop is empty will be used locale value)
 * @prop createLabel `string` — Create button label (default `''`, when prop is empty will be used locale value)
 * @prop createDescription `string` — Create button description for assistive technologies (default `''`, when prop is empty will be used locale value)
 * @prop selectedLabel `string` — Selected label (default `''`, when prop is empty will be used locale value)
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

  .field_multiselect {
    --field-is-arrow-flipped: var(--field-is-popup-opened, 0);
  }

  .field__chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: var(--field-chips-gap, 0.25rem);
  }
}
</style>

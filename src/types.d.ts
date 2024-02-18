
import type { Component, DefineComponent } from 'vue';

import type ParseInputEvent from './utils/parseInput';

import type ProximaButton from './button/button.vue';
import type { ProximaButtonProps } from './button/button.vue';
import type ProximaButtonClose from './button/close.vue';
import type ProximaButtonDelete from './button/delete.vue';
import type ProximaButtonPlus from './button/plus.vue';
import type ProximaCheckbox from './checkbox/checkbox.vue';
import type { ProximaCheckboxProps } from './checkbox/checkbox.vue';
import type ProximaRadioGroup from './checkbox/radiogroup.vue';
import type { ProximaRadioGroupProps } from './checkbox/radiogroup.vue';
import type ProximaChip from './chip/chip.vue';
import type { ProximaChipProps } from './chip/chip.vue';
import type ProximaCombobox from './field/combobox.vue';
import type { ProximaComboboxProps } from './field/combobox.vue';
import type ProximaDate from './field/date.vue';
import type { ProximaDateProps } from './field/date.vue';
import type ProximaEmail from './field/email.vue';
import type { ProximaEmailProps } from './field/email.vue';
import type ProximaField from './field/field.vue';
import type { ProximaFieldProps, ProximaFieldAction } from './field/field.vue';
import type ProximaMultiselect from './field/multiselect.vue';
import type { ProximaMultiselectProps } from './field/multiselect.vue';
import type ProximaNumeric from './field/numeric.vue';
import type { ProximaNumericProps } from './field/numeric.vue';
import type ProximaFieldOption from './field/option.vue';
import type { ProximaFieldOptionProps } from './field/option.vue';
import type ProximaPassword from './field/password.vue';
import type { ProximaPasswordProps } from './field/password.vue';
import type ProximaPhone from './field/phone.vue';
import type { ProximaPhoneProps } from './field/phone.vue';
import type ProximaFieldPopup from './field/popup.vue';
import type { ProximaFieldPopupProps } from './field/popup.vue';
import type ProximaSelect from './field/select.vue';
import type { ProximaSelectProps, ProximaSelectOption } from './field/select.vue';
import type ProximaTextarea from './field/textarea.vue';
import type { ProximaTextareaProps } from './field/textarea.vue';
import type ProximaForm from './form/form.vue';
import type { ProximaFormProps } from './form/form.vue';
import type ProximaFormField from './form/field.vue';
import type { ProximaFormFieldProps, ProximaFormEvent } from './form/field.vue';
import type ProximaFormFieldset from './form/fieldset.vue';
import type { ProximaFormFieldsetProps } from './form/fieldset.vue';
import type ProximaIcon from './icon/icon.vue';
import type { ProximaIconProps } from './icon/icon.vue';
import type ProximaIconArrow from './icon/arrow.vue';
import type { ProximaIconArrowProps } from './icon/arrow.vue';
import type ProximaIconCheck from './icon/check.vue';
import type ProximaIconCross from './icon/cross.vue';
import type ProximaIconDelete from './icon/delete.vue';
import type ProximaIconImportant from './icon/important.vue';
import type ProximaIconPlus from './icon/plus.vue';
import type ProximaIconSearch from './icon/search.vue';
import type ProximaModal from './modal/modal.vue';
import type { ProximaModalProps } from './modal/modal.vue';
import type ProximaNotifications from './notification/notification.vue';
import type { ProximaNotification, ProximaNotificationOptions } from './notification/notification.vue';
import type ProximaPopup from './popup/popup.vue';
import type { ProximaPopupProps } from './popup/popup.vue';
import type ProximaSpinner from './spinner/spinner.vue';
import type { ProximaSpinnerProps } from './spinner/spinner.vue';
import type ProximaSwitch from './switch/switch.vue';
import type { ProximaSwitchProps } from './switch/switch.vue';
import type ProximaToggle from './toggle/toggle.vue';
import type { ProximaToggleProps, ProximaToggleOption } from './toggle/toggle.vue';


export type ProximaLocales = Record<string, Record<string, string>>

export type ProximaSize = 'xxs' | 'xs' | 's' | 'normal' | 'm' | 'l' | 'xl' | 'xxl'
export type ProximaRound = 'soft' | 'full' | 'none'
export type ProximaShadow = 'soft' | 'none'
export type ProximaAlign = 'start' | 'center' | 'end'
export type ProximaClickEffect = 'ripple' | 'pulse' | 'none'
export type ProximaScrollbar = 'pretty' | 'pretty-hover' | 'native'

export type ProximaDynamicComponent = string | Component
export type ProximaDynamicProps = Record<string, any>
export type ProximaDynamicAttrs = Record<string, any>
export type ProximaDynamicClass = string | Record<string, boolean> | (string | Record<string, boolean>)[]

export interface ProximaDynamicAction {
  is: ProximaDynamicComponent
  props?: ProximaDynamicProps
}

// https://github.com/vuejs/language-tools/issues/3206#issuecomment-1624541884

export type ComponentInstance<T> = T extends new (...args: any[]) => infer R
  ? R
  : T extends (...args: any[]) => infer R
    ? R extends { __ctx?: infer K }
      ? Exclude<K, void> extends { expose: (...args: infer K) => void }
        ? K[0] & InstanceType<DefineComponent>
        : any
      : any
    : any

export type ProximaFormFieldExposed = ComponentInstance<typeof ProximaFormField>

export interface ProximaDefaultProps {
  ProximaButton: Pick<ProximaButtonProps, 'view' | 'size' | 'round' | 'shadow' | 'effect' | 'theme'>
  ProximaModal: Pick<ProximaModalProps, 'shouldCloseOnEsc' | 'shouldCloseOnBackdrop' | 'shouldLockScrollbar' | 'stickyHeader' | 'stickyFooter' | 'stickyActions' | 'hasCloseButton' | 'closeAriaLabel' | 'footerAlign' | 'view' | 'theme'>
  ProximaIcon: Pick<ProximaIconProps, 'tag' | 'color' | 'view' | 'size' | 'round' | 'theme'>
  ProximaSwitch: Pick<ProximaSwitchProps, 'hasStateIcons' | 'view' | 'size' | 'round' | 'shadow' | 'effect' | 'theme'>
  ProximaToggle: Pick<ProximaToggleProps, 'labelPosition' | 'view' | 'size' | 'round' | 'shadow' | 'effect' | 'theme'>
  ProximaField: Pick<ProximaFieldProps, 'labelPosition' | 'validityStyle' | 'validityStatus' | 'actions' | 'actionsVisibility' | 'view' | 'size' | 'round' | 'shadow' | 'theme'>
  ProximaTextarea: Pick<ProximaTextareaProps, 'minRows' | 'maxRows' | 'scrollbar' | 'autoresize'>
  ProximaSpinner: Pick<ProximaSpinnerProps, 'labelPosition' | 'size' | 'theme'>
  ProximaRadioGroup: Pick<ProximaRadioGroupProps, 'labelPosition' | 'view' | 'size' | 'shadow' | 'effect' | 'theme'>
  ProximaCheckbox: Pick<ProximaCheckboxProps, 'view' | 'size' | 'shadow' | 'effect' | 'theme'>
  ProximaChip: Pick<ProximaChipProps, 'tag' | 'view' | 'size' | 'round' | 'theme'>
  ProximaPopup: Pick<ProximaPopupProps, 'scrollbar'>
  ProximaFormField: Pick<ProximaFormFieldProps<{}>, 'errorView'>
  ProximaPhone: Pick<ProximaPhoneProps, 'format' | 'maskChar' | 'hasInvalidBlink'>
  ProximaPassword: Pick<ProximaPasswordProps, 'hasEyeButton' | 'actions'>
  ProximaNumeric: Pick<ProximaNumericProps, 'hasInvalidBlink'>
  ProximaEmail: Pick<ProximaEmailProps, 'domains' | 'hasAutocomplete'>
  ProximaDate: Pick<ProximaDateProps, 'format' | 'maskChar' | 'hasInvalidBlink'>
  ProximaCombobox: Pick<ProximaComboboxProps<string>, 'filterKey' | 'maxVisibleOptions' | 'notfoundLabel' | 'countLabel' | 'createLabel' | 'createDescription' | 'hasCreateButton' | 'hasCountLabel'>
  ProximaMultiselect: Pick<ProximaMultiselectProps<string>, 'filterKey' | 'trackKey' | 'maxVisibleOptions' | 'notfoundLabel' | 'countLabel' | 'createLabel' | 'createDescription' | 'selectedLabel' | 'hasCreateButton' | 'hasChips' | 'hasCountLabel'>
  everyone: {
    hasInvalidBlink?: boolean
    effect?: ProximaClickEffect
    scrollbar?: ProximaScrollbar
    shadow?: ProximaShadow
    round?: ProximaRound
    size?: ProximaSize
    theme?: string
  }
}

export interface ProximaSetupOptions {
  lang?: string
  locales?: ProximaLocales
  dateTimeFormatOptions?: Intl.DateTimeFormatOptions
  defaultProps?: Partial<ProximaDefaultProps>
  ssr?: boolean
}

export type {
  ParseInputEvent,

  ProximaButton,
  ProximaButtonProps,
  ProximaButtonClose,
  ProximaButtonDelete,
  ProximaButtonPlus,

  ProximaCheckbox,
  ProximaCheckboxProps,
  ProximaRadioGroup,
  ProximaRadioGroupProps,

  ProximaChip,
  ProximaChipProps,

  ProximaCombobox,
  ProximaComboboxProps,
  ProximaDate,
  ProximaDateProps,
  ProximaEmail,
  ProximaEmailProps,
  ProximaField,
  ProximaFieldProps,
  ProximaFieldAction,
  ProximaMultiselect,
  ProximaMultiselectProps,
  ProximaNumeric,
  ProximaNumericProps,
  ProximaFieldOption,
  ProximaFieldOptionProps,
  ProximaPassword,
  ProximaPasswordProps,
  ProximaPhone,
  ProximaPhoneProps,
  ProximaFieldPopup,
  ProximaFieldPopupProps,
  ProximaSelect,
  ProximaSelectProps,
  ProximaSelectOption,
  ProximaTextarea,
  ProximaTextareaProps,

  ProximaForm,
  ProximaFormProps,
  ProximaFormEvent,
  ProximaFormField,
  ProximaFormFieldProps,
  ProximaFormFieldset,
  ProximaFormFieldsetProps,

  ProximaIcon,
  ProximaIconProps,
  ProximaIconArrow,
  ProximaIconArrowProps,
  ProximaIconCheck,
  ProximaIconCross,
  ProximaIconDelete,
  ProximaIconImportant,
  ProximaIconPlus,
  ProximaIconSearch,

  ProximaModal,
  ProximaModalProps,

  ProximaNotifications,
  ProximaNotification,
  ProximaNotificationOptions,

  ProximaPopup,
  ProximaPopupProps,

  ProximaSpinner,
  ProximaSpinnerProps,

  ProximaSwitch,
  ProximaSwitchProps,

  ProximaToggle,
  ProximaToggleProps,
  ProximaToggleOption,
}

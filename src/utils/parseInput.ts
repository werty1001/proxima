import insertToString from './insertToString';

export default class ParseInputEvent {
  readonly inputData: string;
  readonly inputType: string;
  readonly currentValue: string;
  readonly currentSelection: [number, number];
  readonly validSymbols: string;
  readonly invalidSymbolsRegex: RegExp | null;
  readonly maxlength: number; 
  readonly format: string;
  readonly maskChar: string;

  private selection: [number, number];
  private value: string;
  private data: string;

  constructor({
    currentValue = '',
    selectionStart = 0,
    selectionEnd = 0,
    inputType = '',
    inputData = '',
    validSymbols = '',
    format = '',
    maxlength = Infinity,
    maskChar = '*',
  }) {
    this.inputData = inputData;
    this.inputType = inputType;
    this.currentValue = currentValue;
    this.currentSelection = [selectionStart, selectionEnd];
    this.validSymbols = validSymbols;
    this.invalidSymbolsRegex = validSymbols ? new RegExp(`[^${this.validSymbols}]`, 'g') : null;
    this.maxlength = maxlength;
    this.format = format;
    this.maskChar = maskChar;

    this.selection = [selectionStart, selectionEnd]
    this.value = '';
    this.data = '';

    if (this.checkMaxLength() || this.isHistoryType()) {
      this.value = this.currentValue;
      this.inputData = '';
      return;
    }

    // Backward delete

    if (this.isBackwardDeleteType()) {
      let [selectionStart, selectionEnd] = this.getCurrentSelection(); // eslint-disable-line prefer-const
      selectionStart -= this.hasSelection() ? 0 : 1;
      this.data = this.currentValue.substring(selectionStart, selectionEnd);
      this.value = insertToString(this.currentValue, '', selectionStart, selectionEnd);
      this.setSelectionPosition(selectionStart, selectionStart);
    }

    if (this.isBackwardWordDeleteType()) {
      const [selectionStart] = this.getCurrentSelection();
      const start = this.currentValue.substring(0, selectionStart);
      const end = this.currentValue.substring(selectionStart);
      const [part, value] = this.getDeletePartFromValue(start, end);
      this.data = part;
      this.value = value;
      this.setSelectionPosition(selectionStart - part.length, selectionStart - part.length);
    }

    if (this.isBackwardLineDeleteType()) {
      const [selectionStart] = this.getCurrentSelection();
      this.data = this.currentValue.substring(0, selectionStart);
      this.value = this.currentValue.substring(selectionStart);
      this.setSelectionPosition(0, 0);
    }

    // Forward delete

    if (this.isForwardDeleteType()) {
      let [selectionStart, selectionEnd] = this.getCurrentSelection(); // eslint-disable-line prefer-const
      selectionEnd += this.hasSelection() ? 0 : 1;
      this.data = this.currentValue.substring(selectionStart, selectionEnd);
      this.value = insertToString(this.currentValue, '', selectionStart, selectionEnd);
      this.setSelectionPosition(selectionStart, selectionStart);
    }

    if (this.isForwardWordDeleteType()) {
      const [selectionStart] = this.getCurrentSelection();
      const start = this.currentValue.substring(0, selectionStart);
      const end = this.currentValue.substring(selectionStart);
      const [part, value] = this.getDeletePartFromValue(start, end, 'forward');
      this.data = part;
      this.value = value;
      this.setSelectionPosition(selectionStart, selectionStart);
    }

    if (this.isForwardLineDeleteType()) {
      const [selectionStart] = this.getCurrentSelection();
      this.data = this.currentValue.substring(selectionStart);
      this.value = this.currentValue.substring(0, selectionStart);
      this.setSelectionPosition(selectionStart, selectionStart);
    }

    // Insert

    if (!this.format && !this.isDeleteType()) {
      const [selectionStart, selectionEnd] = this.getCurrentSelection();
      this.data = this.replaceInvalidSymbols(this.inputData);
      if (this.maxlength < Infinity) {
        const max = (this.maxlength - this.currentValue.length) + (selectionEnd - selectionStart);
        this.data = this.data.substring(0, max);
      }
      if (this.data) {
        this.value = insertToString(this.currentValue, this.data, selectionStart, selectionEnd);
        const caretPosition = selectionStart + this.data.length;
        this.setSelectionPosition(caretPosition, caretPosition);
      } else {
        this.value = this.currentValue;
      }
    }

    // Format

    if (this.format && this.isDeleteType()) {
      const rawValue = this.getRawValue(this.value);
      const formatedValue = this.getFormattedValue(rawValue);
      this.value = formatedValue;
    }

    if (this.format && !this.isDeleteType()) {
      let [selectionStart, selectionEnd] = this.getCurrentSelection();
      const startIndex = this.format.indexOf(this.maskChar);

      if (selectionStart < startIndex && !this.checkFullSelection()) {
        const diff = startIndex - selectionStart;
        selectionStart += diff;
        selectionEnd = selectionEnd < selectionStart ? selectionStart : selectionEnd;
      }

      if (this.hasSelection() && !this.checkFullSelection()) {
        const selectionPart = this.currentValue.substring(selectionStart, selectionEnd);
        const replacedCount = this.replaceInvalidSymbols(selectionPart).length;
        this.data = this.replaceInvalidSymbols(this.inputData).substring(0, replacedCount);
      } else {
        this.data = this.replaceInvalidSymbols(this.inputData);
      }

      if (this.data) {
        this.value = insertToString(this.currentValue, this.data, selectionStart, selectionEnd);
      } else {
        this.value = this.currentValue;
      }

      const rawValue = this.getRawValue(this.value);
      const formatedValue = this.getFormattedValue(rawValue);

      const offset = this.getCaretOffset(this.data, selectionStart);
      const caretPosition = selectionStart + offset;

      this.setSelectionPosition(caretPosition, caretPosition);
      this.value = formatedValue;
    }
  }

  isInsertType() {
    return this.inputType === 'insertText';
  }

  isDeleteType() {
    return this.inputType.includes('delete');
  }

  isHistoryType() {
    return ['historyRedo', 'historyUndo'].includes(this.inputType);
  }

  isBackwardDeleteType() {
    return ['deleteContentBackward'].includes(this.inputType);
  }

  isBackwardWordDeleteType() {
    return ['deleteWordBackward'].includes(this.inputType);
  }

  isBackwardLineDeleteType() {
    return ['deleteSoftLineBackward', 'deleteHardLineBackward'].includes(this.inputType);
  }

  isBackwardDelete() {
    return this.isBackwardDeleteType() ||
      this.isBackwardWordDeleteType() ||
      this.isBackwardLineDeleteType();
  }

  isForwardDeleteType() {
    return ['deleteContentForward'].includes(this.inputType);
  }

  isForwardWordDeleteType() {
    return ['deleteWordForward'].includes(this.inputType);
  }

  isForwardLineDeleteType() {
    return ['deleteSoftLineForward', 'deleteHardLineForward'].includes(this.inputType);
  }

  isForwardDelete() {
    return this.isForwardDeleteType() ||
      this.isForwardWordDeleteType() ||
      this.isForwardLineDeleteType();
  }

  checkValueChange() {
    return this.currentValue !== this.value;
  }

  checkSelectionChange() {
    return String(this.getCurrentSelection()) !== String(this.getSelectionPosition());
  }

  checkMaxLength() {
    return !this.isDeleteType() && !this.hasSelection() &&
      this.currentValue.length >= this.maxlength;
  }

  checkUnexpectedInput() {
    return this.inputData && this.inputData !== this.data && this.inputData.length === 1;
  }

  getCurrentSelection() {
    return this.currentSelection;
  }

  hasSelection() {
    const [start, end] = this.getCurrentSelection();
    return start !== end;
  }

  checkFullSelection() {
    const [start, end] = this.getCurrentSelection();
    const valueLength = this.currentValue.length;
    return valueLength > 0 && start === 0 && end >= valueLength;
  }

  getSelectionPosition() {
    return this.selection;
  }

  setSelectionPosition(start: number, end: number) {
    this.selection = [start, end];
  }

  getValue() {
    return this.value;
  }

  getValidInput() {
    return this.data;
  }

  getInputType() {
    return this.inputType;
  }

  getHistoryUndo() {
    const [selectionStart, selectionEnd] = this.getCurrentSelection();
    const validData = this.getValidInput();
    if (this.isForwardDelete()) {
      return {
        type: this.getInputType(),
        value: this.currentValue,
        selectionStart,
        selectionEnd: selectionStart + validData.length,
      };
    }
    if (this.isBackwardDelete()) {
      return {
        type: this.getInputType(),
        value: this.currentValue,
        selectionStart: selectionEnd - validData.length,
        selectionEnd,        
      };
    }
    return {
      type: this.getInputType(),
      value: this.currentValue,
      selectionStart,
      selectionEnd,
    };
  }

  getHistoryData() {
    const [selectionStart, selectionEnd] = this.getSelectionPosition();
    return {
      type: this.getInputType(),
      value: this.getValue(),
      selectionStart,
      selectionEnd,
    };
  }

  getDeletePartFromValue(startPart: string, endPart: string, direction = 'backward') {
    const isBackward = direction === 'backward';
    const source = isBackward ? startPart.split('').reverse().join('') : endPart;
    const invalidRegex = this.invalidSymbolsRegex || /\s/g;

    let part = '';
    let value = '';

    for (let i = 0; i < source.length; i += 1) {
      const char = source.charAt(i);
      if (invalidRegex.test(char) && i !== 0) {
        value = source.substring(i);
        break;
      }
      part += char;
    }

    if (isBackward) {
      part = part.split('').reverse().join('');
      value = value.split('').reverse().join('') + endPart;
    } else {
      value = startPart + value;
    }

    return [part, value];
  }

  replaceInvalidSymbols(value: string) {
    return this.invalidSymbolsRegex ? value.replace(this.invalidSymbolsRegex, '') : value;
  }

  getRawValue(value: string) {
    if (!value) return '';
    if (!this.format) return value;

    const regex = new RegExp(`[^${this.validSymbols}${this.maskChar}]`, 'g');
    const cleanFormat = this.format.replace(regex, '');
    const cleanValue = this.replaceInvalidSymbols(value);

    let raw = '';

    for (let i = 0; cleanFormat[i]; i += 1) {
      const formatChar = cleanFormat.charAt(i);
      const valueChar = cleanValue.charAt(i);
      if (!valueChar) {
        break;
      }
      if (formatChar !== this.maskChar) {
        raw += formatChar;
        continue;
      }
      raw += valueChar;
    }

    return raw;
  }

  getFormattedValue(value: string) {
    if (!value) return '';
    if (!this.format) return value;

    const regex = new RegExp(`[${this.validSymbols}]`, 'g');
    const format = this.format.replace(regex, this.maskChar);

    let formatted = '';

    for (let i = 0, n = 0; format[i]; i += 1) {
      const formatChar = format.charAt(i);
      const valueChar = value.charAt(n);
      if (!valueChar) {
        const isLastChar = format.length - 1 === i;
        if (isLastChar && formatChar !== this.maskChar) {
          formatted += formatChar;
        }
        break;
      }
      if (formatChar !== this.maskChar) {
        formatted += formatChar;
        continue;
      }
      formatted += valueChar;
      n += 1;
    }

    return formatted;
  }

  getCaretOffset(value: string, startIndex: number) {
    if (!this.format || !value) return 0;

    const format = this.format.substring(startIndex);

    let result = '';

    for (let i = 0, n = 0; i < format.length; i += 1) {
      const mask = format.charAt(i);
      const char = value.charAt(n);
      if (!char) {
        result = result + format.substring(i);
        break;
      }
      if (mask === this.maskChar) {
        result += char;
        n += 1;
      } else {
        result += mask;
      }
    }

    const maskCharIndex = result.indexOf(this.maskChar);
    const offset = maskCharIndex >= 0 ? maskCharIndex : result.length;

    return offset;
  }
}

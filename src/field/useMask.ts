import { ref, unref, nextTick, type Ref } from 'vue';
import { checkMacOS } from '../utils/platform';
import ParseInputEvent from '../utils/parseInput';

const updateInputValue = (
  target: HTMLInputElement,
  value: string,
  inputType: string,
  data?: string
) => {
  if (!target) return;
  target.value = value;
  target.dispatchEvent(new InputEvent('input', { data, inputType }));
};

const updateInputSelection = (
  target: HTMLInputElement,
  selectionStart: number,
  selectionEnd: number,
) => nextTick(() => {
  if (!target) return;
  target.setSelectionRange(selectionStart, selectionEnd);
});

type HistoryItem = {
  type: string
  value: string
  selectionStart: number
  selectionEnd: number
}

type ParsePayload = {
  currentValue: string
  selectionStart: number
  selectionEnd: number
  inputType: string
  inputData: string
  validSymbols?: string
  format?: string
  maxlength?: number
}

export default (options: {
  validSymbols: string | Ref<string>
  format?: string | Ref<string>
  beforeParse?: (parsePayload: ParsePayload) => void
  afterParse?: (parseEvent: ParseInputEvent) => void
  onUnexpectedInput?: (target: HTMLInputElement, parseEvent: ParseInputEvent) => void
}) => {
  const historyUndo = ref<HistoryItem[]>([]);
  const historyRedo = ref<HistoryItem[]>([]);
  const historyItem = ref<HistoryItem | null>(null);

  const setHistoryItem = (item: HistoryItem) => {
    if (!item) return;
    historyItem.value = item;
  };

  const clearHistory = () => {
    historyItem.value = null;
    historyUndo.value = [];
    historyRedo.value = [];
  };

  const addHistoryItem = (event: ParseInputEvent) => {
    const undoList = unref(historyUndo);
    const lastUndo = undoList[undoList.length - 1];
    const itemUndo = event.getHistoryUndo();

    // Если последняя запись идентична по типу и позиции курсора, то избегаем записи в историю
    // Это позволяет повторить нативное поведение (отмена всего ввода, а не последнего символа)

    // TODO
    // для масок с форматом лучше сделать запись в историю осмысленной части
    // 23.05.2020 -> 23 | 05 | 2020
    if (
      !event.hasSelection() &&
      lastUndo?.type === itemUndo.type &&
      (
        (event.isForwardDelete() && lastUndo.selectionStart === itemUndo.selectionStart) ||
        (event.isBackwardDelete() && lastUndo.selectionStart === itemUndo.selectionEnd) ||
        (event.isInsertType() && lastUndo.selectionEnd === itemUndo.selectionStart - 1)
      )
    ) {
      lastUndo.selectionStart -= Number(event.isBackwardDelete());
      lastUndo.selectionEnd += Number(event.isForwardDelete() || event.isInsertType());
    } else {
      unref(historyUndo).push(itemUndo);
    }

    setHistoryItem(event.getHistoryData());
  };


  // Parse value

  const parseValue = (modelValue: string, currentValue: string) => {
    if (!modelValue) return '';

    if (modelValue === currentValue) {
      return currentValue;
    }

    const payload = {
      currentValue,
      selectionStart: 0,
      selectionEnd: currentValue.length,
      inputType: 'replaceContentByPropWatcher',
      inputData: modelValue,
      validSymbols: unref(options.validSymbols),
      format: unref(options.format),
    };

    if (typeof options.beforeParse === 'function') {
      options.beforeParse(payload);
    }

    const parseEvent = new ParseInputEvent(payload);

    if (typeof options.afterParse === 'function') {
      options.afterParse(parseEvent);
    }

    return parseEvent.getValue();
  };


  // Parse input

  const parseInput = (event: Event) => {
    const { inputType = '', data = '' } = event as InputEvent;

    if (inputType === 'insertLineBreak') return;

    event.preventDefault();

    const target = (event.target as HTMLInputElement);

    const payload = {
      currentValue: target.value,
      selectionStart: target.selectionStart || 0,
      selectionEnd: target.selectionEnd || 0,
      inputType,
      inputData: data || '',
      validSymbols: unref(options.validSymbols),
      format: unref(options.format),
      maxlength: target.maxLength >= 1 ? target.maxLength : undefined,
    };

    if (typeof options.beforeParse === 'function') {
      options.beforeParse(payload);
    }

    const parseEvent = new ParseInputEvent(payload);

    if (typeof options.afterParse === 'function') {
      options.afterParse(parseEvent);
    }

    if (parseEvent.checkUnexpectedInput()) {
      options.onUnexpectedInput?.(target, parseEvent);
    }

    if (parseEvent.checkValueChange()) {
      updateInputValue(target,
        parseEvent.getValue(),
        parseEvent.getInputType(),
        parseEvent.getValidInput(),
      );
      addHistoryItem(parseEvent);
    }

    if (parseEvent.checkSelectionChange() || parseEvent.checkValueChange()) {
      updateInputSelection(target, ...parseEvent.getSelectionPosition());
    }
  };


  // Parse keydown

  const isMac = checkMacOS();

  const parseKeydown = (event: KeyboardEvent) => {
    const { metaKey, ctrlKey, shiftKey, code } = event;
    const target = (event.target as HTMLInputElement);

    const isUndo = isMac
      ? (code === 'KeyZ' && metaKey && !shiftKey)
      : (code === 'KeyZ' && ctrlKey);

    if (isUndo) {
      const undo = unref(historyUndo).pop();
      const item = unref(historyItem);
      if (undo && item) {
        unref(historyRedo).push(item);
      }
      if (undo) {
        setHistoryItem(undo);
        updateInputValue(target, undo.value, 'historyUndo', undo.value);
        updateInputSelection(target, undo.selectionStart, undo.selectionEnd);
      }
      return;
    }

    const isRedo = isMac
      ? (code === 'KeyZ' && metaKey && shiftKey)
      : (code === 'KeyY' && ctrlKey);

    if (isRedo) {
      const redo = unref(historyRedo).pop();
      const item = unref(historyItem);
      if (redo && item) {
        unref(historyUndo).push(item);
      }
      if (redo) {
        setHistoryItem(redo);
        updateInputValue(target, redo.value, 'historyRedo', redo.value);
        updateInputSelection(target, redo.selectionStart, redo.selectionEnd);
      }
    }
  };

  return {
    historyUndo,
    historyRedo,
    clearHistory,
    parseValue,
    parseInput,
    parseKeydown,
  };
};

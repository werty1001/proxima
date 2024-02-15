import { describe, it, expect } from 'vitest';
import ParseInputEvent from '@/utils/parseInput';

describe('utils/parseInput', () => {
  it('Insert', () => {
    const payload = {
      currentValue: '123',
      inputType: 'insertText',
      inputData: '66b7',
      selectionStart: 1,
      selectionEnd: 1,
      validSymbols: '0-9',
    };

    const insertInvalidChar = new ParseInputEvent(payload);

    expect(insertInvalidChar.getValue()).toBe('166723');
    expect(insertInvalidChar.getValidInput()).toBe('667');
    expect(insertInvalidChar.hasSelection()).toBe(false);
    expect(insertInvalidChar.checkValueChange()).toBe(true);
    expect(insertInvalidChar.checkSelectionChange()).toBe(true);
    expect(insertInvalidChar.checkUnexpectedInput()).toBe(false);
    expect(insertInvalidChar.getSelectionPosition()).toStrictEqual([4, 4]);

    const selectionInsert = new ParseInputEvent({
      ...payload,
      inputData: '5b5b',
      selectionStart: 1,
      selectionEnd: 2,
    });

    expect(selectionInsert.getValue()).toBe('1553');
    expect(selectionInsert.getValidInput()).toBe('55');
    expect(selectionInsert.hasSelection()).toBe(true);
    expect(selectionInsert.checkValueChange()).toBe(true);
    expect(selectionInsert.checkSelectionChange()).toBe(true);
    expect(selectionInsert.checkUnexpectedInput()).toBe(false);
    expect(selectionInsert.getSelectionPosition()).toStrictEqual([3, 3]);
  });

  // TODO
  // Format insert

  it('Format insert', () => {
    const payload = {
      currentValue: '',
      inputType: 'insertText',
      inputData: '7',
      selectionStart: 0,
      selectionEnd: 0,
      validSymbols: '0-9',
      format: '+7(***)***-**-**',
    };

    const insertChar = new ParseInputEvent(payload);

    expect(insertChar.getValue()).toBe('+7');
    expect(insertChar.getValidInput()).toBe('7');
    expect(insertChar.hasSelection()).toBe(false);
    expect(insertChar.checkValueChange()).toBe(true);
    expect(insertChar.checkSelectionChange()).toBe(true);
    expect(insertChar.checkUnexpectedInput()).toBe(false);
  });


  // Unexpected input

  it('UnexpectedInput', () => {
    const payload = {
      currentValue: 'aa',
      inputType: 'insertText',
      inputData: '7',
      selectionStart: 0,
      selectionEnd: 0,
      validSymbols: 'ab',
    };

    const insertInvalidChar = new ParseInputEvent(payload);

    expect(insertInvalidChar.getValue()).toBe('aa');
    expect(insertInvalidChar.getValidInput()).toBe('');
    expect(insertInvalidChar.checkSelectionChange()).toBe(false);
    expect(insertInvalidChar.checkUnexpectedInput()).toBe(true);
    expect(insertInvalidChar.getSelectionPosition()).toStrictEqual([0, 0]);

    const insertValidChar = new ParseInputEvent({
      ...payload,
      inputData: 'b',
    });

    expect(insertValidChar.getValue()).toBe('baa');
    expect(insertValidChar.getValidInput()).toBe('b');
    expect(insertValidChar.checkSelectionChange()).toBe(true);
    expect(insertValidChar.checkUnexpectedInput()).toBe(false);
    expect(insertValidChar.getSelectionPosition()).toStrictEqual([1, 1]);
  });


  // Maxlength

  it('MaxLength', () => {
    const payload = {
      currentValue: '12345',
      inputType: 'insertText',
      inputData: '6',
      selectionStart: 0,
      selectionEnd: 0,
      maxlength: 5,
    };

    const insertChar = new ParseInputEvent(payload);

    expect(insertChar.getValue()).toBe('12345');
    expect(insertChar.getValidInput()).toBe('');
    expect(insertChar.checkSelectionChange()).toBe(false);
    expect(insertChar.checkMaxLength()).toBe(true);
    expect(insertChar.getSelectionPosition()).toStrictEqual([0, 0]);

    const insertChars = new ParseInputEvent({
      ...payload,
      inputData: '67',
      currentValue: '1234',
    });

    expect(insertChars.getValue()).toBe('61234');
    expect(insertChars.getValidInput()).toBe('6');
    expect(insertChars.checkSelectionChange()).toBe(true);
    expect(insertChars.checkMaxLength()).toBe(false);
    expect(insertChars.getSelectionPosition()).toStrictEqual([1, 1]);

    const selectionInsert = new ParseInputEvent({
      ...payload,
      selectionStart: 0,
      selectionEnd: 1,
    });

    expect(selectionInsert.getValue()).toBe('62345');
    expect(selectionInsert.getValidInput()).toBe('6');
    expect(selectionInsert.checkSelectionChange()).toBe(true);
    expect(selectionInsert.checkMaxLength()).toBe(false);
    expect(selectionInsert.getSelectionPosition()).toStrictEqual([1, 1]);

    const selectionInsertChars = new ParseInputEvent({
      ...payload,
      inputData: '678',
      selectionStart: 1,
      selectionEnd: 3,
    });

    expect(selectionInsertChars.getValue()).toBe('16745');
    expect(selectionInsertChars.getValidInput()).toBe('67');
    expect(selectionInsertChars.checkSelectionChange()).toBe(true);
    expect(selectionInsertChars.checkMaxLength()).toBe(false);
    expect(selectionInsertChars.getSelectionPosition()).toStrictEqual([3, 3]);
  });


  // Backward delete

  it('BackwardDelete', () => {
    const deletePayload = {
      currentValue: '12345',
      inputType: 'deleteContentBackward',
      inputData: '',
      selectionStart: 4,
      selectionEnd: 4,
    };

    const oneCharDelete = new ParseInputEvent(deletePayload);

    expect(oneCharDelete.getValue()).toBe('1235');
    expect(oneCharDelete.hasSelection()).toBe(false);
    expect(oneCharDelete.isDeleteType()).toBe(true);
    expect(oneCharDelete.isInsertType()).toBe(false);
    expect(oneCharDelete.isForwardDelete()).toBe(false);
    expect(oneCharDelete.isBackwardDelete()).toBe(true);
    expect(oneCharDelete.isBackwardDeleteType()).toBe(true);
    expect(oneCharDelete.checkValueChange()).toBe(true);
    expect(oneCharDelete.checkSelectionChange()).toBe(true);
    expect(oneCharDelete.checkFullSelection()).toBe(false);
    expect(oneCharDelete.getSelectionPosition()).toStrictEqual([3, 3]);

    const selectionDelete = new ParseInputEvent({ ...deletePayload, selectionStart: 1 });

    expect(selectionDelete.getValue()).toBe('15');
    expect(selectionDelete.hasSelection()).toBe(true);
    expect(selectionDelete.checkValueChange()).toBe(true);
    expect(selectionDelete.checkSelectionChange()).toBe(true);
    expect(selectionDelete.checkFullSelection()).toBe(false);
    expect(selectionDelete.getSelectionPosition()).toStrictEqual([1, 1]);

    const fullSelectionDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 0,
      selectionEnd: 5,
    });

    expect(fullSelectionDelete.getValue()).toBe('');
    expect(fullSelectionDelete.hasSelection()).toBe(true);
    expect(fullSelectionDelete.checkValueChange()).toBe(true);
    expect(fullSelectionDelete.checkSelectionChange()).toBe(true);
    expect(fullSelectionDelete.checkFullSelection()).toBe(true);
    expect(fullSelectionDelete.getSelectionPosition()).toStrictEqual([0, 0]);
  });


  // Backward word delete

  it('BackwardWordDelete', () => {
    const deletePayload = {
      currentValue: '123 456 789',
      inputType: 'deleteWordBackward',
      inputData: '',
      selectionStart: 5,
      selectionEnd: 5,
    };

    const oneCharDelete = new ParseInputEvent(deletePayload);

    expect(oneCharDelete.getValue()).toBe('123 56 789');
    expect(oneCharDelete.hasSelection()).toBe(false);
    expect(oneCharDelete.isDeleteType()).toBe(true);
    expect(oneCharDelete.isInsertType()).toBe(false);
    expect(oneCharDelete.isForwardDelete()).toBe(false);
    expect(oneCharDelete.isBackwardDelete()).toBe(true);
    expect(oneCharDelete.isBackwardWordDeleteType()).toBe(true);
    expect(oneCharDelete.checkValueChange()).toBe(true);
    expect(oneCharDelete.checkSelectionChange()).toBe(true);
    expect(oneCharDelete.checkFullSelection()).toBe(false);
    expect(oneCharDelete.getSelectionPosition()).toStrictEqual([4, 4]);

    const partDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 4,
      selectionEnd: 4,
    });

    expect(partDelete.getValue()).toBe('456 789');
    expect(partDelete.checkValueChange()).toBe(true);
    expect(partDelete.checkSelectionChange()).toBe(true);
    expect(partDelete.checkFullSelection()).toBe(false);
    expect(partDelete.getSelectionPosition()).toStrictEqual([0, 0]);

    const endDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 11,
      selectionEnd: 11,
    });

    expect(endDelete.getValue()).toBe('123 456 ');
    expect(endDelete.checkValueChange()).toBe(true);
    expect(endDelete.checkSelectionChange()).toBe(true);
    expect(endDelete.checkFullSelection()).toBe(false);
    expect(endDelete.getSelectionPosition()).toStrictEqual([8, 8]);
  });


  // Backward line delete

  it('BackwardLineDelete', () => {
    const deletePayload = {
      currentValue: '123 456 789',
      inputType: 'deleteSoftLineBackward',
      inputData: '',
      selectionStart: 5,
      selectionEnd: 5,
    };

    const partDelete = new ParseInputEvent(deletePayload);

    expect(partDelete.getValue()).toBe('56 789');
    expect(partDelete.hasSelection()).toBe(false);
    expect(partDelete.isDeleteType()).toBe(true);
    expect(partDelete.isInsertType()).toBe(false);
    expect(partDelete.isForwardDelete()).toBe(false);
    expect(partDelete.isBackwardDelete()).toBe(true);
    expect(partDelete.isBackwardLineDeleteType()).toBe(true);
    expect(partDelete.checkValueChange()).toBe(true);
    expect(partDelete.checkSelectionChange()).toBe(true);
    expect(partDelete.checkFullSelection()).toBe(false);
    expect(partDelete.getSelectionPosition()).toStrictEqual([0, 0]);

    const fullDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 11,
      selectionEnd: 11,
    });

    expect(fullDelete.getValue()).toBe('');
    expect(fullDelete.checkValueChange()).toBe(true);
    expect(fullDelete.checkSelectionChange()).toBe(true);
    expect(fullDelete.checkFullSelection()).toBe(false);
    expect(fullDelete.getSelectionPosition()).toStrictEqual([0, 0]);
  });


  // Forward delete

  it('ForwardDelete', () => {
    const deletePayload = {
      currentValue: '12345',
      inputType: 'deleteContentForward',
      inputData: '',
      selectionStart: 2,
      selectionEnd: 2,
    };

    const oneCharDelete = new ParseInputEvent(deletePayload);

    expect(oneCharDelete.getValue()).toBe('1245');
    expect(oneCharDelete.hasSelection()).toBe(false);
    expect(oneCharDelete.isDeleteType()).toBe(true);
    expect(oneCharDelete.isInsertType()).toBe(false);
    expect(oneCharDelete.isForwardDelete()).toBe(true);
    expect(oneCharDelete.isForwardDeleteType()).toBe(true);
    expect(oneCharDelete.isBackwardDelete()).toBe(false);
    expect(oneCharDelete.checkValueChange()).toBe(true);
    expect(oneCharDelete.checkSelectionChange()).toBe(false);
    expect(oneCharDelete.checkFullSelection()).toBe(false);
    expect(oneCharDelete.getSelectionPosition()).toStrictEqual([2, 2]);

    const selectionDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 1,
      selectionEnd: 3,
    });

    expect(selectionDelete.getValue()).toBe('145');
    expect(selectionDelete.hasSelection()).toBe(true);
    expect(selectionDelete.checkValueChange()).toBe(true);
    expect(selectionDelete.checkSelectionChange()).toBe(true);
    expect(selectionDelete.checkFullSelection()).toBe(false);
    expect(selectionDelete.getSelectionPosition()).toStrictEqual([1, 1]);

    const fullSelectionDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 0,
      selectionEnd: 5,
    });

    expect(fullSelectionDelete.getValue()).toBe('');
    expect(fullSelectionDelete.hasSelection()).toBe(true);
    expect(fullSelectionDelete.checkValueChange()).toBe(true);
    expect(fullSelectionDelete.checkSelectionChange()).toBe(true);
    expect(fullSelectionDelete.checkFullSelection()).toBe(true);
    expect(fullSelectionDelete.getSelectionPosition()).toStrictEqual([0, 0]);
  });


  // Forward word delete

  it('ForwardWordDelete', () => {
    const deletePayload = {
      currentValue: '123 456 789',
      inputType: 'deleteWordForward',
      inputData: '',
      selectionStart: 2,
      selectionEnd: 2,
    };

    const oneCharDelete = new ParseInputEvent(deletePayload);

    expect(oneCharDelete.getValue()).toBe('12 456 789');
    expect(oneCharDelete.hasSelection()).toBe(false);
    expect(oneCharDelete.isDeleteType()).toBe(true);
    expect(oneCharDelete.isInsertType()).toBe(false);
    expect(oneCharDelete.isForwardDelete()).toBe(true);
    expect(oneCharDelete.isForwardWordDeleteType()).toBe(true);
    expect(oneCharDelete.isBackwardDelete()).toBe(false);
    expect(oneCharDelete.checkValueChange()).toBe(true);
    expect(oneCharDelete.checkSelectionChange()).toBe(false);
    expect(oneCharDelete.checkFullSelection()).toBe(false);
    expect(oneCharDelete.getSelectionPosition()).toStrictEqual([2, 2]);

    const partDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 3,
      selectionEnd: 3,
    });

    expect(partDelete.getValue()).toBe('123 789');
    expect(partDelete.checkValueChange()).toBe(true);
    expect(partDelete.checkSelectionChange()).toBe(false);
    expect(partDelete.checkFullSelection()).toBe(false);
    expect(partDelete.getSelectionPosition()).toStrictEqual([3, 3]);

    const startDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 0,
      selectionEnd: 0,
    });

    expect(startDelete.getValue()).toBe(' 456 789');
    expect(startDelete.checkValueChange()).toBe(true);
    expect(startDelete.checkSelectionChange()).toBe(false);
    expect(startDelete.checkFullSelection()).toBe(false);
    expect(startDelete.getSelectionPosition()).toStrictEqual([0, 0]);
  });


  // Forward line delete

  it('ForwardLineDelete', () => {
    const deletePayload = {
      currentValue: '123 456 789',
      inputType: 'deleteSoftLineForward',
      inputData: '',
      selectionStart: 5,
      selectionEnd: 5,
    };

    const partDelete = new ParseInputEvent(deletePayload);

    expect(partDelete.getValue()).toBe('123 4');
    expect(partDelete.hasSelection()).toBe(false);
    expect(partDelete.isDeleteType()).toBe(true);
    expect(partDelete.isInsertType()).toBe(false);
    expect(partDelete.isForwardDelete()).toBe(true);
    expect(partDelete.isForwardLineDeleteType()).toBe(true);
    expect(partDelete.isBackwardDelete()).toBe(false);
    expect(partDelete.checkValueChange()).toBe(true);
    expect(partDelete.checkSelectionChange()).toBe(false);
    expect(partDelete.checkFullSelection()).toBe(false);
    expect(partDelete.getSelectionPosition()).toStrictEqual([5, 5]);

    const fullDelete = new ParseInputEvent({
      ...deletePayload,
      selectionStart: 0,
      selectionEnd: 0,
    });

    expect(fullDelete.getValue()).toBe('');
    expect(fullDelete.checkValueChange()).toBe(true);
    expect(fullDelete.checkSelectionChange()).toBe(false);
    expect(fullDelete.checkFullSelection()).toBe(false);
    expect(fullDelete.getSelectionPosition()).toStrictEqual([0, 0]);
  });
});

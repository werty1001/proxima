import { describe, it, expect } from 'vitest';
import insertToString from '@/utils/insertToString';

describe('utils/insertToString', () => {
  const str = '1234567';

  it('Simple insert', () => {
    expect(insertToString(str, '###')).toBe('###1234567');
    expect(insertToString(str, '#', 1)).toBe('1#234567');
    expect(insertToString(str, '#', 1, 1)).toBe('1#234567');
    expect(insertToString(str, '#', 1, 3)).toBe('1#4567');
    expect(insertToString(str, '##', 1, 1)).toBe('1##234567');
    expect(insertToString(str, '###', 1, 1)).toBe('1###234567');
    expect(insertToString(str, '###', 0, 3)).toBe('###4567');
    expect(insertToString(str, '###', 2, 2)).toBe('12###34567');
  });

  it('No arguments', () => {
    expect(insertToString()).toBe('');
    expect(insertToString(str)).toBe(str);
  });

  it('Start index more then str length', () => {
    expect(insertToString(str, '###', 10, 10)).toBe('1234567###');
    expect(insertToString(str, '###', 0, 10)).toBe('###');
  });

  it('Start index more then end index', () => {
    expect(insertToString(str, '###', 12, 2)).toBe('1234567###');
  });

  it('Negative index', () => {
    expect(insertToString(str, '###', -2)).toBe('###1234567');
    expect(insertToString(str, '###', -12, -4)).toBe('###1234567');
  });
});

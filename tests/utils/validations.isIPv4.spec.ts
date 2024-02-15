import { describe, it, expect } from 'vitest';
import { isIPv4 } from '@/utils/validations';

describe('utils/validations.isIPv4', () => {
  it('Should be true', () => {
    expect(isIPv4('192.168.0.1')).toBe(true);
    expect(isIPv4('127.0.0.1')).toBe(true);
    expect(isIPv4('0.10.10.10')).toBe(true);
    expect(isIPv4('0.0.0.0')).toBe(true);
    expect(isIPv4('0.255.0.255')).toBe(true);
    expect(isIPv4('192.128.255.1')).toBe(true);
    expect(isIPv4('8.8.8.8')).toBe(true);
    expect(isIPv4('23.71.254.72')).toBe(true);
    expect(isIPv4('110.234.52.124')).toBe(true);
    expect(isIPv4('128.0.0.0')).toBe(true);
    expect(isIPv4('200.168.0.0')).toBe(true);
    expect(isIPv4('115.42.150.37')).toBe(true);
    expect(isIPv4('46.51.197.88')).toBe(true);
    expect(isIPv4('100.100.100.100')).toBe(true);
  });

  it('Should be false', () => {
    expect(isIPv4('123.045.067.089')).toBe(false);
    expect(isIPv4('000.000.000.000')).toBe(false);
    expect(isIPv4('257sd.100f.85.200(V)')).toBe(false);
    expect(isIPv4('.100.100.100.100')).toBe(false);
    expect(isIPv4('100..100.100.100.')).toBe(false);
    expect(isIPv4('256.256.256.256')).toBe(false);
    expect(isIPv4('999.2.3.4')).toBe(false);
    expect(isIPv4('https://123.124.123')).toBe(false);
    expect(isIPv4('y.y.y.y')).toBe(false);
    expect(isIPv4('.254.255.0')).toBe(false);
    expect(isIPv4('1.1.1.01a')).toBe(false);
    expect(isIPv4('172.316.254.1')).toBe(false);
    expect(isIPv4('0..1.0')).toBe(false);
    expect(isIPv4('127.000.000.001')).toBe(false);
    expect(isIPv4('1asd233')).toBe(false);
    expect(isIPv4('')).toBe(false);
  });
});

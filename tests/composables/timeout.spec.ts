import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import useTimeout from '@/composables/timeout';

type UsedTimeout = ReturnType<typeof useTimeout>;

describe('composables/timeout', () => {
  let addTimeout: UsedTimeout['addTimeout'];
  let addThrottle: UsedTimeout['addThrottle'];
  let addDebounce: UsedTimeout['addDebounce'];

  const Component = defineComponent({
    setup() {
      ({ addTimeout, addThrottle, addDebounce } = useTimeout());
      return () => h('div');
    },
  });

  const wrapper = mount(Component);

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Should execute the function', () => {
    const mock = vi.fn((param: string) => param);
    const param = '123';
    addTimeout(mock, 1000, param);
    vi.advanceTimersByTime(500);
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveReturnedWith(param);
  });

  it('Should not execute the function', () => {
    const mock = vi.fn(() => console.log('executed'));
    const clearMockTimeout = addTimeout(mock, 1000);
    vi.advanceTimersByTime(500);
    expect(mock).not.toHaveBeenCalled();
    clearMockTimeout();
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mock).not.toHaveBeenCalled();
    addTimeout(mock, 1000);
    vi.advanceTimersByTime(500);
    expect(mock).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mock).not.toHaveBeenCalled();
  });

  it('Check throttle', () => {
    const mock = vi.fn((param: string) => param);
    const throttledMock = addThrottle(mock, 1000);
    const param = '345';
    expect(mock).not.toHaveBeenCalled();
    throttledMock(param);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveReturnedWith(param);
    vi.advanceTimersByTime(100);
    throttledMock(param);
    throttledMock(param);
    expect(mock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    throttledMock(param);
    throttledMock(param);
    throttledMock(param);
    expect(mock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    throttledMock(param);
    throttledMock(param);
    throttledMock(param);
    expect(mock).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(500);
    throttledMock(param);
    throttledMock(param);
    throttledMock(param);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it('Check debounce', () => {
    const mock = vi.fn(() => console.log('executed'));
    const debouncedMock = addDebounce(mock, 500);
    expect(mock).not.toHaveBeenCalled();
    debouncedMock();
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(mock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(mock).toHaveBeenCalledTimes(1);
    debouncedMock();
    expect(mock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(mock).toHaveBeenCalledTimes(1);
    debouncedMock();
    expect(mock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(400);
    expect(mock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });
});

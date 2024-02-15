import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Component from '@/spinner/spinner.vue';

describe('components/spinner.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(Component);
  });

  it('Check modifiers', async () => {
    const props = {
      label: 'Sending',
      labelPosition: 'aside',
      theme: 'primary',
      size: 's',
    };
    expect(wrapper.classes()).not.toContain(`spinner_size_${props.size}`);
    expect(wrapper.classes()).not.toContain('spinner_label_aside');
    expect(wrapper.classes()).not.toContain(`spinner_theme_${props.theme}`);
    await wrapper.setProps(props);
    expect(wrapper.classes()).toContain(`spinner_size_${props.size}`);
    expect(wrapper.classes()).toContain('spinner_label_aside');
    expect(wrapper.classes()).toContain(`spinner_theme_${props.theme}`);
  });

  it('Check label', async () => {
    const label = 'Spinner label';
    expect(wrapper.html()).not.toContain(label);
    expect(wrapper.classes()).not.toContain('spinner_has_label');
    await wrapper.setProps({ label });
    expect(wrapper.html()).toContain(label);
    expect(wrapper.classes()).toContain('spinner_has_label');
  });

  it('Check slots', () => {
    const slots = {
      default: '<div>Default slot</div>',
      label: '<label>Label slot</label>',
      prepend: '<div>Prepend slot</div>',
    };
    wrapper = mount(Component, { slots });
    expect(wrapper.html()).toContain(slots.default);
    expect(wrapper.html()).toContain(slots.label);
    expect(wrapper.html()).toContain(slots.prepend);
  });
});

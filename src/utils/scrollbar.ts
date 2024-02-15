
export const lockAttrName = 'data-scroll-locked';
export const widthProp = '--app-scrollbar-width';
export const multiplierProp = '--app-scrollbar-multiplier';

export const getScrollbarWidth = () => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  // @ts-ignore
  outer.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(outer);
  const inner = document.createElement('div');
  outer.appendChild(inner);
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
  outer.parentNode?.removeChild(outer);
  return scrollbarWidth;
};

export const setScrollbarLockStyles = () => {
  const style = document.createElement('style');

  const scrollbarWidth = getScrollbarWidth();
  document.documentElement.style.setProperty(multiplierProp, String(scrollbarWidth > 0 ? 1 : 0));
  document.documentElement.style.setProperty(widthProp, `${scrollbarWidth}px`);

  // Position fixed only for iOS,
  // solves the problem of body scrolling through the modal window
  style.innerText = `
    [${lockAttrName}] {
      --app-is-scrollbar-locked: 1;
      border-inline-end: solid var(${widthProp}) transparent;
    }
    @supports (-webkit-touch-callout: none) {[${lockAttrName}] {position: fixed;}}
  `;
  document.head.appendChild(style);
};

const getLockCount = () => Number(document.body.getAttribute(lockAttrName) || '0');

const setLockCount = (count: number) => {
  const el = document.body;
  el.setAttribute(lockAttrName, String(count));
  el.style.overflow = 'hidden';
}

const removeLockAttr = () => {
  const el = document.body;
  el.removeAttribute(lockAttrName);
  el.style.overflow = '';
};

let scrollPosition = 0;

export const lockScrollbar = () => {
  const count = getLockCount();
  if (count === 0) {
    scrollPosition = window.scrollY;
  }
  setLockCount(count + 1);
};

export const unlockScrollbar = () => {
  const count = getLockCount();
  if (count === 1) {
    removeLockAttr();
    window.scrollTo(0, scrollPosition);
  } else {
    setLockCount(count - 1);
  }
};

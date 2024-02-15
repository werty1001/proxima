export default (duration = 150, easing = 'ease-in') => {
  let blinkAnimation: Animation | null = null;

  const addBlinkAnimation = (el: HTMLInputElement | null) => {
    if (!el) return null;
    const animation = el.animate(
      [
        { background: 'rgba(var(--field-blink-rgb, 255, 0, 0), var(--field-blink-rgb-opacity, 0.15))' },
        { background: 'rgba(var(--field-blink-rgb, 255, 0, 0), 0)' },
      ],
      {
        iterations: 1,
        duration,
        easing,
      },
    );
    animation.finish();
    return animation;
  };

  return (el: HTMLInputElement) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)')?.matches) return;
    if (!blinkAnimation) {
      blinkAnimation = addBlinkAnimation(el);
    }
    if (blinkAnimation?.playState === 'running') {
      blinkAnimation.finish();
    }
    blinkAnimation?.play();
  };
};

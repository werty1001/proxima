import { ref, unref, computed, readonly, onMounted, onBeforeUnmount } from 'vue';

enum ColorSchemes {
  System = 'system',
  Dark = 'dark',
  Light = 'light',
}

export type ColorScheme = typeof ColorSchemes[keyof typeof ColorSchemes]

const schemeStorageKey = 'proxima-color-scheme';
const schemesList = Object.values(ColorSchemes);


// State

const colorScheme = ref<ColorScheme>(ColorSchemes.System);
const setScheme = (val: ColorScheme) => (colorScheme.value = val);

const isSystemDark = ref(false);
const setDarkPrefer = (val: boolean) => (isSystemDark.value = val);


// Media elements

let lightElements: NodeListOf<HTMLMetaElement>;
let darkElements: NodeListOf<HTMLMetaElement>;

const findSchemeMedia = (scheme: ColorSchemes.Light | ColorSchemes.Dark) =>
  document.querySelectorAll<HTMLMetaElement>(`[media*=prefers-color-scheme][media*=${scheme}]`);


// Methods

const setMediaAttrs = (scheme: ColorScheme) => {
  if (!lightElements) {
    lightElements = findSchemeMedia(ColorSchemes.Light);
  }
  if (!darkElements) {
    darkElements = findSchemeMedia(ColorSchemes.Dark);
  }
  const lightMediaAttr = scheme === ColorSchemes.System
    ? '(prefers-color-scheme: light)'
    : scheme === ColorSchemes.Light ? 'all' : 'not all';

  const darkMediaAttr = scheme === ColorSchemes.System
    ? '(prefers-color-scheme: dark)'
    : scheme === ColorSchemes.Dark ? 'all' : 'not all';

  for (const item of lightElements) {
    item.media = lightMediaAttr;
  }
  for (const item of darkElements) {
    item.media = darkMediaAttr;
  }
};

const setColorScheme = (scheme: ColorScheme) => {
  if (!schemesList.includes(scheme)) {
    console.warn(`Proxima WARN: Bad scheme: ${scheme}, use only: ${schemesList}!`);
    return;
  }
  setMediaAttrs(scheme);
  setScheme(scheme);
  localStorage.setItem(schemeStorageKey, scheme);
};

const setSystemColorScheme = () => setColorScheme(ColorSchemes.System);
const setLightColorScheme = () => setColorScheme(ColorSchemes.Light);
const setDarkColorScheme = () => setColorScheme(ColorSchemes.Dark);

const setPreferredColorScheme = () => {
  const match = window.matchMedia('(prefers-color-scheme: dark)');
  const onMediaChange = (event: MediaQueryListEvent) => setDarkPrefer(event.matches);

  const storageScheme = localStorage.getItem(schemeStorageKey) as ColorScheme;
  const shouldSetScheme = [ColorSchemes.Light, ColorSchemes.Dark].includes(storageScheme);

  if (shouldSetScheme) {
    setMediaAttrs(storageScheme);
  }

  onMounted(() => {
    match.addEventListener('change', onMediaChange);
    setDarkPrefer(match.matches);

    if (shouldSetScheme) {
      setScheme(storageScheme);
    }
  });
  onBeforeUnmount(() => match.removeEventListener('change', onMediaChange));
};

const isLightPreferred = computed(() =>
  unref(colorScheme) === ColorSchemes.Light ||
  unref(colorScheme) === ColorSchemes.System && !unref(isSystemDark)
);

const isDarkPreferred = computed(() =>
  unref(colorScheme) === ColorSchemes.Dark ||
  unref(colorScheme) === ColorSchemes.System && unref(isSystemDark)
);

export const useProximaColorScheme = () => ({
  colorScheme: readonly(colorScheme),
  colorSchemes: ColorSchemes,
  isDarkPreferred,
  isLightPreferred,
  setPreferredColorScheme,
  setSystemColorScheme,
  setLightColorScheme,
  setDarkColorScheme,
  setColorScheme,
});

export default useProximaColorScheme;

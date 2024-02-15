export const getPlatform = () => {
  // @ts-ignore
  return navigator?.userAgentData?.platform || navigator?.platform || 'unknown';
};

export const checkMacOS = () => {
  const platform = getPlatform();
  return platform.toLowerCase().includes('mac');
};

export const checkiOS = () => {
  const platform = getPlatform();
  return [
    'iPad Simulator', 'iPhone Simulator', 'iPod Simulator',
    'iPad', 'iPhone', 'iPod'
  ].includes(platform);
};

export const checkRTL = () => {
  return document.dir === 'rtl';
};

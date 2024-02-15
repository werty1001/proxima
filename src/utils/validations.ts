
export const isIPv4 = (value: string) => {
  if (!/^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test(value)) {
    return false;
  }
  const isValidOctet = (octet: string) =>
    /^\d+$/.test(octet) &&
    parseInt(octet) <= 255 &&
    (octet.length === 1 || octet.charAt(0) !== '0');
  return value.split('.').every(isValidOctet);
};

export const isEmail = (value: string) => /^.+@.+\..+$/.test(value);

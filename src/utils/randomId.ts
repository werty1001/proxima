/**
 *
 * @example
 * ```js
 * getRandomId() -> 't5cegw5gf'
 * ```
 * ```js
 * getRandomId('spinner') -> 'spinner-z252qp98t'
 * ```
 *
 * @return Random string
 */
export default (prefix = '') => {
  const hash = Math.random().toString(36).substring(2, 11);
  return [prefix, hash]
    .filter(Boolean)
    .join('-')
    .trim()
    .toLowerCase();
};

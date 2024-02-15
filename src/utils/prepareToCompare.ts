export default (str: string | number) => (String(str) || '')
  .trim()
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/\s\s+/g, ' ')
  .replace(/[,.-]/g, '');

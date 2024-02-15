export default (str = '', insert = '', startIndex = 0, endIndex = 0) => {
  const start = Math.max(startIndex, 0);
  const end = Math.max(endIndex, start);
  return [
    String(str).substring(0, start),
    String(insert),
    String(str).substring(end)
  ].join('');
};

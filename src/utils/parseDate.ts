const months = [
  'янв|січ|студ|қаңт|styc|jan|enero|gennaio',
  'фев|лют|ақп|luty|feb|fev|février',
  'мар|берез|сакав|наур|mar|märz',
  'апр|квіт|крас|сәу|kwie|apr|abril|avril',
  'мая|трав|май|мам|maj|may|maio|mai|maggio',
  'июн|черв|чэрв|маус|czer|jun|juin|giugno',
  'июл|лип|ліп|шіл|lip|jul|juillet|luglio',
  'авг|серп|жні|там|sier|aug|agosto|août',
  'сент|верес|верас|қырк|wrzes|sep|setembro|settembre',
  'окт|жовт|кастр|қаз|paźd|oct|outubro|ottobre|oktober',
  'ноя|листопад|ліст|қар|listopad|nov',
  'дек|груд|снеж|желт|grud|dec|diciembre|dez|décembre|dicembre',
];

const formatDate = (year: string, month: string, day: string) => [
  year,
  month.padStart(2, '0'),
  day.padStart(2, '0'),
].join('-');

/**
 * Exploding a date from a string in different languages:
 * ru, fr, en, es, pt, de, it, be, kz, ua, pl
 *
 * @example
 * ```js
 * parseDate('13 April 1999') -> '1999-04-13'
 * ```
 * ```js
 * parseDate('26 июня 2024') -> '2024-06-26'
 * ```
 *
 * @return Date string with `YYYY-MM-DD` format or `''`
 */
export default (str: string) => {
  const value = (str || '').toLowerCase();

  if (value.length < 8) {
    return '';
  }

  const isoDate = value.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (isoDate) {
    const [, year, month, day] = isoDate;
    return formatDate(year, month, day);
  }

  const textDate = value.match(/(\d{1,2})(.+?)(\d{4})/);

  if (textDate) {
    const [, day, text, year] = textDate;
    const monthIndex = months.findIndex((el) => new RegExp(el).test(text));
    const month = monthIndex >= 0 ? String(monthIndex + 1) : null;
    return month ? formatDate(year, month, day) : '';
  }

  return '';
};

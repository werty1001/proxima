import { describe, it, expect } from 'vitest';
import parseDate from '@/utils/parseDate';

describe('utils/parseDate', () => {
  it('Should return empty string', () => {
    expect(parseDate('12 марта')).toBe('');
    expect(parseDate('fsf ssdf')).toBe('');
    expect(parseDate('1223')).toBe('');
    expect(parseDate('')).toBe('');
  });

  it('Should parse date', () => {
    expect(parseDate('1 мая 1987')).toBe('1987-05-01');
    expect(parseDate('22 октября 1972')).toBe('1972-10-22');
    expect(parseDate('15 декабря 2009 года')).toBe('2009-12-15');
    expect(parseDate('2015-03-25T12:00:00-06:30')).toBe('2015-03-25');
    expect(parseDate('26 July 1967 (age 55)')).toBe('1967-07-26');
    // expect(parseDate('1.7.1990')).toBe('1990-07-01');
    expect(parseDate('20 июля 1967[1][2] (55 лет)')).toBe('1967-07-20');
    expect(parseDate('22 октября 1972 г.')).toBe('1972-10-22');
    expect(parseDate('1962-02-10')).toBe('1962-02-10');
  });

  it('Should parse ru date', () => {
    expect(parseDate('12 января 2004')).toBe('2004-01-12');
    expect(parseDate('24 Февраля 1990')).toBe('1990-02-24');
    expect(parseDate('1 марта 2022')).toBe('2022-03-01');
    expect(parseDate('13 апреля 1999')).toBe('1999-04-13');
    expect(parseDate('2 мая 2014')).toBe('2014-05-02');
    expect(parseDate('26 июня 2024')).toBe('2024-06-26');
    expect(parseDate('19 июля 1900')).toBe('1900-07-19');
    expect(parseDate('15 августа 1984')).toBe('1984-08-15');
    expect(parseDate('22 сентября 2002')).toBe('2002-09-22');
    expect(parseDate('7 октября 1975')).toBe('1975-10-07');
    expect(parseDate('14 ноября 1987')).toBe('1987-11-14');
    expect(parseDate('30 декабря 2000')).toBe('2000-12-30');
  });

  it('Should parse fr date', () => {
    expect(parseDate('12 Janvier 2004')).toBe('2004-01-12');
    expect(parseDate('24 Février 1990')).toBe('1990-02-24');
    expect(parseDate('1 Mars 2022')).toBe('2022-03-01');
    expect(parseDate('13 Avril 1999')).toBe('1999-04-13');
    expect(parseDate('2 Mai 2014')).toBe('2014-05-02');
    expect(parseDate('26 Juin 2024')).toBe('2024-06-26');
    expect(parseDate('19 Juillet 1900')).toBe('1900-07-19');
    expect(parseDate('15 Août 1984')).toBe('1984-08-15');
    expect(parseDate('22 Septembre 2002')).toBe('2002-09-22');
    expect(parseDate('7 Octobre 1975')).toBe('1975-10-07');
    expect(parseDate('14 Novembre 1987')).toBe('1987-11-14');
    expect(parseDate('30 Décembre 2000')).toBe('2000-12-30');
  });

  it('Should parse en date', () => {
    expect(parseDate('12 january 2004')).toBe('2004-01-12');
    expect(parseDate('24 February 1990')).toBe('1990-02-24');
    expect(parseDate('1 March 2022')).toBe('2022-03-01');
    expect(parseDate('13 April 1999')).toBe('1999-04-13');
    expect(parseDate('2 May 2014')).toBe('2014-05-02');
    expect(parseDate('26 June 2024')).toBe('2024-06-26');
    expect(parseDate('19 July 1900')).toBe('1900-07-19');
    expect(parseDate('15 August 1984')).toBe('1984-08-15');
    expect(parseDate('22 September 2002')).toBe('2002-09-22');
    expect(parseDate('7 October 1975')).toBe('1975-10-07');
    expect(parseDate('14 November 1987')).toBe('1987-11-14');
    expect(parseDate('30 December 2000')).toBe('2000-12-30');
  });

  it('Should parse es date', () => {
    expect(parseDate('12 Enero 2004')).toBe('2004-01-12');
    expect(parseDate('24 Febrero 1990')).toBe('1990-02-24');
    expect(parseDate('1 Marzo 2022')).toBe('2022-03-01');
    expect(parseDate('13 Abril 1999')).toBe('1999-04-13');
    expect(parseDate('2 Mayo 2014')).toBe('2014-05-02');
    expect(parseDate('26 Junio 2024')).toBe('2024-06-26');
    expect(parseDate('19 Julio 1900')).toBe('1900-07-19');
    expect(parseDate('15 Agosto 1984')).toBe('1984-08-15');
    expect(parseDate('22 Septiembre 2002')).toBe('2002-09-22');
    expect(parseDate('7 Octubre 1975')).toBe('1975-10-07');
    expect(parseDate('14 Noviembre 1987')).toBe('1987-11-14');
    expect(parseDate('30 Diciembre 2000')).toBe('2000-12-30');
  });

  it('Should parse pt date', () => {
    expect(parseDate('12 Janeiro 2004')).toBe('2004-01-12');
    expect(parseDate('24 Fevereiro 1990')).toBe('1990-02-24');
    expect(parseDate('1 Março 2022')).toBe('2022-03-01');
    expect(parseDate('13 Abril 1999')).toBe('1999-04-13');
    expect(parseDate('2 Maio 2014')).toBe('2014-05-02');
    expect(parseDate('26 Junho 2024')).toBe('2024-06-26');
    expect(parseDate('19 Julho 1900')).toBe('1900-07-19');
    expect(parseDate('15 Agosto 1984')).toBe('1984-08-15');
    expect(parseDate('22 Setembro 2002')).toBe('2002-09-22');
    expect(parseDate('7 Outubro 1975')).toBe('1975-10-07');
    expect(parseDate('14 Novembro 1987')).toBe('1987-11-14');
    expect(parseDate('30 Dezembro 2000')).toBe('2000-12-30');
  });

  it('Should parse de date', () => {
    expect(parseDate('12 Januar 2004')).toBe('2004-01-12');
    expect(parseDate('24 Februar 1990')).toBe('1990-02-24');
    expect(parseDate('1 März 2022')).toBe('2022-03-01');
    expect(parseDate('13 April 1999')).toBe('1999-04-13');
    expect(parseDate('2 Mai 2014')).toBe('2014-05-02');
    expect(parseDate('26 Juni 2024')).toBe('2024-06-26');
    expect(parseDate('19 Juli 1900')).toBe('1900-07-19');
    expect(parseDate('15 August 1984')).toBe('1984-08-15');
    expect(parseDate('22 September 2002')).toBe('2002-09-22');
    expect(parseDate('7 Oktober 1975')).toBe('1975-10-07');
    expect(parseDate('14 November 1987')).toBe('1987-11-14');
    expect(parseDate('30 Dezember 2000')).toBe('2000-12-30');
  });

  it('Should parse it date', () => {
    expect(parseDate('12 Gennaio 2004')).toBe('2004-01-12');
    expect(parseDate('24 Febbraio 1990')).toBe('1990-02-24');
    expect(parseDate('1 Marzo 2022')).toBe('2022-03-01');
    expect(parseDate('13 Aprile 1999')).toBe('1999-04-13');
    expect(parseDate('2 Maggio 2014')).toBe('2014-05-02');
    expect(parseDate('26 Giugno 2024')).toBe('2024-06-26');
    expect(parseDate('19 Luglio 1900')).toBe('1900-07-19');
    expect(parseDate('15 Agosto 1984')).toBe('1984-08-15');
    expect(parseDate('22 Settembre 2002')).toBe('2002-09-22');
    expect(parseDate('7 Ottobre 1975')).toBe('1975-10-07');
    expect(parseDate('14 Novembre 1987')).toBe('1987-11-14');
    expect(parseDate('30 Dicembre 2000')).toBe('2000-12-30');
  });

  it('Should parse be date', () => {
    expect(parseDate('12 Студзень 2004')).toBe('2004-01-12');
    expect(parseDate('24 Люты 1990')).toBe('1990-02-24');
    expect(parseDate('1 Сакавік 2022')).toBe('2022-03-01');
    expect(parseDate('13 Красавік 1999')).toBe('1999-04-13');
    expect(parseDate('2 Май 2014')).toBe('2014-05-02');
    expect(parseDate('26 Чэрвень 2024')).toBe('2024-06-26');
    expect(parseDate('19 Ліпень 1900')).toBe('1900-07-19');
    expect(parseDate('15 Жнівень 1984')).toBe('1984-08-15');
    expect(parseDate('22 Верасень 2002')).toBe('2002-09-22');
    expect(parseDate('7 Кастрычнік 1975')).toBe('1975-10-07');
    expect(parseDate('14 Лістапад 1987')).toBe('1987-11-14');
    expect(parseDate('30 Снежань 2000')).toBe('2000-12-30');
  });

  it('Should parse kz date', () => {
    expect(parseDate('12 Қаңтар 2004')).toBe('2004-01-12');
    expect(parseDate('24 Ақпан 1990')).toBe('1990-02-24');
    expect(parseDate('1 Наурыз 2022')).toBe('2022-03-01');
    expect(parseDate('13 Сәуір 1999')).toBe('1999-04-13');
    expect(parseDate('2 Мамыр 2014')).toBe('2014-05-02');
    expect(parseDate('26 Маусым 2024')).toBe('2024-06-26');
    expect(parseDate('19 Шілде 1900')).toBe('1900-07-19');
    expect(parseDate('15 Тамыз 1984')).toBe('1984-08-15');
    expect(parseDate('22 Қыркүйек 2002')).toBe('2002-09-22');
    expect(parseDate('7 Қазан 1975')).toBe('1975-10-07');
    expect(parseDate('14 Қараша 1987')).toBe('1987-11-14');
    expect(parseDate('30 Желтоқсан 2000')).toBe('2000-12-30');
  });

  it('Should parse ua date', () => {
    expect(parseDate('12 Січень 2004')).toBe('2004-01-12');
    expect(parseDate('24 Лютий 1990')).toBe('1990-02-24');
    expect(parseDate('1 Березень 2022')).toBe('2022-03-01');
    expect(parseDate('13 Квітень 1999')).toBe('1999-04-13');
    expect(parseDate('2 Травень 2014')).toBe('2014-05-02');
    expect(parseDate('26 Червень 2024')).toBe('2024-06-26');
    expect(parseDate('19 Липень 1900')).toBe('1900-07-19');
    expect(parseDate('15 Серпень 1984')).toBe('1984-08-15');
    expect(parseDate('22 Вересень 2002')).toBe('2002-09-22');
    expect(parseDate('7 Жовтень 1975')).toBe('1975-10-07');
    expect(parseDate('14 Листопад 1987')).toBe('1987-11-14');
    expect(parseDate('30 Грудень 2000')).toBe('2000-12-30');
  });

  it('Should parse pl date', () => {
    expect(parseDate('12 styczeń 2004')).toBe('2004-01-12');
    expect(parseDate('24 luty 1990')).toBe('1990-02-24');
    expect(parseDate('1 marzec 2022')).toBe('2022-03-01');
    expect(parseDate('13 kwiecień 1999')).toBe('1999-04-13');
    expect(parseDate('2 maj 2014')).toBe('2014-05-02');
    expect(parseDate('26 czerwiec 2024')).toBe('2024-06-26');
    expect(parseDate('19 lipiec 1900')).toBe('1900-07-19');
    expect(parseDate('15 sierpień 1984')).toBe('1984-08-15');
    expect(parseDate('22 wrzesień 2002')).toBe('2002-09-22');
    expect(parseDate('7 październik 1975')).toBe('1975-10-07');
    expect(parseDate('14 listopad 1987')).toBe('1987-11-14');
    expect(parseDate('30 grudzień 2000')).toBe('2000-12-30');
  });
});

import { Transform } from 'class-transformer';
import { parse, isValid, parseISO } from 'date-fns';

export function TransformDate() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const dateDDMMYYYY = parse(value, 'dd/MM/yyyy', new Date());
      const dateYYYYMMDD = parse(value, 'yyyy/MM/dd', new Date());

      const dateISO = parseISO(value); // string iso date

      if (isValid(dateDDMMYYYY)) {
        return dateDDMMYYYY;
      } else if (isValid(dateYYYYMMDD)) {
        return dateYYYYMMDD;
      } else if (isValid(dateISO)) {
        return dateISO;
      }
    }

    // Si el valor ya es un objeto Date, lo validamos
    if (value instanceof Date && !isNaN(value.getTime())) return value;

    throw new Error('Invalid date format');
  });
}

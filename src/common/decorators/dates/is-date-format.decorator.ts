import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { parse, isValid, parseISO } from 'date-fns';

export function IsDateFormat(options?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options,
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            const dateDDMMYYYY = parse(value, 'dd/MM/yyyy', new Date());
            const dateYYYYMMDD = parse(value, 'yyyy/MM/dd', new Date());
            const dateISO = parseISO(value);

            return (
              isValid(dateDDMMYYYY) || isValid(dateYYYYMMDD) || isValid(dateISO)
            );
          }

          if (value instanceof Date) return !isNaN(value.getTime());

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `The ${args.property} must be a valid date format or a 'string' in the format dd/MM/yyyy or yyyy-MM-dd.`;
        },
      },
    });
  };
}

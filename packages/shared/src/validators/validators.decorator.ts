import { ClassConstructor } from 'class-transformer';
import { registerDecorator, ValidationOptions } from 'class-validator';

import { MatchConstraint } from './validatos.constraint';

export const MatchesWithProperty = <T>(
  type: ClassConstructor<T>,
  property: (o: T) => unknown,
  validationOptions?: ValidationOptions
) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: (object as object).constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
};

// Custom validator to ensure one date field is after another
export const IsAfter = (
  property: string,
  validationOptions?: ValidationOptions
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, validationArguments) {
          if (!validationArguments) return false;
          const [relatedPropertyName] = validationArguments.constraints;
          const relatedValue = (
            validationArguments.object as Record<string, unknown>
          )[relatedPropertyName];
          if (
            !relatedValue ||
            !value ||
            typeof value !== 'string' ||
            typeof relatedValue !== 'string'
          ) {
            return false;
          }
          return new Date(value) > new Date(relatedValue);
        },
        defaultMessage(validationArguments) {
          if (!validationArguments) return 'Invalid date comparison';
          const [relatedPropertyName] = validationArguments.constraints;
          return `${validationArguments.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
};

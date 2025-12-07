import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [fn] = args.constraints;
    return fn(args.object) === value;
  }

  defaultMessage(args: ValidationArguments) {
    const [constraintProperty]: Array<() => unknown> = args.constraints;
    return `${(constraintProperty + '').split('.')[1]} and ${
      args.property
    } does not match`;
  }
}

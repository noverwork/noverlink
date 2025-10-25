import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function validateObject<T>(
  objClass: ClassConstructor<T>,
  object: Record<string, unknown>
) {
  const validatedObject = plainToInstance(objClass, object, {
    enableImplicitConversion: true,
  }) as unknown as Record<string, unknown>;
  const errors = validateSync(validatedObject as object, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedObject;
}

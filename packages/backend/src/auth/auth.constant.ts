import * as argon2 from 'argon2';

export const AUTH_MODULE_NAME = 'auth';

export const IS_PUBLIC_KEY = 'isPublic';

export const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
};

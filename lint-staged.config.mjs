/**
 * lint-staged configuration for Noverlink monorepo
 *
 * This configuration runs on staged files before commit:
 * 1. Formats files using nx format:write
 * 2. Lints affected projects using nx affected:lint
 *
 * Note: TypeCheck is skipped in pre-commit for speed.
 * Full typecheck runs in CI before build.
 *
 * @type {import('lint-staged').Configuration}
 */
import { relative } from 'path';

const makeRelativePaths = (files) =>
  files.map((file) => relative(process.cwd(), file));

export default {
  // Format and lint using Nx commands for proper monorepo handling
  '{apps,libs}/**/*.{js,ts,jsx,tsx,json,md}': (files) => {
    const relativePaths = makeRelativePaths(files);
    return [
      `nx format:write --files=${relativePaths.join(',')}`,
      `nx affected:lint --files=${relativePaths.join(',')} --fix`,
    ];
  },
};

import { relative } from 'path';

const makeRelativePaths = (files) =>
  files.map((file) => relative(process.cwd(), file));

export default {
  '{apps,libs,packages}/**/*.{js,ts,jsx,tsx,json,md}': (files) => {
    const relativePaths = makeRelativePaths(files);
    return [
      `nx format:write --files=${relativePaths.join(',')}`,
      `nx affected:lint --files=${relativePaths.join(',')} --fix`,
    ];
  },
};

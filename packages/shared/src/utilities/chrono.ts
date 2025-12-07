export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const second = (s: number) => s * 1000;
export const minute = (m: number) => m * 60 * 1000;
export const hour = (h: number) => h * 60 * 60 * 1000;
export const day = (d: number) => d * 24 * 60 * 60 * 1000;
export const week = (w: number) => w * 7 * 24 * 60 * 60 * 1000;
export const month = (m: number) => m * 4 * 7 * 24 * 60 * 60 * 1000;
export const year = (y: number) => y * 12 * 4 * 7 * 24 * 60 * 60 * 1000;

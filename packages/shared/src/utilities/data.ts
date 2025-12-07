export const filterUndefined = <T extends object>(obj: T): Partial<T> => {
  return Object.entries(obj)
    .filter(([_, v]) => v !== undefined)
    .reduce((o, [k, v]) => ({ ...o, [k]: v }), {});
};

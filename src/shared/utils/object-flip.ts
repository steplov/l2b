export const objectFlip = (obj: unknown) =>
  Object.fromEntries(Object.entries(obj).map((a) => a.reverse()));

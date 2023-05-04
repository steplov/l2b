export const chunk = <T>(arr: T[], n: number): T[][] => {
  if (!arr.length) return [];

  return [arr.slice(0, n)].concat(chunk(arr.slice(n), n));
};

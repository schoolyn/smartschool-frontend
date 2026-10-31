export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value));
};

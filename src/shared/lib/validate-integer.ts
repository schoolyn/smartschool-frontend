export const validateInteger = (value: string): boolean => {
  const number = Number(value);
  return !isNaN(number) && Number.isInteger(number);
};

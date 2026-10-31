export const validateLength = (value: string, min: number, max: number): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

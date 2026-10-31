export const validateRequired = (value: string | number | boolean | null | undefined): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

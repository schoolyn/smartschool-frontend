export const validatePhone = (phone: string): boolean => {
  // Matches formats: (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

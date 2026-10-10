import { z } from "zod";

// the same rule the server applies to every new password: 10+ characters and at least 3 of the 4 character kinds
const CHARACTER_KINDS = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Password must be at least 10 characters long.")
      .refine(
        (value) => CHARACTER_KINDS.filter((kind) => kind.test(value)).length >= 3,
        "Password must contain at least 3 of: lowercase, uppercase, number, symbol.",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

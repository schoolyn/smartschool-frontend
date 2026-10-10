import { describe, it, expect } from "vitest";

import { passwordSchema } from "./password.schema";

const check = (password: string, confirmPassword = password) => passwordSchema.safeParse({ password, confirmPassword });
const firstError = (password: string, confirm?: string) => {
  const result = check(password, confirm);
  return result.success ? null : result.error.issues[0].message;
};

describe("passwordSchema", () => {
  it.each(["Abcdefgh12", "abcdefgh1!", "ABCDEFGH1!", "Sunrise#2026"])("accepts %s", (password) => {
    expect(check(password).success).toBe(true);
  });

  it("rejects fewer than 10 characters", () => {
    expect(firstError("Ab1!")).toBe("Password must be at least 10 characters long.");
  });

  it.each(["abcdefghijkl", "ABCDEFGHIJKL", "123456789012", "abcdefgh1234"])(
    "rejects %s, which has fewer than 3 kinds of character",
    (password) => {
      expect(firstError(password)).toBe("Password must contain at least 3 of: lowercase, uppercase, number, symbol.");
    },
  );

  it("rejects passwords that do not match, reporting it on the confirmation field", () => {
    const result = check("Abcdefgh12", "Abcdefgh13");
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({ path: ["confirmPassword"], message: "Passwords do not match." });
  });

  it("asks for the confirmation to be filled in", () => {
    expect(firstError("Abcdefgh12", "")).toBe("Please confirm your password.");
  });
});

import { describe, it, expect } from "vitest";

import { classFormSchema, sectionFormSchema, yearFormSchema } from "./classes.schema";

const firstIssue = (result: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) =>
  result.success ? null : result.error!.issues[0];

describe("yearFormSchema", () => {
  const base = { name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", isCurrent: false };

  it("accepts a normal year", () => {
    expect(yearFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an end date that is not after the start date, reporting it on the end field", () => {
    const issue = firstIssue(yearFormSchema.safeParse({ ...base, endDate: "2026-04-01" }));
    expect(issue).toMatchObject({ message: "The end date must be after the start date.", path: ["endDate"] });
  });

  it("asks for each required field", () => {
    expect(firstIssue(yearFormSchema.safeParse({ ...base, name: " " }))?.message).toBe("Name is required.");
    expect(firstIssue(yearFormSchema.safeParse({ ...base, startDate: "" }))?.message).toBe("Start date is required.");
  });
});

describe("classFormSchema and sectionFormSchema numbers", () => {
  it.each(["", "1", "40"])("accept %j as an optional whole number", (value) => {
    expect(classFormSchema.safeParse({ name: "Grade 1", numericLevel: value }).success).toBe(true);
    expect(
      sectionFormSchema.safeParse({ name: "A", capacity: value, roomNumber: "", classTeacherId: "" }).success,
    ).toBe(true);
  });

  it.each(["0", "-3", "2.5", "abc", "1e3"])("reject %j", (value) => {
    expect(firstIssue(classFormSchema.safeParse({ name: "Grade 1", numericLevel: value }))?.message).toBe(
      "Level must be a whole number above 0.",
    );
    expect(
      firstIssue(sectionFormSchema.safeParse({ name: "A", capacity: value, roomNumber: "", classTeacherId: "" }))
        ?.message,
    ).toBe("Capacity must be a whole number above 0.");
  });
});

import { describe, it, expect } from "vitest";

import { suggestNextYear } from "./classes.helpers";

const next = (name: string, startDate = "2026-04-01T00:00:00.000Z", endDate = "2027-03-31T00:00:00.000Z") =>
  suggestNextYear({ name, startDate, endDate });

describe("suggestNextYear", () => {
  it.each([
    ["2026-27", "2027-28"],
    ["2026-2027", "2027-2028"],
    ["2026", "2027"],
    ["2099-00", "2100-01"],
    ["AY 2026-27 (main)", "AY 2027-28 (main)"],
  ])("renames %s to %s", (name, expected) => {
    expect(next(name).name).toBe(expected);
  });

  it("leaves the name empty when there is no year in it, so the person types one", () => {
    expect(next("Summer batch").name).toBe("");
  });

  it("moves both dates on by one year, as plain dates", () => {
    expect(next("2026-27")).toMatchObject({ startDate: "2027-04-01", endDate: "2028-03-31" });
  });

  it("handles a leap day", () => {
    expect(next("2027-28", "2027-04-01", "2028-02-29").endDate).toBe("2029-03-01");
  });

  it("gives the same answer when called repeatedly (no leftover regex state)", () => {
    expect(next("2026-27").name).toBe("2027-28");
    expect(next("2026-27").name).toBe("2027-28");
    expect(next("2030-31").name).toBe("2031-32");
  });
});

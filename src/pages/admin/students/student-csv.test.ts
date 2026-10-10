import { describe, it, expect } from "vitest";

import { STUDENT_CSV_OPTIONAL, STUDENT_CSV_REQUIRED, studentToCsvRow } from "./student-csv";

const student = {
  name: "Aarav Sharma",
  dateOfBirth: "2015-06-21",
  address: "12 Park Street",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411001",
  currentEnrollment: { rollNumber: "7" },
  parentId: { name: "Rohit Sharma", email: "rohit@example.com", phoneNumber: "9876543210" },
};

describe("studentToCsvRow", () => {
  it("produces exactly the upload template columns, so an export can be re-imported", () => {
    expect(Object.keys(studentToCsvRow(student)).sort()).toEqual(
      [...STUDENT_CSV_REQUIRED, ...STUDENT_CSV_OPTIONAL].sort(),
    );
  });

  it("flattens the populated parent and enrollment", () => {
    expect(studentToCsvRow(student)).toMatchObject({
      rollNumber: "7",
      parentEmail: "rohit@example.com",
      parentName: "Rohit Sharma",
      phoneNumber: "9876543210",
    });
  });

  it("falls back to empty cells when the parent is only an id or missing", () => {
    expect(studentToCsvRow({ ...student, parentId: "64b0c0ffee" })).toMatchObject({ parentEmail: "", parentName: "" });
    expect(studentToCsvRow({ ...student, parentId: null, currentEnrollment: null })).toMatchObject({
      parentEmail: "",
      rollNumber: "",
    });
  });
});

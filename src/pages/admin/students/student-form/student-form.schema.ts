import { z } from "zod";

import { IPostalAddress, IStudentFormData } from "@/entities/student";
import { SelectOption } from "@/shared/types";
import { IStudentDetailResponse } from "@/entities/student";
import { localDateString } from "@/shared/lib";

export const GENDER_OPTIONS: SelectOption[] = [
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
  { id: "other", name: "Other" },
];

export const BLOOD_GROUP_OPTIONS: SelectOption[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => ({
  id: group,
  name: group,
}));

export const CATEGORY_OPTIONS: SelectOption[] = [
  { id: "general", name: "General" },
  { id: "obc", name: "OBC" },
  { id: "sc", name: "SC" },
  { id: "st", name: "ST" },
  { id: "ews", name: "EWS" },
  { id: "other", name: "Other" },
];

// who signs in to the parent app for this child
export const LOGIN_CONTACT_OPTIONS: SelectOption[] = [
  { id: "father", name: "Father" },
  { id: "mother", name: "Mother" },
  { id: "guardian", name: "Someone else (guardian)" },
];

const text = z.string().trim();
const optionalEmail = z.union([z.literal(""), text.email("Enter a valid email address.")]);
const phone = text.max(20, "Use at most 20 characters.");
const pincode = z.union([z.literal(""), text.regex(/^\d{6}$/, "Pincode must be 6 digits.")]);
const person = z.object({ name: text, phone, email: optionalEmail, occupation: text });
const address = z.object({ address: text, city: text, state: text, pincode });

const baseSchema = z.object({
  id: z.string().optional(),
  photo: z.instanceof(File).nullable(),
  removePhoto: z.boolean(),
  name: text.min(1, "Full name is required."),
  gender: text,
  dateOfBirth: text.min(1, "Date of birth is required."),
  bloodGroup: text,
  aadhaarNumber: z.union([z.literal(""), text.regex(/^\d{12}$/, "Aadhaar number must be 12 digits.")]),
  category: text,
  religion: text,
  motherTongue: text,
  nationality: text,
  academicYearId: text,
  classId: text,
  sectionId: text,
  rollNumber: text,
  admissionNumber: text,
  admissionDate: text,
  father: person,
  mother: person,
  loginContact: z.enum(["father", "mother", "guardian"]),
  parentName: text,
  parentEmail: optionalEmail,
  phoneNumber: phone,
  address: text.min(1, "Address is required."),
  city: text.min(1, "City is required."),
  state: text.min(1, "State is required."),
  pincode,
  sameAddress: z.boolean(),
  permanentAddress: address,
  previousSchool: z.object({ name: text, lastClass: text, tcNumber: text }),
});

export type StudentFormValues = z.infer<typeof baseSchema>;

// an edit changes neither class nor login (Promotion and Guardians do) and shows the login only if one exists
export const studentFormSchema = (isEdit: boolean, hasLogin = true) =>
  baseSchema.superRefine((values, ctx) => {
    const required = (value: string, path: string[], message: string) => {
      if (!value) ctx.addIssue({ code: "custom", path, message });
    };
    if (!isEdit) {
      required(values.gender, ["gender"], "Select a gender.");
      required(values.admissionDate, ["admissionDate"], "Admission date is required.");
      required(values.academicYearId, ["academicYearId"], "Select an academic year.");
      required(values.classId, ["classId"], "Select a class.");
      required(values.sectionId, ["sectionId"], "Select a section.");
      required(values.rollNumber, ["rollNumber"], "Roll number is required.");
    }
    if (isEdit && !hasLogin) return;
    if (isEdit || values.loginContact === "guardian") {
      required(values.parentName, ["parentName"], "Name is required.");
      required(values.parentEmail, ["parentEmail"], "Email is required to send the app invite.");
      required(values.phoneNumber, ["phoneNumber"], "Phone number is required.");
      return;
    }
    const who = values.loginContact;
    const label = who === "father" ? "Father's" : "Mother's";
    required(values[who].name, [who, "name"], `${label} name is required.`);
    required(values[who].email, [who, "email"], `${label} email is required to send the app invite.`);
    required(values[who].phone, [who, "phone"], `${label} phone is required.`);
  });

const emptyPerson = { name: "", phone: "", email: "", occupation: "" };

export const emptyStudentForm = (): StudentFormValues => ({
  photo: null,
  removePhoto: false,
  name: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  aadhaarNumber: "",
  category: "",
  religion: "",
  motherTongue: "",
  nationality: "Indian",
  academicYearId: "",
  classId: "",
  sectionId: "",
  rollNumber: "",
  admissionNumber: "",
  admissionDate: localDateString(),
  father: { ...emptyPerson },
  mother: { ...emptyPerson },
  loginContact: "father",
  parentName: "",
  parentEmail: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  sameAddress: true,
  permanentAddress: { address: "", city: "", state: "", pincode: "" },
  previousSchool: { name: "", lastClass: "", tcNumber: "" },
});

// a new admission leaves an unpicked choice out; an edit sends it empty so the server clears it
const choice = (value: string, isEdit: boolean) => (isEdit ? value : value || undefined);

// what the add and edit endpoints take: the parent who signs in is read from the chosen family member
export const toStudentPayload = (values: StudentFormValues, isEdit: boolean): IStudentFormData => {
  // an edit of a student nobody signs in for sends no login at all
  const login =
    isEdit && !values.parentEmail
      ? {}
      : isEdit || values.loginContact === "guardian"
        ? { parentName: values.parentName, parentEmail: values.parentEmail, phoneNumber: values.phoneNumber }
        : {
            parentName: values[values.loginContact].name,
            parentEmail: values[values.loginContact].email,
            phoneNumber: values[values.loginContact].phone,
          };
  const relationshipType = { father: "FATHER", mother: "MOTHER", guardian: "GUARDIAN" } as const;
  return {
    id: values.id,
    name: values.name,
    gender: choice(values.gender, isEdit) as IStudentFormData["gender"],
    dateOfBirth: values.dateOfBirth,
    bloodGroup: choice(values.bloodGroup, isEdit),
    aadhaarNumber: values.aadhaarNumber,
    category: choice(values.category, isEdit),
    religion: values.religion,
    motherTongue: values.motherTongue,
    nationality: values.nationality,
    academicYearId: values.academicYearId,
    classId: values.classId,
    sectionId: values.sectionId,
    rollNumber: values.rollNumber,
    admissionNumber: values.admissionNumber,
    admissionDate: values.admissionDate,
    father: values.father,
    mother: values.mother,
    ...login,
    ...(isEdit ? {} : { relationshipType: relationshipType[values.loginContact] }),
    address: values.address,
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    permanentAddress: values.sameAddress
      ? { address: values.address, city: values.city, state: values.state, pincode: values.pincode }
      : values.permanentAddress,
    previousSchool: values.previousSchool,
  };
};

const samePlace = (a: IPostalAddress, b: IPostalAddress) =>
  ["address", "city", "state", "pincode"].every(
    (key) => (a[key as keyof IPostalAddress] ?? "") === (b[key as keyof IPostalAddress] ?? "")
  );

// a saved student, as the edit form shows it
export const toStudentFormValues = (student: IStudentDetailResponse): StudentFormValues => {
  const empty = emptyStudentForm();
  const current = {
    address: student.address,
    city: student.city,
    state: student.state,
    pincode: student.pincode ?? "",
  };
  const permanent = { ...empty.permanentAddress, ...student.permanentAddress };
  return {
    ...empty,
    id: student.id,
    name: student.name,
    gender: student.gender ?? "",
    dateOfBirth: student.dateOfBirth?.slice(0, 10) ?? "",
    bloodGroup: student.bloodGroup ?? "",
    aadhaarNumber: student.aadhaarNumber ?? "",
    category: student.category ?? "",
    religion: student.religion ?? "",
    motherTongue: student.motherTongue ?? "",
    nationality: student.nationality ?? "",
    academicYearId: student.currentEnrollment?.academicYearId ?? "",
    classId: student.currentEnrollment?.classId?.id ?? "",
    sectionId: student.currentEnrollment?.sectionId?.id ?? "",
    rollNumber: student.currentEnrollment?.rollNumber ?? "",
    admissionNumber: student.admissionNumber ?? "",
    admissionDate: student.admissionDate ?? "",
    father: { ...empty.father, ...student.father },
    mother: { ...empty.mother, ...student.mother },
    parentName: student.parentName ?? "",
    parentEmail: student.parentEmail ?? "",
    phoneNumber: student.phoneNumber ?? "",
    ...current,
    sameAddress: !student.permanentAddress?.address || samePlace(current, permanent),
    permanentAddress: permanent,
    previousSchool: { ...empty.previousSchool, ...student.previousSchool },
  };
};

export interface IAdmissionPerson {
  name?: string;
  phone?: string;
  email?: string;
  occupation?: string;
}

export interface IPostalAddress {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// the admission form's details beyond the basics; all optional on the server
export interface IStudentAdmissionDetails {
  gender?: "male" | "female" | "other" | "";
  bloodGroup?: string;
  aadhaarNumber?: string;
  category?: string;
  religion?: string;
  motherTongue?: string;
  nationality?: string;
  permanentAddress?: IPostalAddress;
  father?: IAdmissionPerson;
  mother?: IAdmissionPerson;
  previousSchool?: { name?: string; lastClass?: string; tcNumber?: string };
}

// what the add and edit endpoints take
export interface IStudentFormData extends IStudentAdmissionDetails {
  id?: string;
  admissionNumber: string;
  admissionDate: string;
  name: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
  dateOfBirth: string;
  city: string;
  state: string;
  address: string;
  pincode?: string;
  // the parent who signs in; left out on an edit of a student nobody signs in for
  parentEmail?: string;
  parentName?: string;
  phoneNumber?: string;
  relationshipType?: "FATHER" | "MOTHER" | "GUARDIAN";
}

export interface IStudentEnrollment {
  academicYearId: string;
  classId: { id: string; name: string } | null;
  sectionId: { id: string; name: string } | null;
  rollNumber: string;
}

export interface IEnrollmentHistoryEntry {
  id: string;
  academicYearId: { id: string; name: string } | null;
  classId: { id: string; name: string } | null;
  sectionId: { id: string; name: string } | null;
  rollNumber: string;
  status: "ACTIVE" | "PROMOTED" | "DETAINED" | "TRANSFERRED" | "WITHDRAWN" | "PASSED_OUT";
  joinedOn: string;
  leftOn?: string;
}

export interface IGuardian {
  id: string;
  parentUserId: { id: string; name: string; email: string; phoneNumber: string; status: string };
  relationshipType: "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";
  isPrimaryGuardian: boolean;
  isEmergencyContact: boolean;
  canPickup: boolean;
  communicationPreference: string[];
  status: string;
}

export interface IAddGuardianValue {
  parentEmail: string;
  parentName?: string;
  phoneNumber?: string;
  relationshipType: string;
  isPrimaryGuardian: boolean;
  isEmergencyContact: boolean;
  canPickup: boolean;
}

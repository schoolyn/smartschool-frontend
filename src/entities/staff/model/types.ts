export interface IStaffProfile {
  id: string;
  userId: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  address?: string;
  status: string;
}

export interface ITeacherDirectoryEntry {
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  status: string;
  staffProfile: IStaffProfile | null;
}

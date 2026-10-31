import { useGetTeacherDirectory } from "@/entities/staff";

// the staff teacher list is unpaged, so every teacher of the school can be picked
export const useGetAllTeachers = (organizationId: string) => useGetTeacherDirectory(organizationId);

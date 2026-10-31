import { Navigate, Routes, Route } from "react-router-dom";

import { useCan } from "@/entities/session";
import StudentsList from "./student-list";
import StudentDetails from "./student-details";
import StudentForm from "./student-form";

const StudentsContainer = () => {
  const canManage = useCan()("students.manage");
  return (
    <Routes>
      <Route index={true} element={<StudentsList />} />
      <Route path="detail/:studentId" element={<StudentDetails />} />
      <Route path="edit/:studentId" element={canManage ? <StudentForm /> : <Navigate to="/not-access" replace />} />
    </Routes>
  );
};

export default StudentsContainer;

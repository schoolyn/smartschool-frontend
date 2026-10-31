import { Route, Routes } from "react-router-dom";

import AdminReports from "./reports";
import ExamPage from "./exam-page";

// the tabs page, and each exam on its own page
const ExaminationsRoutes = () => (
  <Routes>
    <Route index element={<AdminReports />} />
    <Route path="exams/:examId" element={<ExamPage />} />
  </Routes>
);

export default ExaminationsRoutes;

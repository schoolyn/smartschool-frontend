import { useNavigate, useSearchParams } from "react-router-dom";

import { useAreaBase } from "@/entities/session";

// an exam opens on its own page; grading schemes are a tab of this page
const useExamsTabController = () => {
  const navigate = useNavigate();
  const areaBase = useAreaBase();
  const [, setParams] = useSearchParams();

  return {
    openExam: (examId: string) => navigate(`${areaBase}/results/exams/${examId}`),
    openSchemes: () => setParams({ tab: "schemes" }),
  };
};

export default useExamsTabController;

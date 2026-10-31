import { useNavigate, useParams } from "react-router-dom";

import { useAreaBase } from "@/entities/session";
import { IExamOverviewSubject, useGetExamOverview } from "@/entities/exam";
import { usePageHeader } from "@/shared/lib/hooks";

const useExamPageController = () => {
  const { organizationId = "", examId = "" } = useParams();
  const navigate = useNavigate();
  const areaBase = useAreaBase();
  const toList = () => navigate(`${areaBase}/results?tab=exams`);
  // the same query the page itself reads, so the name costs no extra request
  const examName = useGetExamOverview(organizationId, examId).data?.item.name;
  usePageHeader({ title: examName ?? "Exam", onBack: toList });

  const enterMarks = (subject: IExamOverviewSubject) => {
    const classId = typeof subject.classId === "object" ? subject.classId.id : subject.classId;
    navigate(`${areaBase}/results?tab=marks&exam=${subject.examId}&class=${classId}&subject=${subject.id}`);
  };

  return { organizationId, examId, toList, enterMarks };
};

export default useExamPageController;

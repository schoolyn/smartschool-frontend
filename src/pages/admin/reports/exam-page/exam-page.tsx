import ExamDetail from "../components/exam/exam-detail";
import useExamPageController from "./exam-page-controller";

// one exam on its own page; the header's back arrow returns to the exam list
const ExamPage = () => {
  const c = useExamPageController();
  return (
    <div className="mx-auto max-w-7xl">
      <ExamDetail organizationId={c.organizationId} examId={c.examId} onDeleted={c.toList} enterMarks={c.enterMarks} />
    </div>
  );
};

export default ExamPage;

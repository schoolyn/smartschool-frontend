import { SelectOption } from "@/shared/types";
import ExamList from "../components/exam/exam-list";
import useExamsTabController from "./exams-tab-controller";

interface ExamsTabProps {
  organizationId: string;
  academicYearId?: string;
  classOptions: SelectOption[];
}

const ExamsTab = ({ organizationId, academicYearId, classOptions }: ExamsTabProps) => {
  const c = useExamsTabController();
  return (
    <ExamList
      organizationId={organizationId}
      academicYearId={academicYearId}
      classOptions={classOptions}
      openExam={c.openExam}
      openSchemes={c.openSchemes}
    />
  );
};

export default ExamsTab;

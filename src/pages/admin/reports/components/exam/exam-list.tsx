import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import { Button } from "@/shared/ui/kit/button";
import { SelectOption } from "@/shared/types";
import ExamFormDialog from "./exam-form-dialog";
import { examListColumns } from "./exam-list-columns";
import useExamListController from "./exam-list-controller";

interface ExamListProps {
  organizationId: string;
  academicYearId?: string;
  classOptions: SelectOption[];
  openExam: (examId: string) => void;
  openSchemes: () => void;
}

// every exam with where it stands; a row opens the exam
const ExamList = ({ organizationId, academicYearId, classOptions, openExam, openSchemes }: ExamListProps) => {
  const c = useExamListController(organizationId);
  const columns = examListColumns({ edit: c.openEdit, remove: c.askDelete });

  return (
    <>
      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <DataTable
          columns={columns}
          data={c.items}
          getRowId={(exam) => exam.id}
          isLoading={c.isLoading}
          onRowClick={(exam) => openExam(exam.id)}
          itemLabel={{ one: "exam", other: "exams" }}
          pagination={{ pageSize: 20 }}
          empty={
            c.hasSchemes
              ? {
                  title: "No exams yet",
                  description: "Create an exam, add the subjects each class is tested on, then enter marks.",
                  action: <Button onClick={c.openCreate}>Create exam</Button>,
                }
              : {
                  title: "Start with a grading scheme",
                  description: "Every exam turns marks into grades with a grading scheme. Create one first.",
                  action: <Button onClick={openSchemes}>Go to Grading Schemes</Button>,
                }
          }
        />
      )}

      <ExamFormDialog
        organizationId={organizationId}
        academicYearId={academicYearId}
        classOptions={classOptions}
        gradingSchemes={c.gradingSchemes}
        exam={c.editing ?? undefined}
        open={c.editing !== undefined}
        onClose={c.closeForm}
        onCreated={openExam}
      />

      <DeleteConfirmationDialog
        open={!!c.toDelete}
        title="Delete this exam?"
        description={`${c.toDelete?.name ?? "This exam"} and its subjects will be removed. This cannot be undone.`}
        isLoading={c.isDeleting}
        onClose={c.cancelDelete}
        onConfirm={c.confirmDelete}
      />
    </>
  );
};

export default ExamList;

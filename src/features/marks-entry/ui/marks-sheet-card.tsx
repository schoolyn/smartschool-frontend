import DataTable from "@/shared/ui/data-table";
import ErrorState from "@/shared/ui/error-state";
import useMarksSheetCardController from "../model/marks-sheet-card-controller";
import { marksSheetColumns } from "./marks-sheet-columns";

interface MarksSheetCardProps {
  organizationId: string;
  examSubjectId: string;
  sectionId: string;
  // results published for the exam this subject belongs to: marks lock permanently
  examPublished: boolean;
  // only admins may verify marks already saved; a teacher saves but a second pair of eyes signs off
  canVerify?: boolean;
}

// shared marks grid for admin and teacher: one student per row, saved as a batch
const MarksSheetCard = ({
  organizationId,
  examSubjectId,
  sectionId,
  examPublished,
  canVerify = false,
}: MarksSheetCardProps) => {
  const c = useMarksSheetCardController(organizationId, examSubjectId, sectionId);
  const columns = marksSheetColumns({
    form: c.form,
    draftRows: c.draftRows,
    examSubject: c.examSubject,
    marksByStudent: c.marksByStudent,
    examPublished,
  });

  return (
    <div>
      <h3 className="mb-3 text-lg font-medium text-gray-900">Marks Sheet</h3>

      {examPublished && (
        <p className="mb-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Results for this exam are published, so these marks can no longer be changed.
        </p>
      )}

      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <DataTable
          columns={columns}
          data={c.rows}
          getRowId={(row) => row.id}
          isLoading={c.isLoading}
          toolbar={
            !examPublished &&
            c.hasUnsavedMarks && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                {c.unsavedCount} unsaved change(s)
              </span>
            )
          }
          actions={[
            { label: "Export CSV", readOnlySafe: true, onClick: c.onExport },
            { label: "Verify all", onClick: c.onVerify, loading: c.isVerifying, hidden: examPublished || !canVerify },
            { label: "Save marks", onClick: c.onSave, loading: c.isSaving, variant: "primary", hidden: examPublished },
          ]}
          empty={{
            title: "No students in this section",
            description: "Marks can be entered once students are enrolled here.",
          }}
        />
      )}
    </div>
  );
};

export default MarksSheetCard;

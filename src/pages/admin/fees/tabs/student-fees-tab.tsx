import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import EmptyState from "@/shared/ui/empty-state";
import ErrorState from "@/shared/ui/error-state";
import Spinner from "@/shared/ui/spinner";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Input } from "@/shared/ui/kit/input";
import { cn } from "@/shared/lib/utils";
import StudentFeeCard from "../components/student-fee-card";
import useStudentFeesController from "./student-fees-controller";

const StudentFeesTab = ({ organizationId }: { organizationId: string }) => {
  const c = useStudentFeesController(organizationId);

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle className="mb-4 font-medium">Find a student</CardTitle>
        <Input
          aria-label="Search students"
          placeholder="Search by name or admission number"
          value={c.search}
          onChange={(e) => c.setSearch(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {c.students.map((student) => (
            <button
              key={student.id}
              type="button"
              aria-pressed={c.studentId === student.id}
              onClick={() => c.setStudentId(student.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                c.studentId === student.id
                  ? "border-primary-300 bg-primary-100 text-primary-800"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {student.name}
            </button>
          ))}
        </div>
      </Card>

      {!c.studentId && !c.isLoadingStudents && (
        <Card>
          {c.students.length || c.debouncedSearch ? (
            <EmptyState
              title={c.students.length ? "Pick a student" : "No matching students"}
              description={
                c.students.length
                  ? "Search above and choose a student to see their fees and record payments."
                  : `No student matches "${c.debouncedSearch}".`
              }
            />
          ) : (
            <EmptyState
              title="No students yet"
              description="Add students first; their fees and payments are managed here."
            />
          )}
        </Card>
      )}

      {c.studentId &&
        (c.summaryError ? (
          <ErrorState
            error={c.summaryError}
            title="This student's fees could not be loaded."
            onRetry={c.retrySummary}
          />
        ) : c.isLoadingSummary ? (
          <Spinner />
        ) : c.summaries.length === 0 ? (
          <Card>
            <EmptyState
              title="No fees assigned yet"
              description="Assign a fee structure to this student's class from the Fee Structures tab."
            />
          </Card>
        ) : (
          c.summaries.map((summary) => (
            <StudentFeeCard
              key={summary.studentFeeId}
              organizationId={organizationId}
              summary={summary}
              onReverse={c.setPaymentToReverse}
            />
          ))
        ))}

      <DeleteConfirmationDialog
        open={!!c.paymentToReverse}
        onClose={() => c.setPaymentToReverse(null)}
        onConfirm={c.confirmReverse}
        isLoading={c.isReversing}
        title="Reverse this payment?"
        description="A reversal entry is added to the ledger and the amount becomes due again. This cannot be undone."
        confirmLabel="Reverse payment"
      />
    </div>
  );
};

export default StudentFeesTab;

import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import { Button } from "@/shared/ui/kit/button";
import SchemeFormDialog from "../components/scheme/scheme-form-dialog";
import { schemeColumns } from "../components/scheme/scheme-columns";
import useGradingSchemesTabController from "./grading-schemes-tab-controller";

// the grading scales exams turn marks into grades with
const GradingSchemesTab = ({ organizationId }: { organizationId: string }) => {
  const c = useGradingSchemesTabController(organizationId);
  const columns = schemeColumns({ edit: c.openEdit, remove: c.askDelete });

  return (
    <>
      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <DataTable
          columns={columns}
          data={c.schemes}
          getRowId={(scheme) => scheme.id}
          isLoading={c.isLoading}
          itemLabel={{ one: "scheme", other: "schemes" }}
          pagination={{ pageSize: 20 }}
          empty={{
            title: "No grading schemes yet",
            description:
              "A grading scheme turns marks into grades. Start from the CBSE 9-point scale or make your own.",
            action: <Button onClick={c.openCreate}>Create scheme</Button>,
          }}
        />
      )}

      <SchemeFormDialog
        organizationId={organizationId}
        scheme={c.editing ?? undefined}
        open={c.editing !== undefined}
        onClose={c.closeForm}
      />

      <DeleteConfirmationDialog
        open={!!c.toDelete}
        title="Delete this grading scheme?"
        description={
          c.toDelete?.examCount
            ? `${c.toDelete.name} is used by ${c.toDelete.examCount} exam(s). It can be removed only once those exams are published; published results keep their grades.`
            : `${c.toDelete?.name ?? "This scheme"} will be removed.`
        }
        isLoading={c.isDeleting}
        onClose={c.cancelDelete}
        onConfirm={c.confirmDelete}
      />
    </>
  );
};

export default GradingSchemesTab;

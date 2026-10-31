import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import FormDialog from "@/shared/ui/form-dialog";
import { CheckboxField, SelectField, TextField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Form } from "@/shared/ui/kit/form";
import { SelectOption } from "@/shared/types";
import { feeHeadColumns } from "./fee-heads-columns";
import useFeeHeadsController from "./fee-heads-controller";

const categoryOptions: SelectOption[] = [
  { id: "tuition", name: "Tuition" },
  { id: "transport", name: "Transport" },
  { id: "hostel", name: "Hostel" },
  { id: "exam", name: "Exam" },
  { id: "misc", name: "Misc" },
];

const FeeHeadsTab = ({ organizationId }: { organizationId: string }) => {
  const c = useFeeHeadsController(organizationId);
  const { form, editForm, editing, retiring } = c;
  const columns = feeHeadColumns({ edit: c.openEdit, remove: c.setRetiring });

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle className="mb-4 font-medium">Create Fee Head</CardTitle>
        <Form {...form}>
          <form onSubmit={c.onSubmit} noValidate className="grid grid-cols-1 items-start gap-3 sm:grid-cols-4">
            <TextField form={form} name="name" label="Name" placeholder="Tuition fee" />
            <TextField form={form} name="code" label="Code" placeholder="TUI" />
            <SelectField form={form} name="category" label="Category" options={categoryOptions} />
            <div className="flex items-center justify-between gap-3 sm:mt-6">
              <CheckboxField form={form} name="isRefundable" label="Refundable" />
              <Button type="submit" loading={c.isCreating}>
                Add
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      <div>
        {c.isError ? (
          <ErrorState error={c.error} onRetry={c.retry} />
        ) : (
          <DataTable
            columns={columns}
            data={c.items}
            getRowId={(head) => head.id}
            isLoading={c.isLoading}
            itemLabel={{ one: "fee head", other: "fee heads" }}
            pagination={{ pageSize: 20 }}
            empty={{
              title: "No fee heads yet",
              description: "Add one above, such as Tuition or Transport, to build fee structures from.",
            }}
          />
        )}
      </div>

      <FormDialog
        form={editForm}
        open={!!editing}
        onClose={c.closeEdit}
        title={`Edit ${editing?.name ?? "fee head"}`}
        description={`The code ${editing?.code ?? ""} stays the same, since receipts and structures refer to it.`}
        submitLabel="Save"
        isSubmitting={c.isUpdating}
        onSubmit={c.onEditSubmit}
      >
        <TextField form={editForm} name="name" label="Name" />
        <SelectField form={editForm} name="category" label="Category" options={categoryOptions} />
        <CheckboxField form={editForm} name="isRefundable" label="Refundable" />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!retiring}
        onClose={() => c.setRetiring(null)}
        onConfirm={c.onRetire}
        isLoading={c.isRetiring}
        title={`Remove ${retiring?.name ?? "this fee head"}?`}
        description="It won't be offered for new fee structures. Structures and student fees already using it stay as they are."
        confirmLabel="Remove"
      />
    </div>
  );
};

export default FeeHeadsTab;

import { TrashIcon } from "@heroicons/react/24/outline";

import DataTable from "@/shared/ui/data-table";
import ErrorState from "@/shared/ui/error-state";
import { ChipsField, DateField, SelectField, TextField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Form } from "@/shared/ui/kit/form";
import { Label } from "@/shared/ui/kit/label";
import { formatMoney } from "@/shared/lib";
import { feeStructureColumns } from "./fee-structures-columns";
import useFeeStructuresController from "./fee-structures-controller";

const FeeStructuresTab = ({ organizationId }: { organizationId: string }) => {
  const c = useFeeStructuresController(organizationId);
  const { form, items, installments, classIds, itemsTotal, installmentsTotal, installmentsError, editing } = c;
  const columns = feeStructureColumns({ assigningId: c.assigningId, assign: c.onAssign, edit: c.startEdit });

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle className="mb-4 font-medium">{editing ? `Edit ${editing.name}` : "Create Fee Structure"}</CardTitle>
        {editing && (
          <p className="mb-4 text-sm text-gray-500">
            Students already billed keep their amounts unless you move the ones who haven&apos;t paid yet. Past payments
            never change.
          </p>
        )}
        <Form {...form}>
          <form onSubmit={c.onSubmit} noValidate className="space-y-5">
            <TextField form={form} name="name" label="Structure name" placeholder="Class 9 Annual Fee" />
            <ChipsField
              form={form}
              name="classIds"
              label="Classes"
              options={c.classOptions}
              emptyText="No active classes in the current year yet."
              onToggle={c.onClassesChange}
            />
            <ChipsField
              form={form}
              name="sectionIds"
              label="Sections (optional, narrows the classes above)"
              options={c.sectionOptions}
              emptyText={
                classIds.length ? "These classes have no sections yet." : "Pick a class above to see its sections."
              }
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="mb-0">Fee head items</Label>
                <Button variant="link" onClick={() => items.append({ feeHeadId: "", amount: "" })}>
                  + Add item
                </Button>
              </div>
              {c.feeHeadOptions.length === 0 && !c.isLoadingFeeHeads && (
                <p className="mb-2 text-sm text-gray-500">
                  Create a fee head first (Fee Heads tab), then pick it here.
                </p>
              )}
              <div className="space-y-2">
                {items.fields.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                    <SelectField
                      form={form}
                      name={`items.${index}.feeHeadId`}
                      label="Fee head"
                      options={c.feeHeadOptions}
                    />
                    <TextField
                      form={form}
                      name={`items.${index}.amount`}
                      label="Amount (₹)"
                      type="number"
                      min={0}
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      aria-label="Remove item"
                      disabled={items.fields.length === 1}
                      onClick={() => items.remove(index)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Total: {formatMoney(itemsTotal)}</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="mb-0">Installments</Label>
                <Button
                  variant="link"
                  onClick={() =>
                    installments.append({
                      label: `Installment ${installments.fields.length + 1}`,
                      dueDate: "",
                      amount: "",
                    })
                  }
                >
                  + Add installment
                </Button>
              </div>
              <div className="space-y-2">
                {installments.fields.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <TextField form={form} name={`installments.${index}.label`} label="Label" />
                    <DateField form={form} name={`installments.${index}.dueDate`} label="Due date" />
                    <TextField
                      form={form}
                      name={`installments.${index}.amount`}
                      label="Amount (₹)"
                      type="number"
                      min={0}
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:mt-6"
                      aria-label="Remove installment"
                      disabled={installments.fields.length === 1}
                      onClick={() => installments.remove(index)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className={`mt-1 text-xs ${itemsTotal === installmentsTotal ? "text-gray-500" : "text-red-600"}`}>
                Total: {formatMoney(installmentsTotal)}
                {itemsTotal !== installmentsTotal && " (must match the items total)"}
              </p>
              {installmentsError && <p className="mt-1 text-sm text-red-600">{installmentsError}</p>}
            </div>

            <div>
              <Label>Late fee (optional)</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <TextField
                  form={form}
                  name="lateFeeAmount"
                  label="Fine per installment (₹)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="None"
                />
                <TextField
                  form={form}
                  name="lateFeeGraceDays"
                  label="Days after the due date"
                  type="number"
                  min={0}
                  step="1"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Added once to an installment still unpaid this many days after its due date. Waive it with a concession.
              </p>
            </div>

            {editing && (
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <Checkbox
                  checked={c.applyToUnpaid}
                  onChange={(event) => c.setApplyToUnpaid(event.target.checked)}
                  className="mt-0.5"
                />
                <span>Also move students who haven&apos;t paid anything yet to these new amounts</span>
              </label>
            )}
            <div className="flex gap-2">
              <Button type="submit" loading={c.isSaving}>
                {editing ? "Save changes" : "Create structure"}
              </Button>
              {editing && (
                <Button variant="secondary" onClick={c.stopEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-medium text-gray-900">Existing structures</h3>
        {c.structuresError ? (
          <ErrorState error={c.structuresError} onRetry={c.retryStructures} />
        ) : (
          <DataTable
            columns={columns}
            data={c.structures}
            getRowId={(structure) => structure.id}
            isLoading={c.isLoadingStructures}
            itemLabel={{ one: "structure", other: "structures" }}
            pagination={{ pageSize: 20 }}
            empty={{
              title: "No fee structures yet",
              description: "Create one above, then assign it to a class to bill its students.",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FeeStructuresTab;

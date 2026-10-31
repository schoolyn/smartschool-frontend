import CustomSelectDropdown from "@/shared/ui/custom-select";
import DataTable from "@/shared/ui/data-table";
import ErrorState from "@/shared/ui/error-state";
import { ExportDialog } from "@/features/export-dialog";
import SectionHeader from "@/shared/ui/section-header";
import { CertificateType } from "@/entities/certificate";
import { SelectOption } from "@/shared/types";
import { certificateColumns } from "../certificate-columns";
import useCertificateRegisterController from "./certificate-register-controller";

const TYPE_OPTIONS: SelectOption[] = [
  { id: "all", name: "All types" },
  { id: "bonafide", name: "Bonafide" },
  { id: "transfer", name: "Transfer certificate" },
];

// every certificate the school has issued, newest first
const CertificateRegister = () => {
  const c = useCertificateRegisterController();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Certificates"
        description="Bonafide and transfer certificates issued on the school letterhead"
        action={
          c.canIssue
            ? { label: "Issue certificate", onClick: c.goToStudents, title: "Pick a student, then Issue certificate" }
            : undefined
        }
      />
      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <DataTable
          columns={certificateColumns({ download: c.download, duplicate: c.duplicate, busyId: c.duplicatingId })}
          data={c.rows}
          getRowId={(row) => row.id}
          isLoading={c.isLoading}
          pagination={c.pagination}
          itemLabel={c.itemLabel}
          search={{ placeholder: "Search student or number", value: c.search, onChange: c.setSearch }}
          toolbar={
            <div className="w-52">
              <CustomSelectDropdown
                options={TYPE_OPTIONS}
                value={TYPE_OPTIONS.find((option) => option.id === c.type) ?? null}
                onChange={(option) => c.setType(option.id as CertificateType | "all")}
              />
            </div>
          }
          actions={[
            { label: "Export CSV", readOnlySafe: true, onClick: c.openExport, disabled: c.pagination.total === 0 },
          ]}
          empty={
            c.search
              ? { title: "No matching certificates", description: `Nothing matches "${c.search}".` }
              : {
                  title: "No certificates yet",
                  description: "Open Students, then a student's menu, and choose Issue certificate.",
                }
          }
        />
      )}
      <ExportDialog {...c.exportDialog} />
    </div>
  );
};

export default CertificateRegister;

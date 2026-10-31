import DataTable, { DataTableColumn } from "@/shared/ui/data-table";
import EmptyState from "@/shared/ui/empty-state";
import ErrorState from "@/shared/ui/error-state";
import SectionHeader from "@/shared/ui/section-header";
import Spinner from "@/shared/ui/spinner";
import { IResultSubjectRow } from "@/entities/exam";
import useParentReportsController from "./reports-controller";

const columns: DataTableColumn<IResultSubjectRow>[] = [
  {
    id: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {typeof row.original.subjectId === "object" ? row.original.subjectId.name : ""}
      </span>
    ),
  },
  {
    id: "obtained",
    header: "Marks Obtained",
    meta: { align: "center" },
    cell: ({ row }) => (row.original.isAbsent ? "Absent" : row.original.obtained),
  },
  { id: "max", header: "Max Marks", meta: { align: "center" }, cell: ({ row }) => row.original.max },
  { id: "grade", header: "Grade", meta: { align: "center" }, cell: ({ row }) => row.original.grade || "-" },
];

const ParentReports = () => {
  const c = useParentReportsController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Results" description="Published exam results and report cards for your children" />

      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : c.isLoading ? (
        <Spinner />
      ) : c.hasNoResults ? (
        <div className="bg-white rounded-lg shadow p-6">
          <EmptyState title="No results yet" description="Published exam results and report cards will show up here." />
        </div>
      ) : (
        <div className="space-y-6">
          {c.children.map((item) => (
            <div key={item.studentId} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{item.studentName}</h2>
              <div className="space-y-6">
                {item.results.map((result) => {
                  const exam = typeof result.examId === "object" ? result.examId : null;
                  return (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{exam?.name}</p>
                          <p className="text-xs text-gray-500">
                            {exam?.startDate && new Date(exam.startDate).toLocaleDateString()} · {exam?.term}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              result.promotionStatus === "pass"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {result.promotionStatus === "pass" ? "Pass" : "Needs improvement"}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {result.totals.percentage}% · Grade {result.grade} · GPA {result.gpa}
                          </p>
                          <div className="flex gap-3 justify-end mt-1">
                            <button
                              type="button"
                              onClick={() => c.handleDownload(result, item.studentId)}
                              className="text-xs text-primary-600 hover:text-primary-800"
                            >
                              Download report card
                            </button>
                            <button
                              type="button"
                              onClick={() => c.handleEmail(result, item.studentId)}
                              disabled={c.isEmailing}
                              className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
                            >
                              Email me a copy
                            </button>
                          </div>
                        </div>
                      </div>

                      <DataTable
                        columns={columns}
                        data={result.subjects}
                        empty={{ title: "No subjects in this result" }}
                      />

                      <div className="mt-3 flex gap-6 text-sm text-gray-500">
                        {result.rankInSection && <span>Rank in section: {result.rankInSection}</span>}
                        {result.rankInClass && <span>Rank in class: {result.rankInClass}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentReports;

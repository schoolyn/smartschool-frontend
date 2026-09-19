import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import SectionHeader from "@/components/section-header";
import Spinner from "@/components/spinner";
import NoRecordFound from "@/components/no-record-found";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/table";
import { useGetMyResults, downloadReportCard, useEmailReportCard } from "@/pages/admin/reports/service/exams-service";
import { useTranslation } from "react-i18next";

const ParentReports = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const getMyResults = useGetMyResults(organizationId || "");
  const emailReportCard = useEmailReportCard(organizationId || "");
  const items = getMyResults.data?.items || [];

  const handleDownload = async (examId: string, studentId: string) => {
    try {
      await downloadReportCard(organizationId || "", examId, studentId);
    } catch {
      toast.error("Could not download the report card. Please try again.");
    }
  };

  const handleEmail = (examId: string, studentId: string) => {
    emailReportCard.mutate(
      { examId, studentId },
      {
        onSuccess: () => toast.success("Report card emailed to your registered email address."),
        onError: () => toast.error("Could not email the report card. Please try again."),
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Results" description="Published exam results and report cards for your children" />

      {getMyResults.isLoading ? (
        <Spinner />
      ) : items.every((i) => i.results.length === 0) ? (
        <div className="bg-white rounded-lg shadow p-6">
          <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
        </div>
      ) : (
        <div className="space-y-6">
          {items
            .filter((i) => i.results.length > 0)
            .map((item) => (
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
                                onClick={() =>
                                  handleDownload(typeof result.examId === "object" ? result.examId.id : result.examId, item.studentId)
                                }
                                className="text-xs text-primary-600 hover:text-primary-800"
                              >
                                Download report card
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEmail(typeof result.examId === "object" ? result.examId.id : result.examId, item.studentId)
                                }
                                disabled={emailReportCard.isPending}
                                className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
                              >
                                Email me a copy
                              </button>
                            </div>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-center">Marks Obtained</TableHead>
                            <TableHead className="text-center">Max Marks</TableHead>
                            <TableHead className="text-center">Grade</TableHead>
                          </TableHeader>
                          <TableBody>
                            {result.subjects.map((s, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium text-gray-900">
                                  {typeof s.subjectId === "object" ? s.subjectId.name : ""}
                                </TableCell>
                                <TableCell className="text-center">{s.isAbsent ? "Absent" : s.obtained}</TableCell>
                                <TableCell className="text-center">{s.max}</TableCell>
                                <TableCell className="text-center">{s.grade || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

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

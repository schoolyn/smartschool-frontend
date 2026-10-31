import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { downloadReportCard, useEmailReportCard, useGetMyResults } from "@/entities/exam";
import { IAPIError } from "@/shared/types";
import { IResult } from "@/entities/exam";

const examIdOf = (result: IResult) => (typeof result.examId === "object" ? result.examId.id : result.examId);

const useParentReportsController = () => {
  const { organizationId } = useParams();
  const getMyResults = useGetMyResults(organizationId || "");
  const emailReportCard = useEmailReportCard(organizationId || "");
  const items = getMyResults.data?.items || [];

  const handleDownload = async (result: IResult, studentId: string) => {
    try {
      await downloadReportCard(organizationId || "", examIdOf(result), studentId);
    } catch (error) {
      toast.error(
        (error as IAPIError)?.response?.Error?.message || "Could not download the report card. Please try again."
      );
    }
  };

  const handleEmail = (result: IResult, studentId: string) => {
    emailReportCard.mutate(
      { examId: examIdOf(result), studentId },
      {
        onSuccess: () => toast.success("Report card emailed to your registered email address."),
        // for example "No registered email address found" says what to fix
        onError: (error) =>
          toast.error(error?.response?.Error?.message || "Could not email the report card. Please try again."),
      }
    );
  };

  return {
    children: items.filter((item) => item.results.length > 0),
    hasNoResults: items.every((item) => item.results.length === 0),
    isLoading: getMyResults.isLoading,
    error: getMyResults.isError ? getMyResults.error : null,
    retry: () => getMyResults.refetch(),
    isEmailing: emailReportCard.isPending,
    handleDownload,
    handleEmail,
  };
};

export default useParentReportsController;

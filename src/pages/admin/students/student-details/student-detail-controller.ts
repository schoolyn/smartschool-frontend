import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDeleteStudent, useGetStudentById } from "@/entities/student";
import { useAddGuardian, useSetPrimaryGuardian, useRemoveGuardian } from "@/entities/student";
import { useGetEnrollmentHistory, useTransferStudent, useWithdrawStudent } from "@/entities/student";
import { useGetStudentAttendanceHistory } from "@/entities/student";
import { useGetResultsForStudent } from "@/entities/exam";
import { useError } from "@/shared/lib/hooks";
import { useAreaBase, useCan } from "@/entities/session";

const useStudentDetailController = () => {
  const navigate = useNavigate();

  const { studentId, organizationId } = useParams();

  const areaBase = useAreaBase();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [guardianIdPendingRemoval, setGuardianIdPendingRemoval] = useState<string | null>(null);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);

  const getStudentDetailById = useGetStudentById(organizationId || "", studentId || "");

  const deleteStudent = useDeleteStudent(organizationId || "");

  const addGuardian = useAddGuardian(organizationId || "", studentId || "");
  const setPrimaryGuardian = useSetPrimaryGuardian(organizationId || "", studentId || "");
  const removeGuardian = useRemoveGuardian(organizationId || "", studentId || "");

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const canManage = useCan()("students.manage");
  const enrollmentHistory = useGetEnrollmentHistory(organizationId || "", canManage ? studentId || "" : "");
  const transferStudent = useTransferStudent(organizationId || "", studentId || "");
  const withdrawStudent = useWithdrawStudent(organizationId || "", studentId || "");
  const [attendanceFrom, setAttendanceFrom] = useState("");
  const [attendanceTo, setAttendanceTo] = useState("");
  const attendanceHistory = useGetStudentAttendanceHistory(
    organizationId || "",
    studentId || "",
    attendanceFrom || undefined,
    attendanceTo || undefined
  );
  const examResults = useGetResultsForStudent(organizationId || "", studentId || "");

  // a refused primary change must be shown
  useError({ mutation: setPrimaryGuardian });

  useError({
    mutation: deleteStudent,
    cb: () => {
      setIsDeleteModalOpen(false);
    },
  });

  const handleDeleteStudent = () => {
    deleteStudent.mutate(studentId || "");
  };

  const onBackClick = () => {
    navigate(`${areaBase}/students`);
  };

  useEffect(() => {
    if (deleteStudent.isSuccess) {
      setIsDeleteModalOpen(false);
      navigate(`${areaBase}/students`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteStudent.isSuccess]);

  useEffect(() => {
    if (addGuardian.isSuccess) {
      toast.success(
        addGuardian.data?.invited ? "Guardian added. An invite email was sent to them." : "Guardian added successfully."
      );
      setIsGuardianModalOpen(false);
    }
    if (addGuardian.isError) {
      toast.error(addGuardian.error?.response?.Error?.message || "Failed to add guardian");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addGuardian.isSuccess, addGuardian.isError]);

  useEffect(() => {
    if (removeGuardian.isError) {
      toast.error(removeGuardian.error?.response?.Error?.message || "Failed to remove guardian");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeGuardian.isError]);

  const handleSetPrimaryGuardian = (guardianLinkId: string) => {
    setPrimaryGuardian.mutate(guardianLinkId, { onSuccess: () => toast.success("Primary guardian updated.") });
  };

  const handleRemoveGuardian = (guardianLinkId: string) => {
    setGuardianIdPendingRemoval(guardianLinkId);
  };

  const cancelRemoveGuardian = () => setGuardianIdPendingRemoval(null);

  const confirmRemoveGuardian = () => {
    if (!guardianIdPendingRemoval) return;
    removeGuardian.mutate(guardianIdPendingRemoval, {
      onSuccess: () => setGuardianIdPendingRemoval(null),
    });
  };

  const confirmTransfer = () => {
    transferStudent.mutate(undefined, {
      onSuccess: () => {
        toast.success("Student marked as transferred.");
        setIsTransferModalOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.Error?.message || "Failed to transfer student");
      },
    });
  };

  const confirmWithdraw = () => {
    withdrawStudent.mutate(undefined, {
      onSuccess: () => {
        toast.success("Student marked as withdrawn.");
        setIsWithdrawModalOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.Error?.message || "Failed to withdraw student");
      },
    });
  };

  return {
    canManage,
    organizationId: organizationId || "",
    studentId: studentId || "",
    editStudent: () => navigate(`${areaBase}/students/edit/${studentId}`),
    isDeleteModalOpen,
    isGuardianModalOpen,
    setIsGuardianModalOpen,
    studentDetails: getStudentDetailById?.data?.item,
    isLoadingStudentDetail: getStudentDetailById.isLoading,
    isErrorStudentDetail: getStudentDetailById.isError,
    onBackClick,
    setIsDeleteModalOpen,
    isDeletingStudent: deleteStudent.isPending,
    handleDeleteStudent,
    addGuardian,
    handleSetPrimaryGuardian,
    handleRemoveGuardian,
    guardianIdPendingRemoval,
    isRemovingGuardian: removeGuardian.isPending,
    cancelRemoveGuardian,
    confirmRemoveGuardian,
    enrollmentHistory: enrollmentHistory.data?.items || [],
    isLoadingEnrollmentHistory: enrollmentHistory.isLoading,
    isTransferModalOpen,
    setIsTransferModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    confirmTransfer,
    confirmWithdraw,
    isTransferring: transferStudent.isPending,
    isWithdrawing: withdrawStudent.isPending,
    attendanceSummary: attendanceHistory.data?.summary,
    attendanceRecords: attendanceHistory.data?.items || [],
    isLoadingAttendance: attendanceHistory.isLoading,
    attendanceFrom,
    setAttendanceFrom,
    attendanceTo,
    setAttendanceTo,
    examResults: examResults.data?.items || [],
    isLoadingExamResults: examResults.isLoading,
  };
};

export default useStudentDetailController;

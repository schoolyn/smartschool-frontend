import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";

import {
  useAddStudent,
  useDeleteStudent,
  useGetStudentDetails,
  useReinviteParent,
  useUpdateStudentDetail,
} from "../service";
import { IStudentFormData } from "@/types";
import { EMAIL_REGEX_PATTERN, TOTAL_STEPS } from "@/utils";
import { useNavigate, useParams } from "react-router-dom";
import useGetParentByEmail from "../service/get-parent-by-email";
import { useError } from "@/hooks";
import { useGetAcademicYears, useGetClasses } from "@/pages/admin/classes/service/academics-service";
import { createStudentSchema } from "../student-modal/create-update-student-modal/student-form.schema";

const emptyFormData = {} as IStudentFormData;

const useStudentsListController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const form = useForm<IStudentFormData>({ resolver: zodResolver(createStudentSchema), defaultValues: emptyFormData });
  const [currentStep, setCurrentStep] = useState(1);
  const [isParentExist, setIsParentExist] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [deleteStudentId, setDeleteStudentId] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigateToStudentDetails = (studentId: string) => {
    navigate(`/${organizationId}/admin/students/detail/${studentId}`);
  };

  // the detail page owns the full edit flow (fetches complete student data, prefills the form);
  // jump straight there with a flag so it opens the edit modal instead of just viewing
  const onClickEditStudent = (studentId: string) => {
    navigate(`/${organizationId}/admin/students/detail/${studentId}`, {
      state: { openEdit: true },
    });
  };

  const handleSearchChange = debounce((searchVal: string) => {
    setSearchTerm(searchVal);
    setCurrentPage(1);
  }, 500);

  // Handle class filter change
  const handleClassFilterChange = (classId: string) => {
    setClassFilter(classId);
    setCurrentPage(1);
  };

  // Toggle dropdown menu
  const academicYears = useGetAcademicYears(organizationId || "");
  const currentAcademicYearId =
    academicYears.data?.items.find((y) => y.isCurrent)?.id || academicYears.data?.items[0]?.id || "";
  const classesForFilter = useGetClasses(organizationId || "", currentAcademicYearId, "active");
  const CLASS_OPTIONS = classesForFilter.data?.items || [];

  // Get current students for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    localStorage.setItem("formData", JSON.stringify(form.getValues()));
  };

  const prevStep = () => {
    const saved = localStorage.getItem("formData");
    if (saved) {
      form.reset(JSON.parse(saved));
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getStudentDetails = useGetStudentDetails(
    organizationId || "",
    classFilter,
    searchTerm,
    itemsPerPage,
    currentPage
  );

  const addStudentProfile = useAddStudent(organizationId || "");

  const updateStudentDetail = useUpdateStudentDetail(organizationId || "");

  const parentEmail = form.watch("parentEmail");
  const getParentDetails = useGetParentByEmail(organizationId || "", parentEmail);

  const deleteStudent = useDeleteStudent(organizationId || "");
  const reinviteParent = useReinviteParent();

  useError({ mutation: reinviteParent });

  useError({
    mutation: deleteStudent,
    cb: () => {
      setIsDeleteModalOpen(false);
      setDeleteStudentId("");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    addStudentProfile.mutate(values);
  });

  const onClickAddStudent = () => {
    setIsAddModalOpen(true);
  };

  const onClickBulkUpload = () => {
    setIsBulkModalOpen(true);
  };

  const onCloseBulkModal = () => {
    setIsBulkModalOpen(false);
  };

  const onBulkImported = () => {
    getStudentDetails.refetch();
  };

  const onCloseModal = () => {
    setIsAddModalOpen(false);
    form.reset(emptyFormData);
    setCurrentStep(1);
  };

  const handleDeleteAction = (studentId: string) => {
    setDeleteStudentId(studentId);
    setIsDeleteModalOpen(true);
  };

  const onCancelDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStudentId("");
  };

  const handleResendInvite = (parentUserId: string) => {
    reinviteParent.mutate(parentUserId, { onSuccess: () => toast.success(t("messages.invite_resent")) });
  };

  const handleDeleteStudent = () => {
    if (!deleteStudentId) return;
    deleteStudent.mutate(deleteStudentId);
  };

  useEffect(() => {
    if (getParentDetails.isSuccess && getParentDetails.data) {
      const { item: parent, is_parent_exists } = getParentDetails.data;
      form.setValue("parentName", parent.name);
      form.setValue("phoneNumber", parent.phoneNumber);
      setIsParentExist(is_parent_exists);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getParentDetails.isSuccess, getParentDetails.data]);

  useEffect(() => {
    if (EMAIL_REGEX_PATTERN.test(parentEmail)) {
      getParentDetails.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentEmail]);

  useEffect(() => {
    if (addStudentProfile.isSuccess) {
      setIsAddModalOpen(false);
      localStorage.removeItem("formData");
      form.reset(emptyFormData);
      setCurrentStep(1);
      getStudentDetails.refetch();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addStudentProfile.isSuccess]);

  useEffect(() => {
    getStudentDetails.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFilter, searchTerm]);

  useEffect(() => {
    if (deleteStudent.isSuccess) {
      setIsDeleteModalOpen(false);
      setDeleteStudentId("");
      setSearchTerm("");
      setClassFilter("all");
      getStudentDetails.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteStudent.isSuccess]);

  return {
    t,
    organizationId: organizationId || "",
    form,
    isAddModalOpen,
    isBulkModalOpen,
    onClickBulkUpload,
    onCloseBulkModal,
    onBulkImported,
    currentStep,
    isParentExist,
    handleSearchChange,
    CLASS_OPTIONS,
    indexOfLastItem,
    indexOfFirstItem,
    currentPage,
    itemsPerPage,
    searchTerm,
    classFilter,
    isDeleteModalOpen,
    deleteStudentId,
    studentDetail: getStudentDetails?.data?.items,
    studentTotalCount: getStudentDetails?.data?.total_count,
    isLoadingGetStudentDetails: getStudentDetails.isLoading,
    isLoadingAddStudent: addStudentProfile.isPending,
    isLoadingUpdateStudent: updateStudentDetail.isPending,
    isDeletingStudent: deleteStudent.isPending,
    isFetchingStudentList: getStudentDetails.isFetching,
    onSubmit,
    onCloseModal,
    nextStep,
    prevStep,
    setCurrentStep,
    onClickAddStudent,
    paginate,
    setSearchTerm,
    handleClassFilterChange,
    handleDeleteAction,
    handleDeleteStudent,
    handleResendInvite,
    onCancelDeleteModal,
    setClassFilter,
    navigateToStudentDetails,
    onClickEditStudent,
  };
};

export default useStudentsListController;

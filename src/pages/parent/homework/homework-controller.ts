import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetMyChildren } from "@/entities/student";
import { useGetHomeworkForStudent } from "@/entities/homework";

export const useHomeworkController = () => {
  const { t } = useTranslation();
  const { organizationId = "" } = useParams();

  const [studentId, setStudentId] = useState("");

  const children = useGetMyChildren(organizationId);
  const homework = useGetHomeworkForStudent(organizationId, studentId);

  useEffect(() => {
    if (!studentId && children.data?.items?.length) {
      setStudentId(children.data.items[0].studentId.id);
    }
  }, [studentId, children.data]);

  return {
    t,
    children: children.data?.items || [],
    studentId,
    setStudentId,
    homeworkList: homework.data?.items || [],
    isLoading: homework.isLoading,
    // a failed load shows an error with a retry, not an empty page
    loadError: homework.isError ? homework.error : null,
    retryLoad: () => homework.refetch(),
  };
};

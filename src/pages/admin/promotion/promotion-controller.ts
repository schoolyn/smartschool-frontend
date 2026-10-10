import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetAcademicYears, useGetClasses, useGetSections } from "../classes/service/academics-service";
import { useGetPromotionCandidates, useProcessPromotions } from "./service/promotion-service";
import { PromotionAction } from "@/types";

interface RowState {
  action: PromotionAction;
  rollNumber: string;
}

const defaultActionFor = (promotionStatus?: string): PromotionAction =>
  promotionStatus === "fail" ? "detain" : "promote";

export const usePromotionController = () => {
  const { organizationId = "" } = useParams();

  const [sourceAcademicYearId, setSourceAcademicYearId] = useState("");
  const [sourceClassId, setSourceClassId] = useState("");
  const [sourceSectionId, setSourceSectionId] = useState("");

  const [targetAcademicYearId, setTargetAcademicYearId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSectionId, setTargetSectionId] = useState("");

  const [rowsState, setRowsState] = useState<Record<string, RowState>>({});
  const [resultsByStudent, setResultsByStudent] = useState<Record<string, { success: boolean; message?: string }>>({});

  const academicYears = useGetAcademicYears(organizationId);
  const sourceClasses = useGetClasses(organizationId, sourceAcademicYearId);
  const sourceSections = useGetSections(organizationId, sourceClassId);
  const targetClasses = useGetClasses(organizationId, targetAcademicYearId, "active");
  const targetSections = useGetSections(organizationId, targetClassId, "active");

  const candidates = useGetPromotionCandidates(organizationId, sourceAcademicYearId, sourceSectionId);
  const processPromotions = useProcessPromotions(organizationId);

  useEffect(() => {
    if (!candidates.data?.items) return;
    setRowsState((prev) => {
      const next = { ...prev };
      for (const item of candidates.data!.items) {
        if (!next[item.student.id]) {
          next[item.student.id] = {
            action: defaultActionFor(item.result?.promotionStatus),
            rollNumber: item.rollNumber,
          };
        }
      }
      return next;
    });
    setResultsByStudent({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.data]);

  const setSourceAcademicYear = (id: string) => {
    setSourceAcademicYearId(id);
    setSourceClassId("");
    setSourceSectionId("");
  };
  const setSourceClass = (id: string) => {
    setSourceClassId(id);
    setSourceSectionId("");
  };
  const setTargetAcademicYear = (id: string) => {
    setTargetAcademicYearId(id);
    setTargetClassId("");
    setTargetSectionId("");
  };
  const setTargetClass = (id: string) => {
    setTargetClassId(id);
    setTargetSectionId("");
  };

  const setRowAction = (studentId: string, action: PromotionAction) => {
    setRowsState((prev) => ({ ...prev, [studentId]: { ...prev[studentId], action } }));
  };
  const setRowRollNumber = (studentId: string, rollNumber: string) => {
    setRowsState((prev) => ({ ...prev, [studentId]: { ...prev[studentId], rollNumber } }));
  };

  const handleProcess = () => {
    const items = candidates.data?.items || [];
    if (!items.length) return;

    const needsTarget = items.some((i) => {
      const action = rowsState[i.student.id]?.action;
      return action === "promote" || action === "detain";
    });
    if (needsTarget && (!targetAcademicYearId || !targetClassId || !targetSectionId)) {
      toast.error("Select a target academic year, class and section for promote/detain decisions.");
      return;
    }

    const decisions = items.map((item) => {
      const row = rowsState[item.student.id];
      const action = row?.action || "promote";
      if (action === "promote" || action === "detain") {
        return {
          studentId: item.student.id,
          action,
          academicYearId: targetAcademicYearId,
          classId: action === "promote" ? targetClassId : sourceClassId,
          sectionId: action === "promote" ? targetSectionId : sourceSectionId,
          rollNumber: row?.rollNumber || item.rollNumber,
        };
      }
      return { studentId: item.student.id, action };
    });

    processPromotions.mutate(decisions, {
      onSuccess: (data) => {
        const map: Record<string, { success: boolean; message?: string }> = {};
        for (const r of data.items) map[r.studentId] = { success: r.success, message: r.message };
        setResultsByStudent(map);
        const failedCount = data.items.filter((r) => !r.success).length;
        if (failedCount === 0) toast.success("All students processed successfully.");
        else toast.error(`${failedCount} of ${data.items.length} failed, see details below.`);
        candidates.refetch();
      },
      onError: (error) => {
        toast.error(error?.response?.Error?.message || "Failed to process promotions");
      },
    });
  };

  return {
    academicYears: academicYears.data?.items || [],
    sourceAcademicYearId,
    setSourceAcademicYear,
    sourceClasses: sourceClasses.data?.items || [],
    sourceClassId,
    setSourceClass,
    sourceSections: sourceSections.data?.items || [],
    sourceSectionId,
    setSourceSectionId,
    targetAcademicYearId,
    setTargetAcademicYear,
    targetClasses: targetClasses.data?.items || [],
    targetClassId,
    setTargetClass,
    targetSections: targetSections.data?.items || [],
    targetSectionId,
    setTargetSectionId,
    candidates: candidates.data?.items || [],
    isLoadingCandidates: candidates.isLoading,
    rowsState,
    setRowAction,
    setRowRollNumber,
    resultsByStudent,
    handleProcess,
    isProcessing: processPromotions.isPending,
  };
};

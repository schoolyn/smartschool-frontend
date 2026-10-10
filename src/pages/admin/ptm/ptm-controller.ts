import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useGetPTMEvents, useCreatePTMEvent, useGenerateSlots, useGetSlotsForEvent } from "./service/ptm-service";
import {
  useGetAcademicYears,
  useGetClasses,
  useGetSections,
  useGetTeacherAssignments,
} from "../classes/service/academics-service";
import { useError } from "@/hooks";

const usePTMController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const org = organizationId || "";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState("");
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    mode: "onsite" as "onsite" | "online",
    venue: "",
    defaultMeetingLink: "",
    slotDurationMins: 10,
  });
  const [slotForm, setSlotForm] = useState({ teacherUserId: "", sectionId: "", startAt: "", endAt: "" });

  const getAcademicYears = useGetAcademicYears(org);
  const currentAcademicYearId = getAcademicYears.data?.items.find((y) => y.isCurrent)?.id;
  const getClasses = useGetClasses(org, currentAcademicYearId, "active");
  const getSections = useGetSections(org, undefined);
  const getTeacherAssignments = useGetTeacherAssignments(org);

  const getPTMEvents = useGetPTMEvents(org);
  const createPTMEvent = useCreatePTMEvent(org);
  const generateSlots = useGenerateSlots(org);
  const getSlotsForExpandedEvent = useGetSlotsForEvent(org, expandedEventId);

  useError({ mutation: createPTMEvent });
  useError({ mutation: generateSlots });

  const events = getPTMEvents.data?.items || [];
  const classOptions = getClasses.data?.items || [];
  const sectionOptions = getSections.data?.items || [];
  const teacherAssignments = getTeacherAssignments.data?.items || [];
  const slotsForExpandedEvent = getSlotsForExpandedEvent.data?.items || [];

  const toggleSection = (sectionId: string) => {
    setSectionIds((prev) => (prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]));
  };

  const handleFormChange = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value });
  };

  const handleSlotFormChange = (field: string, value: string) => {
    setSlotForm({ ...slotForm, [field]: value });
  };

  const resetCreateForm = () => {
    setForm({ title: "", date: "", mode: "onsite", venue: "", defaultMeetingLink: "", slotDurationMins: 10 });
    setSectionIds([]);
  };

  const handleCreateEvent = () => {
    if (!currentAcademicYearId || !sectionIds.length) {
      toast.error("Select at least one section.");
      return;
    }
    createPTMEvent.mutate(
      { ...form, academicYearId: currentAcademicYearId, sectionIds },
      {
        onSuccess: () => {
          toast.success("PTM event created.");
          setIsCreateModalOpen(false);
          resetCreateForm();
        },
      }
    );
  };

  const handleGenerateSlots = (ptmEventId: string) => {
    if (!slotForm.teacherUserId || !slotForm.sectionId || !slotForm.startAt || !slotForm.endAt) {
      toast.error("Fill teacher, section and time window.");
      return;
    }
    generateSlots.mutate(
      { ptmEventId, ...slotForm },
      {
        onSuccess: () => {
          toast.success("Slots generated.");
          setSlotForm({ teacherUserId: "", sectionId: "", startAt: "", endAt: "" });
        },
      }
    );
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? "" : eventId);
  };

  return {
    t,
    events,
    classOptions,
    sectionOptions,
    teacherAssignments,
    slotsForExpandedEvent,
    isLoadingEvents: getPTMEvents.isLoading,
    isCreatingEvent: createPTMEvent.isPending,
    isGeneratingSlots: generateSlots.isPending,
    isCreateModalOpen,
    setIsCreateModalOpen,
    expandedEventId,
    toggleExpand,
    form,
    sectionIds,
    toggleSection,
    handleFormChange,
    slotForm,
    handleSlotFormChange,
    handleCreateEvent,
    handleGenerateSlots,
  };
};

export default usePTMController;

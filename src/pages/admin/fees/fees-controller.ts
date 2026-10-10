import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import {
  useGetFeeHeads,
  useCreateFeeHead,
  useGetFeeStructures,
  useCreateFeeStructure,
  useAssignFeeStructure,
  useGetStudentFeeSummary,
  useRecordPayment,
  useReversePayment,
  useGetPaymentLedger,
  useGrantConcession,
} from "./service/fees-service";
import { useGetAcademicYears, useGetClasses, useGetYearSections } from "../classes/service/academics-service";
import useGetStudentDetails from "../students/service/get-student-details/get-student-details";
import { useError } from "@/hooks";

type Tab = "heads" | "structures" | "students" | "ledger";

const useFeesController = () => {
  const { t } = useTranslation();
  const { organizationId } = useParams();
  const org = organizationId || "";

  const [activeTab, setActiveTab] = useState<Tab>("structures");

  const [headForm, setHeadForm] = useState({ name: "", code: "", category: "tuition", isRefundable: false });

  const [classIds, setClassIds] = useState<string[]>([]);
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [items, setItems] = useState<{ feeHeadId: string; amount: string }[]>([{ feeHeadId: "", amount: "" }]);
  const [installments, setInstallments] = useState<{ label: string; dueDate: string; amount: string }[]>([
    { label: "Installment 1", dueDate: "", amount: "" },
  ]);
  const [structureName, setStructureName] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    studentFeeId: "",
    amount: "",
    method: "cash",
    instrumentRef: "",
    remarks: "",
  });
  const [concessionForm, setConcessionForm] = useState({
    studentFeeId: "",
    amount: "",
    reason: "",
    installmentLabel: "",
  });

  const getAcademicYears = useGetAcademicYears(org);
  const currentAcademicYearId = getAcademicYears.data?.items.find((y) => y.isCurrent)?.id;
  const getClasses = useGetClasses(org, currentAcademicYearId, "active");
  const getSections = useGetYearSections(org, currentAcademicYearId);
  const getFeeHeads = useGetFeeHeads(org);
  const getFeeStructures = useGetFeeStructures(org);
  const getStudentSearch = useGetStudentDetails(org, "all", studentSearch, 10, 1);
  const getStudentFeeSummary = useGetStudentFeeSummary(org, selectedStudentId);
  const getPaymentLedger = useGetPaymentLedger(org);

  const createFeeHead = useCreateFeeHead(org);
  const createFeeStructure = useCreateFeeStructure(org);
  const assignFeeStructure = useAssignFeeStructure(org);
  const recordPayment = useRecordPayment(org);
  const reversePayment = useReversePayment(org);
  const grantConcession = useGrantConcession(org);

  useError({ mutation: createFeeHead });
  useError({ mutation: createFeeStructure });
  useError({ mutation: assignFeeStructure });
  useError({ mutation: recordPayment });
  useError({ mutation: reversePayment });
  useError({ mutation: grantConcession });

  const feeHeads = getFeeHeads.data?.items || [];
  const feeStructures = getFeeStructures.data?.items || [];
  const classOptions = getClasses.data?.items || [];
  // only sections of the ticked classes, named with their class since several classes have an "A"
  const sectionOptions = (getSections.data?.items || [])
    .filter((section) => classIds.includes(section.classId))
    .map((section) => ({
      ...section,
      name: `${classOptions.find((c) => c.id === section.classId)?.name ?? ""} - ${section.name}`,
    }));
  const studentSearchResults = getStudentSearch.data?.items || [];
  const studentFeeSummaries = getStudentFeeSummary.data?.items || [];
  const paymentLedger = getPaymentLedger.data?.items || [];

  const handleHeadFormChange = (field: string, value: string | boolean) => {
    setHeadForm({ ...headForm, [field]: value });
  };

  const handleCreateFeeHead = () => {
    if (!headForm.name || !headForm.code) {
      toast.error("Name and code are required.");
      return;
    }
    createFeeHead.mutate(headForm, {
      onSuccess: () => {
        toast.success("Fee head created.");
        setHeadForm({ name: "", code: "", category: "tuition", isRefundable: false });
      },
    });
  };

  const toggleClass = (classId: string) => {
    if (classIds.includes(classId)) {
      // unticking a class also drops any of its sections that were picked
      const sectionsOfClass = new Set(
        (getSections.data?.items || []).filter((section) => section.classId === classId).map((section) => section.id),
      );
      setSectionIds((prev) => prev.filter((id) => !sectionsOfClass.has(id)));
    }
    setClassIds((prev) => (prev.includes(classId) ? prev.filter((c) => c !== classId) : [...prev, classId]));
  };

  const toggleSection = (sectionId: string) => {
    setSectionIds((prev) => (prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]));
  };

  const addItemRow = () => setItems([...items, { feeHeadId: "", amount: "" }]);
  const updateItemRow = (index: number, field: string, value: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };
  const removeItemRow = (index: number) => setItems(items.filter((_, i) => i !== index));

  const addInstallmentRow = () =>
    setInstallments([...installments, { label: `Installment ${installments.length + 1}`, dueDate: "", amount: "" }]);
  const updateInstallmentRow = (index: number, field: string, value: string) => {
    const next = [...installments];
    next[index] = { ...next[index], [field]: value };
    setInstallments(next);
  };
  const removeInstallmentRow = (index: number) => setInstallments(installments.filter((_, i) => i !== index));

  const itemsTotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const installmentsTotal = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const handleCreateFeeStructure = () => {
    if (!currentAcademicYearId || !structureName || !classIds.length) {
      toast.error("Name and at least one class are required.");
      return;
    }

    const validItems = items
      .filter((i) => i.feeHeadId && i.amount)
      .map((i) => ({ feeHeadId: i.feeHeadId, amount: Number(i.amount) }));
    const validInstallments = installments
      .filter((i) => i.label && i.dueDate && i.amount)
      .map((i) => ({ label: i.label, dueDate: i.dueDate, amount: Number(i.amount) }));

    if (!validItems.length) {
      toast.error(
        feeHeads.length === 0
          ? "Create a fee head first (see the Fee Heads tab), then pick it here."
          : "Pick a fee head and enter an amount for at least one item row."
      );
      return;
    }
    if (!validInstallments.length) {
      toast.error("Fill in label, due date and amount for at least one installment row.");
      return;
    }
    if (itemsTotal !== installmentsTotal) {
      toast.error("Installment total must match fee head items total.");
      return;
    }

    createFeeStructure.mutate(
      {
        academicYearId: currentAcademicYearId,
        name: structureName,
        classIds,
        sectionIds,
        items: validItems,
        installments: validInstallments,
      },
      {
        onSuccess: () => {
          toast.success("Fee structure created.");
          setStructureName("");
          setClassIds([]);
          setSectionIds([]);
          setItems([{ feeHeadId: "", amount: "" }]);
          setInstallments([{ label: "Installment 1", dueDate: "", amount: "" }]);
        },
      }
    );
  };

  const handleAssignStructure = (feeStructureId: string) => {
    assignFeeStructure.mutate(feeStructureId, {
      onSuccess: (data) => {
        toast.success(`Assigned to ${data.assigned_count} student(s), skipped ${data.skipped_count} already assigned.`);
      },
    });
  };

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentForm({ ...paymentForm, [field]: value });
  };

  const handleRecordPayment = () => {
    if (!paymentForm.studentFeeId || !paymentForm.amount) {
      toast.error("Select a fee record and enter an amount.");
      return;
    }
    recordPayment.mutate(
      { ...paymentForm, amount: Math.round(Number(paymentForm.amount) * 100) },
      {
        onSuccess: () => {
          toast.success("Payment recorded.");
          setPaymentForm({ studentFeeId: "", amount: "", method: "cash", instrumentRef: "", remarks: "" });
        },
      }
    );
  };

  const handleReversePayment = (paymentId: string) => {
    reversePayment.mutate(paymentId, {
      onSuccess: () => {
        toast.success("Payment reversed.");
      },
    });
  };

  const handleConcessionFormChange = (field: string, value: string) => {
    setConcessionForm({ ...concessionForm, [field]: value });
  };

  const handleGrantConcession = () => {
    if (!concessionForm.studentFeeId || !concessionForm.amount || !concessionForm.reason) {
      toast.error("Select a fee record, enter an amount and a reason.");
      return;
    }
    grantConcession.mutate(
      {
        studentFeeId: concessionForm.studentFeeId,
        amount: Math.round(Number(concessionForm.amount) * 100),
        reason: concessionForm.reason,
        installmentLabel: concessionForm.installmentLabel || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Concession granted.");
          setConcessionForm({ studentFeeId: "", amount: "", reason: "", installmentLabel: "" });
        },
      }
    );
  };

  return {
    t,
    activeTab,
    setActiveTab,
    feeHeads,
    headForm,
    handleHeadFormChange,
    handleCreateFeeHead,
    isCreatingHead: createFeeHead.isPending,
    feeStructures,
    classOptions,
    sectionOptions,
    classIds,
    sectionIds,
    toggleClass,
    toggleSection,
    items,
    addItemRow,
    updateItemRow,
    removeItemRow,
    installments,
    addInstallmentRow,
    updateInstallmentRow,
    removeInstallmentRow,
    structureName,
    setStructureName,
    itemsTotal,
    installmentsTotal,
    handleCreateFeeStructure,
    isCreatingStructure: createFeeStructure.isPending,
    handleAssignStructure,
    isAssigning: assignFeeStructure.isPending,
    studentSearch,
    setStudentSearch,
    studentSearchResults,
    selectedStudentId,
    setSelectedStudentId,
    studentFeeSummaries,
    paymentForm,
    handlePaymentFormChange,
    handleRecordPayment,
    isRecordingPayment: recordPayment.isPending,
    paymentLedger,
    handleReversePayment,
    concessionForm,
    handleConcessionFormChange,
    handleGrantConcession,
    isGrantingConcession: grantConcession.isPending,
  };
};

export default useFeesController;

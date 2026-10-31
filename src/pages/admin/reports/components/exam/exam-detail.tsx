import { PencilSquareIcon, PlusIcon } from "@heroicons/react/20/solid";

import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import RowMenu from "@/shared/ui/row-menu";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import { Skeleton } from "@/shared/ui/kit/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import { IExamOverviewSubject } from "@/entities/exam";
import { dateRange, examTypeLabel, stageOf } from "../../exam-ui";
import AddSubjectsDialog from "./add-subjects-dialog";
import EditSubjectDialog from "./edit-subject-dialog";
import ExamFormDialog from "./exam-form-dialog";
import ExamStageSteps from "./exam-stage-steps";
import { examSubjectsColumns } from "./exam-subjects-columns";
import useExamDetailController from "./exam-detail-controller";

interface ExamDetailProps {
  organizationId: string;
  examId: string;
  onDeleted: () => void;
  enterMarks: (subject: IExamOverviewSubject) => void;
}

// one exam: where it stands, each class's subjects and their marks, and the way to publish
const ExamDetail = ({ organizationId, examId, onDeleted, enterMarks }: ExamDetailProps) => {
  const c = useExamDetailController(organizationId, examId, onDeleted);
  const stage = stageOf(c.progress?.stage);
  const columns = examSubjectsColumns({
    isPublished: c.isPublished,
    enterMarks,
    edit: c.setEditingSubject,
    remove: c.setRemovingSubject,
  });
  const scheme = c.exam && typeof c.exam.gradingSchemeId === "object" ? c.exam.gradingSchemeId.name : "";

  return (
    <div className="space-y-6">
      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <>
          <Card className="space-y-6">
            {c.isLoading || !c.exam ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">{c.exam.name}</h2>
                      <Badge tone={stage.tone}>{stage.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {[
                        examTypeLabel(c.exam.type),
                        c.exam.term,
                        dateRange(c.exam.startDate, c.exam.endDate),
                        scheme && `Grading: ${scheme}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {!c.isPublished && (
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => c.setIsEditing(true)}>
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => c.setIsPublishing(true)}
                        disabled={!c.canPublish}
                        title={c.canPublish ? undefined : "Every mark must be entered and verified first"}
                      >
                        Publish results
                      </Button>
                      {!c.progress?.entered && (
                        <RowMenu
                          label="More exam actions"
                          items={[{ label: "Delete exam", onSelect: () => c.setIsDeleting(true), danger: true }]}
                        />
                      )}
                    </div>
                  )}
                </div>

                <ExamStageSteps stage={c.progress?.stage ?? "setup"} />
                <p className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-700">{c.readiness}</p>
              </>
            )}
          </Card>

          {c.classes.length > 1 && (
            <Tabs value={c.selected?.id} onValueChange={c.selectClass}>
              <TabsList aria-label="Classes in this exam">
                {c.classes.map((klass) => (
                  <TabsTrigger key={klass.id} value={klass.id}>
                    {klass.name}
                    <span className="text-xs text-gray-500">{klass.subjects.length}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <DataTable
            columns={columns}
            data={c.selected?.subjects ?? []}
            getRowId={(subject) => subject.id}
            isLoading={c.isLoading}
            toolbar={
              c.selected && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{c.selected.name}</span> · {c.selected.students} students
                </p>
              )
            }
            actions={[
              {
                label: "Add subjects",
                icon: PlusIcon,
                onClick: () => c.setIsAdding(true),
                variant: "primary",
                hidden: c.isPublished || !c.selected,
              },
            ]}
            empty={{
              title: `No subjects for ${c.selected?.name ?? "this class"} yet`,
              description: "Add the subjects this class is tested on, with their maximum and pass marks.",
              action: !c.isPublished && <Button onClick={() => c.setIsAdding(true)}>Add subjects</Button>,
            }}
          />
        </>
      )}

      {c.exam && (
        <ExamFormDialog
          organizationId={organizationId}
          classOptions={c.classOptions}
          gradingSchemes={c.gradingSchemes}
          exam={c.exam}
          open={c.isEditing}
          onClose={() => c.setIsEditing(false)}
        />
      )}

      {c.exam && c.selected && (
        <AddSubjectsDialog
          organizationId={organizationId}
          academicYearId={c.exam.academicYearId}
          examId={examId}
          classId={c.selected.id}
          className={c.selected.name}
          addedSubjectIds={c.selected.subjects.map((subject) =>
            typeof subject.subjectId === "object" ? subject.subjectId.id : subject.subjectId
          )}
          open={c.isAdding}
          onClose={() => c.setIsAdding(false)}
        />
      )}

      <EditSubjectDialog
        organizationId={organizationId}
        subject={c.editingSubject}
        onClose={() => c.setEditingSubject(null)}
      />

      <DeleteConfirmationDialog
        open={!!c.removingSubject}
        title="Remove this subject?"
        description="It comes out of this exam for this class. No marks are entered for it yet."
        confirmLabel="Remove"
        isLoading={c.isRemovingSubject}
        onClose={() => c.setRemovingSubject(null)}
        onConfirm={c.confirmRemoveSubject}
      />

      <DeleteConfirmationDialog
        open={c.isDeleting}
        title="Delete this exam?"
        description={`${c.exam?.name ?? "This exam"} and its subjects will be removed. This cannot be undone.`}
        isLoading={c.isDeletingExam}
        onClose={() => c.setIsDeleting(false)}
        onConfirm={c.confirmDelete}
      />

      <DeleteConfirmationDialog
        open={c.isPublishing}
        tone="neutral"
        title={`Publish ${c.exam?.name ?? "results"}?`}
        description="Parents see results straight away, and marks lock for good. This cannot be undone."
        confirmLabel="Publish results"
        isLoading={c.isPublishPending}
        onClose={() => c.setIsPublishing(false)}
        onConfirm={c.confirmPublish}
      />
    </div>
  );
};

export default ExamDetail;

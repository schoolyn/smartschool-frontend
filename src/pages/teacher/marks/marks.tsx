import { useParams } from "react-router-dom";

import CustomSelectDropdown from "@/shared/ui/custom-select";
import SectionHeader from "@/shared/ui/section-header";
import { MarksSheetCard } from "@/features/marks-entry";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import useTeacherMarksController from "./marks-controller";
import EmptyState from "@/shared/ui/empty-state";

const TeacherMarks = () => {
  const { organizationId = "" } = useParams();
  const c = useTeacherMarksController();

  return (
    <div className="mx-auto max-w-7xl">
      <SectionHeader title="Marks Entry" description="Enter marks for the exams, classes and subjects you teach" />

      <Card className="mb-6">
        <CardTitle className="mb-4 font-medium">Select exam, class, section &amp; subject</CardTitle>
        {!c.isLoading && c.examOptions.length === 0 ? (
          <EmptyState
            title="No exams to enter marks for"
            description="Marks entry opens here once the school schedules an exam for a class you teach."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <CustomSelectDropdown
              placeholder="Select exam"
              options={c.examOptions}
              value={c.examOptions.find((o) => o.id === c.examId) ?? null}
              onChange={(o) => c.onExamChange(String(o.id))}
            />
            <CustomSelectDropdown
              placeholder="Select class"
              disabled={!c.examId}
              options={c.classOptions}
              value={c.classOptions.find((o) => o.id === c.classId) ?? null}
              onChange={(o) => c.onClassChange(String(o.id))}
            />
            <CustomSelectDropdown
              placeholder="Select section"
              disabled={!c.classId}
              options={c.sectionOptions}
              value={c.sectionOptions.find((o) => o.id === c.sectionId) ?? null}
              onChange={(o) => c.onSectionChange(String(o.id))}
            />
            <CustomSelectDropdown
              placeholder="Select subject"
              disabled={!c.sectionId}
              options={c.subjectOptions}
              value={c.subjectOptions.find((o) => o.id === c.examSubjectId) ?? null}
              onChange={(o) => c.setExamSubjectId(String(o.id))}
            />
          </div>
        )}
      </Card>

      {c.sectionId && c.examSubjectId && (
        <MarksSheetCard
          organizationId={organizationId}
          examSubjectId={c.examSubjectId}
          sectionId={c.sectionId}
          examPublished={c.examPublished}
        />
      )}
    </div>
  );
};

export default TeacherMarks;

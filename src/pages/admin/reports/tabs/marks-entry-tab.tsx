import CustomSelectDropdown from "@/shared/ui/custom-select";
import { Card } from "@/shared/ui/kit/card";
import { Label } from "@/shared/ui/kit/label";
import { MarksSheetCard } from "@/features/marks-entry";
import EmptyState from "@/shared/ui/empty-state";
import useMarksEntryTabController from "./marks-entry-tab-controller";

const MarksEntryTab = ({ organizationId }: { organizationId: string }) => {
  const c = useMarksEntryTabController(organizationId);

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <Label>Exam</Label>
            <CustomSelectDropdown
              placeholder="Select exam"
              options={c.examOptions}
              value={c.examOptions.find((o) => o.id === c.examId) ?? null}
              onChange={(o) => c.selectExam(String(o.id))}
            />
          </div>
          <div>
            <Label>Class</Label>
            <CustomSelectDropdown
              placeholder="Select class"
              disabled={!c.examId}
              options={c.classOptions}
              value={c.classOptions.find((o) => o.id === c.classId) ?? null}
              onChange={(o) => c.selectClass(String(o.id))}
            />
          </div>
          <div>
            <Label>Section</Label>
            <CustomSelectDropdown
              placeholder="Select section"
              disabled={!c.classId}
              options={c.sectionOptions}
              value={c.sectionOptions.find((o) => o.id === c.sectionId) ?? null}
              onChange={(o) => c.selectSection(String(o.id))}
            />
          </div>
          <div>
            <Label>Subject</Label>
            <CustomSelectDropdown
              placeholder="Select subject"
              disabled={!c.classId}
              options={c.subjectOptions}
              value={c.subjectOptions.find((o) => o.id === c.examSubjectId) ?? null}
              onChange={(o) => c.selectSubject(String(o.id))}
            />
          </div>
        </div>
      </Card>

      {!c.isSheetReady && (
        <Card>
          <EmptyState
            title={c.examOptions.length ? "Pick an exam, class, section and subject" : "No exams yet"}
            description={
              c.examOptions.length
                ? "The marks sheet for that paper opens here."
                : "Create an exam in the Exams tab, add its subjects, then enter marks here."
            }
          />
        </Card>
      )}

      {c.isSheetReady && (
        <MarksSheetCard
          organizationId={organizationId}
          examSubjectId={c.examSubjectId}
          sectionId={c.sectionId}
          examPublished={c.examPublished}
          canVerify
        />
      )}
    </div>
  );
};

export default MarksEntryTab;

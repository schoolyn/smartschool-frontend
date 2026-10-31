import ErrorState from "@/shared/ui/error-state";
import { BookOpenIcon } from "@heroicons/react/24/outline";

import Spinner from "@/shared/ui/spinner";
import EmptyState from "@/shared/ui/empty-state";
import SectionHeader from "@/shared/ui/section-header";
import CustomSelectDropdown from "@/shared/ui/custom-select";
import { useHomeworkController } from "./homework-controller";
import { SelectOption } from "@/shared/types";

const ParentHomework = () => {
  const { children, studentId, setStudentId, homeworkList, isLoading, loadError, retryLoad } = useHomeworkController();
  const childOptions = children.map((child): SelectOption => ({ id: child.studentId.id, name: child.studentId.name }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader title="Homework" description="Assignments given to your child" />

      {children.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
          <div className="w-64">
            <CustomSelectDropdown
              placeholder="Select child"
              options={childOptions}
              value={childOptions.find((option) => option.id === studentId) ?? null}
              onChange={(o) => setStudentId(String(o.id))}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {loadError ? (
          <ErrorState error={loadError} onRetry={retryLoad} />
        ) : isLoading ? (
          <Spinner />
        ) : homeworkList.length === 0 ? (
          <EmptyState title="No homework yet" description="Homework set for your children will show up here." />
        ) : (
          <div className="space-y-4">
            {homeworkList.map((hw) => (
              <div key={hw.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5 text-primary-500 shrink-0" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {hw.title}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      ({typeof hw.subjectId === "object" ? hw.subjectId.name : ""})
                    </span>
                  </h2>
                </div>
                <p className="text-gray-600 text-sm mt-1">Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                <p className="mt-2 text-gray-700">{hw.description}</p>
                {hw.attachmentURL && (
                  <a
                    href={hw.attachmentURL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-primary-600 hover:underline"
                  >
                    View attachment
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentHomework;

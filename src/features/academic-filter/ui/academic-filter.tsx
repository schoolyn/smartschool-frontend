import CustomSelectDropdown from "@/shared/ui/custom-select";
import { Label } from "@/shared/ui/kit/label";
import useAcademicFilterController, { ALL, AcademicFilterValue, fromOption } from "../model/academic-filter-controller";

interface AcademicFilterProps {
  organizationId: string;
  value: AcademicFilterValue;
  onChange: (value: AcademicFilterValue) => void;
}

// year, optional class, optional section; for reports where "All" is a real choice
const AcademicFilter = ({ organizationId, value, onChange }: AcademicFilterProps) => {
  const c = useAcademicFilterController(organizationId, value, onChange);

  return (
    <>
      <div>
        <Label>Academic year</Label>
        <CustomSelectDropdown
          placeholder="Select"
          options={c.yearOptions}
          value={c.selected(c.yearOptions, value.academicYearId)}
          onChange={(o) => onChange({ academicYearId: String(o.id), classId: "", sectionId: "" })}
          emptyText="No academic years yet."
        />
      </div>
      <div>
        <Label>Class</Label>
        <CustomSelectDropdown
          placeholder="All classes"
          disabled={!value.academicYearId}
          options={c.classOptions}
          value={c.selected(c.classOptions, value.classId || ALL)}
          onChange={(o) => onChange({ ...value, classId: fromOption(o.id), sectionId: "" })}
        />
      </div>
      <div>
        <Label>Section</Label>
        <CustomSelectDropdown
          placeholder="All sections"
          disabled={!value.classId}
          options={c.sectionOptions}
          value={c.selected(c.sectionOptions, value.sectionId || ALL)}
          onChange={(o) => onChange({ ...value, sectionId: fromOption(o.id) })}
        />
      </div>
    </>
  );
};

export default AcademicFilter;

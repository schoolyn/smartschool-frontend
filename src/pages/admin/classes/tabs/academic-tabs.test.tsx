import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import YearsTab from "./years-tab";
import ClassesTab from "./classes-tab";
import SectionsTab from "./sections-tab";

const mutation = () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false });

const hooks = vi.hoisted(() => ({
  years: { data: { items: [] as unknown[] }, isLoading: false },
  classes: { data: { items: [] as unknown[] }, isLoading: false },
  sections: { data: { items: [] as unknown[] }, isLoading: false },
  getClasses: vi.fn(),
  createYear: null as unknown,
  updateYear: null as unknown,
  createClass: null as unknown,
  updateClass: null as unknown,
  deactivateClass: null as unknown,
  createSection: null as unknown,
  updateSection: null as unknown,
  deactivateSection: null as unknown,
}));

vi.mock("../service/academics-service", () => ({
  useGetAcademicYears: () => hooks.years,
  useCreateAcademicYear: () => hooks.createYear,
  useUpdateAcademicYear: () => hooks.updateYear,
  useGetRolloverPreview: () => ({ data: undefined, isLoading: false }),
  useRolloverAcademicYear: () => ({ mutate: vi.fn(), isPending: false }),
  useGetClasses: (...args: unknown[]) => {
    hooks.getClasses(...args);
    return hooks.classes;
  },
  useCreateClass: () => hooks.createClass,
  useUpdateClass: () => hooks.updateClass,
  useDeactivateClass: () => hooks.deactivateClass,
  useGetSections: () => hooks.sections,
  useCreateSection: () => hooks.createSection,
  useUpdateSection: () => hooks.updateSection,
  useDeactivateSection: () => hooks.deactivateSection,
}));
vi.mock("../service/teachers-service", () => ({ useGetAllTeachers: () => ({ data: { items: [] } }) }));
vi.mock("@/hooks", () => ({ useMutationFeedback: vi.fn() }));

const year = (overrides: object) => ({
  id: "y",
  name: "2026-27",
  startDate: "2026-04-01T00:00:00.000Z",
  endDate: "2027-03-31T00:00:00.000Z",
  isCurrent: false,
  status: "active",
  ...overrides,
});

const openMenu = async (row: string) => {
  const user = userEvent.setup();
  await user.click(within(screen.getByText(row).closest("tr")!).getByRole("button", { name: "Actions" }));
  return user;
};
const menuItems = () => screen.getAllByRole("menuitem").map((item) => item.textContent);

beforeEach(() => {
  for (const key of [
    "createYear",
    "updateYear",
    "createClass",
    "updateClass",
    "deactivateClass",
    "createSection",
    "updateSection",
    "deactivateSection",
  ] as const) {
    hooks[key] = mutation();
  }
  hooks.getClasses.mockClear();
  hooks.years = { data: { items: [] }, isLoading: false };
  hooks.classes = { data: { items: [] }, isLoading: false };
  hooks.sections = { data: { items: [] }, isLoading: false };
});

describe("YearsTab", () => {
  beforeEach(() => {
    hooks.years = {
      data: {
        items: [
          year({ id: "y1", name: "2026-27", isCurrent: true }),
          year({ id: "y0", name: "2025-26" }),
          year({ id: "y9", name: "2024-25", status: "closed" }),
        ],
      },
      isLoading: false,
    };
  });

  it("offers each year only the actions that make sense for it", async () => {
    render(<YearsTab organizationId="org" />);

    await openMenu("2026-27");
    expect(menuItems()).toEqual(["Edit", "Start next year from this one"]);
    await userEvent.keyboard("{Escape}");

    await openMenu("2025-26");
    expect(menuItems()).toEqual(["Edit", "Start next year from this one", "Set as current", "Close year"]);
    await userEvent.keyboard("{Escape}");

    await openMenu("2024-25");
    expect(menuItems()).toEqual(["Edit", "Start next year from this one", "Reopen year"]);
  });

  it("asks before making a year current, and only then sends the change", async () => {
    render(<YearsTab organizationId="org" />);
    const user = await openMenu("2025-26");

    await user.click(screen.getByRole("menuitem", { name: "Set as current" }));
    expect(screen.getByText("Make 2025-26 the current year?")).toBeInTheDocument();
    expect((hooks.updateYear as ReturnType<typeof mutation>).mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Make current" }));
    expect((hooks.updateYear as ReturnType<typeof mutation>).mutate).toHaveBeenCalledWith({
      id: "y0",
      isCurrent: true,
    });
  });

  it("closes and reopens a year through the status field", async () => {
    render(<YearsTab organizationId="org" />);
    const user = await openMenu("2025-26");
    await user.click(screen.getByRole("menuitem", { name: "Close year" }));
    await user.click(screen.getByRole("button", { name: "Close year" }));
    expect((hooks.updateYear as ReturnType<typeof mutation>).mutate).toHaveBeenCalledWith({
      id: "y0",
      status: "closed",
    });
  });

  it("does not send a new year whose end is before its start", async () => {
    render(<YearsTab organizationId="org" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "+ Add academic year" }));

    await user.type(screen.getByLabelText("Name"), "2027-28");
    await user.type(screen.getByLabelText("Starts"), "2027-04-01");
    await user.type(screen.getByLabelText("Ends"), "2027-01-01");
    await user.click(screen.getByRole("button", { name: "Add year" }));

    expect(await screen.findByText("The end date must be after the start date.")).toBeInTheDocument();
    expect((hooks.createYear as ReturnType<typeof mutation>).mutate).not.toHaveBeenCalled();
  });

  it("shows a first-step prompt when there are no years", () => {
    hooks.years = { data: { items: [] }, isLoading: false };
    render(<YearsTab organizationId="org" />);

    expect(screen.getByText("No academic years yet")).toBeInTheDocument();
  });
});

describe("ClassesTab", () => {
  const props = {
    organizationId: "org",
    years: [year({ id: "y1", isCurrent: true })] as never,
    yearId: "y1",
    onYearChange: vi.fn(),
    onViewSections: vi.fn(),
  };
  const klass = (overrides: object) => ({
    id: "c1",
    name: "Grade 1",
    numericLevel: 1,
    status: "active",
    sectionCount: 2,
    studentCount: 31,
    ...overrides,
  });

  it("shows the section and student counts", () => {
    hooks.classes = { data: { items: [klass({})] }, isLoading: false };
    render(<ClassesTab {...props} />);

    const row = screen.getByText("Grade 1").closest("tr")!;
    expect(within(row).getByText("31")).toBeInTheDocument();
    expect(within(row).getByText("2")).toBeInTheDocument();
  });

  it("lists only active classes until 'Show inactive' is switched on", async () => {
    hooks.classes = { data: { items: [klass({})] }, isLoading: false };
    render(<ClassesTab {...props} />);
    expect(hooks.getClasses).toHaveBeenLastCalledWith("org", "y1", "active");

    await userEvent.click(screen.getByRole("switch", { name: "Show inactive" }));
    expect(hooks.getClasses).toHaveBeenLastCalledWith("org", "y1", undefined);
  });

  it("asks before deactivating, explains the consequence, then deactivates", async () => {
    hooks.classes = { data: { items: [klass({})] }, isLoading: false };
    render(<ClassesTab {...props} />);
    const user = await openMenu("Grade 1");

    await user.click(screen.getByRole("menuitem", { name: "Deactivate" }));
    expect(screen.getByText("Deactivate Grade 1?")).toBeInTheDocument();
    expect(screen.getByText(/sections are deactivated with it/i)).toBeInTheDocument();
    expect((hooks.deactivateClass as ReturnType<typeof mutation>).mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Deactivate" }));
    expect((hooks.deactivateClass as ReturnType<typeof mutation>).mutate).toHaveBeenCalledWith("c1");
  });

  it("reactivates an inactive class without a confirmation", async () => {
    hooks.classes = { data: { items: [klass({ status: "inactive" })] }, isLoading: false };
    render(<ClassesTab {...props} />);
    const user = await openMenu("Grade 1");

    await user.click(screen.getByRole("menuitem", { name: "Reactivate" }));
    expect((hooks.updateClass as ReturnType<typeof mutation>).mutate).toHaveBeenCalledWith({
      id: "c1",
      status: "active",
    });
  });

  it("jumps to a class's sections", async () => {
    hooks.classes = { data: { items: [klass({})] }, isLoading: false };
    render(<ClassesTab {...props} />);
    const user = await openMenu("Grade 1");

    await user.click(screen.getByRole("menuitem", { name: "View sections" }));
    expect(props.onViewSections).toHaveBeenCalledWith("c1");
  });

  it("prompts to add the first class when the year has none", () => {
    render(<ClassesTab {...props} />);
    expect(screen.getByText("No active classes in this year")).toBeInTheDocument();
  });

  it("asks for a year before showing anything when none is chosen", () => {
    render(<ClassesTab {...props} yearId="" />);
    expect(screen.getByText("Choose an academic year")).toBeInTheDocument();
  });
});

describe("SectionsTab", () => {
  it("shows seats taken against capacity and flags a full section", () => {
    hooks.classes = { data: { items: [{ id: "c1", name: "Grade 1" }] }, isLoading: false };
    hooks.sections = {
      data: {
        items: [
          {
            id: "s1",
            name: "A",
            capacity: 30,
            studentCount: 30,
            status: "active",
            classTeacherId: { id: "t", name: "Asha Rao", email: "a@x.co" },
          },
          { id: "s2", name: "B", capacity: 40, studentCount: 1, status: "active" },
          { id: "s3", name: "C", studentCount: 7, status: "active" },
        ],
      },
      isLoading: false,
    };
    render(<SectionsTab organizationId="org" yearId="y1" classId="c1" onClassChange={vi.fn()} />);

    const rowA = screen.getByText("A").closest("tr")!;
    expect(within(rowA).getByText(/30 \/ 30/)).toBeInTheDocument();
    expect(within(rowA).getByText("Full")).toBeInTheDocument();
    expect(within(rowA).getByText("Asha Rao")).toBeInTheDocument();

    const rowB = screen.getByText("B").closest("tr")!;
    expect(within(rowB).getByText(/1 \/ 40/)).toBeInTheDocument();
    expect(within(rowB).queryByText("Full")).not.toBeInTheDocument();

    expect(within(screen.getByText("C").closest("tr")!).getByText("7")).toBeInTheDocument();
  });

  it("asks for a class when none is chosen", () => {
    hooks.classes = { data: { items: [] }, isLoading: false };
    render(<SectionsTab organizationId="org" yearId="y1" classId="" onClassChange={vi.fn()} />);

    expect(screen.getByText("Choose a class")).toBeInTheDocument();
  });
});

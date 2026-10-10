import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RolloverDialog from "./rollover-dialog";

const mutate = vi.fn();
const state = vi.hoisted(() => ({
  preview: { data: undefined as unknown, isLoading: false, isFetching: false, isError: false },
}));

vi.mock("../service/academics-service", () => ({
  useGetRolloverPreview: () => state.preview,
  useRolloverAcademicYear: () => ({ mutate, isPending: false }),
}));
vi.mock("@/hooks", () => ({ useMutationFeedback: vi.fn() }));

const years = [
  {
    id: "y1",
    name: "2026-27",
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2027-03-31T00:00:00.000Z",
    isCurrent: true,
    status: "active",
  },
  {
    id: "y0",
    name: "2025-26",
    startDate: "2025-04-01T00:00:00.000Z",
    endDate: "2026-03-31T00:00:00.000Z",
    isCurrent: false,
    status: "active",
  },
];

const preview = (counts: { classes: number; sections: number; subjects: number }) => ({
  data: { sourceYear: { id: "y1", name: "2026-27" }, classes: [], subjects: [], counts },
  isLoading: false,
  isFetching: false,
  isError: false,
});

const open = () =>
  render(<RolloverDialog organizationId="org" years={years} sourceYear={years[0]} onClose={vi.fn()} />);

beforeEach(() => {
  mutate.mockClear();
  state.preview = preview({ classes: 3, sections: 6, subjects: 9 });
});

describe("RolloverDialog", () => {
  it("opens with the next year's name and dates already filled in", () => {
    open();

    expect(screen.getByLabelText("New year name")).toHaveValue("2027-28");
    expect(screen.getByLabelText("Starts")).toHaveValue("2027-04-01");
    expect(screen.getByLabelText("Ends")).toHaveValue("2028-03-31");
  });

  it("says exactly what will be copied before anything happens", () => {
    open();

    expect(screen.getByText("3 classes with 6 sections (active ones only)")).toBeInTheDocument();
    expect(screen.getByText("9 subjects (active ones only)")).toBeInTheDocument();
    expect(screen.getByText(/Students are not moved here/)).toBeInTheDocument();
    expect(screen.getByText(/teacher assignments are not copied/)).toBeInTheDocument();
  });

  it("sends the choices as they are, copying classes and subjects by default and not making the year current", async () => {
    open();
    await userEvent.click(screen.getByRole("button", { name: "Start 2027-28" }));

    expect(mutate).toHaveBeenCalledWith({
      sourceYearId: "y1",
      name: "2027-28",
      startDate: "2027-04-01",
      endDate: "2028-03-31",
      copyClasses: true,
      copySubjects: true,
      isCurrent: false,
    });
  });

  it("lets the person leave subjects out and edit the name", async () => {
    open();
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox", { name: /Subjects/ }));
    await user.clear(screen.getByLabelText("New year name"));
    await user.type(screen.getByLabelText("New year name"), "2027-2028");
    await user.click(screen.getByRole("button", { name: "Start 2027-2028" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "2027-2028", copyClasses: true, copySubjects: false }),
    );
  });

  it("disables a copy option that has nothing to copy", () => {
    state.preview = preview({ classes: 0, sections: 0, subjects: 4 });
    open();

    expect(screen.getByRole("checkbox", { name: /Classes and sections/ })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /Subjects/ })).toBeEnabled();
  });

  it("does not send a year that ends before it starts", async () => {
    open();
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Ends"));
    await user.type(screen.getByLabelText("Ends"), "2027-01-01");
    await user.click(screen.getByRole("button", { name: "Start 2027-28" }));

    expect(await screen.findByText("The end date must be after the start date.")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("does not ask to copy what does not exist: a disabled option is sent as not copied", async () => {
    state.preview = preview({ classes: 0, sections: 0, subjects: 4 });
    open();
    await userEvent.click(screen.getByRole("button", { name: "Start 2027-28" }));

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ copyClasses: false, copySubjects: true }));
  });

  it("says so when the preview cannot load, and does not let the year start blind", () => {
    state.preview = { data: undefined, isLoading: false, isFetching: false, isError: true };
    open();

    expect(screen.getAllByText("Could not load what this year has. Close and try again.")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Start 2027-28" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("waits for fresh counts instead of showing old ones while they reload", () => {
    state.preview = { ...preview({ classes: 3, sections: 6, subjects: 9 }), isFetching: true };
    open();

    expect(screen.queryByText(/3 classes/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start 2027-28" })).toBeDisabled();
  });
});

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";

import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import SectionHeader from "@/shared/ui/section-header";
import { Button } from "@/shared/ui/kit/button";
import EntryDialog from "./components/entry-dialog";
import EventsSidebar from "./components/events-sidebar";
import MonthGrid from "./components/month-grid";
import useCalendarController from "./calendar-controller";

const AdminCalendar = () => {
  const c = useCalendarController();

  return (
    <div className="mx-auto max-w-7xl">
      <SectionHeader
        title="Calendar"
        description="School events, holidays, exams and birthdays for the month"
        action={{ label: "Add event", icon: PlusIcon, onClick: c.openAdd, hidden: !c.canEdit }}
      />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{c.label}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={c.previousMonth} aria-label="Previous month">
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={c.goToday}>
            Today
          </Button>
          <Button variant="secondary" onClick={c.nextMonth} aria-label="Next month">
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {c.month.isError ? (
        <ErrorState error={c.month.error} onRetry={() => c.month.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <MonthGrid
            year={c.cursor.year}
            month={c.cursor.month}
            today={c.today}
            itemsByDate={c.itemsByDate}
            onPickDay={c.pickDay}
            onPickEntry={c.editEntry}
          />
          <EventsSidebar
            entries={c.month.data?.entries ?? []}
            filter={c.filter}
            onFilter={c.setFilter}
            onEdit={c.editEntry}
            onDelete={c.askDelete}
          />
        </div>
      )}

      <EntryDialog
        organizationId={c.organizationId}
        entry={c.dialog?.entry ?? null}
        defaultDate={c.dialog?.date ?? c.today}
        open={!!c.dialog}
        onClose={c.closeDialog}
      />
      <DeleteConfirmationDialog
        open={!!c.toDelete}
        onClose={c.closeDelete}
        title="Delete entry?"
        description={
          c.toDelete?.recurring
            ? `"${c.toDelete.title}" repeats every week; all of its dates will be removed.`
            : `"${c.toDelete?.title}" will be removed from the calendar.`
        }
        isLoading={c.isDeleting}
        onConfirm={c.confirmDelete}
      />
    </div>
  );
};

export default AdminCalendar;

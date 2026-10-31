import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";

import type { Action } from "@/shared/ui/action-buttons";
import ErrorState from "@/shared/ui/error-state";
import EmptyState from "@/shared/ui/empty-state";
import SectionHeader from "@/shared/ui/section-header";
import Spinner from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";
import CreateEventDialog from "./components/create-event-dialog";
import EventSlotsPanel from "./components/event-slots-panel";
import useAdminPTMController from "./ptm-controller";

const AdminPTM = () => {
  const c = useAdminPTMController();
  const createAction: Action = { label: "Schedule PTM", icon: PlusIcon, onClick: c.openCreate };

  return (
    <div className="mx-auto max-w-7xl">
      <SectionHeader
        title="Parent-Teacher Meetings"
        description="Schedule PTM events, open teacher availability, and track parent bookings"
        action={createAction}
      />

      {c.error ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <div className="rounded-lg bg-white shadow">
          {c.isLoading ? (
            <Spinner />
          ) : c.items.length === 0 ? (
            <EmptyState
              title="No PTM events yet"
              description="Use Schedule PTM to create the first parent-teacher meeting."
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {c.items.map((event) => {
                const isOpen = c.expandedEventId === event.id;
                return (
                  <div key={event.id} className="p-4">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => c.toggleEvent(event.id)}
                      className="flex w-full items-center justify-between rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm capitalize text-gray-500">
                          {new Date(event.date).toLocaleDateString()} · {event.mode} · {event.slotDurationMins} min
                          slots
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-sm text-primary-600">
                        {isOpen ? "Hide" : "Manage slots"}
                        <ChevronDownIcon className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                      </span>
                    </button>
                    {isOpen && (
                      <EventSlotsPanel organizationId={c.organizationId} event={event} assignments={c.assignments} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CreateEventDialog
        organizationId={c.organizationId}
        academicYearId={c.currentYearId}
        sectionOptions={c.sectionOptions}
        open={c.isCreateOpen}
        onClose={c.closeCreate}
      />
    </div>
  );
};

export default AdminPTM;

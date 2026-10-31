import CustomSelectDropdown from "@/shared/ui/custom-select";
import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import EmptyState from "@/shared/ui/empty-state";
import ErrorState from "@/shared/ui/error-state";
import FormDialog from "@/shared/ui/form-dialog";
import { SelectField } from "@/shared/ui/form-fields";
import SectionHeader from "@/shared/ui/section-header";
import Spinner from "@/shared/ui/spinner";
import { bookingColumns } from "./ptm-columns";
import useParentPTMController from "./ptm-controller";

const ParentPTM = () => {
  const {
    events,
    slotItems,
    eventOptions,
    childOptions,
    bookings,
    isLoadingBookings,
    bookingsError,
    retryBookings,
    isLoadingEvents,
    isLoadingSlots,
    isBooking,
    selectedEventId,
    selectedEventOption,
    selectEvent,
    bookingSlotId,
    bookingDescription,
    bookingForm,
    openBookingFor,
    closeBooking,
    confirmBooking,
    bookingToCancel,
    setBookingToCancel,
    closeCancel,
    confirmCancelBooking,
    isCancelling,
  } = useParentPTMController();

  const columns = bookingColumns(setBookingToCancel);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Parent-Teacher Meetings"
        description="Book a slot with your child's teacher and track your bookings"
      />
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-3">My bookings</h2>
        {bookingsError ? (
          <ErrorState error={bookingsError} onRetry={retryBookings} />
        ) : (
          <DataTable
            columns={columns}
            data={bookings}
            getRowId={(booking) => booking.id}
            isLoading={isLoadingBookings}
            empty={{ title: "No bookings yet", description: "Slots you book appear here." }}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Book a slot</h2>
        {isLoadingEvents ? (
          <Spinner />
        ) : events.length === 0 ? (
          <EmptyState
            compact
            title="No meetings open for booking"
            description="When the school opens parent-teacher meeting slots, you can book one here."
          />
        ) : (
          <>
            <CustomSelectDropdown
              options={eventOptions}
              placeholder="Select PTM event"
              value={selectedEventOption}
              onChange={selectEvent}
            />

            {selectedEventId && (
              <div className="mt-4">
                {isLoadingSlots ? (
                  <Spinner />
                ) : slotItems.length === 0 ? (
                  <EmptyState
                    compact
                    title="No open slots yet"
                    description="Teachers haven't opened time for your child's section."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slotItems.map((slot) => (
                      <button
                        type="button"
                        key={slot.id}
                        disabled={slot.full || slot.alreadyBooked}
                        onClick={() => openBookingFor(slot.id)}
                        className={`px-3 py-2 rounded-md text-xs border text-left ${
                          slot.full || slot.alreadyBooked
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-primary-50"
                        }`}
                      >
                        <div className="font-medium">{slot.teacherName}</div>
                        <div>{slot.time}</div>
                        {slot.alreadyBooked && <div>Already booked</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <FormDialog
        form={bookingForm}
        open={!!bookingSlotId}
        onClose={closeBooking}
        title="Confirm booking"
        description={bookingDescription}
        submitLabel="Confirm"
        isSubmitting={isBooking}
        submitDisabled={!childOptions.length}
        onSubmit={confirmBooking}
        className="max-w-sm"
      >
        {childOptions.length ? (
          <SelectField form={bookingForm} name="studentId" label="Booking for" options={childOptions} />
        ) : (
          <p className="text-sm text-gray-600">None of your children are in this slot's section.</p>
        )}
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!bookingToCancel}
        onClose={closeCancel}
        onConfirm={confirmCancelBooking}
        isLoading={isCancelling}
        title="Cancel this meeting?"
        description="The slot is freed for other parents. You can book again while slots are open."
        confirmLabel="Cancel meeting"
        cancelLabel="Keep it"
      />
    </div>
  );
};

export default ParentPTM;

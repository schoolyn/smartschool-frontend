import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useGetPTMEvents,
  useGetSlotsForEvent,
  useBookPTMSlot,
  useCancelPTMBooking,
  useGetMyPTMBookings,
} from "@/entities/ptm";
import { useGetMyChildren } from "@/entities/student";
import { useError } from "@/shared/lib/hooks";
import { IPTMSlot } from "@/entities/ptm";
import { SelectOption } from "@/shared/types";
import { bookingSchema, BookingFormValues, defaultBookingValues } from "./ptm.schema";

const teacherNameOf = (slot: IPTMSlot) => (typeof slot.teacherUserId === "object" ? slot.teacherUserId.name : "");
const idOf = (ref: { id: string } | string | undefined) => (typeof ref === "object" ? ref.id : ref);

const useParentPTMController = () => {
  const { organizationId } = useParams();
  const org = organizationId || "";

  const [selectedEventId, setSelectedEventId] = useState("");
  const [bookingSlotId, setBookingSlotId] = useState("");
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaultBookingValues,
  });
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const getPTMEvents = useGetPTMEvents(org);
  const getSlotsForEvent = useGetSlotsForEvent(org, selectedEventId);
  const getMyChildren = useGetMyChildren(org);
  const getMyBookings = useGetMyPTMBookings(org);
  const bookSlot = useBookPTMSlot(org);
  const cancelBooking = useCancelPTMBooking(org);

  useError({ mutation: bookSlot });
  useError({ mutation: cancelBooking });

  const events = getPTMEvents.data?.items || [];
  const slots = getSlotsForEvent.data?.items || [];
  const children = getMyChildren.data?.items || [];
  const bookings = getMyBookings.data?.items || [];

  // the teachers each child already meets in this event: only one slot per teacher per child is allowed
  const bookedWith = new Set(
    bookings
      .filter(
        (b) => b.status !== "cancelled" && typeof b.slotId === "object" && b.slotId.ptmEventId === selectedEventId
      )
      .map((b) => `${idOf(b.studentId)}:${typeof b.slotId === "object" ? idOf(b.slotId.teacherUserId) : ""}`)
  );

  // a slot belongs to one section, so only the children in that section who aren't booked with its teacher can take it
  const childrenForSlot = (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    return children.filter(
      (c) =>
        c.studentId.currentEnrollment?.sectionId?.id === slot?.sectionId &&
        !bookedWith.has(`${c.studentId.id}:${idOf(slot?.teacherUserId)}`)
    );
  };
  const bookingChildren = bookingSlotId ? childrenForSlot(bookingSlotId) : [];
  const bookingSlot = slots.find((s) => s.id === bookingSlotId);
  const bookingDescription = bookingSlot
    ? `${teacherNameOf(bookingSlot)}, ${new Date(bookingSlot.startAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
    : undefined;
  const slotItems = slots.map((slot) => ({
    id: slot.id,
    teacherName: teacherNameOf(slot),
    time: new Date(slot.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    full: slot.bookedCount >= slot.capacity,
    alreadyBooked: childrenForSlot(slot.id).length === 0,
  }));

  const eventOptions: SelectOption[] = events.map((event) => ({
    id: event.id,
    name: `${event.title} (${new Date(event.date).toLocaleDateString()})`,
  }));
  const childOptions: SelectOption[] = bookingChildren.map((c) => ({ id: c.studentId.id, name: c.studentId.name }));

  const openBookingFor = (slotId: string) => {
    setBookingSlotId(slotId);
    bookingForm.reset({ studentId: childrenForSlot(slotId)[0]?.studentId.id || "" });
  };

  const closeBooking = () => setBookingSlotId("");

  const confirmBooking = bookingForm.handleSubmit(({ studentId }) => {
    bookSlot.mutate(
      { slotId: bookingSlotId, studentId, ptmEventId: selectedEventId },
      {
        onSuccess: () => {
          toast.success("Slot booked! Check your email for confirmation.");
          setBookingSlotId("");
        },
      }
    );
  });

  const confirmCancelBooking = () => {
    if (!bookingToCancel) return;
    cancelBooking.mutate(bookingToCancel, {
      onSuccess: () => {
        toast.success("Booking cancelled.");
        setBookingToCancel(null);
      },
    });
  };

  return {
    events,
    slotItems,
    eventOptions,
    childOptions,
    bookings,
    isLoadingBookings: getMyBookings.isLoading,
    bookingsError: getMyBookings.isError ? getMyBookings.error : null,
    retryBookings: () => getMyBookings.refetch(),
    isLoadingEvents: getPTMEvents.isLoading,
    isLoadingSlots: getSlotsForEvent.isLoading,
    isBooking: bookSlot.isPending,
    selectedEventId,
    selectedEventOption: eventOptions.find((o) => o.id === selectedEventId) || null,
    selectEvent: (option: SelectOption) => setSelectedEventId(String(option.id)),
    bookingSlotId,
    bookingDescription,
    bookingForm,
    openBookingFor,
    closeBooking,
    confirmBooking,
    bookingToCancel,
    setBookingToCancel,
    closeCancel: () => setBookingToCancel(null),
    confirmCancelBooking,
    isCancelling: cancelBooking.isPending,
  };
};

export default useParentPTMController;

export {
  useBookPTMSlot,
  useCancelPTMBooking,
  useCreatePTMEvent,
  useGenerateSlots,
  useGetMyPTMAgenda,
  useGetMyPTMBookings,
  useGetPTMEvents,
  useGetSlotsForEvent,
} from "./api/ptm-service";
export type { IPTMBooking, IPTMEvent, IPTMSlot } from "./model/types";

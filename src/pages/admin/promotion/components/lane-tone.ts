import { Lane } from "../promotion.utils";

// one colour per lane, so a card's destination reads at a glance
export const LANE_TONE: Record<Lane, { bar: string; count: string; over: string }> = {
  decide: { bar: "bg-gray-300", count: "bg-gray-200 text-gray-700", over: "ring-gray-400" },
  promote: { bar: "bg-green-500", count: "bg-green-100 text-green-800", over: "ring-green-500" },
  detain: { bar: "bg-amber-500", count: "bg-amber-100 text-amber-800", over: "ring-amber-500" },
  pass_out: { bar: "bg-primary-500", count: "bg-primary-100 text-primary-800", over: "ring-primary-500" },
  leave: { bar: "bg-red-500", count: "bg-red-100 text-red-800", over: "ring-red-500" },
};

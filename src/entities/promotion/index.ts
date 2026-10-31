export {
  candidatesQuery,
  processDecisions,
  refreshAfterPromotion,
  useGetPromotionCandidates,
  useGetPromotionOverview,
  useProcessPromotions,
} from "./api/promotion-service";
export type { IPromotionDecisionInput } from "./api/promotion-service";
export type { IPromotionCandidate, IPromotionSectionStats } from "./model/types";

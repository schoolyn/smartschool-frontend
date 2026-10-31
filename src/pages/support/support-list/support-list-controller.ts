import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAreaBase, useCurrentRole } from "@/entities/session";
import { useSupportRequests } from "@/entities/support";

const useSupportListController = () => {
  const { organizationId = "" } = useParams();
  const navigate = useNavigate();
  const areaBase = useAreaBase();
  const requests = useSupportRequests(organizationId);
  const [isAsking, setIsAsking] = useState(false);

  return {
    requests: requests.data ?? [],
    isLoading: requests.isLoading,
    error: requests.error,
    retry: () => requests.refetch(),
    showsRequester: useCurrentRole() === "admin",
    open: (requestId: string) => navigate(`${areaBase}/support/${requestId}`),
    isAsking,
    setIsAsking,
  };
};

export default useSupportListController;

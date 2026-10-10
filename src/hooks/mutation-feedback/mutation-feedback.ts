import { useEffect } from "react";
import toast from "react-hot-toast";
import type { UseMutationResult } from "@tanstack/react-query";

import useError from "../error/error";

// The standard reaction to a mutation: the server's reason when it fails, and a toast plus an optional callback when
// it succeeds. Success is handled from the mutation's own state, so it runs once per completed request.
export const useMutationFeedback = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, any, any, any>,
  successMessage: string,
  onSuccess?: () => void,
) => {
  useError({ mutation });

  useEffect(() => {
    if (mutation.isSuccess) {
      toast.success(successMessage);
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);
};

export default useMutationFeedback;

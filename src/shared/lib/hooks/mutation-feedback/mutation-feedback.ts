import { useEffect } from "react";
import toast from "react-hot-toast";
import type { UseMutationResult } from "@tanstack/react-query";

import useError from "../error/error";

// server reason on failure; toast plus optional callback once per success, read from the mutation's state
export const useMutationFeedback = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, any, any, any>,
  successMessage: string,
  onSuccess?: () => void
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

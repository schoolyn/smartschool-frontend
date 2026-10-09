import { useEffect } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { IAPIError } from "@/types";

const useError = ({
  mutation,
  entity,
  dependentEntities,
  cb,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, IAPIError, any, any>;
  entity?: string;
  dependentEntities?: string;
  cb?: () => void;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (mutation.isError) {
      const errorCode = mutation.error.response?.Error?.code;

      if (errorCode === "EX-00001" || errorCode === "EX-00006") {
        navigate("/login");
      } else if (errorCode === "EX-00101") {
        toast.error(t("messages.invalid_credentials"));
      } else if (mutation.error.response?.Error?.name === "AuthorizationError") {
        toast.error(mutation.error.response.Error.message || t("messages.something_went_wrong"));
      } else {
        toast.error(t("messages.something_went_wrong"));
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      cb && cb();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependentEntities, entity, history, mutation.error, mutation.isError, t]);
};

export default useError;

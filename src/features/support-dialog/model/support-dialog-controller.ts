import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAreaBase } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { defaultNewSupportRequest, NewSupportRequestValues, newSupportRequestSchema } from "@/entities/support";
import { useCreateSupportRequest } from "@/entities/support";

interface Options {
  open: boolean;
  onClose: () => void;
  prefill?: Partial<NewSupportRequestValues>;
}

const useSupportDialogController = ({ open, onClose, prefill }: Options) => {
  const { organizationId = "" } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const areaBase = useAreaBase();
  const create = useCreateSupportRequest(organizationId);
  useError({ mutation: create });

  const form = useForm<NewSupportRequestValues>({
    resolver: zodResolver(newSupportRequestSchema),
    defaultValues: defaultNewSupportRequest,
  });
  // prefill is read only when the dialog opens
  const prefillRef = useRef(prefill);
  prefillRef.current = prefill;
  useEffect(() => {
    if (open) form.reset({ ...defaultNewSupportRequest, ...prefillRef.current });
  }, [open, form]);

  // the page they were on, for debugging
  const submit = form.handleSubmit((values) =>
    create.mutate(
      { ...values, page: pathname },
      {
        onSuccess: (request) => {
          toast.success(`Request #${request.number} sent. We'll reply here and by email.`);
          onClose();
          navigate(`${areaBase}/support/${request._id}`);
        },
      }
    )
  );

  return { form, submit, isSending: create.isPending };
};

export default useSupportDialogController;

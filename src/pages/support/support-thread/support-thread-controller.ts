import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAreaBase } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { openSupportAttachment, useReplyToSupportRequest, useSupportThread } from "@/entities/support";
import { defaultSupportReply, SupportReplyValues, supportReplySchema } from "@/entities/support";

const useSupportThreadController = () => {
  const { organizationId = "", requestId = "" } = useParams();
  const areaBase = useAreaBase();
  const thread = useSupportThread(organizationId, requestId);
  const reply = useReplyToSupportRequest(organizationId, requestId);
  useError({ mutation: reply });

  const form = useForm<SupportReplyValues>({
    resolver: zodResolver(supportReplySchema),
    defaultValues: defaultSupportReply,
  });
  const send = form.handleSubmit((values) =>
    reply.mutate(values, {
      onSuccess: () => {
        form.reset(defaultSupportReply);
        toast.success("Reply sent.");
      },
    })
  );

  const openAttachment = (messageId: string) =>
    openSupportAttachment(organizationId, requestId, messageId).catch(() =>
      toast.error("The screenshot couldn't be opened.")
    );

  return {
    backTo: `${areaBase}/support`,
    thread: thread.data,
    isLoading: thread.isLoading,
    error: thread.error,
    retry: () => thread.refetch(),
    form,
    send,
    isSending: reply.isPending,
    openAttachment,
  };
};

export default useSupportThreadController;

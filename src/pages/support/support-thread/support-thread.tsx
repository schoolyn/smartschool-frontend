import { Link } from "react-router-dom";
import { ArrowLeftIcon, PaperClipIcon } from "@heroicons/react/24/outline";

import ErrorState from "@/shared/ui/error-state";
import PageLoader from "@/shared/ui/page-loader";
import { FileField, TextareaField } from "@/shared/ui/form-fields";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Form } from "@/shared/ui/kit/form";
import { cn } from "@/shared/lib/utils";
import { STATUS } from "@/entities/support";
import useSupportThreadController from "./support-thread-controller";

const SupportThread = () => {
  const c = useSupportThreadController();

  if (c.isLoading) return <PageLoader />;
  if (c.error || !c.thread) return <ErrorState error={c.error} onRetry={c.retry} />;
  const { thread } = c;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to={c.backTo} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeftIcon className="h-4 w-4" /> All requests
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-gray-900">
            #{thread.number} {thread.subject}
          </p>
          <p className="text-sm text-gray-500">Opened {new Date(thread.createdAt).toLocaleString()}</p>
        </div>
        <Badge tone={STATUS[thread.status].tone}>{STATUS[thread.status].label}</Badge>
      </div>

      <div className="space-y-3">
        {thread.messages.map((message) => {
          const fromSupport = message.from === "support";
          return (
            <div
              key={message._id}
              className={cn(
                "rounded-lg p-4 shadow",
                fromSupport ? "border border-primary-200 bg-primary-50" : "bg-white"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {fromSupport ? "Opscul support" : message.authorId?.name}
                </span>
                <span>{new Date(message.createdAt).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-900">{message.body}</p>
              {message.attachment?.originalName && (
                <Button variant="link" size="sm" className="mt-2" onClick={() => c.openAttachment(message._id)}>
                  <PaperClipIcon className="h-4 w-4" /> {message.attachment.originalName}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <Form {...c.form}>
          <form onSubmit={c.send} noValidate className="space-y-4">
            <TextareaField
              form={c.form}
              name="body"
              label="Reply"
              placeholder="Add more detail or answer Opscul's question"
            />
            <FileField
              form={c.form}
              name="screenshot"
              label="Screenshot (optional)"
              accept="image/png,image/jpeg"
              maxBytes={10 * 1024 * 1024}
              hint="PNG or JPG, up to 10 MB"
            />
            <div className="flex justify-end">
              <Button type="submit" loading={c.isSending}>
                Send reply
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SupportThread;

import ErrorState from "@/shared/ui/error-state";
import PageLoader from "@/shared/ui/page-loader";
import { TextField } from "@/shared/ui/form-fields";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Form } from "@/shared/ui/kit/form";
import { Switch } from "@/shared/ui/kit/switch";
import useOnlinePaymentsController from "./online-payments-controller";

const OnlinePayments = () => {
  const { settings, data, connected, form, submit, isSaving, toggle, webhookUrl, copyWebhook } =
    useOnlinePaymentsController();

  if (settings.isLoading) return <PageLoader />;
  if (settings.isError) return <ErrorState error={settings.error} onRetry={() => settings.refetch()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">Online fee payments</p>
              <Badge tone={data.enabled ? "green" : "gray"}>{data.enabled ? "On" : "Off"}</Badge>
              {data.keyId.startsWith("rzp_test_") && <Badge tone="yellow">Test mode</Badge>}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Parents pay from the app with UPI, cards or net banking, straight into your school&apos;s Razorpay
              account. Each payment gets a receipt and shows in the ledger and reports, like any other payment.
              Razorpay&apos;s charge comes out of what the school receives.
            </p>
          </div>
          <Switch checked={data.enabled} disabled={!connected || isSaving} onCheckedChange={toggle} />
        </div>
        {!connected && (
          <p className="mt-3 text-sm text-amber-700">Connect your Razorpay account below to turn this on.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm font-medium text-gray-900">Razorpay account</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600">
          <li>
            In the Razorpay dashboard, open Account &amp; Settings, then API Keys, and generate a key. Paste the key id
            and secret here.
          </li>
          <li>
            Under Webhooks, add the address below, choose the events{" "}
            <span className="font-medium">payment.captured</span> and <span className="font-medium">order.paid</span>,
            set a secret, and paste that secret here too.
          </li>
          <li>Save. The keys are checked with Razorpay first, then stored encrypted. They are never shown again.</li>
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
          <code className="min-w-0 flex-1 break-all text-xs text-gray-700">{webhookUrl}</code>
          <Button variant="secondary" size="sm" onClick={copyWebhook}>
            Copy
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={submit} noValidate className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField form={form} name="keyId" label="Key id" placeholder="rzp_live_..." />
            <TextField
              form={form}
              name="keySecret"
              label="Key secret"
              type="password"
              placeholder={data.hasKeySecret ? "Saved. Leave blank to keep it." : "Paste the key secret"}
            />
            <TextField
              form={form}
              name="webhookSecret"
              label="Webhook secret"
              type="password"
              placeholder={data.hasWebhookSecret ? "Saved. Leave blank to keep it." : "Paste the webhook secret"}
            />
            <div className="sm:col-span-3">
              <Button type="submit" loading={isSaving}>
                Save and check keys
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OnlinePayments;

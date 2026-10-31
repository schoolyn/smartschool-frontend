import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import PageLoader from "@/shared/ui/page-loader";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/kit/select";
import { AccountRole } from "@/shared/types";
import { PermissionList } from "../access";
import useMemberAccessController from "./member-access-controller";

const MemberAccess = () => {
  const c = useMemberAccessController();

  if (c.isLoading) return <PageLoader />;
  if (c.loadError || !c.member) return <ErrorState error={c.loadError} onRetry={c.retry} />;
  const { member } = c;
  const locked = !!c.lockedReason;
  const { suspended } = c;

  return (
    <div className="space-y-6">
      <Link to={c.backTo} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeftIcon className="h-4 w-4" /> All people
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-white p-6 shadow">
        <div>
          <p className="text-lg font-semibold text-gray-900">{member.name || member.email}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge tone={suspended ? "red" : "green"}>{suspended ? "Suspended" : "Active"}</Badge>
            {member.accountStatus === "pending" && <Badge tone="yellow">Hasn't set a password yet</Badge>}
          </div>
        </div>
        {!locked && (
          <div className="flex gap-2">
            {member.accountStatus === "pending" && (
              <Button variant="secondary" loading={c.isResending} onClick={c.resendInvite}>
                Resend invite
              </Button>
            )}
            <Button variant={suspended ? "secondary" : "danger"} onClick={() => c.setConfirmStatus(true)}>
              {suspended ? "Reactivate" : "Suspend"}
            </Button>
          </div>
        )}
      </div>

      {locked && (
        <p className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">{c.lockedReason}</p>
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm font-medium text-gray-900">Role in this school</p>
        <p className="mt-1 text-sm text-gray-500">The role sets their area of the app and their default access.</p>
        <div className="mt-3 w-64">
          <Select value={c.role} onValueChange={(value) => c.changeRole(value as AccountRole)} disabled={locked}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {c.roleChoices.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Access</p>
            <p className="mt-1 text-sm text-gray-500">
              {c.isStaffRole
                ? "Switches start from the role's defaults; anything you change is marked."
                : c.role === "admin"
                  ? "Administrators always have full access to everything in the school."
                  : "Parents see only their own children's information."}
            </p>
          </div>
          {c.isStaffRole && !locked && (
            <Button variant="secondary" size="sm" onClick={c.resetToDefaults}>
              Reset to role defaults
            </Button>
          )}
        </div>
        {c.isStaffRole && (
          <PermissionList
            permissions={c.grantable}
            value={c.selected}
            defaults={c.defaults}
            disabled={locked}
            onToggle={c.toggle}
          />
        )}
      </div>

      {!locked && (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={!c.isDirty} onClick={c.discard}>
            Discard
          </Button>
          <Button disabled={!c.isDirty} loading={c.isSaving} onClick={c.save}>
            Save changes
          </Button>
        </div>
      )}

      <DeleteConfirmationDialog
        open={c.confirmStatus}
        tone={suspended ? "neutral" : "danger"}
        title={suspended ? "Reactivate in this school?" : "Suspend in this school?"}
        description={
          suspended
            ? "They can open this school again, with the role and access they had."
            : "They lose access to this school straight away. Their role and access are kept for when you reactivate them. Other schools they belong to are not affected."
        }
        confirmLabel={suspended ? "Reactivate" : "Suspend"}
        isLoading={c.isChangingStatus}
        onClose={() => c.setConfirmStatus(false)}
        onConfirm={c.toggleStatus}
      />
    </div>
  );
};

export default MemberAccess;

import ErrorState from "@/shared/ui/error-state";
import PageLoader from "@/shared/ui/page-loader";
import { Button } from "@/shared/ui/kit/button";
import { type AccessCatalog } from "@/entities/access";
import { PermissionList } from "../access";
import useRoleDefaultsController, { useRoleCardController } from "./role-defaults-controller";

const RoleCard = ({
  organizationId,
  catalog,
  entry,
}: {
  organizationId: string;
  catalog: AccessCatalog;
  entry: AccessCatalog["roles"][number];
}) => {
  const c = useRoleCardController(organizationId, catalog, entry);
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{c.title.title}</p>
          <p className="mt-1 text-sm text-gray-500">{c.title.hint} Marked switches differ from Opscul's defaults.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={c.applyOpsculDefaults}>
            Use Opscul defaults
          </Button>
          <Button size="sm" disabled={!c.isDirty} loading={c.isSaving} onClick={c.save}>
            Save
          </Button>
        </div>
      </div>
      <PermissionList permissions={c.grantable} value={c.selected} defaults={c.opsculDefaults} onToggle={c.toggle} />
    </div>
  );
};

const RoleDefaults = () => {
  const { organizationId, catalog, isLoading, error, retry } = useRoleDefaultsController();

  if (isLoading) return <PageLoader />;
  if (error || !catalog) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Changes apply to everyone in that role, except where one person's access was changed on their own page. Admins
        always have full access.
      </p>
      {catalog.roles.map((entry) => (
        <RoleCard key={entry.role} organizationId={organizationId} catalog={catalog} entry={entry} />
      ))}
    </div>
  );
};

export default RoleDefaults;

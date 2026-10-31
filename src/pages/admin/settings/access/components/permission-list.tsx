import { Badge } from "@/shared/ui/kit/badge";
import { Switch } from "@/shared/ui/kit/switch";
import { PermissionKey } from "@/shared/types";
import { AccessCatalog } from "@/entities/access";

interface PermissionListProps {
  permissions: AccessCatalog["permissions"];
  value: ReadonlySet<PermissionKey>;
  defaults: ReadonlySet<PermissionKey>;
  disabled?: boolean;
  onToggle: (key: PermissionKey, on: boolean) => void;
}

const PermissionList = ({ permissions, value, defaults, disabled, onToggle }: PermissionListProps) => {
  const areas = [...new Set(permissions.map((p) => p.area))];
  return (
    <div className="space-y-6">
      {areas.map((area) => (
        <div key={area}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{area}</p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {permissions
              .filter((p) => p.area === area)
              .map((p) => {
                const on = value.has(p.key);
                const changed = on !== defaults.has(p.key);
                return (
                  <div key={p.key} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{p.label}</span>
                      {changed && <Badge tone={on ? "blue" : "yellow"}>{on ? "Added" : "Removed"}</Badge>}
                    </div>
                    <Switch
                      checked={on}
                      disabled={disabled}
                      onCheckedChange={(next) => onToggle(p.key, next)}
                      aria-label={p.label}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionList;

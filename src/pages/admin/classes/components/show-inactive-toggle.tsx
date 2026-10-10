import { Switch } from "@/components/ui/switch";

const ShowInactiveToggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
    <Switch checked={checked} onCheckedChange={onChange} aria-label="Show inactive" />
    Show inactive
  </label>
);

export default ShowInactiveToggle;

import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/20/solid";

import { SupportDialog } from "@/features/support-dialog";
import { Button } from "@/shared/ui/kit/button";
import { ModuleKey } from "@/shared/types";
import { MODULE_LABELS } from "@/shared/lib";

// why a locked page is view-only, with a way to ask for it
const LockedBanner = ({ module }: { module: ModuleKey }) => {
  const [asking, setAsking] = useState(false);
  const label = MODULE_LABELS[module];

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <LockClosedIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-amber-900">{label} isn't part of your school's package</p>
          <p className="text-sm text-amber-800">You can view existing records; changes are turned off.</p>
        </div>
      </div>
      <Button variant="secondary" onClick={() => setAsking(true)}>
        Request access
      </Button>
      <SupportDialog
        open={asking}
        onClose={() => setAsking(false)}
        prefill={{
          topic: "other",
          subject: `Please unlock ${label}`,
          body: `We'd like ${label} added to our school's package.`,
        }}
      />
    </div>
  );
};

export default LockedBanner;

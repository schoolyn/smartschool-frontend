import { cn } from "@/shared/lib/utils";

interface MarksProgressProps {
  entered: number;
  verified: number;
  expected: number;
  className?: string;
}

// a bar of marks entered (light) and verified (dark) out of all expected
const MarksProgress = ({ entered, verified, expected, className }: MarksProgressProps) => {
  const share = (count: number) => (expected ? Math.min(100, Math.round((count / expected) * 100)) : 0);
  return (
    <div className={cn("mx-auto min-w-[9rem] max-w-[14rem]", className)}>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="absolute inset-y-0 left-0 bg-primary-200" style={{ width: `${share(entered)}%` }} />
        <div className="absolute inset-y-0 left-0 bg-primary-600" style={{ width: `${share(verified)}%` }} />
      </div>
      <p className="mt-1 text-center text-xs text-gray-500">
        {expected ? `${entered} of ${expected} entered · ${verified} verified` : "No marks expected yet"}
      </p>
    </div>
  );
};

export default MarksProgress;

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { cn } from "@/lib/utils";
import {
  type JobApplication,
  type AppStatus,
  BOARD_COLUMNS,
  STATUS_CONFIG,
} from "@/data/mock-jobs";

interface JobBoardProps {
  jobs: JobApplication[];
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
  onAddToColumn: (status: AppStatus) => void;
}

export function JobBoard({
  jobs,
  onUpdate,
  onDelete,
  onEdit,
  onAddToColumn,
}: JobBoardProps) {
  const byStatus = useMemo(() => {
    const map = new Map<AppStatus, JobApplication[]>();
    for (const col of BOARD_COLUMNS) map.set(col, []);
    for (const job of jobs) {
      if (map.has(job.status)) {
        map.get(job.status)!.push(job);
      }
    }
    // Sort each column: starred first, then by next action date
    for (const [status, list] of map) {
      map.set(
        status,
        list.sort((a, b) => {
          if (a.starred !== b.starred) return a.starred ? -1 : 1;
          if (a.nextActionDate && b.nextActionDate) {
            return a.nextActionDate.localeCompare(b.nextActionDate);
          }
          return a.nextActionDate ? -1 : 1;
        })
      );
    }
    return map;
  }, [jobs]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1 -mx-1 snap-x snap-mandatory">
      {BOARD_COLUMNS.map((status) => {
        const cfg = STATUS_CONFIG[status];
        const cards = byStatus.get(status) ?? [];

        return (
          <div
            key={status}
            className="flex w-72 shrink-0 snap-start flex-col gap-3"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    cfg.color,
                    cfg.bg,
                    cfg.border
                  )}
                >
                  {cfg.label}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {cards.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onAddToColumn(status)}
                aria-label={`Add to ${cfg.label}`}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5">
              {cards.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onAddToColumn(status)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-fuego-300 hover:text-fuego-600 hover:bg-fuego-50/50"
                >
                  <Plus className="size-5" />
                  <span className="text-xs font-medium">Add first</span>
                </button>
              ) : (
                cards.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

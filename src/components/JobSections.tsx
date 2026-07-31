import { useMemo } from "react";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { cn } from "@/lib/utils";
import {
  type JobApplication,
  type AppStatus,
} from "@/data/mock-jobs";

// ── Category definitions ─────────────────────────────────────────────────────

type SectionKey = AppStatus | "starred";

interface SectionDef {
  key: SectionKey;
  label: string;
  emoji: string;
  color: string;        // active text
  activeBg: string;     // active pill bg
  activeBorder: string; // active pill border
  dot: string;          // count badge dot
}

const SECTIONS: SectionDef[] = [
  {
    key: "applied",
    label: "Applied",
    emoji: "📨",
    color: "text-blue-700",
    activeBg: "bg-blue-50",
    activeBorder: "border-blue-300",
    dot: "bg-blue-500",
  },
  {
    key: "phone_screen",
    label: "Phone Screen",
    emoji: "📞",
    color: "text-purple-700",
    activeBg: "bg-purple-50",
    activeBorder: "border-purple-300",
    dot: "bg-purple-500",
  },
  {
    key: "interview",
    label: "Interview",
    emoji: "🗣️",
    color: "text-fuego-700",
    activeBg: "bg-fuego-50",
    activeBorder: "border-fuego-300",
    dot: "bg-fuego-500",
  },
  {
    key: "offer",
    label: "Offer 🎉",
    emoji: "",
    color: "text-green-700",
    activeBg: "bg-green-50",
    activeBorder: "border-green-300",
    dot: "bg-green-500",
  },
  {
    key: "rejected",
    label: "Rejected",
    emoji: "❌",
    color: "text-red-600",
    activeBg: "bg-red-50",
    activeBorder: "border-red-300",
    dot: "bg-red-400",
  },
  {
    key: "withdrawn",
    label: "Withdrawn",
    emoji: "↩️",
    color: "text-muted-foreground",
    activeBg: "bg-muted",
    activeBorder: "border-border",
    dot: "bg-muted-foreground",
  },
  {
    key: "starred",
    label: "Starred",
    emoji: "⭐",
    color: "text-fuego-700",
    activeBg: "bg-fuego-50",
    activeBorder: "border-fuego-300",
    dot: "bg-fuego-500",
  },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface JobSectionsProps {
  jobs: JobApplication[];
  activeSection: SectionKey;
  onSectionChange: (key: SectionKey) => void;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
  onAdd: (status: AppStatus) => void;
}

export type { SectionKey };

// ── Component ────────────────────────────────────────────────────────────────

export function JobSections({
  jobs,
  activeSection,
  onSectionChange,
  onUpdate,
  onDelete,
  onEdit,
  onAdd,
}: JobSectionsProps) {
  // Build counts and card list per section key
  const { counts, cards } = useMemo(() => {
    const counts = new Map<SectionKey, number>();
    const buckets = new Map<SectionKey, JobApplication[]>();
    for (const s of SECTIONS) {
      counts.set(s.key, 0);
      buckets.set(s.key, []);
    }

    for (const job of jobs) {
      // Status bucket
      if (buckets.has(job.status)) {
        buckets.get(job.status)!.push(job);
        counts.set(job.status, (counts.get(job.status) ?? 0) + 1);
      }
      // Starred bucket
      if (job.starred) {
        buckets.get("starred")!.push(job);
        counts.set("starred", (counts.get("starred") ?? 0) + 1);
      }
    }

    // Sort active bucket: starred first, then by next action date
    const sorted = (buckets.get(activeSection) ?? []).slice().sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      if (a.nextActionDate && b.nextActionDate)
        return a.nextActionDate.localeCompare(b.nextActionDate);
      return a.nextActionDate ? -1 : 1;
    });

    return { counts, cards: sorted };
  }, [jobs, activeSection]);

  const activeDef = SECTIONS.find((s) => s.key === activeSection)!;
  const isStatusSection = activeSection !== "starred";

  return (
    <div className="flex flex-col gap-4">

      {/* ── Category button row ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const count = counts.get(s.key) ?? 0;
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSectionChange(s.key)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                isActive
                  ? cn("shadow-sm", s.color, s.activeBg, s.activeBorder)
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-secondary/60"
              )}
              aria-pressed={isActive}
            >
              {s.key === "starred" ? (
                <Star
                  className={cn(
                    "size-3.5 shrink-0",
                    isActive ? "fill-fuego-500 text-fuego-500" : ""
                  )}
                />
              ) : (
                s.emoji && (
                  <span className="text-xs leading-none" aria-hidden>
                    {s.emoji}
                  </span>
                )
              )}

              <span>{s.label}</span>

              {/* Count bubble */}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                    isActive
                      ? cn("bg-white/80 border", s.activeBorder, s.color)
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active section header + add button ──────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              activeDef.dot
            )}
          />
          <h2 className={cn("text-base font-semibold", activeDef.color)}>
            {activeDef.label}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({cards.length} {cards.length === 1 ? "job" : "jobs"})
          </span>
        </div>

        {isStatusSection && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAdd(activeSection as AppStatus)}
            className={cn("gap-1.5 border-dashed", activeDef.color, activeDef.activeBorder, "hover:border-solid")}
          >
            <Plus className="size-3.5" />
            Add to {activeDef.label}
          </Button>
        )}
      </div>

      {/* ── Job cards ────────────────────────────────────────────────── */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 text-center text-muted-foreground">
          <span className="text-4xl">{activeDef.emoji || "📋"}</span>
          <div>
            <p className="text-sm font-medium">No {activeDef.label.toLowerCase()} applications</p>
            {isStatusSection && (
              <p className="mt-1 text-xs">
                Click "Add to {activeDef.label}" to add one.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeSection === "starred" && (
            <p className="rounded-xl border border-fuego-200 bg-fuego-50 px-4 py-2.5 text-xs text-fuego-700">
              ⭐ Unstarring a job moves it to its status category — you won't lose it.
            </p>
          )}
          {cards.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

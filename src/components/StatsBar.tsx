import { Briefcase, Send, Phone, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { type JobApplication } from "@/data/mock-jobs";
import { type SectionKey } from "@/components/JobSections";

interface StatsBarProps {
  jobs: JobApplication[];
  onNavigate: (section: SectionKey) => void;
}

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
  onClick?: () => void;
  hint?: string;
}

function StatTile({ icon, label, value, accent, onClick, hint }: StatTileProps) {
  const isClickable = !!onClick;
  const Comp = isClickable ? "button" : "div";

  return (
    <Comp
      {...(isClickable ? { type: "button", onClick } : {})}
      title={hint}
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-4 py-3 bg-card text-left w-full",
        accent && "border-fuego-200 bg-fuego-50",
        isClickable && "transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        isClickable && !accent && "hover:border-foreground/20",
        isClickable && accent && "hover:brightness-95"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          accent
            ? "bg-fuego-500 text-white group-hover:bg-fuego-600"
            : "bg-secondary text-muted-foreground group-hover:bg-accent"
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xl font-bold leading-none tabular-nums",
            accent ? "text-fuego-700" : "text-foreground"
          )}
        >
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{label}</p>
      </div>
      {isClickable && (
        <span className="ml-auto text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          View →
        </span>
      )}
    </Comp>
  );
}

export function StatsBar({ jobs, onNavigate }: StatsBarProps) {
  const total = jobs.length;
  const applied = jobs.filter((j) =>
    ["applied", "phone_screen", "interview", "offer"].includes(j.status)
  ).length;
  const interviews = jobs.filter((j) =>
    ["phone_screen", "interview"].includes(j.status)
  ).length;
  const offers = jobs.filter((j) => j.status === "offer").length;

  const denominator = jobs.filter((j) =>
    ["applied", "phone_screen", "interview", "offer", "rejected"].includes(j.status)
  ).length;
  const responded = jobs.filter((j) =>
    ["phone_screen", "interview", "offer", "rejected"].includes(j.status)
  ).length;
  const responseRate =
    denominator > 0 ? Math.round((responded / denominator) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatTile
        icon={<Briefcase className="size-4" />}
        label="Total tracked"
        value={total}
        onClick={() => onNavigate("applied")}
        hint="View Applied jobs"
      />
      <StatTile
        icon={<Send className="size-4" />}
        label="Active pipeline"
        value={applied}
        onClick={() => onNavigate("applied")}
        hint="View Applied jobs"
      />
      <StatTile
        icon={<Phone className="size-4" />}
        label="In interviews"
        value={interviews}
        accent={interviews > 0}
        onClick={() => onNavigate("interview")}
        hint="View Interview jobs"
      />
      <StatTile
        icon={<Trophy className="size-4" />}
        label="Offers"
        value={offers}
        accent={offers > 0}
        onClick={() => onNavigate("offer")}
        hint="View Offers"
      />
      <StatTile
        icon={<Users className="size-4" />}
        label={`Response rate (${responseRate}%)`}
        value={responded}
        onClick={() => onNavigate("phone_screen")}
        hint="View Phone Screen jobs"
      />
    </div>
  );
}

import { useState, useMemo } from "react";
import {
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  Wifi,
  RefreshCw,
  Briefcase,
  Building2,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type AppStatus } from "@/data/mock-jobs";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FeedJob {
  id: string;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  salary?: string;
  postedMinutesAgo: number;
  url: string;
  matchedSkills: string[];
  description: string;
  type: "full_time" | "contract" | "part_time";
}

// ── Mock feed data ───────────────────────────────────────────────────────────
// In a real app this would be fetched from a jobs API (LinkedIn, Indeed, etc.)
// filtered by skills extracted from the uploaded resume.

const MOCK_FEED: FeedJob[] = [
  {
    id: "feed-1",
    company: "Notion",
    role: "Senior React Engineer",
    location: "San Francisco, CA",
    remote: true,
    salary: "$175k – $215k",
    postedMinutesAgo: 42,
    url: "https://notion.so/jobs",
    matchedSkills: ["react", "typescript", "nextjs"],
    description: "Join our editor team building the next generation of collaborative tools. You'll own core rendering performance and shape the product used by millions.",
    type: "full_time",
  },
  {
    id: "feed-2",
    company: "Clerk",
    role: "Frontend Engineer",
    location: "Remote",
    remote: true,
    salary: "$140k – $170k",
    postedMinutesAgo: 78,
    url: "https://clerk.com/careers",
    matchedSkills: ["react", "typescript", "css"],
    description: "Help us build auth infrastructure used by 50,000+ developers. Work on SDKs, component libraries, and the dashboard.",
    type: "full_time",
  },
  {
    id: "feed-3",
    company: "Resend",
    role: "Product Engineer",
    location: "Remote",
    remote: true,
    salary: "$130k – $160k",
    postedMinutesAgo: 110,
    url: "https://resend.com/careers",
    matchedSkills: ["react", "node", "typescript"],
    description: "Small team, big impact. You'll build features used by developers to send emails. Work across the stack on our dashboard and API.",
    type: "full_time",
  },
  {
    id: "feed-4",
    company: "PlanetScale",
    role: "Staff Frontend Engineer",
    location: "Remote",
    remote: true,
    salary: "$200k – $240k",
    postedMinutesAgo: 195,
    url: "https://planetscale.com/careers",
    matchedSkills: ["react", "typescript", "sql", "git"],
    description: "Lead frontend architecture for our database platform. You'll mentor engineers and drive technical decisions for the web dashboard.",
    type: "full_time",
  },
  {
    id: "feed-5",
    company: "Supabase",
    role: "Developer Experience Engineer",
    location: "Remote",
    remote: true,
    salary: "$145k – $175k",
    postedMinutesAgo: 320,
    url: "https://supabase.com/careers",
    matchedSkills: ["react", "typescript", "postgresql", "rest"],
    description: "Build docs, examples, and tools that help developers succeed with Supabase. You'll write code and content that reaches millions.",
    type: "full_time",
  },
  {
    id: "feed-6",
    company: "Railway",
    role: "Frontend Engineer (Contract)",
    location: "Remote",
    remote: true,
    salary: "$80 – $110/hr",
    postedMinutesAgo: 410,
    url: "https://railway.app/careers",
    matchedSkills: ["react", "typescript", "css"],
    description: "6-month contract to help us redesign our deployment dashboard. Attention to detail and a love for developer tooling required.",
    type: "contract",
  },
  {
    id: "feed-7",
    company: "Liveblocks",
    role: "React SDK Engineer",
    location: "Remote",
    remote: true,
    salary: "$150k – $185k",
    postedMinutesAgo: 520,
    url: "https://liveblocks.io/careers",
    matchedSkills: ["react", "typescript", "javascript"],
    description: "Build and maintain real-time collaboration SDKs used in products like Figma alternatives. Deep React expertise required.",
    type: "full_time",
  },
  {
    id: "feed-8",
    company: "Descript",
    role: "UI Engineer",
    location: "San Francisco, CA",
    remote: false,
    salary: "$160k – $195k",
    postedMinutesAgo: 680,
    url: "https://descript.com/careers",
    matchedSkills: ["react", "typescript", "css", "figma"],
    description: "Work on a desktop + web video editing app loved by podcasters and creators. You'll own the component system and collaborate daily with design.",
    type: "full_time",
  },
];

function formatPosted(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  return `${h}h ago`;
}

const TYPE_LABEL: Record<FeedJob["type"], string> = {
  full_time: "Full-time",
  contract: "Contract",
  part_time: "Part-time",
};

// ── Props ────────────────────────────────────────────────────────────────────

interface JobFeedProps {
  /** Skills extracted from the uploaded resume (or a default set) */
  resumeSkills: string[];
  onSaveJob: (job: FeedJob, status: AppStatus) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function JobFeed({ resumeSkills, onSaveJob }: JobFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState<string | null>(null);

  // In a real app: re-fetch. Here we just re-sort to simulate refresh.
  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  // Sort by match quality (more matched skills = higher) then recency
  const sorted = useMemo(() => {
    const lower = resumeSkills.map((s) => s.toLowerCase());
    return [...MOCK_FEED]
      .map((j) => ({
        ...j,
        matchCount: j.matchedSkills.filter((s) => lower.includes(s)).length,
      }))
      .sort((a, b) => {
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        return a.postedMinutesAgo - b.postedMinutesAgo;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeSkills, refreshKey]);

  function handleSave(job: FeedJob) {
    setSaving(job.id);
    setTimeout(() => {
      onSaveJob(job, "applied");
      setSaving(null);
    }, 400);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            New jobs in the last 24 hours
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Matched to your resume skills ·{" "}
            <span className="font-medium text-foreground">{sorted.length} results</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Skill chips — shows what we matched on */}
      {resumeSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center">Matching on:</span>
          {resumeSkills.slice(0, 10).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"
            >
              {skill}
            </span>
          ))}
          {resumeSkills.length > 10 && (
            <span className="text-xs text-muted-foreground self-center">
              +{resumeSkills.length - 10} more
            </span>
          )}
        </div>
      )}

      {/* Feed cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((job) => {
          const isSaving = saving === job.id;
          const matchPct = Math.round((job.matchCount / Math.max(job.matchedSkills.length, 1)) * 100);
          const isHighMatch = matchPct >= 80;

          return (
            <div
              key={job.id}
              className={cn(
                "group flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                isHighMatch && "border-green-200"
              )}
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                {/* Company logo placeholder */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-xs font-bold text-muted-foreground">
                  {job.company[0]}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{job.role}</span>
                    {isHighMatch && (
                      <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        Strong match
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="size-3 shrink-0" />
                    <span className="font-medium text-foreground">{job.company}</span>
                  </div>
                </div>

                {/* Posted time */}
                <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  {formatPosted(job.postedMinutesAgo)}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  {job.location}
                </span>
                {job.remote && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Wifi className="size-3" />
                    Remote
                  </span>
                )}
                <Badge variant="secondary" className="rounded-md text-[10px] px-1.5 py-0">
                  {TYPE_LABEL[job.type]}
                </Badge>
                {job.salary && (
                  <span className="ml-auto font-medium text-foreground">{job.salary}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {job.description}
              </p>

              {/* Matched skills */}
              <div className="flex flex-wrap gap-1">
                {job.matchedSkills.map((skill) => {
                  const matched = resumeSkills.map((s) => s.toLowerCase()).includes(skill);
                  return (
                    <span
                      key={skill}
                      className={cn(
                        "rounded-md border px-1.5 py-0 text-[10px] font-medium",
                        matched
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-muted border-border text-muted-foreground opacity-50"
                      )}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 border-t border-border pt-2 -mb-1">
                <Button
                  size="xs"
                  onClick={() => handleSave(job)}
                  disabled={isSaving}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <BookmarkPlus className="size-3.5" />
                  )}
                  {isSaving ? "Saving…" : "Save to Applied"}
                </Button>

                <Button
                  variant="outline"
                  size="xs"
                  asChild
                  className="gap-1.5"
                >
                  <a href={job.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" />
                    View posting
                  </a>
                </Button>

                <span className="ml-auto text-[10px] text-muted-foreground">
                  {job.matchCount}/{job.matchedSkills.length} skills matched
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        <Briefcase className="inline size-3 mr-1" />
        Upload your resume in the Documents tab to improve skill matching.
      </p>
    </div>
  );
}

// ── Helper: extract skills from stored resume text ───────────────────────────

const KNOWN_SKILLS = [
  "react","typescript","javascript","python","node","aws","docker","kubernetes",
  "sql","postgresql","graphql","rest","api","ci/cd","git","agile","css","html",
  "next.js","nextjs","vue","angular","java","go","rust","figma","tailwind",
  "machine learning","data analysis","product management","leadership","communication",
];

export function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => lower.includes(skill));
}

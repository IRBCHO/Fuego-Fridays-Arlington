import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Star,
  Briefcase,
  XCircle,
  FileText,
  Rss,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StatsBar } from "@/components/StatsBar";
import { JobSections, type SectionKey } from "@/components/JobSections";
import { JobFormModal } from "@/components/JobFormModal";
import { DocumentsPage } from "@/components/DocumentsPage";
import { JobFeed, type FeedJob, extractSkillsFromText } from "@/components/JobFeed";
import { loadDocuments } from "@/data/mock-documents-store";
import {
  type JobApplication,
  type AppStatus,
  mockJobs,
} from "@/data/mock-jobs";

type AppTab = "tracker" | "feed" | "documents";

let nextId = mockJobs.length + 1;
function generateId() {
  return `job-${nextId++}`;
}

/** Pull skills from any uploaded plain-text resume in localStorage */
function getResumeSkills(): string[] {
  const docs = loadDocuments();
  const resume = docs.find((d) => d.kind === "resume" && d.mimeType === "text/plain");
  if (resume) {
    try {
      const text = atob(resume.dataUrl.split(",")[1]);
      const skills = extractSkillsFromText(text);
      if (skills.length > 0) return skills;
    } catch {}
  }
  // Default skill set shown when no resume is uploaded
  return ["react", "typescript", "javascript", "css", "git", "node", "rest", "agile"];
}

export default function App() {
  const [jobs, setJobs] = useState<JobApplication[]>(mockJobs);
  const [tab, setTab] = useState<AppTab>("tracker");
  const [query, setQuery] = useState("");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<JobApplication | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<AppStatus>("applied");
  const [activeSection, setActiveSection] = useState<SectionKey>("applied");

  // ── CRUD ────────────────────────────────────────────────────────────────────

  function addJob(data: Omit<JobApplication, "id">) {
    setJobs((prev) => [{ id: generateId(), ...data }, ...prev]);
    setModalOpen(false);
  }

  function updateJob(id: string, updates: Partial<JobApplication>) {
    if (updates.starred === false && activeSection === "starred") {
      const job = jobs.find((j) => j.id === id);
      if (job) setActiveSection(job.status);
    }
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    );
  }

  function deleteJob(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  function saveEdit(data: Omit<JobApplication, "id">) {
    if (!editTarget) return;
    setJobs((prev) =>
      prev.map((j) => (j.id === editTarget.id ? { ...j, ...data } : j))
    );
    setEditTarget(null);
    setModalOpen(false);
  }

  function openAddModal(status: AppStatus = "applied") {
    setDefaultStatus(status);
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEditModal(job: JobApplication) {
    setEditTarget(job);
    setModalOpen(true);
  }

  /** Called from JobFeed — save a feed job directly into the tracker */
  function saveFeedJob(feedJob: FeedJob, status: AppStatus) {
    const newJob: JobApplication = {
      id: generateId(),
      company: feedJob.company,
      role: feedJob.role,
      location: feedJob.location,
      remote: feedJob.remote,
      type: feedJob.type,
      status,
      appliedDate: new Date().toISOString().slice(0, 10),
      salary: feedJob.salary,
      url: feedJob.url,
      notes: feedJob.description,
      tags: feedJob.matchedSkills.slice(0, 4),
      starred: false,
      contacts: [],
    };
    setJobs((prev) => [newJob, ...prev]);
    // Switch to tracker → applied so user can see it
    setTab("tracker");
    setActiveSection("applied");
  }

  // ── FILTERING ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter((j) => {
      if (onlyStarred && !j.starred) return false;
      if (
        q &&
        !j.company.toLowerCase().includes(q) &&
        !j.role.toLowerCase().includes(q) &&
        !j.location.toLowerCase().includes(q) &&
        !j.tags.some((t) => t.includes(q))
      )
        return false;
      return true;
    });
  }, [jobs, query, onlyStarred]);

  const hasFilters = query.length > 0 || onlyStarred;
  const resumeSkills = useMemo(() => getResumeSkills(), []);

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-auto">
            <span className="flex size-8 items-center justify-center rounded-lg bg-thermal">
              <Briefcase className="size-4 text-white" />
            </span>
            <div>
              <span className="font-display text-sm font-semibold tracking-tight leading-none text-foreground">
                Job Application Tracker
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                your job search, organized
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <nav className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
            {(
              [
                { key: "tracker",   icon: <Briefcase className="size-3.5" />,  label: "Tracker"   },
                { key: "feed",      icon: <Rss className="size-3.5" />,        label: "Job Feed"  },
                { key: "documents", icon: <FileText className="size-3.5" />,   label: "Documents" },
              ] as const
            ).map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  tab === key
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>

          {/* Add job — tracker tab only */}
          {tab === "tracker" && (
            <Button
              onClick={() => openAddModal()}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <Plus className="size-4" />
              Add job
            </Button>
          )}
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6">

        {/* Documents tab */}
        {tab === "documents" && <DocumentsPage />}

        {/* Job Feed tab */}
        {tab === "feed" && (
          <JobFeed
            resumeSkills={resumeSkills}
            onSaveJob={saveFeedJob}
          />
        )}

        {/* Tracker tab */}
        {tab === "tracker" && (
          <>
            <StatsBar jobs={jobs} onNavigate={setActiveSection} />

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company, role, tag…"
                  className="pl-8 h-9"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyStarred((v) => !v)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors shrink-0",
                  onlyStarred
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                <Star className={cn("size-3.5", onlyStarred ? "fill-green-500 text-green-500" : "")} />
                Starred
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setOnlyStarred(false); }}
                  className="flex h-9 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="size-3.5" />
                  Clear
                </button>
              )}
            </div>

            <JobSections
              jobs={filtered}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onUpdate={updateJob}
              onDelete={deleteJob}
              onEdit={openEditModal}
              onAdd={openAddModal}
            />
          </>
        )}
      </main>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <JobFormModal
        open={modalOpen}
        initialData={editTarget}
        defaultStatus={defaultStatus}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSave={editTarget ? saveEdit : addJob}
      />
    </div>
  );
}

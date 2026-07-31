import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Star,
  Briefcase,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StatsBar } from "@/components/StatsBar";
import { JobSections, type SectionKey } from "@/components/JobSections";
import { JobFormModal } from "@/components/JobFormModal";
import { DocumentsPage } from "@/components/DocumentsPage";
import {
  type JobApplication,
  type AppStatus,
  mockJobs,
} from "@/data/mock-jobs";

type AppTab = "tracker" | "documents";

let nextId = mockJobs.length + 1;
function generateId() {
  return `job-${nextId++}`;
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
    // If unstarring while viewing the starred section, switch to that job's status
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

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-auto">
            <span className="flex size-8 items-center justify-center rounded-lg bg-thermal">
              <Briefcase className="size-4 text-white" />
            </span>
            <div>
              <span className="font-display text-base font-semibold tracking-tight leading-none">
                Job Application Tracker
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                your job search, organized
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
            <button
              type="button"
              onClick={() => setTab("tracker")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === "tracker"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Briefcase className="size-3.5" />
              Tracker
            </button>
            <button
              type="button"
              onClick={() => setTab("documents")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                tab === "documents"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="size-3.5" />
              Documents
            </button>
          </div>

          {/* Add job button */}
          {tab === "tracker" && (
            <Button
              onClick={() => openAddModal()}
              size="sm"
              className="bg-thermal text-white font-semibold hover:brightness-105 border-0"
            >
              <Plus className="size-4" />
              Add job
            </Button>
          )}
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6">

        {tab === "documents" ? (
          <DocumentsPage />
        ) : (
          <>
            {/* Stats */}
            <StatsBar jobs={jobs} onNavigate={setActiveSection} />

            {/* Search bar */}
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

              {/* Starred toggle */}
              <button
                type="button"
                onClick={() => setOnlyStarred((v) => !v)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors shrink-0",
                  onlyStarred
                    ? "bg-fuego-50 border-fuego-200 text-fuego-700"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                <Star className={cn("size-3.5", onlyStarred ? "fill-fuego-500 text-fuego-500" : "")} />
                Starred
              </button>

              {/* Clear */}
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

            {/* Sectioned job list */}
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

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type JobApplication,
  type AppStatus,
  type JobType,
  ALL_STATUSES,
  STATUS_CONFIG,
} from "@/data/mock-jobs";

type FormData = Omit<JobApplication, "id">;

function emptyForm(status: AppStatus = "wishlist"): FormData {
  return {
    company: "",
    role: "",
    location: "",
    remote: false,
    type: "full_time",
    status,
    appliedDate: new Date().toISOString().slice(0, 10),
    nextActionDate: "",
    nextActionNote: "",
    salary: "",
    url: "",
    notes: "",
    tags: [],
    starred: false,
  };
}

interface JobFormModalProps {
  open: boolean;
  /** Pass a job to edit, or null to add a new one */
  initialData: JobApplication | null;
  /** Pre-select this status when adding new (ignored when editing) */
  defaultStatus?: AppStatus;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function JobFormModal({
  open,
  initialData,
  defaultStatus = "wishlist",
  onClose,
  onSave,
}: JobFormModalProps) {
  const [form, setForm] = useState<FormData>(() => emptyForm(defaultStatus));
  const [tagInput, setTagInput] = useState("");

  const isEdit = initialData !== null;

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const { id: _id, ...rest } = initialData;
      setForm({
        ...rest,
        nextActionDate: rest.nextActionDate ?? "",
        nextActionNote: rest.nextActionNote ?? "",
        salary: rest.salary ?? "",
        url: rest.url ?? "",
        notes: rest.notes ?? "",
      });
    } else {
      setForm(emptyForm(defaultStatus));
    }
    setTagInput("");
  }, [initialData, open, defaultStatus]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    onSave(form);
  }

  const canSave = form.company.trim().length > 0 && form.role.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit application" : "Add application"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *">
              <Input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Stripe"
                required
                autoFocus
              />
            </Field>
            <Field label="Role *">
              <Input
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="Senior Frontend Engineer"
                required
              />
            </Field>
          </div>

          {/* Location + Job type */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </Field>
            <Field label="Job type">
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as JobType)}
                className={selectClass}
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </Field>
          </div>

          {/* Remote toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => set("remote", e.target.checked)}
              className="size-4 rounded border-input accent-fuego-500"
            />
            Remote / hybrid
          </label>

          {/* Status + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as AppStatus)}
                className={selectClass}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Salary range">
              <Input
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="$160k – $200k"
              />
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date added">
              <Input
                type="date"
                value={form.appliedDate}
                onChange={(e) => set("appliedDate", e.target.value)}
              />
            </Field>
            <Field label="Next action date">
              <Input
                type="date"
                value={form.nextActionDate}
                onChange={(e) => set("nextActionDate", e.target.value)}
              />
            </Field>
          </div>

          {/* Next action note */}
          <Field label="Next action note">
            <Input
              value={form.nextActionNote}
              onChange={(e) => set("nextActionNote", e.target.value)}
              placeholder="Technical interview — system design round"
            />
          </Field>

          {/* URL */}
          <Field label="Job posting URL">
            <Input
              type="url"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://company.com/jobs/..."
            />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Referral from Priya. Recruiter was very responsive..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none resize-none focus:ring-2 focus:ring-ring/50 focus:border-ring placeholder:text-muted-foreground"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g. react, fintech (press Enter)"
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border border-border bg-secondary",
                      "px-2 py-0.5 text-xs font-medium text-secondary-foreground",
                      "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                    )}
                    aria-label={`Remove tag ${tag}`}
                  >
                    {tag}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}
          </Field>

          {/* Star */}
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={form.starred}
              onChange={(e) => set("starred", e.target.checked)}
              className="size-4 rounded border-input accent-fuego-500"
            />
            Star this application (priority)
          </label>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {isEdit ? "Save changes" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

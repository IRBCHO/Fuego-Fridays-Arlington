import { useState } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wifi,
  Pencil,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type JobApplication,
  type AppStatus,
  STATUS_CONFIG,
  ALL_STATUSES,
} from "@/data/mock-jobs";
import { ContactsModal } from "@/components/ContactsModal";

interface JobCardProps {
  job: JobApplication;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
  onEdit: (job: JobApplication) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Deterministic hue from a name string */
function nameHue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** Tiny avatar circle showing initials */
function MiniAvatar({ name }: { name: string }) {
  const hue = nameHue(name);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-card"
      style={{ background: `hsl(${hue} 55% 48%)` }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

/** Statuses where the contact button is always visible (not just on hover) */
const ACTIVE_STATUSES: AppStatus[] = [
  "applied",
  "phone_screen",
  "interview",
  "offer",
];

export function JobCard({ job, onUpdate, onDelete, onEdit }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  const cfg = STATUS_CONFIG[job.status];
  const contacts = job.contacts ?? [];
  const isActive = ACTIVE_STATUSES.includes(job.status);

  const nextDays = job.nextActionDate ? daysUntil(job.nextActionDate) : null;
  const isUrgent = nextDays !== null && nextDays <= 2 && nextDays >= 0;
  const isPast = nextDays !== null && nextDays < 0;

  return (
    <>
      <div
        className={cn(
          "group flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
          job.starred && "border-fuego-200"
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm leading-snug truncate">
                {job.role}
              </span>
              {job.starred && (
                <Star className="size-3.5 fill-fuego-500 text-fuego-500 shrink-0" />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="size-3 shrink-0" />
              <span className="font-medium text-foreground">{job.company}</span>
            </div>
          </div>

          {/* Status selector */}
          <select
            value={job.status}
            onChange={(e) =>
              onUpdate(job.id, { status: e.target.value as AppStatus })
            }
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium appearance-none text-center",
              "focus:outline-none focus:ring-2 focus:ring-ring/50",
              cfg.color,
              cfg.bg,
              cfg.border
            )}
            aria-label="Change status"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* Location + remote + salary */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {job.location}
          </span>
          {job.remote && (
            <span className="flex items-center gap-1 text-green-600">
              <Wifi className="size-3" />
              Remote
            </span>
          )}
          {job.salary && (
            <span className="ml-auto font-medium text-foreground">
              {job.salary}
            </span>
          )}
        </div>

        {/* Next action */}
        {job.nextActionDate && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
              isPast
                ? "bg-red-50 text-red-700 border border-red-200"
                : isUrgent
                ? "bg-fuego-50 text-fuego-700 border border-fuego-200"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Calendar className="size-3 shrink-0" />
            <span className="font-medium">
              {isPast
                ? `Overdue ${Math.abs(nextDays!)}d`
                : nextDays === 0
                ? "Today"
                : nextDays === 1
                ? "Tomorrow"
                : formatDate(job.nextActionDate)}
            </span>
            {job.nextActionNote && (
              <span className="truncate opacity-80">
                — {job.nextActionNote}
              </span>
            )}
          </div>
        )}

        {/* ── Contacts strip ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {contacts.length > 0 ? (
            <>
              {/* Avatar stack */}
              <button
                type="button"
                onClick={() => setContactsOpen(true)}
                className="flex items-center"
                aria-label={`View ${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
              >
                <div className="flex -space-x-1.5">
                  {contacts.slice(0, 4).map((c) => (
                    <MiniAvatar key={c.id} name={c.name} />
                  ))}
                </div>
                {contacts.length > 4 && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                    +{contacts.length - 4}
                  </span>
                )}
              </button>

              {/* Names preview */}
              <button
                type="button"
                onClick={() => setContactsOpen(true)}
                className="min-w-0 flex-1 text-left text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {contacts
                  .slice(0, 2)
                  .map((c) => c.name)
                  .join(", ")}
                {contacts.length > 2 && ` +${contacts.length - 2} more`}
              </button>

              {/* Edit contacts */}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setContactsOpen(true)}
                aria-label="Manage contacts"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Users className="size-3.5" />
              </Button>
            </>
          ) : (
            /* No contacts yet — show a subtle "Add contact" prompt */
            <button
              type="button"
              onClick={() => setContactsOpen(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1 text-xs font-medium transition-colors w-full",
                isActive
                  ? "border-fuego-200 text-fuego-600 hover:bg-fuego-50 hover:border-fuego-300"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100"
              )}
              aria-label="Add contact"
            >
              <UserPlus className="size-3.5 shrink-0" />
              {isActive ? "Add contact to reach out" : "Add contact"}
            </button>
          )}
        </div>

        {/* Tags */}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-md text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Expanded notes */}
        {expanded && job.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
            {job.notes}
          </p>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-1 border-t border-border pt-2 -mb-1">
          <span className="text-[10px] text-muted-foreground mr-auto">
            Added {formatDate(job.appliedDate)}
          </span>

          {job.url && (
            <Button
              variant="ghost"
              size="icon-xs"
              asChild
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                aria-label="Open job posting"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onUpdate(job.id, { starred: !job.starred })}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={job.starred ? "Unstar" : "Star"}
          >
            <Star
              className={cn(
                "size-3.5",
                job.starred ? "fill-fuego-500 text-fuego-500" : ""
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(job)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(job.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>

          {job.notes && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Hide notes" : "Show notes"}
            >
              {expanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Contacts modal — rendered per-card to keep state isolated */}
      <ContactsModal
        open={contactsOpen}
        job={job}
        onClose={() => setContactsOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
}

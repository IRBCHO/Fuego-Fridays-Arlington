import { useState } from "react";
import {
  UserPlus,
  Linkedin,
  Mail,
  Phone,
  Trash2,
  Pencil,
  Check,
  ExternalLink,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Contact, type JobApplication } from "@/data/mock-jobs";

interface ContactsModalProps {
  open: boolean;
  job: JobApplication | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
}

const EMPTY_CONTACT: Omit<Contact, "id"> = {
  name: "",
  title: "",
  role: "",
  email: "",
  phone: "",
  linkedin: "",
  note: "",
};

const ROLE_OPTIONS = [
  "Recruiter",
  "Hiring Manager",
  "Engineering Manager",
  "Team Lead",
  "HR",
  "Referral",
  "Other",
];

const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
const inputClass =
  "h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring placeholder:text-muted-foreground";

let cId = Date.now();
function genContactId() {
  return `c-${cId++}`;
}

/** Initials from a full name */
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Hue derived from name for the avatar background */
function nameHue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function Avatar({ name }: { name: string }) {
  const hue = nameHue(name);
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ background: `hsl(${hue} 55% 48%)` }}
      aria-hidden
    >
      {initials(name) || <User className="size-4" />}
    </div>
  );
}

interface ContactFormProps {
  initial: Omit<Contact, "id">;
  onSave: (data: Omit<Contact, "id">) => void;
  onCancel: () => void;
}

function ContactForm({ initial, onSave, onCancel }: ContactFormProps) {
  const [form, setForm] = useState(initial);

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name *</label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Sarah Kim"
            autoFocus
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Senior Recruiter"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Role / relationship</label>
        <select
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="">Select…</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="sarah@company.com"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 415 555 0100"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>LinkedIn URL</label>
        <Input
          type="url"
          value={form.linkedin}
          onChange={(e) => set("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="h-8 text-sm"
        />
      </div>

      <div>
        <label className={labelClass}>Note</label>
        <Input
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="e.g. Will be on the system design panel"
          className="h-8 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!form.name.trim()}
          onClick={() => onSave(form)}
        >
          <Check className="size-3.5" />
          Save contact
        </Button>
      </div>
    </div>
  );
}

export function ContactsModal({
  open,
  job,
  onClose,
  onUpdate,
}: ContactsModalProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!job) return null;

  const contacts = job.contacts ?? [];

  function saveNew(data: Omit<Contact, "id">) {
    const updated = [...contacts, { id: genContactId(), ...data }];
    onUpdate(job!.id, { contacts: updated });
    setAdding(false);
  }

  function saveEdit(id: string, data: Omit<Contact, "id">) {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );
    onUpdate(job!.id, { contacts: updated });
    setEditingId(null);
  }

  function deleteContact(id: string) {
    onUpdate(job!.id, { contacts: contacts.filter((c) => c.id !== id) });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            Contacts —{" "}
            <span className="text-muted-foreground font-normal">
              {job.company}
            </span>
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          People to follow up with on LinkedIn, email, or phone.
        </p>

        {/* Contact list */}
        <div className="flex flex-col gap-3">
          {contacts.length === 0 && !adding && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
              <UserPlus className="size-7 opacity-30" />
              <div>
                <p className="text-sm font-medium">No contacts yet</p>
                <p className="text-xs mt-0.5">
                  Add a recruiter, hiring manager, or anyone you want to follow up with.
                </p>
              </div>
            </div>
          )}

          {contacts.map((c) =>
            editingId === c.id ? (
              <ContactForm
                key={c.id}
                initial={{ name: c.name, title: c.title ?? "", role: c.role ?? "", email: c.email ?? "", phone: c.phone ?? "", linkedin: c.linkedin ?? "", note: c.note ?? "" }}
                onSave={(data) => saveEdit(c.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <ContactRow
                key={c.id}
                contact={c}
                onEdit={() => setEditingId(c.id)}
                onDelete={() => deleteContact(c.id)}
              />
            )
          )}

          {adding && (
            <ContactForm
              initial={EMPTY_CONTACT}
              onSave={saveNew}
              onCancel={() => setAdding(false)}
            />
          )}
        </div>

        {/* Add button */}
        {!adding && editingId === null && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => setAdding(true)}
          >
            <UserPlus className="size-3.5" />
            Add contact
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── ContactRow ───────────────────────────────────────────────────────────────

function ContactRow({
  contact: c,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <Avatar name={c.name} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{c.name}</span>
          {c.role && (
            <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {c.role}
            </span>
          )}
        </div>
        {c.title && (
          <p className="text-xs text-muted-foreground mt-0.5">{c.title}</p>
        )}

        {/* Reach-out links */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {c.linkedin && (
            <a
              href={c.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-md bg-[#0077b5]/10 border border-[#0077b5]/20 px-2 py-0.5 text-[11px] font-medium text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors"
            >
              <Linkedin className="size-3" />
              LinkedIn
              <ExternalLink className="size-2.5 opacity-60" />
            </a>
          )}
          {c.email && (
            <a
              href={`mailto:${c.email}`}
              className="flex items-center gap-1 rounded-md bg-secondary border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Mail className="size-3" />
              {c.email}
            </a>
          )}
          {c.phone && (
            <a
              href={`tel:${c.phone}`}
              className="flex items-center gap-1 rounded-md bg-secondary border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Phone className="size-3" />
              {c.phone}
            </a>
          )}
        </div>

        {c.note && (
          <p className="mt-1.5 text-[11px] text-muted-foreground italic">
            "{c.note}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-xs" onClick={onEdit} aria-label="Edit contact">
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
          aria-label="Delete contact"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

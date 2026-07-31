import { useState } from "react";
import {
  Download,
  Trash2,
  FileText,
  FileType,
  File,
  Pencil,
  Check,
  Sparkles,
  Link2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type StoredDocument,
  type DocKind,
  DOC_KIND_CONFIG,
  formatFileSize,
  mimeToIcon,
} from "@/data/mock-documents-store";

interface DocumentCardProps {
  doc: StoredDocument;
  onDownload: (doc: StoredDocument) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<StoredDocument, "kind" | "note" | "name" | "dataUrl">>
  ) => void;
  onTailor: (doc: StoredDocument) => void;
  onView: (doc: StoredDocument) => void;
}

function FileIcon({ mime }: { mime: string }) {
  const kind = mimeToIcon(mime);
  const cls = "size-8";
  if (kind === "pdf") return <FileType className={cn(cls, "text-red-500")} />;
  if (kind === "word") return <FileText className={cn(cls, "text-blue-500")} />;
  return <File className={cn(cls, "text-muted-foreground")} />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentCard({
  doc,
  onDownload,
  onDelete,
  onUpdate,
  onTailor,
  onView,
}: DocumentCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(doc.name);
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState(doc.note ?? "");

  const cfg = DOC_KIND_CONFIG[doc.kind];

  function commitName() {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== doc.name) onUpdate(doc.id, { name: trimmed });
    else setNameVal(doc.name);
    setEditingName(false);
  }

  function commitNote() {
    onUpdate(doc.id, { note: noteVal.trim() || undefined });
    setEditingNote(false);
  }

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Top row: icon + name + kind badge */}
      <div className="flex items-start gap-3">
        {/* Clickable icon → opens viewer */}
        <button
          type="button"
          onClick={() => onView(doc)}
          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary hover:bg-accent transition-colors"
          aria-label={`View ${doc.name}`}
        >
          <FileIcon mime={doc.mimeType} />
        </button>

        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setNameVal(doc.name);
                    setEditingName(false);
                  }
                }}
                className="flex-1 rounded border border-input bg-transparent px-2 py-0.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              />
              <Button variant="ghost" size="icon-xs" onClick={commitName} aria-label="Save name">
                <Check className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="group/name flex items-center gap-1 text-left w-full"
              onClick={() => onView(doc)}
              aria-label={`Open ${doc.name}`}
            >
              <span className="truncate text-sm font-semibold leading-snug hover:underline underline-offset-2">
                {doc.name}
              </span>
            </button>
          )}

          {/* Kind selector + meta */}
          <div className="mt-1 flex items-center gap-2">
            <select
              value={doc.kind}
              onChange={(e) =>
                onUpdate(doc.id, { kind: e.target.value as DocKind })
              }
              className={cn(
                "cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold appearance-none",
                "focus:outline-none focus:ring-2 focus:ring-ring/50",
                cfg.color,
                cfg.bg,
                cfg.border
              )}
              aria-label="Document type"
            >
              <option value="resume">Resume</option>
              <option value="cover_letter">Cover Letter</option>
              <option value="other">Other</option>
            </select>
            <span className="text-[10px] text-muted-foreground">
              {formatFileSize(doc.size)} · {formatDate(doc.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      {editingNote ? (
        <div className="flex flex-col gap-1">
          <textarea
            autoFocus
            value={noteVal}
            onChange={(e) => setNoteVal(e.target.value)}
            onBlur={commitNote}
            rows={2}
            placeholder="Add a note…"
            className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
          />
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="xs" onClick={() => { setNoteVal(doc.note ?? ""); setEditingNote(false); }}>
              Cancel
            </Button>
            <Button size="xs" onClick={commitNote}>Save</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditingNote(true)}
          className="text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit note"
        >
          {doc.note ? (
            <span className="flex items-center gap-1">
              <Link2 className="size-3 shrink-0" />
              {doc.note}
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-60 transition-opacity">
              + add note
            </span>
          )}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-border pt-2 -mb-1">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onTailor(doc)}
          className="gap-1 text-fuego-600 border-fuego-200 hover:bg-fuego-50 hover:text-fuego-700"
          aria-label="AI tailor resume"
        >
          <Sparkles className="size-3.5" />
          AI Tailor
        </Button>

        <div className="flex items-center gap-0.5 ml-auto">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onView(doc)}
            aria-label="View / Edit"
            title="View / Edit"
          >
            <Eye className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setNameVal(doc.name);
              setEditingName(true);
            }}
            aria-label="Rename"
            title="Rename"
          >
            <Pencil className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDownload(doc)}
            aria-label="Download"
            title="Download"
          >
            <Download className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(doc.id)}
            className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

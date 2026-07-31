import { useState, useEffect } from "react";
import {
  Download,
  Pencil,
  Check,
  X,
  ExternalLink,
  FileText,
  FileType,
  File,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type StoredDocument,
  type DocKind,
  DOC_KIND_CONFIG,
  formatFileSize,
  mimeToIcon,
} from "@/data/mock-documents-store";

interface DocumentViewerModalProps {
  open: boolean;
  doc: StoredDocument | null;
  onClose: () => void;
  onDownload: (doc: StoredDocument) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<StoredDocument, "kind" | "note" | "name" | "dataUrl">>
  ) => void;
}

const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

export function DocumentViewerModal({
  open,
  doc,
  onClose,
  onDownload,
  onUpdate,
}: DocumentViewerModalProps) {
  const [editingMeta, setEditingMeta] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [kindVal, setKindVal] = useState<DocKind>("resume");
  const [noteVal, setNoteVal] = useState("");
  // For plain-text editing
  const [textContent, setTextContent] = useState<string | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState("");

  const isText = doc?.mimeType === "text/plain";
  const isPdf = doc?.mimeType === "application/pdf";
  const isWord =
    doc?.mimeType === "application/msword" ||
    doc?.mimeType?.includes("wordprocessingml");

  // Decode text content when doc changes
  useEffect(() => {
    if (!doc) return;
    setEditingMeta(false);
    setEditingText(false);
    setNameVal(doc.name);
    setKindVal(doc.kind);
    setNoteVal(doc.note ?? "");

    if (isText) {
      try {
        const base64 = doc.dataUrl.split(",")[1];
        setTextContent(atob(base64));
      } catch {
        setTextContent("[Could not decode file content]");
      }
    } else {
      setTextContent(null);
    }
  }, [doc, isText]);

  if (!doc) return null;

  const cfg = DOC_KIND_CONFIG[doc.kind];
  const iconKind = mimeToIcon(doc.mimeType);

  function saveMeta() {
    const trimmed = nameVal.trim();
    if (!trimmed) return;
    onUpdate(doc!.id, {
      name: trimmed,
      kind: kindVal,
      note: noteVal.trim() || undefined,
    });
    setEditingMeta(false);
  }

  function saveText() {
    // Re-encode edited text back to base64 data URL
    const encoded = btoa(unescape(encodeURIComponent(editedText)));
    const newDataUrl = `data:text/plain;base64,${encoded}`;
    onUpdate(doc!.id, { dataUrl: newDataUrl });
    setTextContent(editedText);
    setEditingText(false);
  }

  function startEditText() {
    setEditedText(textContent ?? "");
    setEditingText(true);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92dvh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* ── Header bar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
          {/* File icon */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
            {iconKind === "pdf" && <FileType className="size-4 text-red-500" />}
            {iconKind === "word" && <FileText className="size-4 text-blue-500" />}
            {iconKind === "text" && <File className="size-4 text-muted-foreground" />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{doc.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "rounded-full border px-2 py-0 text-[10px] font-semibold",
                  cfg.color, cfg.bg, cfg.border
                )}
              >
                {cfg.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {doc.note && (
                <span className="text-[10px] text-muted-foreground italic truncate max-w-48">
                  {doc.note}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {isText && !editingText && (
              <Button variant="outline" size="xs" onClick={startEditText} className="gap-1">
                <Pencil className="size-3" />
                Edit text
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setEditingMeta((v) => !v)}
              aria-label="Edit metadata"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDownload(doc)}
              aria-label="Download"
            >
              <Download className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* ── Metadata editor (collapsible) ──────────────────────────── */}
        {editingMeta && (
          <div className="border-b border-border bg-secondary/40 px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>File name</label>
                <Input
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={kindVal}
                  onChange={(e) => setKindVal(e.target.value as DocKind)}
                  className="h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="resume">Resume</option>
                  <option value="cover_letter">Cover Letter</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Note</label>
                <Input
                  value={noteVal}
                  onChange={(e) => setNoteVal(e.target.value)}
                  placeholder="Optional note…"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="xs" onClick={() => setEditingMeta(false)}>
                Cancel
              </Button>
              <Button size="xs" onClick={saveMeta} disabled={!nameVal.trim()}>
                <Check className="size-3" />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* ── Document body ───────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* PDF — iframe preview */}
          {isPdf && (
            <iframe
              src={doc.dataUrl}
              title={doc.name}
              className="size-full border-0"
              aria-label={`Preview of ${doc.name}`}
            />
          )}

          {/* Word — Google Docs Viewer fallback notice + open button */}
          {isWord && (
            <div className="flex flex-col items-center justify-center gap-4 p-10 text-center h-full">
              <FileText className="size-14 text-blue-400 opacity-60" />
              <div>
                <p className="font-semibold text-sm">Word document preview</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Word files can't be rendered in-browser directly. Download the
                  file to open it in Word, or use the button below to preview it
                  via Google Docs Viewer.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onDownload(doc)} className="gap-1.5">
                  <Download className="size-3.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    // Google Docs Viewer requires a public URL; we can't pass a
                    // data URL to it, so we prompt the user to download instead.
                    alert(
                      "Google Docs Viewer requires a public URL. Please download the file and open it locally."
                    );
                  }}
                >
                  <ExternalLink className="size-3.5" />
                  Open externally
                </Button>
              </div>
            </div>
          )}

          {/* Plain text — view or edit */}
          {isText && (
            <div className="flex h-full flex-col">
              {editingText ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="flex-1 min-h-0 resize-none border-0 bg-background px-6 py-5 font-mono text-sm leading-relaxed outline-none"
                    spellCheck
                    aria-label="Edit document text"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary/40 px-5 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      {editedText.length.toLocaleString()} chars ·{" "}
                      {editedText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setEditingText(false)}
                      >
                        Discard
                      </Button>
                      <Button size="xs" onClick={saveText} className="gap-1">
                        <Check className="size-3" />
                        Save changes
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <pre className="flex-1 min-h-0 overflow-y-auto px-6 py-5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground bg-background">
                    {textContent}
                  </pre>
                  <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-5 py-2">
                    <span className="text-xs text-muted-foreground">
                      {(textContent ?? "").length.toLocaleString()} chars ·{" "}
                      {(textContent ?? "").split(/\s+/).filter(Boolean).length.toLocaleString()} words
                    </span>
                    <Button variant="outline" size="xs" onClick={startEditText} className="gap-1">
                      <Pencil className="size-3" />
                      Edit
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Unknown type */}
          {!isPdf && !isWord && !isText && (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center h-full text-muted-foreground">
              <AlertCircle className="size-10 opacity-30" />
              <p className="text-sm">This file type can't be previewed.</p>
              <Button size="sm" onClick={() => onDownload(doc)} className="gap-1.5">
                <Download className="size-3.5" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

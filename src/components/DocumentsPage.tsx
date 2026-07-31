import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  X,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentCard } from "@/components/DocumentCard";
import { AITailorModal } from "@/components/AITailorModal";
import { DocumentViewerModal } from "@/components/DocumentViewerModal";
import { useDocuments } from "@/hooks/useDocuments";
import {
  type StoredDocument,
  type DocKind,
  DOC_KIND_CONFIG,
  ACCEPTED_EXTENSIONS,
} from "@/data/mock-documents-store";

const KIND_FILTERS: Array<{ value: DocKind | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "resume", label: "Resumes" },
  { value: "cover_letter", label: "Cover Letters" },
  { value: "other", label: "Other" },
];

export function DocumentsPage() {
  const { docs, uploadErrors, uploadFiles, deleteDoc, updateDoc, downloadDoc, clearErrors } =
    useDocuments();

  const [dragOver, setDragOver] = useState(false);
  const [filterKind, setFilterKind] = useState<DocKind | "all">("all");
  const [tailorDoc, setTailorDoc] = useState<StoredDocument | null>(null);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<StoredDocument | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files);
        // reset so the same file can be re-uploaded after delete
        e.target.value = "";
      }
    },
    [uploadFiles]
  );

  function openTailor(doc: StoredDocument) {
    setTailorDoc(doc);
    setTailorOpen(true);
  }

  function openViewer(doc: StoredDocument) {
    setViewerDoc(doc);
    setViewerOpen(true);
  }

  const filtered =
    filterKind === "all" ? docs : docs.filter((d) => d.kind === filterKind);

  const resumeCount = docs.filter((d) => d.kind === "resume").length;
  const coverCount = docs.filter((d) => d.kind === "cover_letter").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Upload errors */}
      {uploadErrors.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertCircle className="size-4" />
              {uploadErrors.length} file{uploadErrors.length > 1 ? "s" : ""} couldn't be uploaded
            </div>
            <Button variant="ghost" size="icon-xs" onClick={clearErrors} aria-label="Dismiss errors">
              <X className="size-3.5" />
            </Button>
          </div>
          <ul className="ml-6 list-disc text-xs text-destructive/80 space-y-0.5">
            {uploadErrors.map((err, i) => (
              <li key={i}>
                <span className="font-medium">{err.fileName}</span> — {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload documents"
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-fuego-400 bg-fuego-50 text-fuego-700"
            : "border-border text-muted-foreground hover:border-fuego-300 hover:bg-fuego-50/40 hover:text-fuego-600"
        )}
      >
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl transition-colors",
            dragOver ? "bg-fuego-100" : "bg-secondary"
          )}
        >
          <Upload className="size-6" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {dragOver ? "Drop to upload" : "Drag & drop files here"}
          </p>
          <p className="mt-1 text-xs">
            or click to browse · PDF, DOC, DOCX, TXT · max 10 MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Summary + filter row */}
      {docs.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 mr-auto">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="size-3.5" />
              <span className="font-medium text-foreground">{resumeCount}</span> resume{resumeCount !== 1 ? "s" : ""}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{coverCount}</span> cover letter{coverCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Kind filter pills */}
          <div className="flex items-center gap-1.5">
            {KIND_FILTERS.map(({ value, label }) => {
              const active = filterKind === value;
              const cfg = value !== "all" ? DOC_KIND_CONFIG[value] : null;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilterKind(value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active && cfg
                      ? cn(cfg.color, cfg.bg, cfg.border)
                      : active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Document grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDownload={downloadDoc}
              onDelete={deleteDoc}
              onUpdate={updateDoc}
              onTailor={openTailor}
              onView={openViewer}
            />
          ))}
        </div>
      ) : docs.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <FolderOpen className="size-12 opacity-20" />
          <div>
            <p className="text-sm font-medium">No documents yet</p>
            <p className="mt-1 text-xs">
              Upload your resume or cover letter above to get started.
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-fuego-200 bg-fuego-50 px-4 py-3 text-xs text-fuego-700">
            <Sparkles className="size-4 shrink-0" />
            <span>
              Once uploaded, use <strong>AI Tailor</strong> to match your resume to any job description.
            </span>
          </div>
        </div>
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No {filterKind.replace("_", " ")}s found.
        </div>
      )}

      {/* AI tailor modal */}
      <AITailorModal
        open={tailorOpen}
        doc={tailorDoc}
        onClose={() => {
          setTailorOpen(false);
          setTailorDoc(null);
        }}
      />

      {/* Document viewer / editor modal */}
      <DocumentViewerModal
        open={viewerOpen}
        doc={viewerDoc}
        onClose={() => {
          setViewerOpen(false);
          setViewerDoc(null);
        }}
        onDownload={downloadDoc}
        onUpdate={(id, updates) => {
          updateDoc(id, updates);
          // keep viewerDoc in sync so the viewer reflects saved changes live
          setViewerDoc((prev) => prev ? { ...prev, ...updates } : prev);
        }}
      />
    </div>
  );
}

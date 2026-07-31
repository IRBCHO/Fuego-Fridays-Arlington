/**
 * Document store types for resume & cover letter management.
 * Files are stored as base64 in localStorage so they survive page refreshes
 * without a backend.
 */

export type DocKind = "resume" | "cover_letter" | "other";

export interface StoredDocument {
  id: string;
  name: string;
  kind: DocKind;
  /** MIME type e.g. application/pdf */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** ISO date when uploaded */
  uploadedAt: string;
  /** base64-encoded file content (data URI) */
  dataUrl: string;
  /** Optional note / label */
  note?: string;
  /** Which job application this is linked to (optional) */
  linkedJobId?: string;
}

export const DOC_KIND_CONFIG: Record<
  DocKind,
  { label: string; color: string; bg: string; border: string }
> = {
  resume: {
    label: "Resume",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  cover_letter: {
    label: "Cover Letter",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  other: {
    label: "Other",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
};

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.txt";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mimeToIcon(mimeType: string): "pdf" | "word" | "text" {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "word";
  return "text";
}

const STORAGE_KEY = "job-tracker-documents";

export function loadDocuments(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredDocument[];
  } catch {
    return [];
  }
}

export function saveDocuments(docs: StoredDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

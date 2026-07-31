import { useState, useCallback } from "react";
import {
  type StoredDocument,
  type DocKind,
  loadDocuments,
  saveDocuments,
  ACCEPTED_MIME_TYPES,
} from "@/data/mock-documents-store";

let nextId = Date.now();
function genId() {
  return `doc-${nextId++}`;
}

/** Max file size: 10 MB */
const MAX_BYTES = 10 * 1024 * 1024;

export interface UploadError {
  fileName: string;
  reason: string;
}

export function useDocuments() {
  const [docs, setDocs] = useState<StoredDocument[]>(() => loadDocuments());
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);

  const persist = useCallback((next: StoredDocument[]) => {
    setDocs(next);
    saveDocuments(next);
  }, []);

  /** Read a File as a base64 data URL */
  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  const uploadFiles = useCallback(
    async (files: FileList | File[], defaultKind: DocKind = "resume") => {
      const errors: UploadError[] = [];
      const newDocs: StoredDocument[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
          errors.push({
            fileName: file.name,
            reason: "Unsupported file type. Use PDF, DOC, DOCX, or TXT.",
          });
          continue;
        }
        if (file.size > MAX_BYTES) {
          errors.push({
            fileName: file.name,
            reason: "File exceeds 10 MB limit.",
          });
          continue;
        }

        try {
          const dataUrl = await readAsDataUrl(file);
          newDocs.push({
            id: genId(),
            name: file.name,
            kind: defaultKind,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            dataUrl,
          });
        } catch {
          errors.push({ fileName: file.name, reason: "Could not read file." });
        }
      }

      if (newDocs.length > 0) {
        persist([...newDocs, ...docs]);
      }
      setUploadErrors(errors);
    },
    [docs, persist]
  );

  const deleteDoc = useCallback(
    (id: string) => {
      persist(docs.filter((d) => d.id !== id));
    },
    [docs, persist]
  );

  const updateDoc = useCallback(
    (id: string, updates: Partial<Pick<StoredDocument, "kind" | "note" | "linkedJobId" | "name" | "dataUrl">>) => {
      persist(docs.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    },
    [docs, persist]
  );

  /** Trigger a browser download of a stored document */
  const downloadDoc = useCallback((doc: StoredDocument) => {
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.name;
    a.click();
  }, []);

  const clearErrors = useCallback(() => setUploadErrors([]), []);

  return {
    docs,
    uploadErrors,
    uploadFiles,
    deleteDoc,
    updateDoc,
    downloadDoc,
    clearErrors,
  };
}

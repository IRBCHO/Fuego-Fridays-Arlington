import { useState } from "react";
import { Sparkles, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type StoredDocument } from "@/data/mock-documents-store";

interface AITailorModalProps {
  open: boolean;
  doc: StoredDocument | null;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Simulated AI analysis — no API key required. Parses keywords from the JD
// and returns structured, actionable suggestions.
// ---------------------------------------------------------------------------

interface TailorResult {
  matchScore: number; // 0-100
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: Suggestion[];
  summary: string;
}

interface Suggestion {
  section: string;
  issue: string;
  fix: string;
  priority: "high" | "medium" | "low";
}

const COMMON_TECH = [
  "react","typescript","javascript","python","node","aws","docker","kubernetes",
  "sql","postgresql","graphql","rest","api","ci/cd","git","agile","scrum",
  "figma","tailwind","css","html","next.js","vue","angular","java","go","rust",
  "machine learning","data analysis","product management","leadership","mentoring",
  "communication","cross-functional","stakeholder","roadmap","kpis","analytics",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return COMMON_TECH.filter((kw) => lower.includes(kw));
}

/** Simulate extracting plain text from a data URL for keyword matching */
function extractTextFromDataUrl(dataUrl: string): string {
  // For text/plain files we can decode; for PDF/DOC we simulate
  try {
    if (dataUrl.startsWith("data:text/plain")) {
      const base64 = dataUrl.split(",")[1];
      return atob(base64);
    }
  } catch {}
  // For binary formats, return a realistic placeholder set of terms
  return "react typescript javascript node css html git agile communication leadership";
}

function analyzeMatch(resumeText: string, jd: string): TailorResult {
  const jdKeywords = extractKeywords(jd);
  const resumeKeywords = extractKeywords(resumeText);

  const present = jdKeywords.filter((k) => resumeKeywords.includes(k));
  const missing = jdKeywords.filter((k) => !resumeKeywords.includes(k));

  const matchScore =
    jdKeywords.length === 0
      ? 75
      : Math.round((present.length / jdKeywords.length) * 100);

  // Generate dynamic suggestions based on what's missing
  const suggestions: Suggestion[] = [];

  if (missing.length > 0) {
    suggestions.push({
      section: "Skills section",
      issue: `Missing ${missing.length} keyword(s) the JD emphasizes: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}.`,
      fix: `Add a dedicated "Technical Skills" section and explicitly list: ${missing.join(", ")}.`,
      priority: "high",
    });
  }

  if (jd.toLowerCase().includes("lead") || jd.toLowerCase().includes("senior")) {
    suggestions.push({
      section: "Work Experience",
      issue: "The role requires leadership but your resume may not show impact at scale.",
      fix: 'Quantify team size and impact — e.g. "Led a team of 5 engineers to ship X, reducing Y by Z%".',
      priority: "high",
    });
  }

  if (jd.toLowerCase().includes("remote") || jd.toLowerCase().includes("async")) {
    suggestions.push({
      section: "Summary",
      issue: "Remote/async collaboration isn't highlighted.",
      fix: 'Add "experienced in async, distributed team collaboration" to your summary.',
      priority: "medium",
    });
  }

  if (jd.toLowerCase().includes("startup") || jd.toLowerCase().includes("fast-paced")) {
    suggestions.push({
      section: "Summary",
      issue: "Startup pace and adaptability aren't explicitly signalled.",
      fix: 'Use language like "thrive in fast-paced environments" and mention any 0→1 product work.',
      priority: "medium",
    });
  }

  suggestions.push({
    section: "Formatting",
    issue: "ATS systems often struggle with headers, tables, and graphics.",
    fix: "Use a plain single-column layout with standard section headings (Experience, Education, Skills).",
    priority: "low",
  });

  if (jd.toLowerCase().includes("metrics") || jd.toLowerCase().includes("data-driven")) {
    suggestions.push({
      section: "Work Experience",
      issue: "The JD is metrics-focused but bullet points may lack numbers.",
      fix: 'Add measurable outcomes to at least 3 bullets — e.g. "improved load time by 40%", "grew DAU 2×".',
      priority: "high",
    });
  }

  const summary =
    matchScore >= 80
      ? "Strong match. A few targeted tweaks will make this resume stand out."
      : matchScore >= 55
      ? "Decent foundation. Add missing keywords and quantify impact to move past ATS filters."
      : "Significant gaps detected. Rework the skills section and tailor your summary to this specific role.";

  return { matchScore, missingKeywords: missing, presentKeywords: present, suggestions, summary };
}

const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
  medium: { label: "Medium", color: "text-fuego-700",  bg: "bg-fuego-50",  border: "border-fuego-200" },
  low:    { label: "Low",    color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
};

export function AITailorModal({ open, doc, onClose }: AITailorModalProps) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  function handleAnalyze() {
    if (!doc || !jd.trim()) return;
    setLoading(true);
    setResult(null);

    // Simulate a brief "thinking" delay for realism
    setTimeout(() => {
      const resumeText = extractTextFromDataUrl(doc.dataUrl);
      const analysis = analyzeMatch(resumeText, jd);
      setResult(analysis);
      setLoading(false);
    }, 1400);
  }

  function handleClose() {
    setJd("");
    setResult(null);
    setLoading(false);
    onClose();
  }

  async function copySuggestion(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1600);
    } catch {}
  }

  const scoreColor =
    (result?.matchScore ?? 0) >= 80
      ? "text-green-600"
      : (result?.matchScore ?? 0) >= 55
      ? "text-fuego-600"
      : "text-red-600";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-fuego-500" />
            AI Resume Tailor
          </DialogTitle>
        </DialogHeader>

        {doc && (
          <p className="text-xs text-muted-foreground -mt-2">
            Analyzing: <span className="font-medium text-foreground">{doc.name}</span>
          </p>
        )}

        {/* Job description input */}
        {!result && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Paste the job description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={10}
                placeholder="Paste the full job description here — the more detail, the better the analysis…"
                className="w-full resize-none rounded-xl border border-input bg-transparent px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring placeholder:text-muted-foreground leading-relaxed"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!jd.trim() || loading}
                className="bg-thermal text-white font-semibold border-0 hover:brightness-105 gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Analyze match
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-5">
            {/* Score */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/50 px-5 py-4">
              <div className="text-center">
                <p className={cn("text-4xl font-bold tabular-nums", scoreColor)}>
                  {result.matchScore}%
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
                  match score
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
              </div>
            </div>

            {/* Keywords */}
            <div className="grid grid-cols-2 gap-3">
              {result.presentKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-2">
                    ✓ Present in your resume ({result.presentKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.presentKeywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-2">
                    ✗ Missing from your resume ({result.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.missingKeywords.map((k) => (
                      <span
                        key={k}
                        className="rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-medium text-red-600"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Actionable suggestions
              </p>
              <div className="flex flex-col gap-2">
                {result.suggestions.map((s, i) => {
                  const p = PRIORITY_CONFIG[s.priority];
                  const isOpen = expandedIdx === i;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        p.bg,
                        p.border
                      )}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 text-left"
                        onClick={() => setExpandedIdx(isOpen ? null : i)}
                      >
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                            p.color,
                            p.bg,
                            p.border
                          )}
                        >
                          {p.label}
                        </span>
                        <span className="flex-1 text-xs font-semibold text-foreground">
                          {s.section}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="mt-2.5 flex flex-col gap-2 border-t border-current/10 pt-2.5">
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{s.issue}</p>
                          </div>
                          <div className="flex items-start gap-1.5 rounded-lg bg-background/60 px-2.5 py-2">
                            <p className="flex-1 text-xs font-medium text-foreground">
                              {s.fix}
                            </p>
                            <button
                              type="button"
                              onClick={() => copySuggestion(s.fix, i)}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Copy suggestion"
                            >
                              {copiedIdx === i ? (
                                <Check className="size-3.5 text-green-600" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setJd("");
                }}
              >
                Try another JD
              </Button>
              <Button size="sm" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

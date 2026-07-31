/**
 * Job application tracker — types and mock data.
 */

export type AppStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type JobType = "full_time" | "part_time" | "contract" | "internship";

export interface Contact {
  id: string;
  name: string;
  title?: string;
  /** e.g. "Hiring Manager", "Recruiter", "Engineering Manager" */
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  note?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  type: JobType;
  status: AppStatus;
  /** ISO date when you applied or added to wishlist */
  appliedDate: string;
  /** ISO date of next action (interview, deadline, follow-up) */
  nextActionDate?: string;
  nextActionNote?: string;
  salary?: string;
  url?: string;
  notes?: string;
  tags: string[];
  /** Star / priority flag */
  starred: boolean;
  /** People to reach out to after applying */
  contacts?: Contact[];
}

export const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  wishlist:     { label: "Wishlist",      color: "text-muted-foreground", bg: "bg-muted",          border: "border-border" },
  applied:      { label: "Applied",       color: "text-blue-700",         bg: "bg-blue-50",        border: "border-blue-200" },
  phone_screen: { label: "Phone Screen",  color: "text-purple-700",       bg: "bg-purple-50",      border: "border-purple-200" },
  interview:    { label: "Interview",     color: "text-fuego-700",        bg: "bg-fuego-50",       border: "border-fuego-200" },
  offer:        { label: "Offer 🎉",      color: "text-green-700",        bg: "bg-green-50",       border: "border-green-200" },
  rejected:     { label: "Rejected",      color: "text-red-600",          bg: "bg-red-50",         border: "border-red-200" },
  withdrawn:    { label: "Withdrawn",     color: "text-muted-foreground", bg: "bg-muted",          border: "border-border" },
};

export const ALL_STATUSES: AppStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

/** Columns shown in the board view (excluding terminal states by default) */
export const BOARD_COLUMNS: AppStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
];

export const mockJobs: JobApplication[] = [
  {
    id: "job-1",
    company: "Stripe",
    role: "Senior Frontend Engineer",
    location: "San Francisco, CA",
    remote: true,
    type: "full_time",
    status: "interview",
    appliedDate: "2026-07-10",
    nextActionDate: "2026-08-04",
    nextActionNote: "Technical interview — system design round",
    salary: "$180k – $220k",
    url: "https://stripe.com/jobs",
    notes: "Referral from Priya. Recruiter was responsive.",
    tags: ["fintech", "react", "referral"],
    starred: true,
    contacts: [
      {
        id: "c-1a",
        name: "Sarah Kim",
        title: "Senior Recruiter",
        role: "Recruiter",
        email: "sarah.kim@stripe.com",
        linkedin: "https://linkedin.com/in/sarahkim",
      },
      {
        id: "c-1b",
        name: "James Okafor",
        title: "Engineering Manager",
        role: "Hiring Manager",
        linkedin: "https://linkedin.com/in/jamesokafor",
        note: "Will be on the system design panel",
      },
    ],
  },
  {
    id: "job-2",
    company: "Linear",
    role: "Product Engineer",
    location: "Remote",
    remote: true,
    type: "full_time",
    status: "applied",
    appliedDate: "2026-07-18",
    nextActionDate: "2026-08-01",
    nextActionNote: "Follow up if no response",
    salary: "$160k – $200k",
    url: "https://linear.app/jobs",
    notes: "Love the product. Applied via careers page.",
    tags: ["startup", "product", "typescript"],
    starred: true,
    contacts: [
      {
        id: "c-2a",
        name: "Tuomas Artman",
        title: "CTO",
        role: "Engineering Lead",
        linkedin: "https://linkedin.com/in/tuomasartman",
        note: "Reached out on LinkedIn after applying",
      },
    ],
  },
  {
    id: "job-3",
    company: "Vercel",
    role: "Developer Advocate",
    location: "New York, NY",
    remote: true,
    type: "full_time",
    status: "phone_screen",
    appliedDate: "2026-07-08",
    nextActionDate: "2026-08-02",
    nextActionNote: "30-min call with hiring manager",
    salary: "$140k – $170k",
    url: "https://vercel.com/careers",
    notes: "Reached out cold on LinkedIn — got a response within 48 hours.",
    tags: ["developer-relations", "nextjs"],
    starred: false,
    contacts: [
      {
        id: "c-3a",
        name: "Maya Chen",
        title: "Head of DevRel",
        role: "Hiring Manager",
        email: "maya@vercel.com",
        linkedin: "https://linkedin.com/in/mayachen",
        phone: "+1 415 555 0192",
      },
    ],
  },
  {
    id: "job-4",
    company: "Figma",
    role: "Software Engineer — Design Tools",
    location: "San Francisco, CA",
    remote: false,
    type: "full_time",
    status: "wishlist",
    appliedDate: "2026-07-25",
    salary: "$170k – $210k",
    url: "https://figma.com/careers",
    notes: "Haven't applied yet. Need to update portfolio first.",
    tags: ["design-tools", "canvas", "webgl"],
    starred: false,
  },
  {
    id: "job-5",
    company: "Notion",
    role: "Frontend Engineer — Editor",
    location: "San Francisco, CA",
    remote: true,
    type: "full_time",
    status: "rejected",
    appliedDate: "2026-06-28",
    notes: "Rejected after take-home. Ask for feedback.",
    tags: ["productivity", "react"],
    starred: false,
  },
  {
    id: "job-6",
    company: "Arc (Browser Company)",
    role: "React Native Engineer",
    location: "New York, NY",
    remote: true,
    type: "full_time",
    status: "applied",
    appliedDate: "2026-07-22",
    nextActionDate: "2026-08-05",
    nextActionNote: "Application under review",
    salary: "$150k – $190k",
    url: "https://thebrowser.company/careers",
    tags: ["mobile", "react-native", "startup"],
    starred: false,
  },
  {
    id: "job-7",
    company: "Shopify",
    role: "Staff Frontend Engineer",
    location: "Ottawa, Canada",
    remote: true,
    type: "full_time",
    status: "offer",
    appliedDate: "2026-06-15",
    nextActionDate: "2026-08-03",
    nextActionNote: "Offer expires — need to decide",
    salary: "$195k – $235k",
    url: "https://shopify.com/careers",
    notes: "Offer in hand. Comparing with Stripe.",
    tags: ["commerce", "typescript", "offer"],
    starred: true,
  },
  {
    id: "job-8",
    company: "Loom",
    role: "Frontend Engineer",
    location: "San Francisco, CA",
    remote: true,
    type: "full_time",
    status: "wishlist",
    appliedDate: "2026-07-28",
    tags: ["video", "startup"],
    starred: false,
  },
];

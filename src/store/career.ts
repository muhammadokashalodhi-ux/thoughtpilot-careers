import { create } from 'zustand';

export type Stage = 1 | 2 | 3 | 4 | 5;

export type ChangeStatus = 'pending' | 'approved' | 'discarded';
export type ChangeType = 'weak_verb' | 'ats' | 'quantification' | 'grammar' | 'improvement';
export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface Dimension {
  id: string;
  name: string;
  score: number;
  status: 'good' | 'needs_work' | 'poor';
  issues: string[];
  tip: string;
}

export interface CVChange {
  id: string;
  section: string;
  type: ChangeType;
  original: string;
  suggested: string;
  reason: string;
  recruiter_insight: string;
  status: ChangeStatus;
  editedText?: string;
}

export interface ATSResult {
  overall_score: number;
  grade: string;
  summary: string;
  dimensions: Dimension[];
  changes: CVChange[];
  missing_keywords: string[];
  strengths: string[];
}

export interface JobSuggestion {
  id: string;
  section: string;
  suggestion: string;
  reason: string;
  priority: SuggestionPriority;
  status: ChangeStatus;
}

export interface JobMatchResult {
  match_score: number;
  gap_summary: string;
  missing_keywords: string[];
  suggestions: JobSuggestion[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
}

export interface HandoffData {
  user: UserProfile;
  profile: {
    role: string;
    headline: string;
    location: string;
    years_experience: number;
    sectors: string[];
    companies: string[];
    countries: string[];
    achievements: string[];
    credentials: string[];
  };
  cv_prefill: string;
}

export type ExportTemplate = 'classic' | 'modern' | 'minimal' | 'executive' | 'compact';

interface CareerStore {
  // Auth
  handoff: HandoffData | null;
  authLoading: boolean;
  setHandoff: (h: HandoffData | null) => void;
  setAuthLoading: (v: boolean) => void;

  // Stage
  stage: Stage;
  setStage: (s: Stage) => void;

  // CV Input
  cvText: string;
  setCvText: (t: string) => void;
  cvFileName: string;
  setCvFileName: (n: string) => void;

  // ATS Analysis
  atsResult: ATSResult | null;
  setAtsResult: (r: ATSResult | null) => void;
  analysisLoading: boolean;
  setAnalysisLoading: (v: boolean) => void;
  analysisError: string;
  setAnalysisError: (e: string) => void;

  // Changes
  changes: CVChange[];
  setChanges: (c: CVChange[]) => void;
  approveChange: (id: string) => void;
  discardChange: (id: string) => void;
  editChange: (id: string, text: string) => void;
  approveAll: () => void;

  // Job Match
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  jobMatchResult: JobMatchResult | null;
  setJobMatchResult: (r: JobMatchResult | null) => void;
  jobMatchLoading: boolean;
  setJobMatchLoading: (v: boolean) => void;
  jobSuggestions: JobSuggestion[];
  setJobSuggestions: (s: JobSuggestion[]) => void;
  approveJobSuggestion: (id: string) => void;
  discardJobSuggestion: (id: string) => void;
  coverLetter: string;
  setCoverLetter: (cl: string) => void;
  coverLetterLoading: boolean;
  setCoverLetterLoading: (v: boolean) => void;

  // Export
  selectedTemplate: ExportTemplate;
  setSelectedTemplate: (t: ExportTemplate) => void;
  exportLoading: boolean;
  setExportLoading: (v: boolean) => void;

  // Computed helpers
  getApprovedChanges: () => CVChange[];
  getFinalCvText: () => string;
}

export const useCareerStore = create<CareerStore>((set, get) => ({
  handoff: null,
  authLoading: true,
  setHandoff: (h) => set({ handoff: h }),
  setAuthLoading: (v) => set({ authLoading: v }),

  stage: 1,
  setStage: (s) => set({ stage: s }),

  cvText: '',
  setCvText: (t) => set({ cvText: t }),
  cvFileName: '',
  setCvFileName: (n) => set({ cvFileName: n }),

  atsResult: null,
  setAtsResult: (r) => set({ atsResult: r }),
  analysisLoading: false,
  setAnalysisLoading: (v) => set({ analysisLoading: v }),
  analysisError: '',
  setAnalysisError: (e) => set({ analysisError: e }),

  changes: [],
  setChanges: (c) => set({ changes: c }),
  approveChange: (id) =>
    set((s) => ({ changes: s.changes.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)) })),
  discardChange: (id) =>
    set((s) => ({ changes: s.changes.map((c) => (c.id === id ? { ...c, status: 'discarded' } : c)) })),
  editChange: (id, text) =>
    set((s) => ({
      changes: s.changes.map((c) =>
        c.id === id ? { ...c, editedText: text, status: 'approved' } : c,
      ),
    })),
  approveAll: () =>
    set((s) => ({ changes: s.changes.map((c) => (c.status === 'pending' ? { ...c, status: 'approved' } : c)) })),

  jobDescription: '',
  setJobDescription: (jd) => set({ jobDescription: jd }),
  jobMatchResult: null,
  setJobMatchResult: (r) => {
    set({ jobMatchResult: r, jobSuggestions: r ? r.suggestions.map((s) => ({ ...s, status: 'pending' as ChangeStatus })) : [] });
  },
  jobMatchLoading: false,
  setJobMatchLoading: (v) => set({ jobMatchLoading: v }),
  jobSuggestions: [],
  setJobSuggestions: (s) => set({ jobSuggestions: s }),
  approveJobSuggestion: (id) =>
    set((s) => ({ jobSuggestions: s.jobSuggestions.map((j) => (j.id === id ? { ...j, status: 'approved' } : j)) })),
  discardJobSuggestion: (id) =>
    set((s) => ({ jobSuggestions: s.jobSuggestions.map((j) => (j.id === id ? { ...j, status: 'discarded' } : j)) })),
  coverLetter: '',
  setCoverLetter: (cl) => set({ coverLetter: cl }),
  coverLetterLoading: false,
  setCoverLetterLoading: (v) => set({ coverLetterLoading: v }),

  selectedTemplate: 'classic',
  setSelectedTemplate: (t) => set({ selectedTemplate: t }),
  exportLoading: false,
  setExportLoading: (v) => set({ exportLoading: v }),

  getApprovedChanges: () => get().changes.filter((c) => c.status === 'approved'),
  getFinalCvText: () => {
    const { cvText, changes } = get();
    let final = cvText;
    changes
      .filter((c) => c.status === 'approved')
      .forEach((c) => {
        const replacement = c.editedText || c.suggested;
        final = final.replace(c.original, replacement);
      });
    return final;
  },
}));

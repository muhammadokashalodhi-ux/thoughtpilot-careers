import { create } from 'zustand';

export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ChangeStatus = 'pending' | 'approved' | 'discarded';
export type ChangeType =
  | 'weak_verb' | 'ats' | 'quantification' | 'grammar' | 'improvement'
  | 'authenticity' | 'recruiter_trust' | 'interview_risk'
  | 'leadership' | 'credibility' | 'narrative' | 'executive_presence' | 'humanization';

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

export interface HiringConfidence {
  score: number;
  verdict: string;
  recruiter_first_impression: string;
  top_strengths: string[];
  top_concerns: string[];
}

export interface RecruiterReaction {
  first_impression: string;
  trust_level: 'high' | 'medium' | 'low';
  possible_concerns: string[];
  why_it_matters: string;
  recruiter_read_time_estimate: string;
  executive_presence_score: number;
}

export interface CredibilityAnalysis {
  score: number;
  strong_signals: string[];
  weak_signals: string[];
  suspicious_claims: string[];
  unsupported_skills: string[];
  metric_quality: string;
  overall_assessment: string;
}

export interface LeadershipSignals {
  score: number;
  signals_found: string[];
  missing_signals: string[];
  seniority_alignment: string;
  people_management_strength: string;
  strategic_ownership_strength: string;
  improvement_suggestions: string[];
}

export interface CareerStory {
  clarity_score: number;
  career_direction: string;
  positioning_strength: string;
  brand_consistency: string;
  narrative_gaps: string[];
  career_arc_summary: string;
}

export interface PeerBenchmark {
  market_position: string;
  years_experience_detected: number;
  competitive_strengths: string[];
  missing_common_skills: string[];
  uniqueness_score: number;
  industry_comparison: string;
}

export interface SkillValidation {
  verified_skills: string[];
  weak_evidence_skills: string[];
  hidden_skills_detected: string[];
  unsupported_skills: string[];
  skills_missing_evidence: string[];
}

export interface VocabWord {
  word: string;
  count: number;
  alternatives: string[];
}

export interface VocabularyAnalysis {
  repeated_words: VocabWord[];
  weak_phrases: string[];
  buzzwords: string[];
  variety_score: number;
}

export interface BulletQuality {
  too_short: string[];
  too_long: string[];
  passive_voice: string[];
  weak_openings: string[];
  generic_bullets: string[];
  recommended_structure: string;
}

export interface ProfessionalismChecks {
  file_name_score: number;
  date_consistency: string;
  link_quality: string;
  email_professionalism: string;
  formatting_consistency: string;
  presentation_quality: string;
}

export interface HumanAuthenticity {
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  ai_like_patterns: string[];
  recruiter_suspicion_triggers: string[];
  humanization_suggestions: Array<{ replace: string; with: string; reason: string }>;
  authenticity_summary: string;
}

export interface InterviewRisk {
  risk_type: string;
  severity: 'high' | 'medium' | 'low';
  detected_issue: string;
  why_recruiters_ask: string;
  suggested_fix: string;
  sample_interview_question: string;
}

export interface InterviewDefensibility {
  high_risk_claims: Array<{
    claim: string;
    risk_reason: string;
    prep_advice: string;
    difficulty_level: 'low' | 'medium' | 'high';
  }>;
}

export interface ATSParseAnalysis {
  parse_rate: number;
  readability_score: number;
  issues: string[];
  problematic_sections: string[];
  format_risks: string[];
  recommendations: string[];
}

export interface IntelligenceResult {
  overall_score: number;
  grade: string;
  summary: string;
  hiring_confidence: HiringConfidence;
  dimensions: Dimension[];
  changes: CVChange[];
  ats_parse_analysis: ATSParseAnalysis;
  recruiter_reaction: RecruiterReaction;
  credibility_analysis: CredibilityAnalysis;
  leadership_signals: LeadershipSignals;
  career_story: CareerStory;
  peer_benchmark: PeerBenchmark;
  skill_validation: SkillValidation;
  vocabulary_analysis: VocabularyAnalysis;
  bullet_quality: BulletQuality;
  professionalism_checks: ProfessionalismChecks;
  human_authenticity: HumanAuthenticity;
  interview_risks: InterviewRisk[];
  interview_defensibility: InterviewDefensibility;
  hidden_recruiter_concerns: string[];
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

export type ExportTemplate = 'classic' | 'modern' | 'minimal' | 'executive' | 'compact' | 'classic-navy' | 'modern-teal' | 'minimal-dark' | 'executive-red' | 'tech-sidebar';

interface CareerStore {
  handoff: HandoffData | null;
  authLoading: boolean;
  setHandoff: (h: HandoffData | null) => void;
  setAuthLoading: (v: boolean) => void;

  stage: Stage;
  setStage: (s: Stage) => void;

  cvText: string;
  setCvText: (t: string) => void;
  cvFileName: string;
  setCvFileName: (n: string) => void;

  intelligenceResult: IntelligenceResult | null;
  setIntelligenceResult: (r: IntelligenceResult | null) => void;
  analysisLoading: boolean;
  setAnalysisLoading: (v: boolean) => void;
  analysisError: string;
  setAnalysisError: (e: string) => void;

  changes: CVChange[];
  setChanges: (c: CVChange[]) => void;
  approveChange: (id: string) => void;
  discardChange: (id: string) => void;
  editChange: (id: string, text: string) => void;
  approveAll: () => void;

  jobDescription: string;
  setJobDescription: (jd: string) => void;
  jobMatchResult: JobMatchResult | null;
  setJobMatchResult: (r: JobMatchResult | null) => void;
  jobMatchLoading: boolean;
  setJobMatchLoading: (v: boolean) => void;
  jobSuggestions: JobSuggestion[];
  approveJobSuggestion: (id: string) => void;
  discardJobSuggestion: (id: string) => void;
  coverLetter: string;
  setCoverLetter: (cl: string) => void;
  coverLetterLoading: boolean;
  setCoverLetterLoading: (v: boolean) => void;

  selectedTemplate: ExportTemplate;
  setSelectedTemplate: (t: ExportTemplate) => void;

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

  intelligenceResult: null,
  setIntelligenceResult: (r) => set({ intelligenceResult: r }),
  analysisLoading: false,
  setAnalysisLoading: (v) => set({ analysisLoading: v }),
  analysisError: '',
  setAnalysisError: (e) => set({ analysisError: e }),

  changes: [],
  setChanges: (c) => set({ changes: c }),
  approveChange: (id) =>
    set((s) => ({ changes: s.changes.map((c) => c.id === id ? { ...c, status: 'approved' } : c) })),
  discardChange: (id) =>
    set((s) => ({ changes: s.changes.map((c) => c.id === id ? { ...c, status: 'discarded' } : c) })),
  editChange: (id, text) =>
    set((s) => ({ changes: s.changes.map((c) => c.id === id ? { ...c, editedText: text, status: 'approved' } : c) })),
  approveAll: () =>
    set((s) => ({ changes: s.changes.map((c) => c.status === 'pending' ? { ...c, status: 'approved' } : c) })),

  jobDescription: '',
  setJobDescription: (jd) => set({ jobDescription: jd }),
  jobMatchResult: null,
  setJobMatchResult: (r) => {
    set({
      jobMatchResult: r,
      jobSuggestions: r ? r.suggestions.map((s) => ({ ...s, status: 'pending' as ChangeStatus })) : [],
    });
  },
  jobMatchLoading: false,
  setJobMatchLoading: (v) => set({ jobMatchLoading: v }),
  jobSuggestions: [],
  approveJobSuggestion: (id) =>
    set((s) => ({ jobSuggestions: s.jobSuggestions.map((j) => j.id === id ? { ...j, status: 'approved' } : j) })),
  discardJobSuggestion: (id) =>
    set((s) => ({ jobSuggestions: s.jobSuggestions.map((j) => j.id === id ? { ...j, status: 'discarded' } : j) })),
  coverLetter: '',
  setCoverLetter: (cl) => set({ coverLetter: cl }),
  coverLetterLoading: false,
  setCoverLetterLoading: (v) => set({ coverLetterLoading: v }),

  selectedTemplate: 'classic-navy',
  setSelectedTemplate: (t) => set({ selectedTemplate: t }),

  getApprovedChanges: () => get().changes.filter((c) => c.status === 'approved'),
  getFinalCvText: () => {
    const { cvText, changes } = get();
    let final = cvText;
    changes.filter((c) => c.status === 'approved').forEach((c) => {
      final = final.replace(c.original, c.editedText || c.suggested);
    });
    return final;
  },
}));

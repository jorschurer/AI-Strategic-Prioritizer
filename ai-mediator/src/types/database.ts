export type ProjectStatus = 'draft' | 'collecting' | 'memo_ready' | 'commitments' | 'completed';

export type StakeholderStatus = 'invited' | 'scheduled' | 'interviewed' | 'committed';

export type CommitmentType = 'agree' | 'block' | 'need_change';

export interface Project {
  id: string;
  title: string;
  description: string;
  decision_question: string;
  deadline: string;
  interview_start: string;
  interview_end: string;
  status: ProjectStatus;
  admin_email: string;
  created_at: string;
  updated_at: string;
}

export interface Stakeholder {
  id: string;
  project_id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  status: StakeholderStatus;
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  stakeholder_id: string;
  project_id: string;
  goals: string;
  no_gos: string;
  concerns: string;
  conditions: string;
  additional_notes?: string;
  call_duration_seconds?: number;
  transcript?: string;
  created_at: string;
}

export interface DecisionMemo {
  id: string;
  project_id: string;
  options: MemoOption[];
  recommendation: string;
  recommendation_rationale: string;
  tradeoffs: string[];
  open_questions: string[];
  generated_at: string;
  updated_at: string;
}

export interface MemoOption {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface Commitment {
  id: string;
  stakeholder_id: string;
  project_id: string;
  decision: CommitmentType;
  comment?: string;
  created_at: string;
}

// Database response types for Supabase
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      stakeholders: {
        Row: Stakeholder;
        Insert: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Stakeholder, 'id' | 'created_at'>>;
      };
      interviews: {
        Row: Interview;
        Insert: Omit<Interview, 'id' | 'created_at'>;
        Update: Partial<Omit<Interview, 'id' | 'created_at'>>;
      };
      decision_memos: {
        Row: DecisionMemo;
        Insert: Omit<DecisionMemo, 'id' | 'generated_at' | 'updated_at'>;
        Update: Partial<Omit<DecisionMemo, 'id' | 'generated_at'>>;
      };
      commitments: {
        Row: Commitment;
        Insert: Omit<Commitment, 'id' | 'created_at'>;
        Update: Partial<Omit<Commitment, 'id' | 'created_at'>>;
      };
    };
  };
}

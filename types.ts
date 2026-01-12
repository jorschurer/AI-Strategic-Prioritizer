export interface MaturityProfile {
  score: number;
  level: 'Novice' | 'Explorer' | 'Practitioner' | 'Expert';
  summary: string;
}

export interface UseCaseInput {
  id: string;
  title: string;
  department: string;
  description: string;
}

export interface AnalyzedUseCase extends UseCaseInput {
  impactScore: number; // 1-10
  feasibilityScore: number; // 1-10
  riskScore: number; // 1-10
  group: 'Quick Wins' | 'Strategic Bets' | 'Low Priority' | 'Transformational';
  reasoning: string;
  implementationSteps: string[];
}

export interface AnalysisResult {
  executiveSummary: string;
  analyzedUseCases: AnalyzedUseCase[];
}

export interface Question {
  id: number;
  category: string;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}
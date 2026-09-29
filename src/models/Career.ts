/**
 * Career Preparation, Interview Roadmap & Job Readiness Data Models (Part 23)
 */

export interface CareerRoadmap {
  id: string;
  title: string;
  category: string;
  target_roles: string;
  description: string;
  stages_count: number;
  estimated_months: number;
  created_at: string;
}

export interface CareerStage {
  id: string;
  roadmap_id: string;
  title: string;
  stage_order: number;
  skills_covered: string[];
  is_completed: boolean;
  completed_at?: string | null;
}

export interface CareerProject {
  id: string;
  title: string;
  role: string;
  tech_stack: string;
  github_url?: string | null;
  live_demo_url?: string | null;
  description: string;
  key_achievements?: string | null;
  interview_topics?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerReadiness {
  id: string;
  user_id: string;
  technical_score: number;
  dsa_score: number;
  system_design_score: number;
  soft_skills_score: number;
  overall_score: number;
  updated_at: string;
}

export interface ResumeProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  summary: string;
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ role: string; company: string; duration: string; details: string }>;
  skills: string[];
  projects: CareerProject[];
  certifications: string[];
  updated_at: string;
}

export interface MockInterviewRecord {
  id: string;
  user_id: string;
  interview_type: string;
  difficulty: string;
  score: number;
  feedback?: string | null;
  questions_and_answers: Array<{ question: string; answer: string; feedback?: string }>;
  created_at: string;
}

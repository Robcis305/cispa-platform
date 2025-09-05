// Core CISPA Data Types
// Based on architecture document data models

import { z } from 'zod';

// User Types
export const UserRoleSchema = z.enum(['advisor', 'founder', 'admin']);
export const SubscriptionTierSchema = z.enum(['free', 'pro', 'enterprise']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  company_name: z.string().optional(),
  profile_data: z.record(z.any()).default({}),
  subscription_tier: SubscriptionTierSchema.default('free'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

// Assessment Types
export const AssessmentStatusSchema = z.enum(['in_progress', 'completed', 'archived']);

export const AssessmentSchema = z.object({
  id: z.string().uuid(),
  company_name: z.string(),
  advisor_id: z.string().uuid(),
  founder_id: z.string().uuid().optional(),
  status: AssessmentStatusSchema.default('in_progress'),
  started_at: z.string(),
  completed_at: z.string().optional(),
  overall_readiness_score: z.number().min(0).max(100).optional(),
  dimension_scores: z.record(z.number()).optional(),
  recommendations: z.array(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Assessment = z.infer<typeof AssessmentSchema>;
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

// Question Types
export const QuestionTypeSchema = z.enum(['text', 'number', 'multiple_choice', 'file_upload']);
export const ModuleTypeSchema = z.enum(['core', 'marketing', 'technology', 'investor']);

export const QuestionSchema = z.object({
  id: z.string().uuid(),
  question_text: z.string(),
  question_type: QuestionTypeSchema,
  dimension: z.string(),
  module: ModuleTypeSchema.default('core'),
  weight: z.number().default(1.0),
  branching_conditions: z.record(z.any()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type ModuleType = z.infer<typeof ModuleTypeSchema>;

// Answer Types
export const AnswerSchema = z.object({
  id: z.string().uuid(),
  assessment_id: z.string().uuid(),
  question_id: z.string().uuid(),
  answer_value: z.string(),
  answer_metadata: z.record(z.any()).optional(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Answer = z.infer<typeof AnswerSchema>;

// Report Types
export const ReportTypeSchema = z.enum(['pdf', 'powerpoint']);

export const ReportSchema = z.object({
  id: z.string().uuid(),
  assessment_id: z.string().uuid(),
  report_type: ReportTypeSchema,
  file_path: z.string(),
  generated_by: z.string().uuid(),
  report_data: z.record(z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Report = z.infer<typeof ReportSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;

// Share Types
export const SharePermissionSchema = z.enum(['view', 'download']);

export const ShareSchema = z.object({
  id: z.string().uuid(),
  report_id: z.string().uuid(),
  shared_by: z.string().uuid(),
  share_token: z.string(),
  permissions: SharePermissionSchema.default('view'),
  expiration_date: z.string().optional(),
  email_restrictions: z.array(z.string()).default([]),
  access_count: z.number().default(0),
  last_accessed_at: z.string().optional(),
  created_at: z.string(),
  revoked_at: z.string().optional(),
});

export type Share = z.infer<typeof ShareSchema>;
export type SharePermission = z.infer<typeof SharePermissionSchema>;

// Investor Types
export const InvestorSchema = z.object({
  id: z.string().uuid(),
  fund_name: z.string(),
  investment_focus: z.record(z.any()).default({}),
  check_size_min: z.number().optional(),
  check_size_max: z.number().optional(),
  geographic_focus: z.array(z.string()).default([]),
  contact_info: z.record(z.any()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Investor = z.infer<typeof InvestorSchema>;

// API Response Types
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    timestamp: z.string(),
    requestId: z.string(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Recommendation Types
export const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['Critical', 'Important', 'Optional']),
  dimension: z.string(),
  impact: z.string(),
  effort: z.enum(['Low', 'Medium', 'High']),
  timeline: z.string(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// Assessment Progress Types
export const AssessmentProgressSchema = z.object({
  currentQuestionIndex: z.number(),
  totalQuestions: z.number(),
  timeSpent: z.number(), // in seconds
  completedDimensions: z.array(z.string()),
});

export type AssessmentProgress = z.infer<typeof AssessmentProgressSchema>;
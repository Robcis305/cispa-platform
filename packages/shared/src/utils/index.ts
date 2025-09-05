// CISPA Utility Functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SCORING_CONFIG } from '../constants/index.js';
import type { Assessment, Recommendation, AssessmentProgress } from '../types/index.js';

// Tailwind CSS utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Score utilities
export function getScoreLabel(score: number): string {
  const { SCORE_RANGES } = SCORING_CONFIG;
  
  for (const range of Object.values(SCORE_RANGES)) {
    if (score >= range.min && score <= range.max) {
      return range.label;
    }
  }
  
  return 'Unknown';
}

export function getScoreColor(score: number): string {
  const { SCORE_RANGES } = SCORING_CONFIG;
  
  if (score >= SCORE_RANGES.EXCELLENT.min) return 'text-green-600';
  if (score >= SCORE_RANGES.GOOD.min) return 'text-blue-600';
  if (score >= SCORE_RANGES.FAIR.min) return 'text-yellow-600';
  return 'text-red-600';
}

export function isHighRisk(score: number): boolean {
  return score < SCORING_CONFIG.RISK_THRESHOLDS.HIGH_RISK;
}

export function isMediumRisk(score: number): boolean {
  return score >= SCORING_CONFIG.RISK_THRESHOLDS.HIGH_RISK && 
         score < SCORING_CONFIG.RISK_THRESHOLDS.MEDIUM_RISK;
}

// Assessment utilities
export function calculateAssessmentProgress(
  currentIndex: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((currentIndex / totalQuestions) * 100);
}

export function formatAssessmentTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function isAssessmentComplete(assessment: Assessment): boolean {
  return assessment.status === 'completed' && 
         assessment.overall_readiness_score !== undefined;
}

export function getAssessmentDuration(assessment: Assessment): number | null {
  if (!assessment.started_at || !assessment.completed_at) {
    return null;
  }
  
  const start = new Date(assessment.started_at).getTime();
  const end = new Date(assessment.completed_at).getTime();
  
  return Math.floor((end - start) / 1000); // Return in seconds
}

// Recommendation utilities
export function sortRecommendationsByPriority(recommendations: Recommendation[]): Recommendation[] {
  const priorityOrder: Record<Recommendation['priority'], number> = { 
    'Critical': 0, 
    'Important': 1, 
    'Optional': 2 
  };
  
  return [...recommendations].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getPriorityColor(priority: Recommendation['priority']): string {
  switch (priority) {
    case 'Critical': return 'text-red-600 bg-red-50';
    case 'Important': return 'text-yellow-600 bg-yellow-50';
    case 'Optional': return 'text-blue-600 bg-blue-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

// Date utilities
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString);
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Object utilities
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// Error utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
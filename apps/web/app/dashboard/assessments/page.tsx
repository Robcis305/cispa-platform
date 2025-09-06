// Assessments Dashboard Page
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Assessment, 
  getErrorMessage, 
  formatDate,
  getScoreLabel,
  getScoreColor
} from '@repo/shared';

interface AssessmentsState {
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;
}

export default function AssessmentsPage() {
  const [state, setState] = useState<AssessmentsState>({
    assessments: [],
    isLoading: true,
    error: null
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    company_name: '',
    founder_email: ''
  });

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await fetch('/api/assessments');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load assessments');
      }

      setState(prev => ({ 
        ...prev, 
        assessments: data.assessments || [],
        isLoading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: getErrorMessage(error),
        isLoading: false 
      }));
    }
  };

  const createAssessment = async () => {
    if (!newAssessment.company_name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssessment)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create assessment');
      }

      const data = await response.json();
      
      // Redirect to the new assessment
      window.location.href = `/dashboard/assessments/${data.assessment.id}`;
      
    } catch (error) {
      setState(prev => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setIsCreating(false);
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 h-24 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            New Assessment
          </button>
        </div>

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Create Assessment Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newAssessment.company_name}
                  onChange={(e) => setNewAssessment(prev => ({ 
                    ...prev, 
                    company_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founder Email (Optional)
                </label>
                <input
                  type="email"
                  value={newAssessment.founder_email}
                  onChange={(e) => setNewAssessment(prev => ({ 
                    ...prev, 
                    founder_email: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="founder@company.com"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={createAssessment}
                disabled={!newAssessment.company_name.trim() || isCreating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Assessment'}
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Assessments List */}
        <div className="bg-white rounded-lg shadow-sm">
          {state.assessments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-600">Create your first assessment to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {state.assessments.map((assessment) => (
                <div key={assessment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assessment.company_name}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                          assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assessment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assessment.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Started: {formatDate(assessment.started_at)}</span>
                        {assessment.completed_at && (
                          <span>Completed: {formatDate(assessment.completed_at)}</span>
                        )}
                        {assessment.overall_readiness_score && (
                          <span className={getScoreColor(assessment.overall_readiness_score)}>
                            Score: {assessment.overall_readiness_score}% ({getScoreLabel(assessment.overall_readiness_score)})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      {assessment.status === 'in_progress' ? (
                        <Link
                          href={`/dashboard/assessments/${assessment.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/assessments/${assessment.id}/results`}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Assessment Detail Page - Dynamic question flow
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Question, 
  Assessment, 
  AssessmentProgress,
  getErrorMessage,
  calculateAssessmentProgress,
  formatAssessmentTime
} from '@repo/shared';

interface AssessmentState {
  assessment: Assessment | null;
  currentQuestion: Question | null;
  progress: AssessmentProgress;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  timeStarted: number;
}

export default function AssessmentPage() {
  const params = useParams();
  const assessmentId = params.id as string;
  
  const [state, setState] = useState<AssessmentState>({
    assessment: null,
    currentQuestion: null,
    progress: { currentQuestionIndex: 0, totalQuestions: 30, timeSpent: 0, completedDimensions: [] },
    isCompleted: false,
    isLoading: true,
    error: null,
    timeStarted: Date.now()
  });

  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load assessment and first question
  useEffect(() => {
    loadAssessment();
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          timeSpent: Math.floor((Date.now() - prev.timeStarted) / 1000)
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      // Get assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      setState(prev => ({ ...prev, assessment }));
      
      // Get next question
      await loadNextQuestion();
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: getErrorMessage(error),
        isLoading: false 
      }));
    }
  };

  const loadNextQuestion = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/questions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load question');
      }

      if (data.completed) {
        setState(prev => ({ 
          ...prev, 
          isCompleted: true, 
          isLoading: false,
          progress: data.progress
        }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        currentQuestion: data.question,
        progress: data.progress,
        isLoading: false
      }));
      
      setAnswer(''); // Reset answer for new question
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: getErrorMessage(error),
        isLoading: false 
      }));
    }
  };

  const submitAnswer = async () => {
    if (!state.currentQuestion || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: state.currentQuestion.id,
          answer_value: answer
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to submit answer');
      }

      // Load next question
      await loadNextQuestion();
      
    } catch (error) {
      setState(prev => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeAssessment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/complete`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to complete assessment');
      }

      const data = await response.json();
      // Redirect to results page (we'll build this next)
      window.location.href = `/dashboard/assessments/${assessmentId}/results`;
      
    } catch (error) {
      setState(prev => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state.isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-green-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">All Questions Answered!</h2>
          <p className="text-gray-600 mb-4">
            You've completed all questions. Click below to finish the assessment and generate scores.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Time spent: {formatAssessmentTime(state.progress.timeSpent)}
          </p>
          <button
            onClick={completeAssessment}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Completing...' : 'Complete Assessment'}
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = calculateAssessmentProgress(
    state.progress.currentQuestionIndex, 
    state.progress.totalQuestions
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assessment: {state.assessment?.company_name}
              </h1>
              <p className="text-gray-600">
                Time elapsed: {formatAssessmentTime(state.progress.timeSpent)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold">
                {state.progress.currentQuestionIndex} / {state.progress.totalQuestions}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        {state.currentQuestion && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <div className="text-sm text-blue-600 font-medium mb-2">
                {state.currentQuestion.dimension} • {state.currentQuestion.module}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {state.currentQuestion.question_text}
              </h2>
            </div>

            <div className="mb-6">
              {state.currentQuestion.question_type === 'text' && (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              )}

              {state.currentQuestion.question_type === 'number' && (
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter number..."
                  className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {state.currentQuestion.question_type === 'multiple_choice' && (
                <div className="space-y-3">
                  {['Yes', 'No', 'Partially', 'Not Applicable'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        value={option}
                        checked={answer === option}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <div>
                {state.progress.currentQuestionIndex > 0 && (
                  <button className="text-gray-600 hover:text-gray-800">
                    ← Previous
                  </button>
                )}
              </div>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim() || isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
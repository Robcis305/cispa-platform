// Assessment Completion API - Complete assessment and calculate scores
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { SCORING_CONFIG } from '@repo/shared/constants';

// Simple scoring algorithm - this would be more sophisticated in production
function calculateDimensionScores(answers: any[], questions: any[]) {
  const dimensionScores: Record<string, number> = {};
  const dimensionWeights: Record<string, number> = {};

  // Group answers by dimension
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.question_id);
    if (!question) return;

    const dimension = question.dimension;
    const weight = question.weight || 1.0;

    if (!dimensionScores[dimension]) {
      dimensionScores[dimension] = 0;
      dimensionWeights[dimension] = 0;
    }

    // Simple scoring: numerical answers get their value, text answers get 50, yes/no gets 80/20
    let score = 50; // Default score for text answers
    
    if (question.question_type === 'number') {
      // Normalize numerical answers (this is very simplified)
      const numValue = parseFloat(answer.answer_value);
      if (!isNaN(numValue)) {
        score = Math.min(100, Math.max(0, numValue > 0 ? 75 : 25));
      }
    } else if (question.question_type === 'multiple_choice') {
      // Simple yes/no scoring
      const value = answer.answer_value.toLowerCase();
      score = value.includes('yes') || value.includes('good') || value.includes('excellent') ? 80 : 30;
    } else {
      // Text answers - simple scoring based on length and keywords
      const text = answer.answer_value.toLowerCase();
      score = text.length > 20 ? 60 : 40;
      if (text.includes('excellent') || text.includes('strong') || text.includes('good')) score += 20;
      if (text.includes('poor') || text.includes('weak') || text.includes('none')) score -= 20;
      score = Math.min(100, Math.max(0, score));
    }

    dimensionScores[dimension] += score * weight;
    dimensionWeights[dimension] += weight;
  });

  // Calculate weighted averages
  Object.keys(dimensionScores).forEach(dimension => {
    const weight = dimensionWeights[dimension];
    const score = dimensionScores[dimension];
    if (weight && weight > 0 && score !== undefined) {
      dimensionScores[dimension] = Math.round(score / weight);
    }
  });

  return dimensionScores;
}

function generateRecommendations(dimensionScores: Record<string, number>) {
  const recommendations: any[] = [];
  
  Object.entries(dimensionScores).forEach(([dimension, score]) => {
    if (score < SCORING_CONFIG.RISK_THRESHOLDS.HIGH_RISK) {
      recommendations.push({
        id: `${dimension.toLowerCase().replace(' ', '_')}_critical`,
        title: `Critical: Improve ${dimension}`,
        description: `Your ${dimension} score of ${score} indicates critical issues that require immediate attention before any transaction.`,
        priority: 'Critical' as const,
        dimension,
        impact: 'High transaction risk',
        effort: 'High' as const,
        timeline: '1-3 months'
      });
    } else if (score < SCORING_CONFIG.RISK_THRESHOLDS.MEDIUM_RISK) {
      recommendations.push({
        id: `${dimension.toLowerCase().replace(' ', '_')}_important`,
        title: `Important: Strengthen ${dimension}`,
        description: `Your ${dimension} score of ${score} shows room for improvement that could impact valuation.`,
        priority: 'Important' as const,
        dimension,
        impact: 'Moderate valuation impact',
        effort: 'Medium' as const,
        timeline: '3-6 months'
      });
    }
  });

  return recommendations;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const assessmentId = params.id;
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 401 }
      );
    }

    // Verify user can access this assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Assessment not found', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 404 }
      );
    }

    // Check if user has access to this assessment (only advisors can complete)
    if (assessment.advisor_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only assessment advisor can complete assessment', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 403 }
      );
    }

    // Check if assessment is still in progress
    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATE', message: 'Assessment is not in progress', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 400 }
      );
    }

    // Get all answers for this assessment
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select(`
        *,
        questions:question_id (
          id,
          dimension,
          weight,
          question_type
        )
      `)
      .eq('assessment_id', assessmentId);

    if (answersError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch answers', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No answers found for assessment', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 400 }
      );
    }

    // Get all questions for scoring
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*');

    if (questionsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch questions', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    // Calculate scores
    const dimensionScores = calculateDimensionScores(answers, questions);
    const overallScore = Math.round(
      Object.values(dimensionScores).reduce((sum, score) => sum + score, 0) / 
      Object.keys(dimensionScores).length
    );

    // Generate recommendations
    const recommendations = generateRecommendations(dimensionScores);

    // Update assessment with scores and mark as completed
    const { data: completedAssessment, error: updateError } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        overall_readiness_score: overallScore,
        dimension_scores: dimensionScores,
        recommendations
      })
      .eq('id', assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Assessment completion error:', updateError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to complete assessment', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      assessment: completedAssessment,
      scores: {
        overall: overallScore,
        dimensions: dimensionScores
      },
      recommendations
    });

  } catch (error) {
    console.error('POST /api/assessments/[id]/complete error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
      { status: 500 }
    );
  }
}
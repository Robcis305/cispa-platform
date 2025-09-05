// Assessment Questions API - Get next question for assessment
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
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

    // Check if user has access to this assessment
    if (assessment.advisor_id !== user.id && assessment.founder_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 403 }
      );
    }

    // Get all answered questions for this assessment
    const { data: answeredQuestions, error: answersError } = await supabase
      .from('answers')
      .select('question_id')
      .eq('assessment_id', assessmentId);

    if (answersError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch answers', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    const answeredQuestionIds = answeredQuestions?.map(a => a.question_id) || [];

    // Get the next unanswered question from core module first
    let { data: nextQuestion, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('module', 'core')
      .not('id', 'in', `(${answeredQuestionIds.join(',')})`)
      .order('created_at')
      .limit(1)
      .single();

    // If no core questions left, check optional modules
    if (questionError && questionError.code === 'PGRST116') {
      // Get optional modules questions (for now, just return marketing module as example)
      const { data: optionalQuestion, error: optionalError } = await supabase
        .from('questions')
        .select('*')
        .in('module', ['marketing', 'technology', 'investor'])
        .not('id', 'in', `(${answeredQuestionIds.join(',')})`)
        .order('module', { ascending: true })
        .order('created_at')
        .limit(1)
        .single();

      if (optionalError && optionalError.code === 'PGRST116') {
        // No more questions - assessment is complete
        return NextResponse.json({ 
          question: null, 
          completed: true,
          progress: {
            answered: answeredQuestionIds.length,
            total: answeredQuestionIds.length
          }
        });
      }

      nextQuestion = optionalQuestion;
    }

    if (questionError && questionError.code !== 'PGRST116') {
      console.error('Question fetch error:', questionError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch questions', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    // Get total question count for progress
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('module', 'core');

    return NextResponse.json({
      question: nextQuestion,
      completed: false,
      progress: {
        answered: answeredQuestionIds.length,
        total: totalQuestions || 30 // Fallback to expected core questions
      }
    });

  } catch (error) {
    console.error('GET /api/assessments/[id]/questions error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
      { status: 500 }
    );
  }
}
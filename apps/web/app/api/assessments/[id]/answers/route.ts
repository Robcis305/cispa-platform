// Assessment Answers API - Submit answers to questions
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const supabase = await createClient();
    const assessmentId = params.id;
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { question_id, answer_value, answer_metadata = {} } = body;

    if (!question_id || answer_value === undefined || answer_value === '') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Question ID and answer value are required', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 400 }
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

    // Check if assessment is still in progress
    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATE', message: 'Cannot modify completed assessment', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 400 }
      );
    }

    // Verify question exists
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Question not found', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 404 }
      );
    }

    // Insert or update answer using upsert
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .upsert({
        assessment_id: assessmentId,
        question_id,
        answer_value: String(answer_value),
        answer_metadata,
        created_by: user.id
      }, {
        onConflict: 'assessment_id,question_id'
      })
      .select()
      .single();

    if (answerError) {
      console.error('Answer upsert error:', answerError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to save answer', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer }, { status: 201 });

  } catch (error) {
    console.error('POST /api/assessments/[id]/answers error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
      { status: 500 }
    );
  }
}
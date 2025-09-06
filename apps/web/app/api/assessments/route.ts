// Assessment API routes - Create and List assessments
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { 
  AssessmentSchema, 
  UserRoleSchema,
  ApiErrorSchema 
} from '@repo/shared/types';

// GET /api/assessments - List user's assessments
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 401 }
      );
    }

    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User profile not found', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 404 }
      );
    }

    // Fetch assessments based on user role
    let query = supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (userData.role === 'advisor') {
      query = query.eq('advisor_id', user.id);
    } else if (userData.role === 'founder') {
      query = query.eq('founder_id', user.id);
    }
    // Admins can see all assessments (no additional filter)

    const { data: assessments, error: assessmentsError } = await query;

    if (assessmentsError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch assessments', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessments });

  } catch (error) {
    console.error('GET /api/assessments error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
      { status: 500 }
    );
  }
}

// POST /api/assessments - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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
    const { company_name, founder_email, modules = ['core'] } = body;

    if (!company_name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Company name is required', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 400 }
      );
    }

    // Verify user is an advisor
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'advisor') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only advisors can create assessments', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 403 }
      );
    }

    // Find founder if email provided
    let founder_id = null;
    if (founder_email) {
      const { data: founderData } = await supabase
        .from('users')
        .select('id')
        .eq('email', founder_email)
        .eq('role', 'founder')
        .single();
      
      founder_id = founderData?.id || null;
    }

    // Create assessment
    const { data: assessment, error: createError } = await supabase
      .from('assessments')
      .insert({
        company_name,
        advisor_id: user.id,
        founder_id,
        status: 'in_progress'
      })
      .select()
      .single();

    if (createError) {
      console.error('Assessment creation error:', createError);
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create assessment', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessment }, { status: 201 });

  } catch (error) {
    console.error('POST /api/assessments error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error', timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } },
      { status: 500 }
    );
  }
}
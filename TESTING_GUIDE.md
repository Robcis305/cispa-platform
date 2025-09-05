# CISPA Testing Guide

## Prerequisites

1. **Docker Desktop** - Install from https://docs.docker.com/desktop/
2. **Node.js 18+** - Already installed ✅
3. **Supabase CLI** - Install via package manager (see https://github.com/supabase/cli#install-the-cli)

## Alternative Testing (Without Docker)

If Docker is not available, you can test the application using Supabase Cloud:

### Option A: Supabase Cloud Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Apply Database Schema**
   - In Supabase Dashboard → SQL Editor
   - Run the migration files in order:
     - Copy contents of `supabase/migrations/20250901000000_initial_schema.sql`
     - Copy contents of `supabase/migrations/20250901000001_rls_policies.sql`
     - Copy contents of `supabase/seed.sql`

## Setup Instructions

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 2. Start Supabase Local Development
```bash
cd cispa-app
npx supabase start
```

This will output connection details like:
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: your-jwt-secret
        anon key: your-anon-key
service_role key: your-service-role-key
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cd apps/web
cp .env.local.example .env.local
```

Update `.env.local` with the values from Supabase start:
```bash
# Update these with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start

# Application Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
APP_ENV=local
```

### 4. Apply Seed Data (Optional)
```bash
# Load sample questions and test data
npx supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
```

### 5. Start the Application
```bash
# In the root cispa-app directory
npm run dev
```

This starts both the web app and any other services.

## Testing the Assessment Flow

### Access URLs:
- **Web App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323 (Database GUI)
- **API Docs:** http://localhost:3000/api (if we add documentation)

### Test User Accounts
The seed data includes these test users:

**Advisor Account:**
- Email: advisor@test.com
- Role: advisor
- Can create and manage assessments

**Founder Account:**
- Email: founder@startup.com  
- Role: founder
- Can view assigned assessments

### Testing Steps:

1. **Authentication Test**
   - Go to http://localhost:3000
   - Should redirect to login
   - Create account or use test accounts

2. **Assessment Creation**
   - Navigate to Dashboard → Assessments
   - Click "New Assessment"
   - Enter company name: "Test Company"
   - Click "Create Assessment"

3. **Question Flow Test**
   - Should load first question from Financial dimension
   - Answer the question and click "Next"
   - Verify progress bar updates
   - Complete several questions to test flow

4. **Progress Tracking**
   - Verify time tracking works
   - Check progress percentage
   - Test browser refresh (should resume where left off)

5. **Assessment Completion**
   - Answer all core questions
   - Click "Complete Assessment"
   - Verify scoring calculation works
   - Check results display

## Database Inspection

Use Supabase Studio (http://localhost:54323) to inspect:

- **Users table** - Check user creation
- **Assessments table** - Verify assessment data
- **Questions table** - Review question library
- **Answers table** - Check answer storage
- **Audit logs** - Verify tracking works

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure .env.local has correct SUPABASE_URL and SUPABASE_ANON_KEY

### Issue: Database connection errors
**Solution:** 
1. Check Docker is running
2. Run `npx supabase status` to check services
3. Restart with `npx supabase stop` then `npx supabase start`

### Issue: No questions showing up
**Solution:** Run `npx supabase db reset` to apply seed data

### Issue: Authentication not working
**Solution:** 
1. Check Supabase Auth is enabled in Studio
2. Verify JWT secret is correct
3. Clear browser localStorage and try again

## Success Metrics

✅ **User can create assessment in < 30 seconds**  
✅ **Question flow is intuitive and responsive**  
✅ **Progress tracking works accurately**  
✅ **Assessment completion generates scores**  
✅ **All interactions are properly audited**  
✅ **System handles errors gracefully**

## Next Steps After Testing

Once testing is complete, we can:

1. **Fix any bugs discovered**
2. **Add authentication pages** (login/signup)
3. **Start User Story 2** - Report Generation
4. **Deploy to staging** for external testing

## Performance Testing

For the 2-hour target:
- Start a timer when beginning assessment
- Complete all 30 core questions
- Verify total time is well under 2 hours
- Test with realistic answer lengths

The system is designed to complete assessments in under 2 hours as specified in the PRD.
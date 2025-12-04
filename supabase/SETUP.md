# Supabase Database Setup Instructions

## Step 1: Run Migrations

1. Go to your Supabase project dashboard: https://letjkvyfbbqqixyinhmq.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Run the migrations in order:

### Migration 1: Create Profiles Table
- Open `supabase/migrations/001_create_profiles.sql`
- Copy the entire SQL content
- Paste into the SQL Editor
- Click **Run** to execute

### Migration 2: Create Usage Logs Table
- Open `supabase/migrations/002_create_usage_logs.sql`
- Copy the entire SQL content
- Paste into the SQL Editor
- Click **Run** to execute

## Step 2: Verify Tables

1. Navigate to **Table Editor** in the left sidebar
2. You should see two new tables:
   - `profiles` - User profile data
   - `usage_logs` - AI usage tracking

## Step 3: Get API Keys

1. Navigate to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://letjkvyfbbqqixyinhmq.supabase.co`
   - **anon public key**: Copy the `anon` `public` key
   - **service_role key**: Copy the `service_role` `secret` key (⚠️ Keep this secret!)

## Step 4: Create .env.local File

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://letjkvyfbbqqixyinhmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
USE_AI_TAILORING=false
```

Replace `your-anon-key-here` and `your-service-role-key-here` with the actual keys from Step 3.

## Step 5: Test Database Connection

After setting up the environment variables, the application will automatically connect to Supabase when you run `pnpm dev`.

## Row Level Security (RLS) Policies

The migrations automatically set up RLS policies:

### Profiles Table
- ✅ Users can view their own profile
- ✅ Users can update their own profile
- ✅ Service role can insert profiles (for signup)
- ✅ Auto-creates profile when user signs up via trigger

### Usage Logs Table
- ✅ Users can view their own usage logs
- ✅ Service role can insert usage logs
- ✅ Service role can view all logs (for admin)

## Next Steps

Once the database is set up and environment variables are configured, the migration will continue with updating the authentication services and API routes.

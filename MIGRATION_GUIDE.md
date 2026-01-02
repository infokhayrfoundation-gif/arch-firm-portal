# Migration Guide: localStorage to Supabase

## Problem
Your app currently uses `localStorage` which is browser-specific. Changes in one browser don't appear in others because each browser has its own storage.

## Solution
We've created a Supabase-based database service that syncs data across all browsers in real-time.

## Steps to Migrate

### 1. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the SQL script from `SUPABASE_SETUP.md` to create the required tables
4. Make sure Realtime is enabled (Dashboard > Settings > API > Realtime)

### 2. Set Environment Variables

**For Local Development:**
Create a `.env.local` file in the root directory:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Vercel Production:**
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add:
   - `VITE_SUPABASE_URL` = your_supabase_project_url
   - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key
4. Redeploy your application

### 3. Replace the db Service

The new `db-supabase.ts` service uses Supabase instead of localStorage. You have two options:

**Option A: Complete Migration (Recommended)**
- Replace `services/db.ts` with the Supabase version
- Update all code to use async/await (see step 4)

**Option B: Gradual Migration**
- Keep both services
- Switch imports gradually

### 4. Update Code to Use Async/Await

Since Supabase operations are async, you need to update all db method calls to use `await`.

**Before:**
```typescript
const user = db.login(email, password, role);
const projects = db.getProjects(userId, role);
db.createProject(userId, form);
```

**After:**
```typescript
const user = await db.login(email, password, role);
const projects = await db.getProjects(userId, role);
await db.createProject(userId, form);
```

### 5. Files That Need Updates

The following files need to be updated to use async/await:

- `pages/PublicViews.tsx` - Login, Signup components
- `pages/ClientViews.tsx` - All client dashboard components
- `pages/AdminViews.tsx` - Admin dashboard
- `App.tsx` - User session management
- Any other files that import from `services/db`

### 6. Testing

1. Test in multiple browsers/devices simultaneously
2. Make a change in one browser
3. Verify it appears in other browsers within seconds
4. Check browser console for any errors

### 7. Data Migration (Optional)

If you have existing data in localStorage that you want to migrate:

1. Export data from localStorage (use browser DevTools)
2. Create a migration script to insert into Supabase
3. Or start fresh - the app will work with empty database

## Troubleshooting

**Real-time not working?**
- Check that Realtime is enabled in Supabase
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure the `projects` table is added to Realtime publication

**Data not syncing?**
- Check Supabase logs for errors
- Verify RLS policies allow your operations
- Check network tab for failed requests

**Async errors?**
- Make sure all db methods are called with `await`
- Wrap in try-catch blocks for error handling
- Check that functions calling db methods are marked `async`


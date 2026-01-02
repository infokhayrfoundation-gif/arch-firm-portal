# Deployment Checklist - Supabase Migration

## ✅ Code Updates Complete

All files have been updated to use Supabase instead of localStorage:
- ✅ `services/db.ts` - Now uses Supabase
- ✅ `pages/ClientViews.tsx` - All db calls are async
- ✅ `pages/AdminViews.tsx` - All db calls are async  
- ✅ `pages/PublicViews.tsx` - Login/Signup are async
- ✅ `App.tsx` - Session loading is async

## Required Steps Before Deployment

### 1. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Open the **SQL Editor**
3. Copy and run the SQL script from `SUPABASE_SETUP.md`
4. Verify tables are created: `users`, `projects`, `availability`

### 2. Enable Realtime

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll to **Realtime** section
3. Make sure Realtime is **enabled**
4. Verify `projects` table is in the Realtime publication (should be done by the SQL script)

### 3. Set Environment Variables

**In Vercel:**
1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
3. Redeploy your application

**For Local Development:**
Create `.env.local` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Real-time Updates

1. Deploy to Vercel
2. Open the app in **Browser A** (e.g., Chrome)
3. Open the app in **Browser B** (e.g., Firefox) 
4. Login as admin in Browser A
5. Make a change (e.g., update project status)
6. Verify change appears in Browser B within 1-2 seconds

### 5. Optional: Migrate Existing Data

If you have data in localStorage you want to preserve:
1. Export data from browser DevTools → Application → Local Storage
2. Create a migration script or manually insert into Supabase tables
3. Or start fresh - the app works with empty database

## Troubleshooting

**Real-time not working?**
- ✅ Check Realtime is enabled in Supabase
- ✅ Verify environment variables are set correctly
- ✅ Check browser console for errors
- ✅ Ensure `projects` table is in Realtime publication

**"Table doesn't exist" errors?**
- ✅ Run the SQL script from `SUPABASE_SETUP.md`

**"Unauthorized" or permission errors?**
- ✅ Check RLS policies in Supabase (or disable RLS for testing)

**Data not syncing?**
- ✅ Check Supabase logs for errors
- ✅ Verify network tab for failed requests
- ✅ Check that updates are being written to Supabase (not localStorage)

## Next Steps

After successful deployment:
1. Test all workflows (login, signup, project creation, etc.)
2. Monitor Supabase logs for any errors
3. Consider setting up proper RLS policies for production
4. Set up database backups in Supabase

🎉 **Your app now has real-time updates across all browsers!**


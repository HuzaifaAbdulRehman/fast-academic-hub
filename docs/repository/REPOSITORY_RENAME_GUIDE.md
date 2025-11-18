================================================================================
  REPOSITORY & VERCEL PROJECT RENAME GUIDE
  GitHub Repository: absence-tracker → fast-timetable-attendance
  Vercel Project: Renaming to fast-timetable-attendance
================================================================================

📌 IMPORTANT: About the OIDC Warning
================================================================================

The warning you saw says:
"Changing the project name will affect the OpenID Connect Token claims and may
require updating your backend's OpenID Connect Federation configuration."

WHAT THIS MEANS:
- OIDC (OpenID Connect) is used for advanced authentication/authorization
- It's typically used when deploying from GitHub Actions with secure tokens
- This warning is relevant ONLY if you're using OIDC tokens in your deployment

FOR YOUR PROJECT:
✅ You can SAFELY IGNORE this warning because:
   - You're using standard GitHub → Vercel Git integration
   - You're NOT using custom OIDC authentication
   - You're NOT using GitHub Actions with OIDC tokens
   - This is a simple PWA/React app with automatic Vercel deployments

PROCEED with the rename - it will NOT break your deployment!

================================================================================
STEP 1: RENAME GITHUB REPOSITORY
================================================================================

OPTION A: Using GitHub Web Interface (RECOMMENDED)
---------------------------------------------------
1. Go to your GitHub repository:
   https://github.com/YOUR_USERNAME/absence-tracker

2. Click "Settings" (top right of repository page)

3. Scroll down to "Repository name" section (at the very top)

4. Change name from: absence-tracker
   To: fast-timetable-attendance

5. Click "Rename" button

6. GitHub will show a warning about redirects - this is normal
   ✓ Old URLs will redirect to new name
   ✓ Existing clones will continue to work

OPTION B: Using GitHub CLI (If you have gh installed)
------------------------------------------------------
gh repo rename fast-timetable-attendance

================================================================================
STEP 2: UPDATE LOCAL GIT REMOTE (AFTER GITHUB RENAME)
================================================================================

After renaming on GitHub, update your local repository:

1. Open terminal in your project directory

2. Check current remote URL:
   git remote -v

3. Update remote URL to new repository name:
   git remote set-url origin https://github.com/YOUR_USERNAME/fast-timetable-attendance.git

   OR if using SSH:
   git remote set-url origin git@github.com:YOUR_USERNAME/fast-timetable-attendance.git

4. Verify the change:
   git remote -v

5. Test connection:
   git fetch

================================================================================
STEP 3: RENAME VERCEL PROJECT
================================================================================

1. Go to Vercel Dashboard:
   https://vercel.com/dashboard

2. Click on your project

3. Click "Settings" tab (top navigation)

4. Click "General" in left sidebar

5. Scroll to "Project Name" section

6. Change name to: fast-timetable-attendance

7. Click "Save"

8. You'll see the OIDC warning - Click "Confirm" or "Save" anyway
   ✅ This is safe for your use case (standard Git deployment)

WHAT HAPPENS AFTER RENAME:
--------------------------
✓ Old Vercel URL will redirect to new one
✓ Deployments continue to work automatically
✓ GitHub integration remains connected
✓ All environment variables are preserved
✓ Deployment history is preserved

YOUR NEW VERCEL URL WILL BE:
https://fast-timetable-attendance.vercel.app
(or similar, Vercel may append random suffix if name is taken)

================================================================================
STEP 4: UPDATE VERCEL DOMAIN (OPTIONAL)
================================================================================

If you want a cleaner production domain:

1. In Vercel Settings → Domains

2. Add a new domain or alias:
   - fast-tracker.vercel.app
   - nuces-tracker.vercel.app
   - Or your own custom domain

3. Set as primary production domain

================================================================================
STEP 5: VERIFY EVERYTHING WORKS
================================================================================

After all renames, verify:

□ GitHub repository renamed: https://github.com/YOUR_USERNAME/fast-timetable-attendance
□ Local git remote updated (git remote -v)
□ Can push to GitHub: git push origin main
□ Vercel project renamed
□ Vercel auto-deployment still works after push
□ Production site is live at new URL

TEST DEPLOYMENT:
1. Make a small change (add a comment in code)
2. git add . && git commit -m "Test deployment after rename"
3. git push origin main
4. Check Vercel dashboard - should see new deployment
5. Wait 1-3 minutes, check production URL

================================================================================
TROUBLESHOOTING
================================================================================

ISSUE: "git push" fails after GitHub rename
FIX: Update remote URL (see Step 2 above)

ISSUE: Vercel not detecting pushes after rename
FIX:
1. Go to Vercel → Settings → Git
2. Disconnect and reconnect GitHub integration
3. Re-select repository (will have new name)

ISSUE: Old repository URL still works
EXPLANATION: GitHub automatically redirects old URLs to new ones
This is normal and helpful - no action needed

ISSUE: Vercel deployment URLs showing old name
FIX:
1. Vercel Settings → Domains
2. Add new domain with preferred name
3. Set as primary

================================================================================
REPOSITORY NAMING BEST PRACTICES
================================================================================

✓ fast-timetable-attendance (GOOD - descriptive, SEO-friendly)
✓ nuces-course-tracker (GOOD - includes institution)
✗ absence-tracker (OLD - doesn't reflect full functionality)
✗ my-project (BAD - not descriptive)

Your new name "fast-timetable-attendance" clearly indicates:
- Institution: FAST/NUCES
- Features: Timetable + Attendance tracking
- Purpose: Student academic management

================================================================================
FINAL CHECKLIST
================================================================================

Before starting:
□ Commit all local changes
□ Push to GitHub (old name is fine)
□ Note your GitHub username

During rename:
□ Rename GitHub repository (Step 1)
□ Update local git remote (Step 2)
□ Rename Vercel project (Step 3)
□ Ignore OIDC warning (safe for your setup)

After rename:
□ Test git push
□ Verify Vercel deployment
□ Update any bookmarks
□ Share new URLs with users

================================================================================
SUMMARY
================================================================================

The OIDC warning is SAFE to ignore for your project because you're using
standard GitHub → Vercel integration, not advanced OIDC authentication.

After renaming:
- Repository: github.com/YOUR_USERNAME/fast-timetable-attendance
- Vercel: fast-timetable-attendance.vercel.app
- Deployments: Continue working automatically
- No data loss, no broken deployments

Total time needed: ~5 minutes

================================================================================

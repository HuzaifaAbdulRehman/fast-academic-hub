================================================================================
  FAST COURSE, TIMETABLE & ATTENDANCE TRACKER
  GitHub + Vercel Deployment Workflow
================================================================================

PROJECT RENAMED TO: "FAST Course, Timetable & Attendance Tracker"
(Previously: "Absence Tracker")

================================================================================
AUTOMATIC DEPLOYMENT WORKFLOW
================================================================================

Your project is configured for AUTOMATIC deployments through GitHub + Vercel.

HOW IT WORKS:
1. You make changes locally (code, timetable updates, features, etc.)
2. Commit changes: `git add .` and `git commit -m "your message"`
3. Push to GitHub: `git push origin main`
4. Vercel automatically detects the push and deploys

NO MANUAL ACTION NEEDED ON VERCEL!

================================================================================
WHEN TIMETABLE UPDATES
================================================================================

SCENARIO: New semester timetable is released

YOUR WORKFLOW:
1. Update timetable JSON file locally: /public/timetable/timetable.json
2. Test locally: `npm run dev` (verify timetable loads correctly)
3. Commit: `git add . && git commit -m "Update timetable for Spring 2025"`
4. Push: `git push origin main`
5. Wait 1-3 minutes → Vercel auto-deploys → Live!

THAT'S IT! No manual build, no re-upload, no Vercel dashboard needed.

================================================================================
VERCEL PROJECT SETTINGS
================================================================================

OPTIONAL: Rename Project on Vercel (Recommended)
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → General → Project Name
4. Change to: "fast-course-timetable-attendance-tracker"
5. Save

This is COSMETIC only - doesn't affect functionality.

OPTIONAL: Update Production Domain (Optional)
If you want a custom domain like: fast-tracker.vercel.app
1. Settings → Domains
2. Add new domain or edit existing

================================================================================
GIT COMMANDS REFERENCE
================================================================================

PUSH CHANGES (TRIGGERS AUTO-DEPLOY):
git add .
git commit -m "Description of changes"
git push origin main

CHECK STATUS:
git status

VIEW COMMIT HISTORY:
git log --oneline

CREATE A NEW BRANCH (for testing):
git checkout -b feature/new-feature
... make changes ...
git push origin feature/new-feature
(Deploy preview will be created automatically)

MERGE TO MAIN (PRODUCTION DEPLOY):
git checkout main
git merge feature/new-feature
git push origin main

================================================================================
VERCEL DEPLOYMENT LOGS
================================================================================

TO SEE DEPLOYMENT STATUS:
1. Visit: https://vercel.com/dashboard
2. Click your project
3. View "Deployments" tab
4. See real-time build logs, errors, and success status

EACH GIT PUSH = NEW DEPLOYMENT
Vercel keeps history of all deployments. You can rollback if needed.

================================================================================
TROUBLESHOOTING
================================================================================

ISSUE: Deployment not triggered after push
FIX: Check Vercel → Settings → Git → ensure GitHub integration is connected

ISSUE: Build fails
FIX: Check Vercel deployment logs for error details
Common: Missing dependencies → run `npm install` locally first

ISSUE: Old content showing after deploy
FIX: Clear browser cache (Ctrl+Shift+R) or wait 1-2 minutes for CDN propagation

================================================================================
ICON RECOMMENDATION
================================================================================

CURRENT ICON: Generic Vite logo (not relevant to project)

RECOMMENDED: Replace with academic/timetable-themed icon

SUGGESTED ICONS:
✓ Calendar with checkmark (represents attendance + timetable)
✓ Book + Calendar combination (represents courses + scheduling)
✓ Graduation cap + Calendar (represents academic tracking)

WHERE TO GENERATE ICONS:
- Favicon.io (https://favicon.io)
- RealFaviconGenerator (https://realfavicongenerator.net)
- Figma or Canva (design custom)

FILES TO REPLACE:
- /public/icon-192.png
- /public/icon-512.png
- /public/vite.svg (optional)

After replacing, commit and push to deploy new icons.

================================================================================
BEST PRACTICES
================================================================================

✓ Commit frequently with descriptive messages
✓ Test locally before pushing (`npm run dev`)
✓ Use feature branches for experimental changes
✓ Keep timetable JSON well-formatted (validate JSON structure)
✓ Monitor Vercel dashboard for deployment status
✓ Use meaningful commit messages (e.g., "Fix mobile layout bug" not "update")

================================================================================
QUICK REFERENCE
================================================================================

LOCAL DEVELOPMENT:  npm run dev
BUILD FOR PRODUCTION: npm run build
PREVIEW BUILD: npm run preview
PUSH TO DEPLOY: git add . && git commit -m "message" && git push origin main

VERCEL DASHBOARD: https://vercel.com/dashboard
PROJECT SETTINGS: https://vercel.com/[your-username]/[project-name]/settings

================================================================================

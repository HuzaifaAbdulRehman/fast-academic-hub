# FAST Course, Timetable & Attendance Tracker - Documentation

Welcome to the documentation for the FAST Course, Timetable & Attendance Tracker PWA.

## Documentation Structure

### Development Documentation
- **[ARCHITECTURE.md](development/ARCHITECTURE.md)** - Complete technical architecture overview, component hierarchy, state management, and design patterns

### Deployment Documentation
- **[DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)** - GitHub + Vercel automatic deployment workflow, timetable update process, and troubleshooting

### Repository Documentation
- **[REPOSITORY_RENAME_GUIDE.md](repository/REPOSITORY_RENAME_GUIDE.md)** - Guide for renaming GitHub repository and Vercel project, OIDC warning explanation

### Operations Documentation
- **[PRODUCTION_READINESS_REPORT.md](operations/PRODUCTION_READINESS_REPORT.md)** - Production readiness assessment and deployment checklist

## Quick Links

**For Developers:**
- [Architecture Overview](development/ARCHITECTURE.md#high-level-architecture)
- [Component Structure](development/ARCHITECTURE.md#component-architecture)
- [State Management](development/ARCHITECTURE.md#state-management)
- [Styling System](development/ARCHITECTURE.md#styling-system)

**For Deployment:**
- [Deployment Workflow](deployment/DEPLOYMENT_GUIDE.md#automatic-deployment-workflow)
- [Timetable Updates](deployment/DEPLOYMENT_GUIDE.md#when-timetable-updates)
- [Vercel Settings](deployment/DEPLOYMENT_GUIDE.md#vercel-project-settings)

**For Operations:**
- [Production Checklist](operations/PRODUCTION_READINESS_REPORT.md)
- [Troubleshooting](deployment/DEPLOYMENT_GUIDE.md#troubleshooting)

## Project Overview

**Project Name:** FAST Course, Timetable & Attendance Tracker
**Version:** 1.0.0
**Technology:** React 19.2, Vite 7.2, Tailwind CSS v4, PWA
**Target Users:** NUCES/FAST University Students
**Purpose:** Course management, timetable planning, and smart attendance tracking to maintain 80% attendance

## Features

1. **Course Management**
   - Add courses manually or from university timetable
   - Track credit hours, sections, and allowed absences
   - Color-coded course cards

2. **Attendance Tracking**
   - Daily attendance marking with 3 states: Present, Absent, Cancelled
   - Real-time percentage calculation
   - Visual warnings when approaching 80% threshold
   - Bulk marking support

3. **Timetable Integration**
   - Import courses from official NUCES timetable
   - Automatic session calculation
   - Section selection support

4. **Multi-Semester Support**
   - Separate data for each semester
   - Easy semester switching
   - Historical data preservation

5. **Progressive Web App**
   - Installable on mobile devices
   - Offline functionality
   - Fast loading with caching

## Contributing

(Future: Add CONTRIBUTING.md when ready for open-source contributions)

## License

(Future: Add LICENSE file)

## Support

For issues, questions, or feature requests, please refer to the relevant documentation file above.

---

**Last Updated:** November 18, 2025

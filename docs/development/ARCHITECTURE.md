# FAST Academic Hub - Complete Architecture Documentation

## Overview

**FAST Academic Hub** is a production-grade Progressive Web Application (PWA) designed for NUCES/FAST University students to manage their academic schedule, track attendance, plan absences strategically, and calculate GPA/CGPA. The application follows a mobile-first responsive design philosophy with complete offline capability.

**Version:** 1.0.0
**Tech Stack:** React 19.2, Vite 7.2, Tailwind CSS v4, Workbox PWA
**Target Users:** NUCES/FAST University Students
**Platform:** Web (Mobile-first PWA)
**Deployment:** Vercel (Static Hosting + Edge CDN)
**Repository:** GitHub with automated CI/CD

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Complete Directory Structure](#complete-directory-structure)
3. [Feature Modules](#feature-modules)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Data Flow Patterns](#data-flow-patterns)
7. [Mobile-First Responsive Design](#mobile-first-responsive-design)
8. [Styling System](#styling-system)
9. [PWA Configuration](#pwa-configuration)
10. [New Semester Workflow](#new-semester-workflow)
11. [Deployment & CI/CD](#deployment--cicd)
12. [Performance & Production](#performance--production)

---

## High-Level Architecture

### Architecture Pattern: Component-Based SPA with Context API

```
┌─────────────────────────────────────────────────────────────────────┐
│                       User Interface Layer                          │
│         (React 19.2 Components - Mobile-First Design)               │
│  ┌────────────┬──────────────┬────────────┬────────────┬─────────┐ │
│  │  Explore   │  My Courses  │ Timetable  │ Attendance │   GPA   │ │
│  │   View     │     View     │    View    │    View    │  View   │ │
│  └────────────┴──────────────┴────────────┴────────────┴─────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                     Context Providers Layer                         │
│  ┌──────────────────────┐  ┌─────────────────────────────────────┐ │
│  │    ThemeContext      │  │         AppContext                  │ │
│  │  - Light/Dark Mode   │  │  - Courses (with sections)         │ │
│  │  - System Preference │  │  - Attendance (session tracking)   │ │
│  └──────────────────────┘  │  - Semesters (multi-semester)      │ │
│                             │  - Notifications (settings)        │ │
│                             │  - GPA/CGPA (calculations)         │ │
│                             └─────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    Business Logic Layer                             │
│  ┌────────────────────┐  ┌───────────────────┐  ┌────────────────┐ │
│  │  Utility Modules   │  │   Custom Hooks    │  │  Calculations  │ │
│  │ - Attendance Calc  │  │ - useLocalStorage │  │ - GPA Calc     │ │
│  │ - Date Helpers     │  │ - useDebounce     │  │ - Attendance % │ │
│  │ - Timetable Parser │  │ - useClassSearch  │  │ - Conflict Det │ │
│  │ - Cache Manager    │  │ - useScrollCollap │  │                │ │
│  │ - Notification Mgr │  └───────────────────┘  └────────────────┘ │
│  │ - Conflict Detect  │                                             │
│  └────────────────────┘                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                  Data Persistence Layer                             │
│  ┌─────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  localStorage       │  │       Service Worker (Workbox)       │ │
│  │ - Courses           │  │  - Offline Cache (Network First)     │ │
│  │ - Attendance        │  │  - Asset Caching (Cache First)       │ │
│  │ - Semesters         │  │  - Background Sync                   │ │
│  │ - Theme Preference  │  │  - Push Notifications                │ │
│  │ - Notification Set  │  └──────────────────────────────────────┘ │
│  │ - GPA Semesters     │                                            │
│  └─────────────────────┘                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Client-Side Only Architecture**
   - No backend server required (Vercel static hosting)
   - All user data stored in browser localStorage (10MB limit)
   - Timetable data served from `/public/timetable/timetable.json`
   - GitHub Actions automates CSV → JSON conversion

2. **Context API for State Management**
   - Simpler than Redux, perfect for single-user local data
   - React 19 compatibility with concurrent features
   - Two contexts: `AppContext` (data) and `ThemeContext` (UI)

3. **Mobile-First Progressive Enhancement**
   - Base styles optimized for 320px screens (iPhone SE)
   - Responsive breakpoints: xs (350px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
   - Touch-first interactions with haptic feedback
   - Pull-to-refresh on all main views

4. **PWA for App-Like Experience**
   - Installable on home screen
   - Offline-capable with service worker
   - Standalone display mode

5. **Multi-Semester Support**
   - Users can create unlimited semesters
   - Switch between semesters instantly
   - All data scoped to active semester

---

## Complete Directory Structure

```
absence-tracker/
├── .github/workflows/
│   └── parse-timetable.yml         # GitHub Actions: Auto-parse CSVs
│
├── public/timetable/
│   ├── *.csv (Monday-Friday)       # Source CSV files
│   ├── timetable.json              # Auto-generated from CSVs
│   └── README.md                   # CSV upload guide
│
├── src/
│   ├── components/
│   │   ├── attendance/             # Attendance tracking
│   │   │   ├── AttendanceTable.jsx
│   │   │   ├── AttendanceView.jsx
│   │   │   ├── CourseHeader.jsx
│   │   │   └── QuickMarkToday.jsx
│   │   │
│   │   ├── courses/                # Course management
│   │   │   ├── CourseCard.jsx
│   │   │   ├── CourseForm.jsx
│   │   │   ├── CoursesView.jsx
│   │   │   └── TimetableSelector.jsx
│   │   │
│   │   ├── explore/                # Timetable exploration
│   │   │   ├── ClassCard.jsx
│   │   │   ├── ExploreClassesView.jsx
│   │   │   └── FilterPanel.jsx
│   │   │
│   │   ├── gpa/                    # GPA calculator
│   │   │   ├── GPAView.jsx
│   │   │   ├── GPAForOthers.jsx
│   │   │   ├── SemesterModal.jsx
│   │   │   └── SemesterSetupModal.jsx
│   │   │
│   │   ├── shared/                 # Reusable components
│   │   │   ├── BaseModal.jsx
│   │   │   ├── CacheReminderBanner.jsx
│   │   │   ├── Confetti.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── InstallPrompt.jsx
│   │   │   ├── NotificationPrompt.jsx
│   │   │   ├── NotificationSettings.jsx
│   │   │   ├── SectionSelectorDialog.jsx
│   │   │   ├── SemesterSelector.jsx
│   │   │   ├── TabNavigation.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   └── timetable/
│   │       └── TimetableView.jsx
│   │
│   ├── context/
│   │   ├── AppContext.jsx          # Main app state (898 lines)
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── useClassSearch.js       # Fuzzy search
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   └── useScrollCollapse.js
│   │
│   ├── utils/
│   │   ├── attendanceCalculator.js
│   │   ├── cacheManager.js
│   │   ├── conflictDetection.js
│   │   ├── constants.js
│   │   ├── dateHelpers.js
│   │   ├── gpaCalculator.js
│   │   ├── id.js
│   │   ├── notificationManager.js
│   │   ├── timetableParser.js      # CSV parser (424 lines)
│   │   └── uiHelpers.js
│   │
│   ├── App.jsx                     # Root component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles + Tailwind
│
├── docs/
│   ├── deployment/DEPLOYMENT_GUIDE.md
│   ├── development/ARCHITECTURE.md
│   ├── operations/PRODUCTION_READINESS_REPORT.md
│   └── repository/REPOSITORY_RENAME_GUIDE.md
│
├── scripts/parse-timetable.js      # CSV → JSON parser script
├── vite.config.js                  # Vite + PWA config
├── package.json
└── tailwind.config.js
```

---

## Feature Modules

### 1. Explore (ExploreClassesView)

**Purpose:** Browse university timetable, search courses, add to "My Courses"

**Key Features:**
- Fuzzy multi-keyword search (course, instructor, section, day)
- Conflict detection (time, duplicate, section)
- Multi-select mode (bulk add courses)
- Responsive grid (1/2/3 columns)
- Pull-to-refresh

**Responsive:** Mobile (1 col) → Tablet (2 col) → Desktop (3 col)

---

### 2. My Courses (CoursesView)

**Purpose:** Manage enrolled courses

**Key Features:**
- Course cards with attendance stats
- Add manually or from timetable
- Edit/delete courses
- Semester management
- Full-width responsive padding

**Responsive:** Single-column vertical stack with px-3 to px-16 padding

---

### 3. My Timetable (TimetableView)

**Purpose:** View weekly schedule

**Key Features:**
- Day-wise collapsible cards
- Quick day navigation (pills)
- Smart toggle (expand/collapse all)
- Instructor & location (break-words, no truncate)
- Full-width layout

**Responsive:** px-3 to px-16 padding, compact→spacious

---

### 4. Attendance (AttendanceView)

**Purpose:** Track attendance

**Key Features:**
- Calendar grid (Mon-Sun)
- Session marking (absent/cancelled/present)
- Bulk select mode
- Undo action
- Status: Safe/Warning/Danger

**Responsive:** Horizontal scroll table on mobile

---

### 5. GPA/CGPA (GPAView)

**Purpose:** Calculate GPA

**Key Features:**
- Two tabs: My GPA | GPA for Others
- Semester-wise tracking
- Multi-student calculator (table)
- Import from My Courses

**Responsive:** Horizontal scroll table with responsive columns

---

## Component Architecture

See complete component hierarchy in full documentation above.

**Component Types:**
1. Container (Smart): ExploreClassesView, CoursesView, etc.
2. Presentational (Dumb): CourseCard, ClassCard, CourseHeader
3. Modal: CourseForm, ConfirmModal, TimetableSelector
4. Utility: ErrorBoundary, Toast, Confetti
5. Layout: Header, TabNavigation, SemesterSelector

---

## State Management

### AppContext (898 lines)

**State:**
```javascript
{
  allCourses: [...],      // All semesters
  courses: [...],         // Filtered by activeSemesterId
  allAttendance: [...],
  attendance: [...],      // Filtered by activeSemesterId
  semesters: [...],
  activeSemesterId: 'spring-2025',
  undoHistory: {...},
  notificationSettings: {...}
}
```

**Course Object:**
```javascript
{
  id, name, shortName, courseCode, section, instructor,
  creditHours, weekdays, startDate, endDate,
  initialAbsences, allowedAbsences, color, colorHex,
  semesterId, createdAt,
  // Timetable metadata
  schedule: [{day, startTime, endTime, room, building}],
  room, roomNumber, building, timeSlot
}
```

**Key Functions:**
- Course: addCourse, addMultipleCourses, updateCourse, deleteCourse, changeCourseSection, reorderCourse
- Attendance: toggleSession, toggleDay, markDaysAbsent, undo
- Semester: createSemester, switchSemester, deleteSemester
- Stats: getCourseStats

---

## Data Flow Patterns

### Add Course from Explore
```
Search → Filter → Click → Conflict Check → CourseForm → addCourse() → localStorage → Re-render
```

### Mark Attendance
```
Click cell → toggleSession() → Update attendance array → localStorage → Recalculate stats → Update UI
```

### Switch Semester
```
Select semester → switchSemester() → Update activeSemesterId → Filter courses/attendance → Re-render
```

---

## Mobile-First Responsive Design

### Breakpoints
- **<350px:** Ultra-short labels, smallest icons (18px)
- **350-640px:** Short labels, small icons (20px)
- **640-768px:** Full labels, medium icons (20px)
- **768-1024px:** Larger icons (24px), more padding
- **1024-1280px:** Spacious layout, 3-col grid
- **1280px+:** Maximum padding (px-12 to px-16)

### Touch Optimization
- Minimum 48px × 48px touch targets
- Haptic feedback (Vibration API)
- Pull-to-refresh
- No accidental swipes

---

## Styling System

### Tailwind CSS v4

**CSS Variables:**
```css
/* Dark mode (default) */
--color-dark-bg: #0a0a0a
--color-content-primary: #f5f5f5
--color-accent: #3b82f6

/* Light mode */
:root:has([data-theme="light"]) {
  --color-dark-bg: #ffffff
  --color-content-primary: #111827
}
```

**Component Patterns:**
- Buttons: Primary, Secondary, Danger, Ghost
- Cards: Standard, Glassmorphism, Status
- Inputs: Text, Select (with focus rings)

---

## PWA Configuration

### Service Worker (Workbox)

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'FAST Absence Planner + Timetable',
    short_name: 'FAST Planner',
    display: 'standalone',
    // ...
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg}'],
    runtimeCaching: [
      { urlPattern: /fonts\.googleapis\.com/, handler: 'CacheFirst' }
    ]
  }
})
```

**Offline Support:**
- ✅ App shell, user data, cached timetable
- ❌ Fresh timetable data

---

## New Semester Workflow

### For Students
1. Create new semester in app
2. Pull-to-refresh in Explore
3. Search new section
4. Add courses
5. Old semester data preserved

### For Admins
1. Download new CSVs from university
2. Replace files in `public/timetable/`
3. Commit & push to GitHub
4. GitHub Actions auto-parses to JSON
5. Vercel auto-deploys
6. Students see new timetable on refresh

**GitHub Actions Workflow:**
```yaml
on:
  push:
    paths: ['public/timetable/*.csv']
jobs:
  parse-and-deploy:
    - Checkout
    - Setup Node.js
    - npm install
    - node scripts/parse-timetable.js
    - Commit timetable.json
    - Push (triggers Vercel)
```

---

## Deployment & CI/CD

### Vercel Production
- Auto-deploy on push to `main`
- `npm run build` (Vite)
- Edge CDN (global)
- HTTPS by default

### Local Development
```bash
npm install
npm run dev  # http://localhost:5173
```

---

## Performance & Production

### Optimizations
✅ React 19 concurrent features
✅ Tailwind JIT compilation
✅ localStorage (instant loading)
✅ Service Worker caching
✅ Minimal dependencies (~150KB gzipped)
✅ Hardware-accelerated animations

### Gaps
⚠️ No code splitting
⚠️ Large AppContext (898 lines)
⚠️ No bundle analysis

### Security
✅ HTTPS
✅ Client-side only (no server vulnerabilities)
⚠️ localStorage not encrypted

### Accessibility (WCAG 2.1 AA)
✅ Color contrast (7:1 ratio)
✅ Keyboard navigation
✅ ARIA labels
✅ 48px touch targets

### Testing
❌ No unit/E2E tests (critical gap)

---

## Future Roadmap

**Phase 1 (Q1 2026):** Refactor, testing, TypeScript
**Phase 2 (Q2 2026):** Code splitting, accessibility audit
**Phase 3 (Q3 2026):** Multi-university, notifications, exports
**Phase 4 (Q4 2026):** Backend sync, analytics, mobile apps

---

## Strengths & Weaknesses

**Strengths:**
1. Mobile-first responsive (320px → 4K)
2. Offline-capable PWA
3. Multi-semester support
4. Automated CSV parsing & deployment
5. Clean architecture & separation of concerns

**Weaknesses:**
1. No backend (single-device only)
2. localStorage limits (10MB)
3. No testing
4. Monolithic AppContext
5. No monitoring/analytics

---

**Document Maintained By:** Development Team
**Last Updated:** November 19, 2025
**Next Review:** Q1 2026
**Status:** Production-Ready v1.0.0

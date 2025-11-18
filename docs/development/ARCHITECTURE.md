# FAST Course, Timetable & Attendance Tracker - Architecture Documentation

## Overview

This document describes the technical architecture of the FAST Course, Timetable & Attendance Tracker Progressive Web Application (PWA).

**Version:** 1.0.0
**Tech Stack:** React 19.2, Vite 7.2, Tailwind CSS v4, Workbox PWA
**Target Users:** NUCES/FAST University Students
**Platform:** Web (Mobile-first PWA)

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Directory Structure](#directory-structure)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Data Flow](#data-flow)
6. [Styling System](#styling-system)
7. [PWA Configuration](#pwa-configuration)
8. [Performance Considerations](#performance-considerations)
9. [Future Roadmap](#future-roadmap)

---

## High-Level Architecture

### Architecture Pattern: Component-Based SPA with Context API

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (React Components - Mobile-First Responsive Design)    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Context Providers                        │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │    AppContext        │  │   ThemeContext          │ │
│  │ - Courses           │  │ - Light/Dark Mode       │ │
│  │ - Attendance        │  │ - System Preference     │ │
│  │ - Semesters         │  └─────────────────────────┘ │
│  │ - Notifications     │                              │
│  └──────────────────────┘                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                Business Logic Layer                      │
│  ┌───────────────────┐  ┌──────────────────────────┐  │
│  │  Utility Modules  │  │   Custom Hooks           │  │
│  │ - Attendance Calc │  │ - useLocalStorage        │  │
│  │ - Date Helpers    │  │ - useScrollCollapse      │  │
│  │ - Timetable Parse │  └──────────────────────────┘  │
│  │ - Cache Manager   │                                │
│  └───────────────────┘                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Data Persistence                        │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │  localStorage        │  │   Service Worker        │ │
│  │ - Courses Data      │  │ - Offline Cache         │ │
│  │ - Attendance        │  │ - Asset Caching         │ │
│  │ - Semesters         │  │ - API Response Cache    │ │
│  │ - Theme Preference  │  └─────────────────────────┘ │
│  └──────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Client-Side Only Architecture**
   - No backend server (except Vercel static hosting)
   - All data stored in browser localStorage
   - Timetable data fetched from public JSON file

2. **Context API for State Management**
   - Chosen over Redux for simplicity and React 19 compatibility
   - Sufficient for app scale (single user, local data)
   - No complex async state management needed

3. **Mobile-First Progressive Enhancement**
   - Base styles optimized for 320px screens
   - Responsive breakpoints: sm (640px), md (768px), lg (1024px)
   - Touch-first interactions with haptic feedback

4. **PWA for App-Like Experience**
   - Installable on home screen
   - Offline-capable with service worker
   - Fast loading with asset pre-caching

---

## Directory Structure

```
absence-tracker/
├── public/
│   ├── icon-192.png              # PWA app icon (small)
│   ├── icon-512.png              # PWA app icon (large)
│   └── timetable/
│       └── timetable.json        # University timetable data
│
├── src/
│   ├── components/
│   │   ├── attendance/           # Attendance tracking components
│   │   │   ├── AttendanceTable.jsx
│   │   │   ├── AttendanceView.jsx
│   │   │   ├── CourseHeader.jsx
│   │   │   └── QuickMarkToday.jsx
│   │   │
│   │   ├── courses/              # Course management components
│   │   │   ├── CourseCard.jsx
│   │   │   ├── CourseForm.jsx
│   │   │   └── TimetableSelector.jsx
│   │   │
│   │   ├── shared/               # Shared/reusable components
│   │   │   ├── BaseModal.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ... (13 total)
│   │   │
│   │   └── timetable/            # Timetable view component
│   │       └── TimetableView.jsx
│   │
│   ├── context/
│   │   ├── AppContext.jsx        # Main app state (courses, attendance, semesters)
│   │   └── ThemeContext.jsx      # Theme management (light/dark mode)
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.js    # localStorage persistence hook
│   │   └── useScrollCollapse.js  # Scroll behavior hook
│   │
│   ├── utils/
│   │   ├── attendanceCalculator.js  # Attendance math & stats
│   │   ├── cacheManager.js          # PWA cache management
│   │   ├── constants.js             # App constants
│   │   ├── dateHelpers.js           # Date manipulation utilities
│   │   ├── id.js                    # Unique ID generation
│   │   ├── notificationManager.js   # Browser notifications
│   │   ├── timetableParser.js       # Timetable JSON parsing
│   │   └── uiHelpers.js             # UI utility functions
│   │
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles & CSS variables
│
├── docs/                         # Project documentation
│   ├── deployment/
│   ├── development/
│   ├── operations/
│   └── repository/
│
├── vite.config.js                # Vite build configuration
├── package.json                  # NPM dependencies
├── tailwind.config.js            # Tailwind CSS configuration (v4)
└── vercel.json                   # Vercel deployment config
```

### File Organization Principles

1. **Feature-Based Grouping:** Components grouped by feature (attendance/, courses/, timetable/)
2. **Shared Components:** Reusable UI components in shared/
3. **Separation of Concerns:** Business logic in utils/, presentation in components/
4. **Single Responsibility:** Each file has one clear purpose
5. **Co-location:** Related files kept together

---

## Component Architecture

### Component Hierarchy

```
App (AppContext, ThemeContext)
├── ErrorBoundary
│   ├── Header
│   │   ├── ThemeToggle
│   │   └── NotificationSettings
│   │
│   ├── SemesterSelector
│   │
│   ├── TabNavigation
│   │
│   ├── CoursesView (Tab 1)
│   │   ├── CourseCard (multiple)
│   │   │   └── CourseForm (modal)
│   │   ├── TimetableSelector (modal)
│   │   └── ConfirmModal (delete confirmation)
│   │
│   ├── AttendanceView (Tab 2)
│   │   ├── QuickMarkToday (modal)
│   │   ├── CourseHeader (multiple)
│   │   └── AttendanceTable (multiple)
│   │       └── SectionSelectorDialog (modal)
│   │
│   ├── TimetableView (Tab 3)
│   │   └── (Renders timetable.json data)
│   │
│   ├── Toast (global notification)
│   ├── Confetti (celebration effects)
│   ├── InstallPrompt (PWA install banner)
│   └── NotificationPrompt (permission request)
```

### Component Types

1. **Container Components** (Smart)
   - Connect to AppContext
   - Manage local state
   - Handle business logic
   - Examples: CoursesView, AttendanceView, TimetableView

2. **Presentational Components** (Dumb)
   - Receive data via props
   - Pure UI rendering
   - No state management
   - Examples: CourseCard, CourseHeader

3. **Modal Components**
   - Based on BaseModal foundation
   - Handles user actions/forms
   - Examples: CourseForm, ConfirmModal, TimetableSelector

4. **Utility Components**
   - Cross-cutting concerns
   - Examples: ErrorBoundary, Toast, Confetti

### Design Patterns Used

#### 1. Compound Components Pattern
```jsx
// BaseModal provides structure, children provide content
<BaseModal
  size="md"
  title="Add Course"
  footer={<Button>Submit</Button>}
>
  <FormContent />
</BaseModal>
```

#### 2. Render Props Pattern
```jsx
// ErrorBoundary wraps children with error handling
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

#### 3. Custom Hooks Pattern
```jsx
// Encapsulates localStorage logic
const [data, setData] = useLocalStorage('key', defaultValue)
```

#### 4. Context Provider Pattern
```jsx
// Provides state to component tree
<AppContext.Provider value={{ courses, addCourse, ... }}>
  <App />
</AppContext.Provider>
```

---

## State Management

### AppContext (Main Application State)

**Location:** `src/context/AppContext.jsx`
**Responsibility:** Manages all course, attendance, and semester data

**State Structure:**
```javascript
{
  // Course Management
  courses: [
    {
      id: 'unique-id',
      name: 'Operating Systems',
      code: 'CS-3001',
      creditHours: 3,
      colorHex: '#3B82F6',
      startDate: '2025-01-15',
      endDate: '2025-05-15',
      allowedAbsences: 11,
      section: 'A',
      semesterId: 'spring-2025'
    }
  ],

  // Attendance Tracking
  attendance: [
    {
      id: 'unique-id',
      courseId: 'course-id',
      date: '2025-01-20',
      status: 'absent' | 'cancelled' | 'present',
      semesterId: 'spring-2025'
    }
  ],

  // Semester Management
  semesters: [
    {
      id: 'spring-2025',
      name: 'Spring 2025',
      startDate: '2025-01-15',
      endDate: '2025-05-15',
      isActive: true
    }
  ],

  activeSemesterId: 'spring-2025'
}
```

**Key Functions:**
- `addCourse(course)` - Adds new course with validation
- `editCourse(courseId, updates)` - Updates existing course
- `deleteCourse(courseId)` - Removes course and related attendance
- `toggleSession(courseId, date, status)` - Marks attendance
- `bulkMarkAttendance(courseId, dates, status)` - Bulk attendance marking
- `changeSection(courseId, newSection)` - Changes course section
- `createSemester(semester)` - Creates new semester
- `setActiveSemester(semesterId)` - Switches active semester

**Data Persistence:**
- All state automatically saved to localStorage via `useEffect`
- Keys: `courses`, `attendance`, `semesters`, `activeSemesterId`
- Data migration logic for old formats

### ThemeContext (UI Theme State)

**Location:** `src/context/ThemeContext.jsx`
**Responsibility:** Manages light/dark mode preference

**State Structure:**
```javascript
{
  theme: 'light' | 'dark'
}
```

**Key Functions:**
- `toggleTheme()` - Switches between light and dark mode
- Detects system preference via `window.matchMedia`
- Persists to localStorage

---

## Data Flow

### 1. User Adds Course (Manual)

```
User clicks "Add Course" button
  ↓
CourseForm modal opens (BaseModal wrapper)
  ↓
User fills form & submits
  ↓
CourseForm calls AppContext.addCourse(courseData)
  ↓
AppContext validates data:
  - Duplicate course check (name + section + semester)
  - Date validation (end > start)
  - Credit hours validation (1-4)
  ↓
If valid:
  - Generate unique ID
  - Add to courses array
  - Set allowedAbsences = Math.floor(creditHours * 16 * 0.2)
  - Update localStorage
  - Trigger re-render
  ↓
CoursesView displays new course card
  ↓
Toast shows success message
  ↓
Confetti animation plays (80%+ attendance courses)
```

### 2. User Marks Attendance

```
User opens AttendanceView tab
  ↓
Sees list of courses with attendance tables
  ↓
Clicks cell for specific date
  ↓
AttendanceTable calls AppContext.toggleSession(courseId, date, status)
  ↓
AppContext:
  - Finds existing attendance record for course+date
  - If found: updates status or removes if marking present
  - If not found: creates new record with status
  - Updates localStorage
  - Triggers re-render
  ↓
AttendanceTable recalculates stats via attendanceCalculator.js:
  - Total sessions (creditHours × weeks)
  - Sessions conducted (dates with attendance records)
  - Absences count
  - Current percentage = (conducted - absences) / conducted × 100
  - Attendance status (safe/warning/danger based on thresholds)
  ↓
UI updates with new cell icon and course header color
  ↓
Toast shows undo option for 5 seconds
```

### 3. User Switches Semester

```
User clicks semester dropdown
  ↓
SemesterSelector renders list of semesters
  ↓
User selects different semester
  ↓
SemesterSelector calls AppContext.setActiveSemester(semesterId)
  ↓
AppContext:
  - Updates activeSemesterId
  - Updates localStorage
  - Triggers re-render
  ↓
All views filter data by new activeSemesterId:
  - courses.filter(c => c.semesterId === activeSemesterId)
  - attendance.filter(a => a.semesterId === activeSemesterId)
  ↓
UI shows courses/attendance only for selected semester
```

---

## Styling System

### Tailwind CSS v4 Configuration

**Approach:** Utility-first CSS with CSS variables for theming

**CSS Variable System (index.css):**
```css
@theme {
  /* Base Colors */
  --color-dark-bg: #0a0a0a;
  --color-dark-surface: #1a1a1a;
  --color-dark-surface-raised: #242424;
  --color-dark-border: #2a2a2a;

  /* Content Colors */
  --color-content-primary: #f5f5f5;
  --color-content-secondary: #a3a3a3;
  --color-content-tertiary: #737373;

  /* Accent */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;

  /* Attendance Status Colors */
  --color-attendance-safe: #10b981;
  --color-attendance-warning: #f59e0b;
  --color-attendance-danger: #ef4444;
}

/* Light Mode Overrides */
:root:has([data-theme="light"]) {
  --color-dark-bg: #ffffff;
  --color-dark-surface: #f9fafb;
  /* ... (all colors inverted) */
}
```

**Responsive Breakpoints:**
- **Default:** < 640px (mobile-first)
- **sm:** ≥ 640px (large phones, small tablets)
- **md:** ≥ 768px (tablets)
- **lg:** ≥ 1024px (desktops)

**Design Tokens:**
- Spacing: Tailwind default scale (4px increments)
- Border Radius: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px)
- Shadows: Custom `shadow-glass`, `shadow-glass-lg` for glassmorphism
- Z-Index: Hardcoded (needs standardization - see audit report)

### Component Styling Patterns

**Modal Styling (BaseModal):**
```jsx
<div className="
  w-full max-w-[96vw] sm:max-w-[540px]  /* Responsive width */
  bg-dark-surface/95 backdrop-blur-xl   /* Glassmorphism */
  border border-dark-border             /* Subtle border */
  shadow-glass-lg                        /* Elevated shadow */
  rounded-t-3xl md:rounded-2xl          /* Bottom sheet on mobile */
  max-h-[88vh]                           /* Keyboard avoidance */
">
```

**Button Styling Pattern:**
```jsx
// Primary Button
className="
  px-3 py-2.5 sm:px-4 sm:py-3           /* Responsive padding */
  bg-gradient-to-br from-accent to-accent-hover
  text-dark-bg font-semibold
  rounded-lg sm:rounded-xl
  transition-all hover:scale-[1.02] active:scale-95
  shadow-accent hover:shadow-accent-lg
"

// Secondary Button
className="
  px-3 py-2.5 sm:px-4 sm:py-3
  bg-dark-surface-raised border border-dark-border
  text-content-primary
  rounded-lg sm:rounded-xl
  hover:bg-dark-surface-hover
"
```

---

## PWA Configuration

### Service Worker (Workbox)

**Configuration:** `vite.config.js`

```javascript
VitePWA({
  registerType: 'autoUpdate',  // Auto-update on new version
  devOptions: { enabled: true }, // PWA in dev mode

  workbox: {
    // Cache Strategy: Cache First with Network Fallback
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: { cacheName: 'google-fonts-cache' }
      },
      {
        urlPattern: /\/timetable\/timetable\.json$/,
        handler: 'NetworkFirst',  // Timetable: fresh data priority
        options: { cacheName: 'timetable-cache' }
      }
    ]
  }
})
```

**Caching Strategy:**
1. **Static Assets:** Precached at install (HTML, CSS, JS, icons)
2. **Fonts:** CacheFirst (immutable)
3. **Timetable Data:** NetworkFirst (fetch new, fallback to cache)
4. **User Data:** localStorage (not cached in SW)

### Offline Functionality

- App shell cached → works offline
- Timetable data cached → viewable offline (may be stale)
- User data in localStorage → always available
- Attendance marking → works offline (localStorage)

---

## Performance Considerations

### Current Optimizations

1. **React 19 Concurrent Features**
   - Automatic batching of state updates
   - Improved rendering performance

2. **CSS-in-Tailwind (No Runtime Styles)**
   - All styles compiled at build time
   - No CSS-in-JS performance overhead

3. **LocalStorage for Data**
   - No network requests for user data
   - Instant loading

4. **Service Worker Caching**
   - Instant repeat visits
   - Offline capability

5. **Minimal Dependencies**
   - Small bundle size
   - Fast page load

### Performance Gaps (From Audit)

1. **No Code Splitting**
   - All code loads upfront
   - **Fix:** Lazy load tabs with `React.lazy()`

2. **Large AppContext File (898 lines)**
   - Could cause slower context updates
   - **Fix:** Split into custom hooks

3. **No Memoization**
   - Recalculates filtered courses/attendance on every render
   - **Fix:** Use `useMemo` for expensive calculations

4. **No Image Optimization**
   - Icons could be optimized/WebP
   - **Fix:** Use Vite image optimization plugin

---

## Future Roadmap

### Phase 1: Foundation Improvements (Q1 2026)
- Refactor TimetableSelector to use BaseModal
- Create standardized Button component
- Split AppContext into custom hooks
- Add comprehensive error boundary
- Implement toast queue system

### Phase 2: Testing & Quality (Q2 2026)
- Add unit tests for utils/ (Jest/Vitest)
- Add component tests (React Testing Library)
- Set up E2E tests (Playwright)
- Add TypeScript migration (gradual)
- Add accessibility audit & fixes

### Phase 3: Feature Enhancements (Q3 2026)
- Multi-university support (config-based)
- Timetable conflict detection
- Class reminder notifications
- GPA calculator integration
- Export attendance reports (PDF/CSV)

### Phase 4: Platform Expansion (Q4 2026)
- Desktop optimizations
- Admin panel for timetable management
- Real-time sync (optional backend)
- Analytics dashboard
- Social features (study groups, etc.)

---

## Key Architectural Strengths

1. **Mobile-First:** Optimized for primary use case (students on phones)
2. **Offline-Capable:** Works without internet via PWA
3. **Simple State Management:** Context API sufficient for current scale
4. **Clean Separation:** Business logic separate from UI
5. **Maintainable:** Well-organized file structure

## Key Architectural Weaknesses

1. **No Backend:** Limited to single-device usage (no sync)
2. **localStorage Limits:** ~10MB cap (enough for now, but not scalable)
3. **No Versioning:** Data migrations manual (no schema versioning)
4. **Monolithic Context:** AppContext too large (needs refactoring)
5. **No Testing:** Critical gap for production confidence

---

**Document Maintained By:** Development Team
**Last Updated:** November 18, 2025
**Next Review:** After Phase 1 completion

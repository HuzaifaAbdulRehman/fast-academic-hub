# 📚 Absence Tracker

**Strategic absence planning for students** - Stay above 80% attendance while planning absences smartly.

## 🎯 What Makes This Different

Traditional attendance trackers just record attendance. **This app helps you PLAN absences strategically**:

- Click a date → All classes that day marked absent
- See attendance percentages update in real-time
- Week-grouped calendar view for planning ahead
- Visual indicators (green/yellow/red) for safe planning

## ✨ Features

### 📅 **Date-Centric Attendance Table**
- Week-grouped table view (Mon-Fri only)
- Click date row → toggle ALL classes that day
- Click individual cell → override specific session
- Sticky date column with horizontal scroll
- Color-coded cells (green=present, red=absent, gray=no class)

### 📊 **Real-Time Stats**
- Attendance percentage per course
- Safe absences remaining
- Visual warnings when approaching 80% threshold
- Summary statistics in header

### 🎓 **Course Management**
- Add courses with custom schedules
- Multiple classes per week
- Set custom absence limits
- Color-coded course cards

### 💾 **Offline-First**
- All data stored locally (localStorage)
- No server required
- Works completely offline
- PWA-ready (installable on mobile)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### First Use

1. Open http://localhost:5173
2. Go to "Courses" tab
3. Click "Add Course"
4. Fill in course details (name, weekdays, dates, allowed absences)
5. Go to "Attendance" tab
6. Click date rows to mark entire days absent
7. Click individual cells to override specific sessions

## 🎨 Design

Built with **Spark Theme** - clean, minimal dark mode based on Tailwind/Vercel design systems.

**Color Coding:**
- 🟢 Safe (>85%)
- 🟡 Warning (80-85%)
- 🔴 Danger (<80%)
- ⚡ Accent (Electric Yellow #FFD600)

## 🛠️ Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI framework
- **Tailwind CSS** - Utility-first styling
- **date-fns** - Date manipulation
- **lucide-react** - Beautiful icons
- **vite-plugin-pwa** - PWA support

## 📁 Structure

```
src/
├── components/       # React components
│   ├── attendance/   # Attendance table & view
│   ├── courses/      # Course management
│   └── shared/       # Header, navigation
├── context/          # Global state
├── hooks/            # Custom hooks
├── utils/            # Helper functions
└── App.jsx           # Main app
```

## 🎮 Usage

### Mark Entire Day
Click the date row → All classes that day toggle between present/absent

### Override Individual Session
Click a specific cell → Toggle that session only

### Visual Indicators
- **✓** = All present
- **✗** = All absent
- **~** = Mixed
- **○** = No data/future

## 📱 Mobile Optimized

- Touch-friendly (44px minimum tap targets)
- Horizontal scroll for multiple courses
- Responsive design (mobile-first)
- Installable as PWA

## 🤝 Made by Students, For Students

A 5th semester university project solving a real problem: **"How do I skip classes strategically without failing?"**

---

**Built with ⚡ Vite + ⚛️ React + 🎨 Tailwind**

*Stay above 80%, plan smarter!* 📚✨

# Habitly 🔥 | Daily Habit Tracker

**CodGen Frontend Development Internship – Week 2 Project**

Habitly is a clean, modern, and responsive habit-tracking web application built with vanilla HTML5, CSS3, and JavaScript (ES6+). It helps users build consistency, maintain streaks, and stay motivated every single day without any external frameworks or complex build steps.

---

## 🌟 Live Demo & Deployment
- **GitHub Pages URL**: `https://<your-username>.github.io/habitly/`
- **Zero build step**: Runs directly in any modern web browser or via static hosting.

---

## ✨ Features Implemented (Week 2)

### 1. Habit Management
- **Add Habits**: Users can add new custom habits with any title and custom emoji icon.
- **Keyboard Support**: Pressing `Enter` in the input field instantly adds the habit.
- **Visual Emoji Selector**: 10 curated emoji pills (`💧`, `📖`, `🏃`, `🧘`, `💻`, `😴`, `🥗`, `🎯`, `🏋️`, `✍️`) with active states.
- **Validation & Inline Errors**:
  - Empty habit names are prevented with a friendly inline error message.
  - Duplicate habit names (case-insensitive) are rejected with a clear explanation.
  - Inline error disappears automatically as soon as the user begins typing.

### 2. Complete & Undo Habits
- **One-Click Completion**: Click "Complete" on any card to mark it done for today (`YYYY-MM-DD`).
- **Undo Capability**: Clicking again immediately toggles completion back to pending.
- **Dynamic Visual State**: Completed cards change accent borders, background tint, and button style to an emerald green `✓ Completed` badge.
- **Accurate Consecutive Streak Calculation**: Dynamically counts uninterrupted days up to today.

### 3. Delete Habit with Confirmation
- **Delete Button**: Each habit card features an accessible trash can button with hover highlights.
- **Confirmation Modal**: Prevents accidental deletions by presenting a custom, accessible confirmation dialog.
- **Immediate DOM Updates**: Upon confirmation, the habit is removed, stats update, and localStorage is synced instantly.

### 4. Dynamic JavaScript Rendering
- **Pure Dynamic Rendering**: Zero hard-coded habit cards in HTML. Everything renders from a clean JavaScript array of objects:
  ```javascript
  {
    id: 1,
    name: "Drink Water",
    emoji: "💧",
    completedDates: ["2026-11-25"]
  }
  ```
- **Modular Architecture**: All specified core functions are cleanly implemented:
  - `renderHabits()`
  - `createHabitCard(habit)`
  - `addHabit()`
  - `completeHabit(id)`
  - `deleteHabit(id)`
  - `updateSummary()`

### 5. Daily Progress Summary & Animated Bar
- **Key Metrics**:
  - **Done today**: Real-time counter of completed vs total habits (e.g., `3/6`).
  - **Best streak**: Highlights the highest active streak across all tracked habits.
  - **Completion rate**: Percentage of habits completed for today.
- **Animated Progress Bar**: Smooth linear gradient bar visually tracking today's progress percentage.

### 6. Empty State Handling
- When no habits exist (or all are deleted), a friendly illustration is displayed:
  > *"No habits yet! Start building better habits today."*
- Includes an **"+ Add Your First Habit"** action button that automatically focuses the input field.

### 7. Resilient Local Storage
- **Automatic Persistence**: All habits, dates, and streaks persist across browser refreshes using `localStorage`.
- **Error Handling**: Wrapped in `try / catch` blocks to handle private browsing restrictions, disabled cookies, or quota limits gracefully.
- **Safe Fallbacks**: Validates parsed JSON before using data.

### 8. Daily Motivational Quote (API + Fallback)
- **API Integration**: Fetches quotes dynamically from `https://dummyjson.com/quotes/random` using `fetch()` and `async/await`.
- **Loading State**: Displays a clean loading indicator while fetching.
- **Offline / Failure Fallback**: Gracefully catches network failures or offline modes and selects an inspiring quote from an internal fallback list.
- **Refresh Button**: Features an animated spinning "New Quote" button to fetch new inspiration on demand.

### 9. UI & UX Improvements
- **Preserved Week 1 Aesthetic**: Retained Navy (`#0B1F3A`), Teal (`#14B8A6`), clean whites, and subtle shadows.
- **Smooth Animations**: Micro-interactions on buttons, hover lifts on cards, modal pop-ins, and animated toasts.
- **Responsive Layout**: Tested across mobile (360px), tablet (768px), and desktop (1280px).
- **Reduced Motion Support**: Respects users' `prefers-reduced-motion` settings.

---

## 📁 Project File Structure

```text
habitly/
├── index.html         # Semantic HTML5 markup and dialog structures
├── style.css          # Modern CSS3 with tokens, grid, flexbox & animations
├── app.js             # Modular vanilla JS logic, state, API & storage
└── README.md          # Comprehensive documentation and guide
```

---

## 🚀 How to Run Locally

### Option 1: Direct Browser Launch (No server required)
Simply double-click `index.html` or right-click and choose **Open with Google Chrome / Microsoft Edge / Firefox**.

### Option 2: Using Python's Built-in Server
Open your terminal in the `habitly` directory and run:
```bash
python -m http.server 8000
```
Then visit: **`http://localhost:8000`** in your browser.

### Option 3: Using VS Code Live Server
1. Open the project folder in VS Code.
2. Install the **Live Server** extension if not already installed.
3. Right-click `index.html` and click **"Open with Live Server"**.

---

## 📤 GitHub Upload Instructions

If you haven't initialized your git repository yet, run the following commands in the folder containing `index.html`, `style.css`, and `app.js`:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit your changes
git commit -m "Complete Week 2: Interactive Habitly web application"

# 4. Rename default branch to main
git branch -M main

# 5. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/habitly.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 🌐 GitHub Pages Deployment Steps

1. Navigate to your repository on **GitHub.com**.
2. Click on **Settings** (tab at the top).
3. In the left navigation sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` branch and `/ (root)` folder.
   - Click **Save**.
5. Wait 1-2 minutes. Refresh the page to see your live URL:
   `https://<your-username>.github.io/habitly/`

---

## ✅ Final Testing Checklist

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| 1 | **Add a habit** | Input name, select emoji, click "Add Habit" -> card appears in grid | Pass ✅ |
| 2 | **Add habit via Enter key** | Type habit name and hit <kbd>Enter</kbd> -> habit created immediately | Pass ✅ |
| 3 | **Empty habit validation** | Click "Add Habit" with blank input -> shows "Please enter a habit name." | Pass ✅ |
| 4 | **Duplicate habit validation** | Add an existing habit -> shows friendly duplicate error message | Pass ✅ |
| 5 | **Complete habit** | Click "Complete" -> button turns green ("✓ Completed"), streak updates | Pass ✅ |
| 6 | **Undo complete habit** | Click "✓ Completed" -> returns to pending state, count decrements | Pass ✅ |
| 7 | **Delete habit** | Click trash icon -> opens confirmation dialog; confirms -> removed | Pass ✅ |
| 8 | **LocalStorage persistence** | Refresh browser -> all habits, completed states, and streaks remain | Pass ✅ |
| 9 | **Daily quote API & refresh** | Loads quote on startup; clicking "New Quote" fetches fresh quote | Pass ✅ |
| 10 | **Offline / API fallback** | If API fails or is offline, displays high-quality fallback quote | Pass ✅ |
| 11 | **Empty state** | Delete all habits -> displays friendly "No habits yet!" illustration | Pass ✅ |
| 12 | **Mobile responsiveness** | Fluid 1-column layout on phones, 2-col on tablets, 3-col on desktop | Pass ✅ |

---

Built with pride for the **CodGen Frontend Internship** | [codgen.in](https://codgen.in)

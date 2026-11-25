/**
 * Habitly - Week 2: Interactive Habit Tracker
 * CodGen Frontend Development Internship
 * 
 * Features:
 * - Dynamic habit rendering & management (Add, Complete, Delete)
 * - Daily progress tracking & streak calculations
 * - LocalStorage persistence with error handling
 * - Daily motivational quote via Fetch API with fallback
 * - Accessible UI with confirmation modal, keyboard shortcuts, and inline validation
 */

// ==========================================================
// 1. Constants & State Management
// ==========================================================

const STORAGE_KEY = 'habitly_habits_v1';

// Default habits for first-time visitors (preserving Week 1 design)
const DEFAULT_HABITS = [
  { id: 1, name: "Drink Water", emoji: "💧", completedDates: [] },
  { id: 2, name: "Read 20 Pages", emoji: "📖", completedDates: [] },
  { id: 3, name: "Morning Run", emoji: "🏃", completedDates: [] },
  { id: 4, name: "Meditate", emoji: "🧘", completedDates: [] },
  { id: 5, name: "Code Practice", emoji: "💻", completedDates: [] },
  { id: 6, name: "Sleep by 11", emoji: "😴", completedDates: [] }
];

// Offline / Fallback quotes for when API is unavailable
const FALLBACK_QUOTES = [
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { quote: "Small habits don't add up, they compound.", author: "James Clear" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" }
];

// Application state
let habits = [];
let habitPendingDeleteId = null;
let selectedEmoji = '💧';

// ==========================================================
// 2. Date & Calculation Helpers
// ==========================================================

/**
 * Returns today's local date string formatted as YYYY-MM-DD
 */
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object as YYYY-MM-DD
 */
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current active streak in consecutive days
 */
function calculateStreak(completedDates) {
  if (!Array.isArray(completedDates) || completedDates.length === 0) {
    return 0;
  }

  const today = getTodayDate();
  const dateSet = new Set(completedDates);

  let streak = 0;
  let checkDate = new Date();

  // If not completed today, check if streak was active as of yesterday
  if (!dateSet.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = formatDate(checkDate);
    if (!dateSet.has(yesterdayStr)) {
      return 0;
    }
  }

  // Count backwards day-by-day
  while (true) {
    const dStr = formatDate(checkDate);
    if (dateSet.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the best streak across all habits
 */
function getBestStreak() {
  if (habits.length === 0) return 0;
  return habits.reduce((max, h) => {
    const s = calculateStreak(h.completedDates);
    return s > max ? s : max;
  }, 0);
}

/**
 * Prevents XSS when rendering user-submitted strings into HTML
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================================
// 3. Local Storage Management (try/catch protected)
// ==========================================================

/**
 * Safely loads habits from localStorage
 */
function loadHabits() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    // First time visitor: seed default habits
    saveHabitsToStorage(DEFAULT_HABITS);
    return DEFAULT_HABITS;
  } catch (error) {
    console.error("Error loading habits from localStorage:", error);
    return DEFAULT_HABITS;
  }
}

/**
 * Safely saves habits array to localStorage
 */
function saveHabits() {
  saveHabitsToStorage(habits);
}

function saveHabitsToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving habits to localStorage:", error);
    showToast("Storage quota exceeded or unavailable", "error");
  }
}

// ==========================================================
// 4. Core Required Functions
// ==========================================================

/**
 * Creates the DOM element for an individual habit card
 * @param {Object} habit - { id, name, emoji, completedDates: [] }
 * @returns {HTMLElement} card article element
 */
function createHabitCard(habit) {
  const today = getTodayDate();
  const isCompletedToday = Array.isArray(habit.completedDates) && habit.completedDates.includes(today);
  const streak = calculateStreak(habit.completedDates);

  const card = document.createElement('article');
  card.className = `card habit-card ${isCompletedToday ? 'completed' : ''}`;
  card.setAttribute('data-id', habit.id);

  card.innerHTML = `
    <div class="habit-card-header">
      <span class="habit-emoji" aria-hidden="true">${escapeHTML(habit.emoji)}</span>
      <button 
        type="button" 
        class="btn-delete" 
        aria-label="Delete ${escapeHTML(habit.name)}" 
        title="Delete habit"
        data-action="delete"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>

    <div class="habit-card-body">
      <h3 class="habit-name">${escapeHTML(habit.name)}</h3>
      <div class="habit-badges">
        <span class="streak ${streak > 0 ? 'streak-active' : ''}" title="${streak} days in a row">
          🔥 ${streak} ${streak === 1 ? 'day' : 'days'}
        </span>
        ${isCompletedToday 
          ? `<span class="badge-status badge-done" aria-label="Status: Completed today">✓ Completed today</span>` 
          : `<span class="badge-status badge-pending" aria-label="Status: Incomplete today">Pending</span>`
        }
      </div>
    </div>

    <button 
      type="button" 
      class="btn ${isCompletedToday ? 'btn-completed' : 'btn-complete'}" 
      data-action="complete"
      aria-pressed="${isCompletedToday}"
    >
      ${isCompletedToday ? '✓ Completed' : 'Complete'}
    </button>
  `;

  // Attach event listeners
  const completeBtn = card.querySelector('[data-action="complete"]');
  completeBtn.addEventListener('click', () => completeHabit(habit.id));

  const deleteBtn = card.querySelector('[data-action="delete"]');
  deleteBtn.addEventListener('click', () => openDeleteModal(habit.id, habit.name));

  return card;
}

/**
 * Renders all habits or the empty state message
 */
function renderHabits() {
  const container = document.getElementById('habit-grid');
  const emptyState = document.getElementById('empty-state');
  
  if (!container) return;

  container.innerHTML = '';

  if (!habits || habits.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.classList.remove('hidden');

  const fragment = document.createDocumentFragment();
  habits.forEach(habit => {
    const card = createHabitCard(habit);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/**
 * Toggles completion status for a habit on the current date
 * @param {number|string} id - habit id
 */
function completeHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const today = getTodayDate();
  if (!Array.isArray(habit.completedDates)) {
    habit.completedDates = [];
  }

  const index = habit.completedDates.indexOf(today);
  const wasCompleted = index > -1;

  if (wasCompleted) {
    // Undo completion
    habit.completedDates.splice(index, 1);
    showToast(`"${habit.name}" marked incomplete`, 'info');
  } else {
    // Complete habit
    habit.completedDates.push(today);
    showToast(`"${habit.name}" completed for today! 🎉`, 'success');
  }

  saveHabits();
  renderHabits();
  updateSummary();
}

/**
 * Adds a new habit from the input form
 */
function addHabit() {
  const input = document.getElementById('habit-name-input');
  if (!input) return;

  const name = input.value.trim();

  // 1. Validation: Prevent empty habit names
  if (!name) {
    showInlineError("Please enter a habit name.");
    input.focus();
    return;
  }

  // 2. Validation: Prevent duplicate habit names (case-insensitive)
  const isDuplicate = habits.some(
    h => h.name.toLowerCase() === name.toLowerCase()
  );

  if (isDuplicate) {
    showInlineError(`A habit named "${name}" already exists!`);
    input.focus();
    return;
  }

  // Valid input: clear error
  clearInlineError();

  const newHabit = {
    id: Date.now(),
    name: name,
    emoji: selectedEmoji || '🎯',
    completedDates: []
  };

  habits.unshift(newHabit); // Add to beginning of array
  saveHabits();
  renderHabits();
  updateSummary();

  // Reset form
  input.value = '';
  input.focus();
  showToast(`Habit "${name}" created successfully!`, 'success');
}

/**
 * Deletes a habit by ID after confirmation
 * @param {number|string} id - habit id
 */
function deleteHabit(id) {
  const index = habits.findIndex(h => h.id === id);
  if (index === -1) return;

  const deletedName = habits[index].name;
  habits.splice(index, 1);

  saveHabits();
  renderHabits();
  updateSummary();

  showToast(`Habit "${deletedName}" deleted`, 'info');
}

/**
 * Updates the summary stats cards and progress bar
 */
function updateSummary() {
  const today = getTodayDate();
  const total = habits.length;

  const completedTodayCount = habits.filter(h => 
    Array.isArray(h.completedDates) && h.completedDates.includes(today)
  ).length;

  const percentage = total === 0 ? 0 : Math.round((completedTodayCount / total) * 100);
  const bestStreak = getBestStreak();

  // Update Done Today stat
  const doneTodayEl = document.getElementById('stat-done-today');
  if (doneTodayEl) {
    doneTodayEl.textContent = `${completedTodayCount}/${total}`;
  }

  // Update Best Streak stat
  const bestStreakEl = document.getElementById('stat-best-streak');
  if (bestStreakEl) {
    bestStreakEl.textContent = `${bestStreak} ${bestStreak === 1 ? 'day' : 'days'}`;
  }

  // Update Percentage stat
  const percentageEl = document.getElementById('stat-percentage');
  if (percentageEl) {
    percentageEl.textContent = `${percentage}%`;
  }

  // Update Progress Bar
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  if (progressBarFill) {
    progressBarFill.style.width = `${percentage}%`;
    progressBarFill.setAttribute('aria-valuenow', percentage);
  }
  if (progressText) {
    progressText.textContent = `${completedTodayCount} of ${total} habits completed today (${percentage}%)`;
  }
}

// ==========================================================
// 5. Delete Confirmation Modal
// ==========================================================

function openDeleteModal(id, name) {
  habitPendingDeleteId = id;
  const modal = document.getElementById('delete-modal');
  const modalNameEl = document.getElementById('delete-habit-name');
  
  if (modalNameEl) {
    modalNameEl.textContent = name;
  }

  if (modal) {
    modal.classList.remove('hidden');
    // Set focus to cancel button for accessible keyboard navigation
    const cancelBtn = document.getElementById('btn-cancel-delete');
    if (cancelBtn) cancelBtn.focus();
  }
}

function closeDeleteModal() {
  habitPendingDeleteId = null;
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function confirmDelete() {
  if (habitPendingDeleteId !== null) {
    deleteHabit(habitPendingDeleteId);
    closeDeleteModal();
  }
}

// ==========================================================
// 6. Inline Errors & Toast Notifications
// ==========================================================

function showInlineError(message) {
  const errorEl = document.getElementById('habit-error-msg');
  const input = document.getElementById('habit-name-input');
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
  if (input) {
    input.classList.add('input-error');
  }
}

function clearInlineError() {
  const errorEl = document.getElementById('habit-error-msg');
  const input = document.getElementById('habit-name-input');
  
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (input) {
    input.classList.remove('input-error');
  }
}

let toastTimeout = null;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.className = `toast toast-${type} toast-visible`;

  toastTimeout = setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3200);
}

// ==========================================================
// 7. Daily Motivational Quote (API with Fallback)
// ==========================================================

async function fetchDailyQuote() {
  const quoteTextEl = document.getElementById('quote-text');
  const quoteAuthorEl = document.getElementById('quote-author');
  const refreshBtn = document.getElementById('btn-refresh-quote');

  if (!quoteTextEl || !quoteAuthorEl) return;

  // Loading state
  quoteTextEl.textContent = "Loading daily inspiration...";
  quoteAuthorEl.textContent = "";
  if (refreshBtn) {
    refreshBtn.classList.add('spinning');
    refreshBtn.disabled = true;
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://dummyjson.com/quotes/random', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    quoteTextEl.textContent = `"${data.quote}"`;
    quoteAuthorEl.textContent = `— ${data.author}`;
  } catch (error) {
    console.warn("Could not fetch remote quote, using fallback:", error);
    // Pick random fallback quote
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    const fallback = FALLBACK_QUOTES[randomIndex];
    quoteTextEl.textContent = `"${fallback.quote}"`;
    quoteAuthorEl.textContent = `— ${fallback.author}`;
  } finally {
    if (refreshBtn) {
      refreshBtn.classList.remove('spinning');
      refreshBtn.disabled = false;
    }
  }
}

// ==========================================================
// 8. Date Header Display
// ==========================================================

function updateHeaderDate() {
  const dateEl = document.getElementById('current-date');
  if (!dateEl) return;

  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// ==========================================================
// 9. Event Listeners & Initialization
// ==========================================================

function setupEventListeners() {
  // Add habit form submission
  const addForm = document.getElementById('add-habit-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addHabit();
    });
  }

  // Clear inline error when typing
  const input = document.getElementById('habit-name-input');
  if (input) {
    input.addEventListener('input', () => {
      clearInlineError();
    });
  }

  // Emoji selection pills
  const emojiBtns = document.querySelectorAll('.emoji-option');
  emojiBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      emojiBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEmoji = btn.getAttribute('data-emoji') || '💧';
    });
  });

  // Motivational quote refresh
  const refreshQuoteBtn = document.getElementById('btn-refresh-quote');
  if (refreshQuoteBtn) {
    refreshQuoteBtn.addEventListener('click', fetchDailyQuote);
  }

  // Delete modal buttons
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
  const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
  const modalBackdrop = document.getElementById('delete-modal');

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDelete);
  }
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeDeleteModal();
      }
    });
  }

  // Keyboard shortcut: Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('delete-modal');
      if (modal && !modal.classList.contains('hidden')) {
        closeDeleteModal();
      }
    }
  });

  // Empty state "Add First Habit" button
  const emptyStateAddBtn = document.getElementById('btn-empty-add');
  if (emptyStateAddBtn && input) {
    emptyStateAddBtn.addEventListener('click', () => {
      input.focus();
    });
  }
}

// App bootstrap
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderDate();
  habits = loadHabits();
  renderHabits();
  updateSummary();
  setupEventListeners();
  fetchDailyQuote();
});

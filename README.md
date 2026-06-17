# FocusFlow: AI-Smart Study Assistant

FocusFlow is a premium, state-of-the-art study scheduling and active recall platform designed to maximize student performance and streamline syllabus coverage. Leveraging Gemini AI, it generates customized study plans, schedules spaced-repetition flashcards, and parses curriculum documents in seconds.

---

## ✨ Features

### 📅 1. AI-Powered Study Planner
*   **Intelligent Scheduling**: Generates optimized timetables based on subject difficulty, exam dates, daily study caps, and user breaks.
*   **Adaptive Scheduling**: Automatically detects missed study blocks and reschedules them to ensure exam prep stays on track.
*   **Priority Allocation**: Double-weights subjects with exams coming up within 7 days and reserves 20% of schedule blocks for review.

### 🧠 2. Spaced Repetition (SRS) & AI Flashcards
*   **AI Flashcard Generator**: Input a subject name and check syllabus chapters; Gemini generates high-quality active recall QA pairs.
*   **Interactive 3D Cards**: Beautifully animated flipping card interface (via Framer Motion) for active recall study.
*   **SM-2 Spaced Repetition**: Rate card recall using standard feedback categories (`Again`, `Hard`, `Good`, `Easy`) to automatically calculate next review intervals.
*   **Manual Creation**: Easily add custom study cards to subject decks.

### 📚 3. Multimodal Smart Syllabus Import
*   **Smart Parsing**: Import complete chapter lists instantly using Gemini Multimodal APIs.
*   **Format Freedom**: Drag-and-drop syllabus files (PDF, PNG, JPG, TXT) or copy-paste text outlines directly.
*   **Syllabus Wizard**: Preview extracted chapters, check/uncheck topics, and select integration strategies (`Append` or `Overwrite`).
*   **Progress Tracker**: Circular progress meters indicating syllabus completion levels per subject.

### 📊 4. Interactive Analytics & Dashboard
*   **Analytics Overview**: Track streak counts, best streaks, total study hours, task completion rate, and completed vs. missed slots.
*   **Recharts Visualizations**: Interactive weekly study trends, subject time distributions, and status pie charts.
*   **Focus Hub**: Refreshes daily with cognitive study hacks and motivational quotes to boost productivity.
*   **Pomodoro Desk**: Built-in customizable Pomodoro timer with progress rings and audio-alert indications.

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: React.js (Vite)
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand
*   **Animations**: Framer Motion
*   **Charts**: Recharts
*   **Icons**: Lucide React
*   **Notifications**: React Hot Toast

### Backend
*   **Runtime & Server**: Node.js & Express.js
*   **Database ORM**: Sequelize
*   **Database**: PostgreSQL
*   **LLM Client**: Axios integration with Google Gemini Developer API (`gemini-2.5-flash`)

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database instance
*   Gemini API Key (Get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/SanujTiwari/FocusFlow-AI-Smart-Study.git
cd FocusFlow-AI-Smart-Study
```

### 2. Configure Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and populate it:
   ```env
   PORT=8080
   DATABASE_URL=postgres://your_user:your_password@your_host:5432/focusflow
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_signing_secret_here
   ```
4. Start the server (Sequelize will auto-sync the PostgreSQL schemas):
   ```bash
   npm start
   ```

### 3. Configure Frontend
1. Open a new terminal in the root and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite developer server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Project Structure

```text
FocusFlow-AI-Smart-Study/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection options
│   │   ├── controllers/     # Route logic (Auth, Subjects, Schedules, Flashcards)
│   │   ├── middleware/      # JWT route protection
│   │   ├── models/          # Sequelize schemas (User, Subject, Schedule, Flashcard)
│   │   ├── routes/          # API endpoints definition
│   │   └── services/        # Gemini API prompt callers
│   └── server.js            # Node startup entry
└── frontend/
    ├── src/
    │   ├── components/      # Global widgets (PomodoroTimer)
    │   ├── layouts/         # Layout navigation sidebars & headers
    │   ├── pages/           # Page views (Dashboard, Flashcards, Subjects, Analytics, Settings)
    │   ├── services/        # Axios API handlers
    │   ├── store/           # Zustand state configs (Auth, Theme)
    │   ├── App.jsx          # Route registration
    │   └── index.css        # Global CSS classes and Tailwind directives
```

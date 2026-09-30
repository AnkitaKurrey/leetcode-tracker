# LeetCode Practice Tracker

A full-stack web application to track LeetCode problems, schedule revisions, and monitor your progress.

## Features

- **Problem Management**: Add LeetCode problems with difficulty, topics, companies, and notes
- **Revision Scheduling**: Set revision intervals (3, 7, 14, 30 days) for solved problems
- **Status Tracking**: Automatic status calculation (SOLVED, DUE, OVERDUE, REVISED)
- **Dashboard**: Overview of due/overdue problems and statistics
- **Progress Analytics**: Track progress by difficulty and revision consistency
- **Revision History**: Every revision is recorded in `revision_history`
- **Daily Reminder Job**: A midnight cron job logs a summary of due/overdue problems

## Tech Stack

### Backend
- NestJS
- TypeORM
- MySQL
- NestJS Scheduler (Cron jobs)

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router

## Quick Start

```bash
npm run setup   # installs root, backend and frontend dependencies (once)
npm run dev     # runs the API and the web app together, both with auto-reload
```

Then open http://localhost:5173. The backend restarts itself when a file in
`backend/src` changes, and the frontend hot-reloads in the browser. You only
need `.env` files in place (see below) and MySQL running.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

**Note for Windows PowerShell users**: If you encounter execution policy errors when running npm commands, you can either:
- Use `cmd /c npm <command>` instead of `npm <command>`
- Or run PowerShell as Administrator and set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (copy `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=leetcode_tracker
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Create the MySQL database:
```sql
CREATE DATABASE leetcode_tracker;
```

5. Start the backend server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, see `.env.example`):
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Add a Problem**: Click "Add Problem" to add a new LeetCode problem
2. **Mark as Solved**: Mark problems as solved when you complete them
3. **Set Revision Schedule**: Set revision intervals for solved problems
4. **View Due Problems**: Check the "Due Problems" page for problems due for revision
5. **Mark as Revised**: After revising, mark the problem as revised to update the schedule
6. **Track Progress**: View analytics and statistics on the Progress page

## API Endpoints

### Problems
- `GET /problems` - Get all problems (filters: `difficulty`, `status`, `is_solved`)
- `GET /problems/:id` - Get a single problem
- `GET /problems/:id/history` - Get the revision history of a problem
- `POST /problems` - Create a new problem (all fields optional; a `title` or a `leetcode_url` is required, and the title is derived from the URL slug when omitted)
- `PATCH /problems/:id` - Update a problem (send `next_revision_date: null` to recalculate it from the interval; setting `is_solved: false` clears the schedule)
- `DELETE /problems/:id` - Delete a problem
- `POST /problems/:id/solve` - Mark problem as solved
- `POST /problems/:id/revision` - Set revision schedule
- `POST /problems/:id/revise` - Mark problem as revised

### Revisions
- `GET /revisions/due` - Get problems due today
- `GET /revisions/overdue` - Get overdue problems
- `GET /revisions/dashboard` - Get dashboard summary

## Database Schema

The application uses two tables:
- `problems`: Stores problem information and revision schedules
- `revision_history`: One row per revision (deleted together with its problem)

All date-only fields (`solved_date`, `next_revision_date`, `last_revised_date`, `revised_date`) are `YYYY-MM-DD` strings.

## Status Calculation

Problem status is calculated on every read (it is not stored):
- `null`: Problem is not solved yet
- `SOLVED`: Solved, and either no revision is scheduled or the next revision is in the future and it has never been revised
- `DUE`: Next revision date is today
- `OVERDUE`: Next revision date has passed
- `REVISED`: Revised at least once, and the next revision is in the future

When a schedule is set, the next revision date counts from the last revision (or the solved date). If that would already be in the past, it counts from today instead so a new schedule never starts out overdue.

## License

MIT

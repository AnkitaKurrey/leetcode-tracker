# LeetCode Practice Tracker

A full-stack web application to track LeetCode problems, schedule revisions, and monitor your progress.

## Features

- **Problem Management**: Add LeetCode problems with difficulty, topics, companies, and notes
- **Revision Scheduling**: Set revision intervals (3, 7, 14, 30 days) for solved problems
- **Status Tracking**: Automatic status calculation (SOLVED, DUE, OVERDUE, REVISED)
- **Dashboard**: Overview of due/overdue problems and statistics
- **Progress Analytics**: Track progress by difficulty and revision consistency
- **Automated Reminders**: Daily cron job updates problem statuses

## Tech Stack

### Backend
- NestJS
- TypeORM
- MySQL
- NestJS Scheduler (Cron jobs)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router

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

3. Create a `.env` file in the backend directory:
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

3. Create a `.env` file in the frontend directory (optional):
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
- `GET /problems` - Get all problems (with optional filters)
- `GET /problems/:id` - Get a single problem
- `POST /problems` - Create a new problem
- `PATCH /problems/:id` - Update a problem
- `DELETE /problems/:id` - Delete a problem
- `POST /problems/:id/solve` - Mark problem as solved
- `POST /problems/:id/revision` - Set revision schedule
- `POST /problems/:id/revise` - Mark problem as revised

### Revisions
- `GET /revisions/due` - Get problems due today
- `GET /revisions/overdue` - Get overdue problems
- `GET /revisions/dashboard` - Get dashboard summary

## Database Schema

The application uses two main tables:
- `problems`: Stores problem information and revision schedules
- `revision_history`: (Optional) Tracks revision history

## Status Calculation

Problem status is automatically calculated based on:
- `SOLVED`: Problem is solved but revision not yet due
- `DUE`: Revision date is today
- `OVERDUE`: Revision date has passed
- `REVISED`: Problem was revised on or before due date

## License

MIT

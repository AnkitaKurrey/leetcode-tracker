import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error interceptor for better debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

export const ProblemStatus = {
  SOLVED: 'SOLVED',
  DUE: 'DUE',
  OVERDUE: 'OVERDUE',
  REVISED: 'REVISED',
} as const;

export type ProblemStatus = typeof ProblemStatus[keyof typeof ProblemStatus];

export interface Problem {
  id: number;
  title: string;
  leetcode_url: string | null;
  difficulty: Difficulty | null;
  topics: string[] | null;
  companies: string[] | null;
  notes: string | null;
  is_solved: boolean;
  /** YYYY-MM-DD */
  solved_date: string | null;
  revision_interval_days: number | null;
  /** YYYY-MM-DD */
  next_revision_date: string | null;
  /** YYYY-MM-DD */
  last_revised_date: string | null;
  revision_count: number;
  created_at: string;
  updated_at: string;
  status: ProblemStatus | null;
}

export interface CreateProblemDto {
  /** A title or a LeetCode URL is required; the title is derived from the URL if omitted. */
  title?: string | null;
  leetcode_url?: string | null;
  difficulty?: Difficulty | null;
  topics?: string[];
  companies?: string[];
  notes?: string;
  is_solved?: boolean;
  /** YYYY-MM-DD */
  solved_date?: string | null;
  revision_interval_days?: number | null;
  /** YYYY-MM-DD. Send null to auto-calculate from revision_interval_days. */
  next_revision_date?: string | null;
}

export type UpdateProblemDto = Partial<CreateProblemDto>;

export interface RevisionHistoryEntry {
  id: number;
  problem_id: number;
  revised_date: string;
  status: 'REVISED' | 'SKIPPED';
  notes: string | null;
  created_at: string;
}

/** Extract a human-readable message from an API error. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join('. ')
        : data.message;
    }
    if (!error.response) {
      return 'Cannot reach the backend. Is the server running?';
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Unexpected error';
}

export interface DashboardSummary {
  stats: {
    total: number;
    solved: number;
    due: number;
    overdue: number;
    byDifficulty: {
      EASY: number;
      MEDIUM: number;
      HARD: number;
    };
  };
  dueProblems: Problem[];
  overdueProblems: Problem[];
}

/** How a revision went: 'easy' skips a rung of the schedule, 'hard' restarts it. */
export type ReviseResult = 'easy' | 'ok' | 'hard';

export const problemsApi = {
  getAll: async (filters?: {
    difficulty?: string;
    status?: string;
    is_solved?: boolean;
  }): Promise<Problem[]> => {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.is_solved !== undefined)
      params.append('is_solved', filters.is_solved.toString());
    const response = await api.get<Problem[]>(`/problems?${params}`);
    return response.data;
  },

  getOne: async (id: number): Promise<Problem> => {
    const response = await api.get<Problem>(`/problems/${id}`);
    return response.data;
  },

  getHistory: async (id: number): Promise<RevisionHistoryEntry[]> => {
    const response = await api.get<RevisionHistoryEntry[]>(
      `/problems/${id}/history`,
    );
    return response.data;
  },

  create: async (data: CreateProblemDto): Promise<Problem> => {
    const response = await api.post<Problem>('/problems', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProblemDto): Promise<Problem> => {
    const response = await api.patch<Problem>(`/problems/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/problems/${id}`);
  },

  markAsSolved: async (id: number): Promise<Problem> => {
    const response = await api.post<Problem>(`/problems/${id}/solve`);
    return response.data;
  },

  setRevisionSchedule: async (
    id: number,
    intervalDays: number,
  ): Promise<Problem> => {
    const response = await api.post<Problem>(`/problems/${id}/revision`, {
      interval_days: intervalDays,
    });
    return response.data;
  },

  markAsRevised: async (id: number, result: ReviseResult = 'ok'): Promise<Problem> => {
    const response = await api.post<Problem>(`/problems/${id}/revise`, { result });
    return response.data;
  },
};

export const revisionsApi = {
  getDue: async (): Promise<Problem[]> => {
    const response = await api.get<Problem[]>('/revisions/due');
    return response.data;
  },

  getOverdue: async (): Promise<Problem[]> => {
    const response = await api.get<Problem[]>('/revisions/overdue');
    return response.data;
  },

  getDashboard: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/revisions/dashboard');
    return response.data;
  },
};

export default api;

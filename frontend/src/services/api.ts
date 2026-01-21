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
  leetcode_url: string;
  difficulty: Difficulty;
  topics: string[];
  companies: string[];
  notes?: string;
  is_solved: boolean;
  solved_date?: string;
  revision_interval_days?: number;
  next_revision_date?: string;
  last_revised_date?: string;
  revision_count: number;
  created_at: string;
  updated_at: string;
  status?: ProblemStatus | null;
}

export interface CreateProblemDto {
  title: string;
  leetcode_url: string;
  difficulty: Difficulty;
  topics?: string[];
  companies?: string[];
  notes?: string;
  is_solved?: boolean;
  solved_date?: string;
}

export interface UpdateProblemDto {
  title?: string;
  leetcode_url?: string;
  difficulty?: Difficulty;
  topics?: string[];
  companies?: string[];
  notes?: string;
  is_solved?: boolean;
  solved_date?: string;
  revision_interval_days?: number;
  next_revision_date?: string;
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

  markAsRevised: async (id: number): Promise<Problem> => {
    const response = await api.post<Problem>(`/problems/${id}/revise`);
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

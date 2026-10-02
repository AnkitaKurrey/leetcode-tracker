import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsApi, revisionsApi } from '../services/api';
import type {
  CreateProblemDto,
  UpdateProblemDto,
  DashboardSummary,
  ReviseResult,
} from '../services/api';

export interface ProblemFilters {
  difficulty?: string;
  status?: string;
  is_solved?: boolean;
}

export const useProblems = (filters?: ProblemFilters) => {
  return useQuery({
    queryKey: ['problems', filters],
    queryFn: () => problemsApi.getAll(filters),
  });
};

export const useProblem = (id: number) => {
  return useQuery({
    queryKey: ['problems', id],
    queryFn: () => problemsApi.getOne(id),
    enabled: !!id,
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProblemDto) => problemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProblemDto }) =>
      problemsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problems', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => problemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });
};

export const useMarkAsSolved = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => problemsApi.markAsSolved(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });
};

export const useSetRevisionSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, intervalDays }: { id: number; intervalDays: number }) =>
      problemsApi.setRevisionSchedule(id, intervalDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });
};

export const useMarkAsRevised = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, result }: { id: number; result?: ReviseResult }) =>
      problemsApi.markAsRevised(id, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
    },
  });
};

export const useDashboard = () => {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard'],
    queryFn: () => revisionsApi.getDashboard(),
  });
};

export const useDueProblems = () => {
  return useQuery({
    queryKey: ['revisions', 'due'],
    queryFn: () => revisionsApi.getDue(),
  });
};

export const useOverdueProblems = () => {
  return useQuery({
    queryKey: ['revisions', 'overdue'],
    queryFn: () => revisionsApi.getOverdue(),
  });
};

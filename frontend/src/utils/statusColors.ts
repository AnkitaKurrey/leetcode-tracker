import { ProblemStatus } from '../services/api';

export const getStatusColor = (status: ProblemStatus | null | undefined): string => {
  if (!status) return 'bg-gray-200 text-gray-800';

  switch (status) {
    case ProblemStatus.SOLVED:
      return 'bg-green-100 text-green-800';
    case ProblemStatus.DUE:
      return 'bg-yellow-100 text-yellow-800';
    case ProblemStatus.OVERDUE:
      return 'bg-red-100 text-red-800';
    case ProblemStatus.REVISED:
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'EASY':
      return 'bg-green-100 text-green-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HARD':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

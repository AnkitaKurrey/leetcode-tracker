import { useState } from 'react';
import { useProblems } from '../hooks/useProblems';
import { Difficulty, ProblemStatus as PS } from '../services/api';
import ProblemCard from './ProblemCard';
import ProblemForm from './ProblemForm';

export default function ProblemList() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [solvedFilter, setSolvedFilter] = useState<string>('');

  const filters: any = {};
  if (difficultyFilter) filters.difficulty = difficultyFilter;
  if (statusFilter) filters.status = statusFilter;
  if (solvedFilter !== '') {
    filters.is_solved = solvedFilter === 'true';
  }

  const { data: problems, isLoading, error } = useProblems(filters);

  const filteredProblems = problems?.filter((problem) => {
    if (statusFilter && problem.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Problems</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Problem
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value={PS.SOLVED}>Solved</option>
              <option value={PS.DUE}>Due</option>
              <option value={PS.OVERDUE}>Overdue</option>
              <option value={PS.REVISED}>Revised</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solved Status
            </label>
            <select
              value={solvedFilter}
              onChange={(e) => setSolvedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Solved</option>
              <option value="false">Not Solved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading problems. Please try again.
        </div>
      )}

      {/* Problems List */}
      {!isLoading && !error && (
        <>
          {filteredProblems && filteredProblems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredProblems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">
                No problems found. Add your first problem to get started!
              </p>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <ProblemForm onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

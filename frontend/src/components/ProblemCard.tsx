import type { Problem, ProblemStatus } from '../services/api';
import { ProblemStatus as PS } from '../services/api';
import { getStatusColor, getDifficultyColor } from '../utils/statusColors';
import { formatDate } from '../utils/dateFormatter';
import { useMarkAsSolved, useSetRevisionSchedule, useMarkAsRevised, useDeleteProblem } from '../hooks/useProblems';
import { useState } from 'react';
import ProblemForm from './ProblemForm';

interface ProblemCardProps {
  problem: Problem;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [revisionDays, setRevisionDays] = useState(7);

  const markAsSolved = useMarkAsSolved();
  const setRevision = useSetRevisionSchedule();
  const markAsRevised = useMarkAsRevised();
  const deleteProblem = useDeleteProblem();

  const handleSetRevision = () => {
    setRevision.mutate(
      { id: problem.id, intervalDays: revisionDays },
      {
        onSuccess: () => {
          setShowRevisionModal(false);
        },
      },
    );
  };

  const handleMarkAsRevised = () => {
    markAsRevised.mutate(problem.id);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <a
                href={problem.leetcode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-900 hover:text-blue-600"
              >
                {problem.title}
              </a>
              {problem.status && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                    problem.status as ProblemStatus,
                  )}`}
                >
                  {problem.status}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                  problem.difficulty,
                )}`}
              >
                {problem.difficulty}
              </span>
              {problem.topics && problem.topics.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {problem.topics.slice(0, 3).map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                  {problem.topics.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{problem.topics.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {problem.companies && problem.companies.length > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Companies: {problem.companies.join(', ')}
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-1">
              {problem.is_solved && problem.solved_date && (
                <div>Solved: {formatDate(problem.solved_date)}</div>
              )}
              {problem.next_revision_date && (
                <div>
                  Next revision: {formatDate(problem.next_revision_date)}
                </div>
              )}
              {problem.revision_count > 0 && (
                <div>Revised {problem.revision_count} time(s)</div>
              )}
            </div>

            {problem.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                {problem.notes}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!problem.is_solved && (
            <button
              onClick={() => markAsSolved.mutate(problem.id)}
              disabled={markAsSolved.isPending}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Solved
            </button>
          )}

          {problem.is_solved && !problem.revision_interval_days && (
            <button
              onClick={() => setShowRevisionModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Set Revision Schedule
            </button>
          )}

          {(problem.status === PS.DUE ||
            problem.status === PS.OVERDUE) && (
            <button
              onClick={handleMarkAsRevised}
              disabled={markAsRevised.isPending}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Mark as Revised
            </button>
          )}

          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Edit
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this problem?')) {
                deleteProblem.mutate(problem.id);
              }
            }}
            disabled={deleteProblem.isPending}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Set Revision Schedule</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revision Interval (days)
              </label>
              <input
                type="number"
                min="1"
                value={revisionDays}
                onChange={(e) => setRevisionDays(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setRevisionDays(3)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  3 days
                </button>
                <button
                  onClick={() => setRevisionDays(7)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  7 days
                </button>
                <button
                  onClick={() => setRevisionDays(14)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  14 days
                </button>
                <button
                  onClick={() => setRevisionDays(30)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  30 days
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSetRevision}
                disabled={setRevision.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Set Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <ProblemForm
          problem={problem}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

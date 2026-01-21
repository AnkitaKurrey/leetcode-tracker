import { useState, useEffect } from 'react';
import type { Problem, CreateProblemDto, UpdateProblemDto } from '../services/api';
import { Difficulty } from '../services/api';
import { useCreateProblem, useUpdateProblem } from '../hooks/useProblems';

interface ProblemFormProps {
  problem?: Problem;
  onClose: () => void;
}

export default function ProblemForm({ problem, onClose }: ProblemFormProps) {
  const [formData, setFormData] = useState<CreateProblemDto | UpdateProblemDto>({
    title: problem?.title || '',
    leetcode_url: problem?.leetcode_url || '',
    difficulty: problem?.difficulty || Difficulty.EASY,
    topics: problem?.topics || [],
    companies: problem?.companies || [],
    notes: problem?.notes || '',
    is_solved: problem?.is_solved || false,
    solved_date: problem?.solved_date || undefined,
    revision_interval_days: problem?.revision_interval_days || undefined,
    next_revision_date: problem?.next_revision_date || undefined,
  });

  const [topicsInput, setTopicsInput] = useState(
    problem?.topics?.join(', ') || '',
  );
  const [companiesInput, setCompaniesInput] = useState(
    problem?.companies?.join(', ') || '',
  );

  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem();

  useEffect(() => {
    if (topicsInput) {
      setFormData((prev) => ({
        ...prev,
        topics: topicsInput.split(',').map((t) => t.trim()).filter(Boolean),
      }));
    }
  }, [topicsInput]);

  useEffect(() => {
    if (companiesInput) {
      setFormData((prev) => ({
        ...prev,
        companies: companiesInput.split(',').map((c) => c.trim()).filter(Boolean),
      }));
    }
  }, [companiesInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem) {
      updateProblem.mutate(
        { id: problem.id, data: formData },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createProblem.mutate(formData as CreateProblemDto, {
        onSuccess: () => {
          onClose();
          setFormData({
            title: '',
            leetcode_url: '',
            difficulty: Difficulty.EASY,
            topics: [],
            companies: [],
            notes: '',
            is_solved: false,
          });
          setTopicsInput('');
          setCompaniesInput('');
        },
      });
    }
  };

  const isLoading = createProblem.isPending || updateProblem.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {problem ? 'Edit Problem' : 'Add Problem'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LeetCode URL *
            </label>
            <input
              type="url"
              required
              value={formData.leetcode_url}
              onChange={(e) =>
                setFormData({ ...formData, leetcode_url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty: e.target.value as Difficulty,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g., Arrays, Dynamic Programming, Graphs"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Companies (comma-separated)
            </label>
            <input
              type="text"
              value={companiesInput}
              onChange={(e) => setCompaniesInput(e.target.value)}
              placeholder="e.g., Google, Amazon, Microsoft"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_solved"
              checked={formData.is_solved || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_solved: e.target.checked,
                  solved_date: e.target.checked
                    ? new Date().toISOString().split('T')[0]
                    : undefined,
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_solved" className="ml-2 text-sm text-gray-700">
              Mark as solved
            </label>
          </div>

          {formData.is_solved && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solved Date
                </label>
                <input
                  type="date"
                  value={
                    formData.solved_date
                      ? new Date(formData.solved_date).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      solved_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {problem && (problem.revision_interval_days || formData.revision_interval_days) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Revision Date
                  </label>
                  <input
                    type="date"
                    value={
                      formData.next_revision_date
                        ? new Date(formData.next_revision_date).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        next_revision_date: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to auto-calculate based on revision interval
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : problem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

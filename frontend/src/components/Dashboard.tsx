import { useDashboard } from '../hooks/useProblems';
import { Link } from 'react-router-dom';
import { getDifficultyColor } from '../utils/statusColors';
import { formatDate } from '../utils/dateFormatter';

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error loading dashboard';
    const isNetworkError = errorMessage.includes('Network') || 
                          errorMessage.includes('ECONNREFUSED') ||
                          errorMessage.includes('Failed to fetch');

    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <h3 className="font-semibold mb-2">Error loading dashboard</h3>
        <p className="text-sm mb-2">{errorMessage}</p>
        {isNetworkError && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <p className="font-semibold mb-1">Connection Error Detected</p>
            <p>Please make sure:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>The backend server is running on port 3000</li>
              <li>MySQL database is configured and running</li>
              <li>CORS is properly configured in the backend</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const { stats, dueProblems, overdueProblems } = dashboard;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Problems</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.total}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Solved</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {stats.solved}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Due Today</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.due}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Overdue</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Solved by Difficulty
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Easy</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.byDifficulty.EASY}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Medium</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byDifficulty.MEDIUM}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Hard</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.byDifficulty.HARD}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Problems */}
      {overdueProblems.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Overdue Problems ({overdueProblems.length})
            </h2>
            <Link
              to="/due"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {overdueProblems.slice(0, 5).map((problem) => (
              <div
                key={problem.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div className="flex-1">
                  <a
                    href={problem.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {problem.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                        problem.difficulty,
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                    {problem.next_revision_date && (
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(problem.next_revision_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Today Problems */}
      {dueProblems.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Due Today ({dueProblems.length})
            </h2>
            <Link
              to="/due"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {dueProblems.slice(0, 5).map((problem) => (
              <div
                key={problem.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
              >
                <div className="flex-1">
                  <a
                    href={problem.leetcode_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {problem.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                        problem.difficulty,
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overdueProblems.length === 0 && dueProblems.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No problems due or overdue. Great job! 🎉
        </div>
      )}
    </div>
  );
}

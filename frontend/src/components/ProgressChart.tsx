import { useDashboard, useProblems } from '../hooks/useProblems';

export default function ProgressChart() {
  const { data: dashboard } = useDashboard();
  const { data: problems } = useProblems();

  if (!dashboard || !problems) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { stats } = dashboard;
  const solvedProblems = problems.filter((p) => p.is_solved);

  // Calculate revision consistency
  const problemsWithRevisions = solvedProblems.filter(
    (p) => p.revision_count > 0,
  );
  const revisionRate =
    solvedProblems.length > 0
      ? (problemsWithRevisions.length / solvedProblems.length) * 100
      : 0;

  // Calculate average revisions per problem
  const totalRevisions = solvedProblems.reduce(
    (sum, p) => sum + (p.revision_count || 0),
    0,
  );
  const avgRevisions =
    solvedProblems.length > 0 ? totalRevisions / solvedProblems.length : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Progress & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Difficulty Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Solved by Difficulty
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-green-600">Easy</span>
                <span className="text-sm text-gray-600">
                  {stats.byDifficulty.EASY}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-600 h-4 rounded-full"
                  style={{
                    width: `${
                      stats.solved > 0
                        ? (stats.byDifficulty.EASY / stats.solved) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-yellow-600">
                  Medium
                </span>
                <span className="text-sm text-gray-600">
                  {stats.byDifficulty.MEDIUM}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-yellow-600 h-4 rounded-full"
                  style={{
                    width: `${
                      stats.solved > 0
                        ? (stats.byDifficulty.MEDIUM / stats.solved) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-red-600">Hard</span>
                <span className="text-sm text-gray-600">
                  {stats.byDifficulty.HARD}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-600 h-4 rounded-full"
                  style={{
                    width: `${
                      stats.solved > 0
                        ? (stats.byDifficulty.HARD / stats.solved) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Revision Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Revision Statistics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Revision Rate</div>
              <div className="text-3xl font-bold text-blue-600">
                {revisionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {problemsWithRevisions.length} of {solvedProblems.length}{' '}
                problems revised
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">
                Average Revisions
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {avgRevisions.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Revisions per solved problem
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Revisions</div>
              <div className="text-3xl font-bold text-indigo-600">
                {totalRevisions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Overall Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Problems</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Solved</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.solved}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Due Today</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.due}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

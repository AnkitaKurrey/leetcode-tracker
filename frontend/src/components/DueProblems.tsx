import { useDueProblems, useOverdueProblems } from '../hooks/useProblems';
import ProblemCard from './ProblemCard';

export default function DueProblems() {
  const {
    data: dueProblems,
    isLoading: dueLoading,
    error: dueError,
  } = useDueProblems();
  const {
    data: overdueProblems,
    isLoading: overdueLoading,
    error: overdueError,
  } = useOverdueProblems();

  const isLoading = dueLoading || overdueLoading;
  const error = dueError || overdueError;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Due Problems</h1>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Error loading problems. Please try again.
        </div>
      )}

      {/* Overdue Section */}
      {overdueProblems && overdueProblems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Overdue ({overdueProblems.length})
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {overdueProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      {dueProblems && dueProblems.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-yellow-600 mb-4">
            Due Today ({dueProblems.length})
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {dueProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </div>
      )}

      {!isLoading &&
        (!overdueProblems || overdueProblems.length === 0) &&
        (!dueProblems || dueProblems.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              No problems due or overdue. Great job! 🎉
            </p>
          </div>
        )}
    </div>
  );
}

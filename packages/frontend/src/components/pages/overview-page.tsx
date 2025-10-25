import { DashboardLayout } from '../dashboard-layout';

export function OverviewPage() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="text-sm font-medium text-gray-400 mb-2">
            Active Tunnels
          </div>
          <div className="text-3xl font-bold text-white">0</div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="text-sm font-medium text-gray-400 mb-2">
            Total Requests
          </div>
          <div className="text-3xl font-bold text-white">0</div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="text-sm font-medium text-gray-400 mb-2">
            Bandwidth Used
          </div>
          <div className="text-3xl font-bold text-white">0 GB</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No active tunnels
          </h3>
          <p className="text-gray-400 mb-6">
            Get started by creating your first tunnel
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Create Tunnel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

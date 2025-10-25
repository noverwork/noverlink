import { DashboardLayout } from '../dashboard-layout';

export function TunnelsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Tunnels</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
          Create Tunnel
        </button>
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No tunnels configured
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first tunnel to start forwarding traffic
          </p>
        </div>

        {/* Tunnel List Placeholder */}
        <div className="mt-8 text-left">
          <div className="text-sm font-medium text-gray-300 mb-4">
            When you create tunnels, they will appear here with:
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              Tunnel name and status
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              Public URL
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              Local port forwarding
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              Connection metrics
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Noverlink</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-white border-r border-gray-200">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-900 bg-gray-100 rounded-md font-medium"
                >
                  Overview
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Tunnels
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Dashboard
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Active Tunnels
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Total Requests
                </div>
                <div className="text-3xl font-bold text-gray-900">0</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Bandwidth Used
                </div>
                <div className="text-3xl font-bold text-gray-900">0 GB</div>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No active tunnels
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first tunnel
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                  Create Tunnel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

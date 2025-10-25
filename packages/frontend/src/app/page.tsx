export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Noverlink
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Tailwind CSS v4 and shadcn/ui are now configured and ready to use!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-blue-900 mb-2">Tailwind v4</h3>
              <p className="text-sm text-blue-700">
                Using the latest @tailwindcss/postcss plugin with modern configuration
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-purple-900 mb-2">shadcn/ui</h3>
              <p className="text-sm text-purple-700">
                Component library configured and ready to add components
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-green-900 mb-2">Next.js 15</h3>
              <p className="text-sm text-green-700">
                App router with React 19 and modern tooling
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Next Steps
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <span>Add shadcn components: <code className="bg-gray-100 px-2 py-1 rounded text-sm">npx shadcn@latest add button</code></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <span>Start building your tunnel control panel</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">→</span>
              <span>Integrate with the NestJS backend</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

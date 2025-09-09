export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Test Page - Funziona!
        </h1>
        <p className="text-gray-600">
          Se vedi questa pagina, Next.js funziona correttamente.
        </p>
        <div className="mt-4">
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Vai alla Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

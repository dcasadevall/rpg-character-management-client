import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-5xl font-bold mb-6">Welcome to DnD Character Manager</h1>
      <p className="text-xl mb-8">Create, manage, and visualize your DnD characters with ease</p>

      <div className="flex gap-6">
        <Link
          href="/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Character
        </Link>
        <Link
          href="/characters"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          View Your Characters
        </Link>
      </div>
    </div>
  );
}

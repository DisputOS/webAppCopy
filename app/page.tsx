import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Disput.ai</h1>
      <Link href="/cases/new" className="px-4 py-2 bg-blue-600 text-white rounded">Створити диспут</Link>
    </main>
  );
}

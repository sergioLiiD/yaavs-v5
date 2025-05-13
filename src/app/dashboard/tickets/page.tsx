'use client';

import { TicketsTable } from './components/TicketsTable';

export default function TicketsPage() {
  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Tickets</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <TicketsTable />
        </div>
      </main>
    </div>
  );
} 
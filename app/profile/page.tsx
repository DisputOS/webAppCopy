'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';

export default function ProfilePage() {
  const [showPlans, setShowPlans] = useState(false);
  const router = useRouter();

  const handleSelectPlan = (plan: string) => {
    console.log(`User selected: ${plan}`);
    setShowPlans(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white font-mono p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 max-w-lg">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-white font-medium">user@example.com</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Plan</p>
          <p className="text-white font-medium">Free</p>
        </div>

        <button
          onClick={() => setShowPlans(true)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition w-full"
        >
          Upgrade Plan
        </button>

        <button
          onClick={() => router.push('/cases/archived')}
          className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition w-full"
        >
          View Archived Disputes
        </button>
      </div>

      {showPlans && (
        <Modal onClose={() => setShowPlans(false)}>
          <h2 className="text-xl font-bold mb-4">Choose a Plan</h2>
          <ul className="space-y-4">
            {[
              { name: 'Pro', desc: 'Unlimited disputes, priority support' },
              { name: 'Business', desc: 'Team access, analytics, export' },
              { name: 'Enterprise', desc: 'Custom SLA & integrations' },
            ].map((plan) => (
              <li key={plan.name} className="space-y-1">
                <p className="text-lg font-semibold">{plan.name}</p>
                <p className="text-sm text-gray-400">{plan.desc}</p>
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className="mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded"
                >
                  Select {plan.name}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </main>
  );
}

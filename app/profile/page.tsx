'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Modal from '@/components/Modal';
import ArchivedDisputesModal from '@/components/ArchivedDisputesModal';
import Header from '@/components/Header';

export default function ProfilePage() {
  const [showPlans, setShowPlans] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error) setUserData(data);
    };

    loadUserData();
  }, [session, supabase]);

  const handleSelectPlan = (plan: string) => {
    console.log(`User selected: ${plan}`);
    setShowPlans(false);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen  p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 max-w-lg">
          {!userData ? (
            <p className="text-gray-400 text-sm">Loading user data...</p>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-white font-medium">{userData.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-white font-medium">{userData.username ?? '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-white font-medium">
                  {userData.plan ?? 'Free'}{' '}
                  {userData.plan === 'Pro' && (
                    <span className="text-green-500 text-xs ml-2">✓ Pro Member</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="text-white font-medium">
                  {new Date(userData.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-500">Country / Language / Timezone</p>
                <p className="text-white font-medium">
                  {userData.country_code ?? '—'} / {userData.language_code ?? '—'} /{' '}
                  {userData.timezone ?? '—'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subscription Status</p>
                <p className="text-white font-medium">
                  {userData.subscription_status ?? 'None'}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-500">Stats</p>
                <p className="text-white font-medium">
                  {userData.disputes_count ?? 0} disputes,{' '}
                  {userData.proof_bundle_count ?? 0} proofs
                </p>
              </div>

              {userData.fraud_flag && (
                <div className="bg-red-900 text-red-300 text-sm p-3 rounded border border-red-700">
                  ⚠️ This account has been flagged for review.
                </div>
              )}

              {userData.pdf_trust_rate && (
                <div>
                  <p className="text-sm text-gray-500">PDF Trust Rate</p>
                  <p className="text-white font-medium">
                    {(userData.pdf_trust_rate * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowPlans(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition w-full"
              >
                Upgrade Plan
              </button>

              <button
                onClick={() => setShowArchived(true)}
                className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition w-full"
              >
                View Archived Disputes
              </button>
            </>
          )}
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

        {showArchived && (
          <ArchivedDisputesModal onClose={() => setShowArchived(false)} />
        )}
      </main>
    </>
  );
}

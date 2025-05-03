'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@supabase/auth-helpers-react';

export default function SettingsPage() {
  const session = useSession();
  const [showPayment, setShowPayment] = useState(false);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 font-mono">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold">Settings</h1>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Billing & Payment</h2>
          <p className="text-sm text-gray-400 mb-4">
            Add or update your payment method to subscribe to Pro or Business plans.
          </p>
          <Button onClick={() => setShowPayment(true)}>Add Payment Method</Button>

          {showPayment && (
            <div className="mt-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-sm mb-2 text-gray-300">Stripe integration coming soon...</p>
              <p className="text-xs text-gray-500">
                This will allow you to securely add your card and manage billing through Stripe.
              </p>
            </div>
          )}
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Field Documentation</h2>

          <div className="text-sm text-gray-300 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">🔐 Identification</h3>
              <ul className="list-disc pl-6 text-gray-400">
                <li><strong>id</strong>: Primary key from auth.users</li>
                <li><strong>email</strong>: Cached for fast UI</li>
                <li><strong>telegram_id</strong>: Link to bot</li>
                <li><strong>username</strong>: Display name</li>
                <li><strong>auth_provider</strong>: email, Google, Telegram</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">⚖️ Legal / Risk Engine</h3>
              <ul className="list-disc pl-6 text-gray-400">
                <li><strong>country_code</strong>, <strong>jurisdiction_flag</strong></li>
                <li><strong>legal_escalation_required</strong>, <strong>fraud_flag</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">🤖 AI Preferences</h3>
              <ul className="list-disc pl-6 text-gray-400">
                <li><strong>plan</strong>: free / trial / pro</li>
                <li><strong>ai_response_tone_preference</strong>: strict / soft / auto</li>
                <li><strong>language_code</strong>, <strong>timezone</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">📊 Stats</h3>
              <ul className="list-disc pl-6 text-gray-400">
                <li><strong>disputes_count</strong>, <strong>proof_bundle_count</strong></li>
                <li><strong>archive_backup_completed</strong></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">🔌 Integrations</h3>
              <ul className="list-disc pl-6 text-gray-400">
                <li><strong>subscription_id</strong>, <strong>subscription_status</strong></li>
                <li><strong>connected_email_inbox</strong>, <strong>webhook_urls</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <p className="text-xs text-gray-500 text-center">
          public.users is your enhanced user model powering AI, Legal UX & Billing.
        </p>
      </div>
    </main>
  );
}

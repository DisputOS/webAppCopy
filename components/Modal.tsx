'use client';

import { ReactNode } from 'react';

export default function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Upgrade Your Plan</h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              name: 'Free',
              price: '€0/mo',
              features: ['1 active dispute', 'Community support'],
              highlight: false,
            },
            {
              name: 'Pro',
              price: '€9.99/mo',
              features: ['Unlimited disputes', 'Priority support', 'PDF export'],
              highlight: true,
            },
            {
              name: 'Business',
              price: '€29.99/mo',
              features: ['Team collaboration', 'Audit logs', 'Custom templates'],
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-5 border ${
                plan.highlight
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-xl font-bold text-white mb-3">{plan.price}</p>
              <ul className="text-sm text-gray-300 space-y-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <button
                onClick={() => {
                  alert(`You selected ${plan.name}`);
                  onClose();
                }}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

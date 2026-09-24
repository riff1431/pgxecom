"use client";

import { StripeSettingsTab } from "../components/StripeSettingsTab";

export default function AdminPaymentSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono uppercase">
          Payment (Stripe) Settings
        </h1>
        <p className="text-slate-400 font-medium text-xs mt-1">
          Manage Stripe API keys, test and live environment profiles, webhook secrets, and test connection balances.
        </p>
      </div>

      <StripeSettingsTab />
    </div>
  );
}

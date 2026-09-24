"use client";

import { SmtpSettingsTab } from "../components/SmtpSettingsTab";

export default function AdminSmtpSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono uppercase">
          Email (SMTP) Settings
        </h1>
        <p className="text-slate-400 font-medium text-xs mt-1">
          Configure dynamic SMTP email delivery, credentials encryption, and test live outgoing mail.
        </p>
      </div>

      <SmtpSettingsTab />
    </div>
  );
}

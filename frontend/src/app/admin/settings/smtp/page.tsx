import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SmtpSettingsTab } from "../components/SmtpSettingsTab";

export default function AdminSmtpSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Email (SMTP) Settings"
        description="Configure dynamic SMTP email delivery, credentials encryption, and test live outgoing mail."
      />

      <SmtpSettingsTab />
    </div>
  );
}

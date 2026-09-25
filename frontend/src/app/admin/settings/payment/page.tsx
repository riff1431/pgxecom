import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StripeSettingsTab } from "../components/StripeSettingsTab";

export default function AdminPaymentSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Payment (Stripe) Settings"
        description="Manage Stripe API keys, test and live environment profiles, webhook secrets, and test connection balances."
      />

      <StripeSettingsTab />
    </div>
  );
}

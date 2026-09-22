import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { StorefrontSettingsGate } from "@/components/storefront/StorefrontSettingsGate";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { StoreSettingsProvider } from "@/providers/StoreSettingsProvider";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsProvider>
      <StorefrontSettingsGate>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </div>
      </StorefrontSettingsGate>
    </StoreSettingsProvider>
  );
}

"use client";

import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { withPrivateRoute } from "@/helpers/with-route-guard";
import { useAuth } from "@/providers/AuthProvider";
import { StoreSettingsProvider } from "@/providers/StoreSettingsProvider";
import { Coins, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/my-account", icon: User },
  { name: "Wallet & Top-Up", href: "/my-account/wallet", icon: Coins },
  { name: "Orders", href: "/my-account/orders", icon: Package },
  { name: "Addresses", href: "/my-account/addresses", icon: MapPin },
  { name: "Account Info", href: "/my-account/profile", icon: User },
  { name: "Settings", href: "/my-account/settings", icon: Settings },
];

function AccountLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  return (
    <StoreSettingsProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Account Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-card rounded-2xl border border-border p-5 space-y-2 sticky top-24 shadow-xs">
                <div className="px-2 mb-6 pb-4 border-b border-border flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-primary font-bold block truncate">
                      PGX Athlete Hub
                    </span>
                    <h2 className="font-mono font-black text-base text-foreground uppercase tracking-wide truncate">
                      My Account
                    </h2>
                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t border-border">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Account Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 min-h-125 shadow-xs">
                {children}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </StoreSettingsProvider>
  );
}

export default withPrivateRoute(AccountLayout);

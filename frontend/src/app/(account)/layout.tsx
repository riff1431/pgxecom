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

        <main className="flex-1 container mx-auto px-4 py-8 sm:py-10 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
            {/* Account Sidebar */}
            <aside className="w-full md:w-68 shrink-0">
              <div className="bg-card text-card-foreground rounded-2xl border border-border p-5 space-y-3 sticky top-24 shadow-sm backdrop-blur-xs">
                <div className="px-2 mb-2 pb-4 border-b border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold font-mono text-base shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block truncate">
                      PGX Athlete Hub
                    </span>
                    <h2 className="font-heading font-black text-sm text-foreground uppercase tracking-wider truncate">
                      {user?.name || "My Account"}
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
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t border-border">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Account Main Content */}
            <div className="flex-1 min-w-0 w-full">
              <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 sm:p-8 min-h-125 shadow-sm">
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

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
      <div className="min-h-screen flex flex-col bg-[#060b13] text-slate-100">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Account Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-[#0b1322] rounded-2xl border border-slate-800 p-5 space-y-2 sticky top-24 shadow-xl">
                <div className="px-2 mb-6 pb-4 border-b border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00a3ff] font-bold block mb-1">
                    PGX Athlete Hub
                  </span>
                  <h2 className="font-mono font-black text-lg text-white uppercase tracking-wide">
                    My Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 truncate font-mono">
                    {user?.email}
                  </p>
                </div>
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                          isActive
                            ? "bg-[#00a3ff] text-white shadow-lg shadow-[#00a3ff]/20 font-black"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
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
              <div className="bg-[#0b1322] rounded-2xl border border-slate-800 p-6 sm:p-8 min-h-125 shadow-xl">
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

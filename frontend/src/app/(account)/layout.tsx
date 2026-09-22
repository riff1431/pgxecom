"use client";

import { Footer } from "@/components/storefront/Footer";
import { Navbar } from "@/components/storefront/Navbar";
import { withPrivateRoute } from "@/helpers/with-route-guard";
import { useAuth } from "@/providers/AuthProvider";
import { StoreSettingsProvider } from "@/providers/StoreSettingsProvider";
import { LogOut, MapPin, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/my-account", icon: User },
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Account Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border p-4 space-y-1 sticky top-24">
                <div className="px-2 mb-6">
                  <h2 className="font-bold text-lg text-gray-900">
                    My Account
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 truncate">
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </nav>
              </div>
            </aside>

            {/* Account Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border p-6 min-h-125">
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

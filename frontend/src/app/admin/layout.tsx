"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { withAdminRoute } from "@/helpers/with-route-guard";
import { useGetPublicSettings } from "@/lib/api/settings";
import { resolveImageUrl } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Categories", icon: Tags, href: "/admin/categories" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Coupons", icon: Ticket, href: "/admin/coupons" },
  { label: "Blog", icon: FileText, href: "/admin/blog" },
  // { label: "Banners", icon: ImageIcon, href: "/admin/banners" },
  { label: "Shipping", icon: Truck, href: "/admin/shipping" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
];

const settingsSubmenu = [
  { label: "Storefront", icon: Globe, href: "/admin/settings" },
  { label: "Email (SMTP)", icon: Mail, href: "/admin/settings/smtp" },
  { label: "Payment (Stripe)", icon: CreditCard, href: "/admin/settings/payment" },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(true);
  const { data: storeSettings } = useGetPublicSettings();
  const settings = storeSettings || [];
  const map = new Map(settings.map((item) => [item.key, item.value]));
  const getSetting = (key: string, fallback = "") => map.get(key) || fallback;
  const rawStoreLogo = getSetting("store_logo", "/logo.png");
  const logoUrl = resolveImageUrl(rawStoreLogo);

  const isSettingsActive = pathname.startsWith("/admin/settings");

  return (
    <div className="dark min-h-screen bg-[#060b13] text-slate-100 flex">
      <SidebarProvider className="bg-[#060b13] text-slate-100 min-h-screen w-full">
        <Sidebar
          className="border-r border-slate-800/80 bg-[#070d18] text-slate-200"
        >
          {/* Logo Header */}
          <SidebarHeader className="h-20 flex items-center justify-center border-b border-slate-800/80 px-6 bg-[#070d18]">
            <Link
              href="/admin"
              className="flex items-center justify-center w-full py-2 hover:opacity-90 transition-opacity"
            >
              <img
                src={logoUrl}
                alt="PGX Admin Logo"
                className="h-10 w-auto max-h-12 max-w-[160px] object-contain shrink-0 drop-shadow-[0_2px_12px_rgba(0,163,255,0.15)]"
              />
            </Link>
          </SidebarHeader>

          {/* Navigation Menu */}
          <SidebarContent className="bg-[#070d18] px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00a3ff] px-3 mb-2">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                  {menuItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          tooltip={item.label}
                          className={`w-full h-10 rounded-xl px-3.5 text-xs font-semibold tracking-wide transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-[#00a3ff]/20 to-[#00a3ff]/10 text-white font-bold border border-[#00a3ff]/40 shadow-[0_0_15px_rgba(0,163,255,0.2)] hover:bg-[#00a3ff]/25 hover:text-white"
                              : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 transition-colors shrink-0 ${
                              isActive
                                ? "text-[#00a3ff] stroke-[2.2]"
                                : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          />
                          <span className="flex-1 truncate text-left">{item.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a3ff] shadow-[0_0_6px_#00a3ff] shrink-0" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  {/* Settings Item with Submenu */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setSettingsOpen((prev) => !prev)}
                      isActive={isSettingsActive}
                      tooltip="Settings"
                      className={`w-full h-10 rounded-xl px-3.5 text-xs font-semibold tracking-wide transition-all ${
                        isSettingsActive
                          ? "bg-gradient-to-r from-[#00a3ff]/20 to-[#00a3ff]/10 text-white font-bold border border-[#00a3ff]/40 shadow-[0_0_15px_rgba(0,163,255,0.2)]"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <Settings
                        className={`w-4 h-4 transition-colors shrink-0 ${
                          isSettingsActive
                            ? "text-[#00a3ff] stroke-[2.2]"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span className="flex-1 truncate text-left">Settings</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          settingsOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </SidebarMenuButton>

                    {settingsOpen && (
                      <SidebarMenuSub className="mt-1 space-y-1 border-l-2 border-slate-800/80 ml-5 pl-2.5">
                        {settingsSubmenu.map((sub) => {
                          const isSubActive =
                            sub.href === "/admin/settings"
                              ? pathname === "/admin/settings"
                              : pathname.startsWith(sub.href);

                          return (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton
                                render={<Link href={sub.href} />}
                                isActive={isSubActive}
                                className={`w-full h-8 rounded-lg px-2.5 text-xs font-medium transition-all flex items-center gap-2 ${
                                  isSubActive
                                    ? "bg-[#00a3ff]/15 text-[#00a3ff] font-bold border border-[#00a3ff]/30 shadow-[0_0_10px_rgba(0,163,255,0.15)]"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                                }`}
                              >
                                <sub.icon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSubActive ? "text-[#00a3ff]" : "text-slate-400"
                                  }`}
                                />
                                <span className="truncate">{sub.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer Navigation */}
          <SidebarFooter className="border-t border-slate-800/80 bg-[#050911] p-3">
            <div className="grid grid-cols-2 gap-2">
              <SidebarMenuButton
                render={<Link href="/" target="_blank" />}
                tooltip="Storefront"
                className="h-9 w-full text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg text-xs font-medium border border-slate-800 flex items-center justify-center gap-2 px-2"
              >
                <Store className="w-4 h-4 text-[#00a3ff] shrink-0" />
                <span className="truncate">Storefront</span>
              </SidebarMenuButton>

              <SidebarMenuButton
                onClick={logout}
                className="h-9 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs font-medium border border-red-500/20 flex items-center justify-center gap-1.5 px-2"
                tooltip="Logout"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="truncate">Logout</span>
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-[#060b13] text-slate-100 flex-1 flex flex-col min-w-0 border-l border-slate-800/60">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 px-6 bg-[#060b13]/90 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg" />
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold hidden sm:inline-block">
                Store Console
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="text-xs font-bold text-[#00a3ff] hover:underline uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00a3ff]/30 hover:bg-[#00a3ff]/10 transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                Live Store
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-8 bg-[#060b13] text-slate-100">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default withAdminRoute(AdminLayout);

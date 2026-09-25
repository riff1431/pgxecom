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
    <div className="min-h-screen bg-muted/30 text-foreground flex">
      <SidebarProvider className="bg-muted/30 text-foreground min-h-screen w-full">
        <Sidebar
          className="border-r border-border bg-card text-card-foreground shadow-xs"
        >
          {/* Logo Header */}
          <SidebarHeader className="h-20 flex items-center justify-center border-b border-border px-6 bg-card">
            <Link
              href="/admin"
              className="flex items-center justify-center w-full py-2 hover:opacity-90 transition-opacity"
            >
              <img
                src={logoUrl}
                alt="PGX Admin Logo"
                className="h-10 w-auto max-h-12 max-w-[160px] object-contain shrink-0"
              />
            </Link>
          </SidebarHeader>

          {/* Navigation Menu */}
          <SidebarContent className="bg-card px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary px-3 mb-2">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
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
                              ? "bg-primary/10 text-primary font-bold border border-primary/25 shadow-xs hover:bg-primary/15"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                          }`}
                        >
                          <item.icon
                            className={`w-4 h-4 transition-colors shrink-0 ${
                              isActive
                                ? "text-primary stroke-[2.2]"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          />
                          <span className="flex-1 truncate text-left">{item.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
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
                          ? "bg-primary/10 text-primary font-bold border border-primary/25 shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                      }`}
                    >
                      <Settings
                        className={`w-4 h-4 transition-colors shrink-0 ${
                          isSettingsActive
                            ? "text-primary stroke-[2.2]"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                      <span className="flex-1 truncate text-left">Settings</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                          settingsOpen ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </SidebarMenuButton>

                    {settingsOpen && (
                      <SidebarMenuSub className="mt-1 space-y-1 border-l-2 border-border ml-5 pl-2.5">
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
                                    ? "bg-primary/15 text-primary font-bold border border-primary/30"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                }`}
                              >
                                <sub.icon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSubActive ? "text-primary" : "text-muted-foreground"
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
          <SidebarFooter className="border-t border-border bg-card p-3">
            <div className="grid grid-cols-2 gap-2">
              <SidebarMenuButton
                render={<Link href="/" target="_blank" />}
                tooltip="Storefront"
                className="h-9 w-full text-foreground/80 hover:text-foreground hover:bg-muted rounded-lg text-xs font-medium border border-border flex items-center justify-center gap-2 px-2 shadow-2xs"
              >
                <Store className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">Storefront</span>
              </SidebarMenuButton>

              <SidebarMenuButton
                onClick={logout}
                className="h-9 w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg text-xs font-medium border border-destructive/20 flex items-center justify-center gap-1.5 px-2"
                tooltip="Logout"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="truncate">Logout</span>
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-muted/20 text-foreground flex-1 flex flex-col min-w-0 border-l border-border">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-6 bg-background/95 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg" />
              <div className="h-4 w-px bg-border hidden sm:block" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold hidden sm:inline-block">
                Store Console
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                Live Store
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-8 bg-muted/20 text-foreground">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default withAdminRoute(AdminLayout);

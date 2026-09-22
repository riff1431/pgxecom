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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { withAdminRoute } from "@/helpers/with-route-guard";
import { useGetPublicSettings } from "@/lib/api/settings";
import { resolveImageUrl } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { data: storeSettings } = useGetPublicSettings();
  const settings = storeSettings || [];
  const map = new Map(settings.map((item) => [item.key, item.value]));
  const getSetting = (key: string, fallback = "") => map.get(key) || fallback;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 w-full justify-start"
          >
            <Image
              src={resolveImageUrl(getSetting("store_logo", ""))}
              alt="Logo"
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span className="font-bold text-gray-900 line-clamp-1">
              {getSetting("store_name", "Admin")}
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className="w-full"
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 w-full"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <div className="flex gap-2 p-2">
            <SidebarMenuButton tooltip="Store" className="w-full">
              <Link href="/" className="flex items-center gap-2 w-full">
                <Store className="w-4 h-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton
              onClick={logout}
              className="text-red-600 hover:text-red-700"
              tooltip="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default withAdminRoute(AdminLayout);

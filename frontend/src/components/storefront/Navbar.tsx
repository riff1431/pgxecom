"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { useCartStore } from "@/store/cart.store";
import {
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeaderSearch } from "./HeaderSearch";
import { WalletPill } from "./WalletPill";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  const navLinks = [
    {
      title: "Shop",
      href: "/shop",
      children: [
        { title: "All Equipment", href: "/shop" },
        { title: "Cardio Machines", href: "/shop?category=cardio-equipment" },
        { title: "Strength & Racks", href: "/shop?category=strength-equipment" },
        { title: "Weights & Dumbbells", href: "/shop?category=strength-equipment" },
      ],
    },
    {
      title: "Fitness",
      href: "/shop?category=strength-equipment",
      children: [
        { title: "Treadmills & Rowers", href: "/shop?category=cardio-equipment" },
        { title: "Home Gym Systems", href: "/shop?category=home-gym" },
        { title: "Power Racks", href: "/shop?category=strength-equipment" },
      ],
    },
    {
      title: "Apparel",
      href: "/shop?category=apparel",
      children: [
        { title: "Men's Performance", href: "/shop?category=apparel" },
        { title: "Women's Activewear", href: "/shop?category=apparel" },
        { title: "Training Footwear", href: "/shop?category=apparel" },
      ],
    },
    {
      title: "Accessories",
      href: "/shop?category=accessories",
      children: [
        { title: "Resistance Bands", href: "/shop?category=accessories" },
        { title: "Yoga & Floor Mats", href: "/shop?category=accessories" },
        { title: "Water Bottles & Shakers", href: "/shop?category=accessories" },
      ],
    },
    {
      title: "Home & Office",
      href: "/shop?category=home-office",
    },
    {
      title: "Bundles",
      href: "/shop?category=bundles",
    },
    {
      title: "About",
      href: "/about-us",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border text-foreground select-none">
      {/* Top Announcement Bar */}
      <div className="bg-muted/60 border-b border-border/80 text-[11px] sm:text-xs text-muted-foreground py-1.5 px-4 tracking-wide font-medium">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left Highlights */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
              <Globe className="w-3.5 h-3.5 text-primary" />
              Worldwide Shipping
            </span>
            <span className="hidden md:inline-block text-border">|</span>
            <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
              <Truck className="w-3.5 h-3.5 text-primary" />
              Free Shipping on Orders Over €50
            </span>
            <span className="hidden lg:inline-block text-border">|</span>
            <span className="hidden lg:inline-block text-muted-foreground italic">
              A Healthier, Stronger You
            </span>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link
              href="/orders/track?orderNumber="
              className="hover:text-foreground transition-colors"
            >
              Track Order
            </Link>
            <span className="text-border">|</span>
            <Link href="/contact-us" className="hover:text-foreground transition-colors">
              Help
            </Link>
            <span className="text-border">|</span>
            <Link href="/contact-us" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1 cursor-pointer text-foreground/80 hover:text-foreground">
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="inline-flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="PGX Logo"
            className="h-9 sm:h-11 w-auto object-contain"
          />
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold tracking-wide">
          {navLinks.map((link) =>
            link.children ? (
              <DropdownMenu key={link.title}>
                <DropdownMenuTrigger className="px-3 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 outline-none">
                  {link.title}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border border-border text-popover-foreground min-w-[180px] shadow-lg py-1.5">
                  {link.children.map((sub) => (
                    <DropdownMenuItem
                      key={sub.title}
                      onClick={() => router.push(sub.href)}
                      className="cursor-pointer text-xs text-foreground/80 hover:text-foreground hover:bg-muted py-2 px-3"
                    >
                      {sub.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.title}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.title}
              </Link>
            )
          )}
        </nav>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2">
          <HeaderSearch />
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Universal Wallet Pill */}
          <WalletPill />

          {/* User Account */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors outline-none">
                <User className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border border-border text-popover-foreground min-w-[200px] shadow-lg"
              >
                <div className="px-3 py-2 text-xs border-b border-border">
                  <p className="font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={() => router.push("/my-account")}
                  className="cursor-pointer text-xs hover:bg-muted py-2"
                >
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/my-account/wallet")}
                  className="cursor-pointer text-xs hover:bg-muted py-2 font-semibold text-primary"
                >
                  Wallet &amp; Top-Up
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/orders")}
                  className="cursor-pointer text-xs hover:bg-muted py-2"
                >
                  Order History
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => router.push("/admin")}
                    className="cursor-pointer text-xs text-primary font-medium hover:bg-muted py-2"
                  >
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-xs text-destructive hover:bg-destructive/10 py-2 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              title="Sign In"
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Cart Icon & Badge */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-background border-t border-border px-4 py-4 space-y-3">
          <div className="sm:hidden mb-3">
            <HeaderSearch />
          </div>
          <div className="flex flex-col space-y-1.5 text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

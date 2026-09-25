"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing to PGX Newsletter!");
    setEmail("");
  };

  return (
    <footer className="bg-muted/40 text-muted-foreground border-t border-border text-xs">
      {/* Main Links & Info */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="PGX Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground font-medium">
              A Lifestyle That Moves With You.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { name: "IG", href: "https://instagram.com" },
                { name: "FB", href: "https://facebook.com" },
                { name: "X", href: "https://x.com" },
                { name: "IN", href: "https://linkedin.com" },
              ].map((s, idx) => (
                <a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-background border border-border hover:border-primary text-muted-foreground hover:text-primary flex items-center justify-center font-bold text-[11px] transition-colors shadow-2xs"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-mono">
              Shop
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/shop?category=cardio-equipment" className="hover:text-foreground transition-colors">
                  Cardio Equipment
                </Link>
              </li>
              <li>
                <Link href="/shop?category=strength-equipment" className="hover:text-foreground transition-colors">
                  Strength Equipment
                </Link>
              </li>
              <li>
                <Link href="/shop?category=home-gym" className="hover:text-foreground transition-colors">
                  Home Gym
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel" className="hover:text-foreground transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-foreground transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-mono">
              Support
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/orders/track?orderNumber=" className="hover:text-foreground transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-foreground transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about-us" className="hover:text-foreground transition-colors">
                  About PGX
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="hover:text-foreground transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-foreground transition-colors">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-foreground uppercase tracking-wider text-xs font-mono">
              Join Our Newsletter
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Get exclusive offers, new products and fitness tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs shadow-2xs"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 shadow-2xs"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-border bg-muted/70 py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div>© 2026 PGX. All rights reserved.</div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/shipping-policy" className="hover:text-foreground">
              Shipping Policy
            </Link>
            <span>|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
              <span>EN</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

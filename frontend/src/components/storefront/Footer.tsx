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
    <footer className="bg-[#060b13] text-slate-300 border-t border-slate-800 text-xs">
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
            <p className="text-slate-400 font-medium">
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
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-[#00a3ff] text-slate-400 hover:text-white flex items-center justify-center font-bold text-[11px] transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              Shop
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/shop?category=cardio-equipment" className="hover:text-white transition-colors">
                  Cardio Equipment
                </Link>
              </li>
              <li>
                <Link href="/shop?category=strength-equipment" className="hover:text-white transition-colors">
                  Strength Equipment
                </Link>
              </li>
              <li>
                <Link href="/shop?category=home-gym" className="hover:text-white transition-colors">
                  Home Gym
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel" className="hover:text-white transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              Support
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/orders/track?orderNumber=" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              Company
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors">
                  About PGX
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="hover:text-white transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-white transition-colors">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">
              Join Our Newsletter
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Get exclusive offers, new products and fitness tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#00a3ff] text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-800/80 bg-[#04070d] py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 PGX. All rights reserved.</div>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/privacy-policy" className="hover:text-slate-400">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms-of-service" className="hover:text-slate-400">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/shipping-policy" className="hover:text-slate-400">
              Shipping Policy
            </Link>
            <span>|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-400">
              <span>EN</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

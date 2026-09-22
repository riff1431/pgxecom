"use client";

import { buttonVariants } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="py-12 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500">
      <div className="container mx-auto px-4 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Use Code <span className="text-amber-300">WELCOME10</span> for 10% Off
        </h2>
        <p className="text-emerald-100 mb-6 text-lg">
          First-time customers get an exclusive discount on orders over ৳500
        </p>
        <Link href="/shop" className={buttonVariants({ size: "lg", className: "bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8" })}>
           Shop Now
        </Link>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    { name: "Rahim Ahmed", comment: "Best quality honey I've ever tasted. The Sundarbans variety is absolutely amazing!", rating: 5, location: "Dhaka" },
    { name: "Fatima Begum", comment: "Fast delivery and excellent packaging. The dry fruits are very fresh and tasty.", rating: 5, location: "Chittagong" },
    { name: "Kamal Hossain", comment: "Great prices and genuine organic products. Will definitely order again!", rating: 4, location: "Sylhet" },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 mt-1">Trusted by thousands of happy customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 border rounded-xl border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-4 italic">&ldquo;{t.comment}&rdquo;</p>
              <div>
                <p className="font-medium text-sm text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Corporate & Bulk Orders</h2>
        <p className="text-gray-500 max-w-lg mx-auto mb-6">
          Looking for bulk orders for your office, restaurant, or event? Contact us for special corporate deals and pricing.
        </p>
        <Link href="/contact-us" className={buttonVariants({ size: "lg", className: "bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8" })}>
            Contact Us
        </Link>
      </div>
    </section>
  );
}

import { Building2, Handshake, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CorporateDealPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 items-center justify-center flex gap-3">
          <Handshake className="w-8 h-8 text-emerald-600" /> B2B & Wholesale Deals
        </h1>
        <p className="text-gray-600 text-lg">
          Partner with us to source authentic, pure, and organic food products in bulk for your corporate gifting, retail store, or restaurant.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        <div className="flex-1 space-y-8">
          <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
             <h3 className="text-xl font-bold text-emerald-900 mb-4">Why Partner With Us?</h3>
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                   <div className="bg-emerald-200 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-sm">✓</div>
                   <span className="text-emerald-800">Unmatched guarantee on product purity.</span>
                </li>
                <li className="flex items-start gap-3">
                   <div className="bg-emerald-200 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-sm">✓</div>
                   <span className="text-emerald-800">Special discounted tier pricing for high-volume orders.</span>
                </li>
                <li className="flex items-start gap-3">
                   <div className="bg-emerald-200 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-sm">✓</div>
                   <span className="text-emerald-800">Customized corporate gift baskets for Ramadan, Eid, and New Year.</span>
                </li>
                <li className="flex items-start gap-3">
                   <div className="bg-emerald-200 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-sm">✓</div>
                   <span className="text-emerald-800">Dedicated account manager for fast processing.</span>
                </li>
             </ul>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
             <Mail className="w-6 h-6" />
             <span>Or email us directly at <a href="mailto:b2b@freshmart.com" className="font-bold text-emerald-600 hover:underline">b2b@freshmart.com</a></span>
          </div>
        </div>

        <div className="w-full lg:w-[500px]">
          <div className="bg-white border shadow-lg shadow-emerald-500/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <Building2 className="w-5 h-5 text-gray-400" /> Send an Inquiry
            </h2>
            <form className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Company Name</label>
                <Input placeholder="Acme Corp" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Contact Person</label>
                <Input placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Email Address</label>
                <Input type="email" placeholder="john@acme.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Phone</label>
                <Input placeholder="01XXXXXXXXX" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Requirements</label>
                <Textarea placeholder="Which products and what quantity are you looking for?" rows={4} required className="resize-none" />
              </div>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 h-11">
                Submit Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

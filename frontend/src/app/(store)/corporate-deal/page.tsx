import { Building2, Dumbbell, Handshake, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CorporateDealPage() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            B2B &amp; Commercial Partnerships
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mt-2 font-mono flex items-center justify-center gap-3">
            <Handshake className="w-9 h-9 text-primary" /> Wholesale &amp; Gym Fitouts
          </h1>
          <p className="text-muted-foreground text-base mt-4">
            Partner with PGX to equip your commercial gym, corporate wellness center, hotel facility, or distribution network with high-end fitness gear.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          <div className="flex-1 space-y-8">
            <div className="bg-card text-card-foreground rounded-2xl p-8 border border-border shadow-xs space-y-6">
              <span className="text-xs uppercase tracking-widest font-mono text-primary font-bold">
                Commercial Benefits
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight font-mono text-foreground">
                Why Partner With PGX?
              </h3>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Tiered volume pricing &amp; wholesale container discounts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Commercial warranties (2-year structural guarantee on racks &amp; trainers).</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Custom 3D gym space planning and layout consultation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Dedicated B2B account manager and priority freight dispatch.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground bg-card p-6 rounded-xl border border-border">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm">Or email directly: <a href="mailto:wholesale@playgroundfitnex.com" className="font-bold text-foreground hover:text-primary underline transition-colors">wholesale@playgroundfitnex.com</a></span>
            </div>
          </div>

          <div className="w-full lg:w-[480px]">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xs">
              <h2 className="text-xl font-black uppercase tracking-tight text-card-foreground mb-6 flex items-center gap-2 font-mono">
                <Building2 className="w-5 h-5 text-primary" /> Request B2B Quote
              </h2>
              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company / Gym Name *</label>
                  <Input placeholder="Apex Fitness Club" required className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Person *</label>
                  <Input placeholder="Alex Miller" required className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Email *</label>
                  <Input type="email" placeholder="alex@apexfitness.com" required className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
                  <Input placeholder="+1 (555) 012-3456" className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Requirements / Equipment Needed</label>
                  <Textarea placeholder="E.g., 5 Home Gym Systems, 10 Dumbbell Sets, Power Racks..." rows={4} required className="resize-none bg-background border-border focus:border-primary" />
                </div>
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs">
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Dumbbell, ShieldCheck, Trophy, Truck, Users, Zap } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Our Story &amp; Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mt-2 font-mono">
            About PG<span className="text-primary">X</span>
          </h1>
          <p className="text-muted-foreground text-base mt-4 leading-relaxed">
            A lifestyle that moves with you. Built for champions, elite athletes, and anyone dedicated to a stronger tomorrow.
          </p>
        </div>

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl bg-muted/40 border border-border p-8 sm:p-12 text-foreground overflow-hidden shadow-xs mb-16">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-mono text-primary font-bold">
              Engineering Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mt-2 font-mono">
              Designed For High Performance
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-4 leading-relaxed">
              At PGX, we engineer commercial-grade fitness equipment, performance sportswear, and everyday athletic gear designed to withstand rigorous training routines. From precision cable crossover machines to high-density dumbbells and ergonomic gear, every product is built to perform.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
            <Dumbbell className="w-96 h-96 text-foreground" />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-foreground mb-2">
              Commercial Grade
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Industrial heavy-duty steel, laser-cut components, and precision weight stacks built for lifelong durability.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/40 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-foreground mb-2">
              Worldwide Shipping
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fast, secure courier delivery and freight support across 50+ countries with complete tracking transparency.
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-6 text-left hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#00a3ff] flex items-center justify-center mb-4">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-slate-900 mb-2">
              Elite Support
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Expert gym equipment specialists standing by to assist with home gym layouts, commercial fitouts, and inquiries.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-slate-700 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-mono">
            Our Commitment
          </h2>
          <p className="leading-relaxed text-sm sm:text-base">
            Whether you are outfitting a garage gym, upgrading a commercial fitness center, or elevating your training apparel, PGX is committed to delivering state-of-the-art innovation, rugged reliability, and uncompromising quality.
          </p>
          <p className="leading-relaxed text-sm sm:text-base">
            Every piece of hardware undergoes strict stress testing, ergonomic assessment, and safety inspections before reaching your workout space. Train hard, recover smart, and push your limits with PGX.
          </p>
        </div>
      </div>
    </div>
  );
}

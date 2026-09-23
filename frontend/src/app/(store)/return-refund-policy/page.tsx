export default function ReturnRefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10 pb-6 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a3ff]">
            Customer Assurance
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Return &amp; Refund Policy
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Commercial equipment warranty &amp; 30-day money-back guarantee
          </p>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Thank you for shopping at PGX. We engineer gym hardware and athletic apparel to the highest standards. If you are not completely satisfied with your purchase, our support team is here to assist.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">Returns &amp; Exchanges</h2>
          <p>
            You have <strong>30 calendar days</strong> to return an item from the date of delivery. To be eligible for a return:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Apparel &amp; Accessories must be unworn, unwashed, and in original packaging with tags attached.</li>
            <li>Gym Equipment &amp; Machines must be in pristine condition, disassembled in original factory freight packaging, including all bolts, accessories, and instruction manuals.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">Commercial Warranty</h2>
          <p>
            All PGX heavy equipment (Power Racks, Home Gym Systems, and Cable Crossovers) comes with an automatic <strong>2-year structural warranty</strong> covering manufacturing defects, weld integrity, and frame construction.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">Refunds Process</h2>
          <p>
            Once your returned item arrives at our regional logistics hub and undergoes inspection, we will immediately initiate a refund to your original payment method (Stripe or PGX Wallet credit).
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">Damaged Freight Upon Arrival</h2>
          <p>
            If any freight packaging arrives visibly damaged by courier transit, photograph the exterior box before opening and contact <a href="mailto:support@playgroundfitnex.com" className="text-[#00a3ff] font-medium hover:underline">support@playgroundfitnex.com</a> within 48 hours for immediate replacement parts or a unit swap.
          </p>
        </div>
      </div>
    </div>
  );
}

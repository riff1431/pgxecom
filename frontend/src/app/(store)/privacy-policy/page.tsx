export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10 pb-6 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a3ff]">
            Legal &amp; Compliance
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Last updated: September 2026
          </p>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At PGX (<a href="https://playgroundfitnex.com" className="text-[#00a3ff] font-medium hover:underline">playgroundfitnex.com</a>), we take your privacy and data security seriously. This Privacy Policy explains how we collect, handle, protect, and process your personal information when using our ecommerce storefront and ordering fitness gear.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information strictly necessary to provide seamless checkout, shipping, and account management:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account &amp; Contact Details:</strong> Name, delivery address, email, and phone number for shipping coordination.</li>
            <li><strong>Payment &amp; Transactions:</strong> Stripe and universal PGX wallet checkout tokens. We do not store raw credit card numbers on our servers.</li>
            <li><strong>Device &amp; Telemetry Data:</strong> IP address, browser type, and navigation flow to detect fraud and optimize page speeds.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">2. Use of Your Information</h2>
          <p>
            Your information is utilized solely to fulfill equipment orders, provide tracking updates, prevent fraud, and comply with international shipping regulations.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-4">3. Security</h2>
          <p>
            We utilize end-to-end encrypted SSL sessions, strict database access controls, and PCI-DSS compliant payment gateways (Stripe) to secure all financial and personal interactions.
          </p>
        </div>
      </div>
    </div>
  );
}

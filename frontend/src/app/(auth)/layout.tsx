import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060b13] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-[#00a3ff] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex justify-center">
          <img
            src="/logo.png"
            alt="PGX Logo"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#0b121f] py-8 px-6 sm:px-10 rounded-2xl border border-slate-800 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

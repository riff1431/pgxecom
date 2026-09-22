"use client";

import { useShopParams } from "@/hooks/use-shop-params";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const isShopPage = pathname === "/shop";
  
  const [{ search }, setParams] = useShopParams();
  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedSearch] = useDebounceValue(localSearch, 500);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (isShopPage) {
      setParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, isShopPage, setParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isShopPage) {
      router.push(`/shop?search=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0e1726]/80 text-white placeholder-slate-400 border border-slate-700/80 focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff] outline-none transition-all text-xs sm:text-sm"
      />
    </form>
  );
}

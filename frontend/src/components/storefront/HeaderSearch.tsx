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
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground border border-border focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs sm:text-sm font-medium"
      />
    </form>
  );
}

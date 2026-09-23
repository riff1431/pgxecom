"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Grid, List as ListIcon } from "lucide-react";

interface ShopHeaderProps {
  search: string;
  totalProducts: number;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  sort?: string;
  setSort?: (sort: string) => void;
}

export function ShopHeader({ search, totalProducts, viewMode, setViewMode, sort, setSort }: ShopHeaderProps) {
  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Alphabetical", value: "name" },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || "Newest";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {search ? `Search: "${search}"` : "Shop All Products"}
        </h1>
        <p className="text-sm text-gray-500">{totalProducts} products found</p>
      </div>
      
      <div className="flex items-center gap-3">
        {setSort && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-xs sm:text-sm">
                Sort: {currentSortLabel} <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value} 
                  onClick={() => setSort(option.value)}
                  className={sort === option.value ? "text-[#00a3ff] font-bold" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="flex items-center border rounded-lg bg-gray-50 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm text-slate-950" : "text-gray-500"}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm text-slate-950" : "text-gray-500"}`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

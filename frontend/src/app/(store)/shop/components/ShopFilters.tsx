"use client";

import type { CategoryTreeNode } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ShopFiltersProps {
  categories: CategoryTreeNode[];
  activeCategory: string;
  setActiveCategory: (slug: string) => void;
}

export function ShopFilters({
  categories,
  activeCategory,
  setActiveCategory,
}: ShopFiltersProps) {
  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900 font-sans">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setActiveCategory("")}
              className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-all font-medium ${
                activeCategory === ""
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Products
            </button>
          </li>
          {categories?.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              depth={0}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}

interface CategoryItemProps {
  category: CategoryTreeNode;
  activeCategory: string;
  setActiveCategory: (slug: string) => void;
  depth: number;
}

function CategoryItem({
  category,
  activeCategory,
  setActiveCategory,
  depth,
}: CategoryItemProps) {
  const hasChildren = category.children && category.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);
  const isActive = activeCategory === category.slug;

  return (
    <li>
      <div className="flex items-center group">
        <button
          onClick={() => setActiveCategory(category.slug)}
          className={`flex-1 text-sm text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between font-medium ${
            isActive
              ? "bg-[#00a3ff]/10 text-[#0070cc] font-bold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <span>{category.name}</span>
        </button>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="mt-0.5 space-y-0.5">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

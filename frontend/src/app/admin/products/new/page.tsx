"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="bg-[#0b1322] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">
          <Link href="/admin/products">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white font-mono uppercase tracking-wider">Add New Product</h1>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}

"use client";

import Link from "next/link";
import ProductTypeSelector from "../../../../components/products/ProductTypeSelector";

export default function NewProductPage() {
  return (
    <div>
      <nav className="flex flex-wrap items-center gap-2 text-[15px]">
        <Link href="/dashboard/products" className="font-medium text-slate-500 hover:text-slate-800">
          My Products
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-bold text-slate-900">New Product</span>
      </nav>
      <ProductTypeSelector />
    </div>
  );
}

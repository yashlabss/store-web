"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ProductEditor from "../../../../components/products/ProductEditor";

export default function ProductEditorPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;

  return (
    <div>
      <nav className="flex flex-wrap items-center gap-2 text-[15px]">
        <Link href="/dashboard/products" className="font-medium text-slate-500 hover:text-slate-800">
          My Products
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-bold text-slate-900">Edit Product</span>
      </nav>
      <ProductEditor productId={productId} />
    </div>
  );
}

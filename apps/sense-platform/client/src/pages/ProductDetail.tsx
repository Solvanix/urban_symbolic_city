import PublicShell from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, ShoppingCart } from "lucide-react";
import { Link, useParams } from "wouter";

const currency = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "ILS" });

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const { data, isLoading, isError } = trpc.commerce.products.list.useQuery({ first: 24 });
  const { addItem, loading, openCart } = useCart();
  const product = data?.find(item => item.handle === handle);
  const variant = product?.variants[0];
  const image = product?.images[0];

  return (
    <PublicShell>
      <main className="min-h-screen bg-[#f4f7fb] py-14 text-[#09244f]">
        <div className="container">
          <Link href="/store" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#1f67ac]">العودة إلى المتجر <ArrowRight className="size-4" /></Link>
          {isLoading && <div className="flex items-center gap-3 py-20"><Loader2 className="animate-spin" /> جارٍ تحميل المنتج…</div>}
          {isError && <div className="border border-red-200 bg-red-50 p-6 text-red-800">تعذر تحميل المنتج الآن.</div>}
          {!isLoading && !isError && !product && <div className="border border-dashed border-[#9db0c8] bg-white p-12 text-center">المنتج غير موجود أو لم يعد منشورًا.</div>}
          {product && (
            <Card className="grid overflow-hidden border-[#d6e1ef] bg-white lg:grid-cols-2">
              <div className="min-h-[360px] bg-[#e7eef7]">{image ? <img src={image.url} alt={image.altText ?? product.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ShoppingCart className="size-16 text-[#1f67ac]" /></div>}</div>
              <CardContent className="flex flex-col justify-center p-8 md:p-12">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#1f67ac]">{product.productType ?? "SENSE MARKET"}</p>
                <h1 className="mt-3 text-4xl font-black">{product.title}</h1>
                <p className="mt-5 leading-8 text-slate-600">{product.description || "منتج مختار بعناية لاحتياجات السفر والوصول."}</p>
                <div className="mt-8 flex items-center justify-between gap-4"><strong className="text-2xl">{currency.format(Number(product.priceRange.min.amount))}</strong><Button disabled={!variant?.availableForSale || loading} onClick={() => variant && addItem(variant.id)} className="bg-[#09244f] hover:bg-[#123c78]">{loading ? <Loader2 className="animate-spin" /> : "أضف للسلة"}</Button></div>
                <Button variant="outline" onClick={openCart} className="mt-3">عرض السلة</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </PublicShell>
  );
}

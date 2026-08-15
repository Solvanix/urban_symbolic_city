import PublicShell from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";

const currency = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "ILS" });

export default function Store() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { data, isLoading, isError } = trpc.commerce.products.list.useQuery({ first: 24 });

  const filterOptions = useMemo(() => {
    const values = new Set<string>();
    for (const product of data ?? []) {
      if (product.productType) values.add(product.productType);
      for (const tag of product.tags ?? []) values.add(tag);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b, "ar"));
  }, [data]);
  const { addItem, itemCount, loading, openCart, closeCart, isOpen, cart, updateQuantity, removeItem, proceedToCheckout } = useCart();

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data ?? []).filter(product => {
      const searchable = `${product.title} ${product.description} ${product.productType ?? ""} ${(product.tags ?? []).join(" ")}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesFilter = filter === "all" || product.productType === filter || (product.tags ?? []).includes(filter);
      return matchesSearch && matchesFilter;
    });
  }, [data, filter, search]);

  return (
    <PublicShell>
      <main className="min-h-screen bg-[#f4f7fb] text-[#09244f]">
        <section className="blueprint-grid relative overflow-hidden bg-[#071d49] px-5 py-20 text-white md:px-10">
          <div className="container relative z-10 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-[#ffd23f]">SENSE / المتجر الداخلي</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] md:text-7xl">منتجات وخدمات مرتبطة بالرحلة.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-9 text-blue-100">تصفح المنتجات المدرجة في كتالوج SENSE، وراجع الوصف والسعر والتوفر قبل إضافتها إلى السلة.</p>
            </div>
            <div className="cad-frame bg-[#0b2d63]/70 p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffd23f]">حالة السلة</p>
              <p className="mt-4 text-4xl font-black">{itemCount}</p>
              <p className="text-blue-100">عنصر في سلتك</p>
              <Button className="mt-6 w-full bg-[#ffd23f] text-[#08204c] hover:bg-[#ffe47b]" onClick={openCart}>
                <ShoppingCart className="ms-2 size-4" /> عرض السلة
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-14">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#1f67ac]">كتالوج SENSE</p>
              <h2 className="mt-2 text-3xl font-black md:text-4xl">ابحث في المنتجات المتاحة</h2>
            </div>
            <div className="flex w-full max-w-xl flex-col gap-3 md:flex-row">
              <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث عن منتج أو فئة" className="bg-white" aria-label="البحث في المنتجات" />
              <select value={filter} onChange={event => setFilter(event.target.value)} className="h-10 border border-[#c7d7ea] bg-white px-3 text-sm" aria-label="تصفية المنتجات حسب الاستخدام أو الفئة">
                <option value="all">كل الفئات والاستخدامات</option>
                {filterOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }}>مسح</Button>
            </div>
          </div>

          {isLoading && <div className="flex items-center gap-3 py-20 text-[#1f67ac]"><Loader2 className="animate-spin" /> جارٍ تحميل المنتجات…</div>}
          {isError && <div className="border border-red-200 bg-red-50 p-6 text-red-800">تعذر تحميل المنتجات الآن. حاول مرة أخرى لاحقًا.</div>}
          {!isLoading && !isError && products.length === 0 && <div className="border border-dashed border-[#9db0c8] bg-white p-12 text-center">لا توجد منتجات مطابقة لهذا البحث.</div>}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map(product => {
              const variant = product.variants[0];
              const image = product.images[0];
              return (
                <Card key={product.id} className="overflow-hidden border-[#d6e1ef] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="aspect-[4/3] overflow-hidden bg-[#e7eef7]">
                    {image ? <img src={image.url} alt={image.altText ?? product.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#1f67ac]"><ShoppingBag className="size-12" /></div>}
                  </div>
                  <CardContent className="p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#1f67ac]">{product.productType ?? "منتج من كتالوج SENSE"}</p>
                    <h3 className="mt-2 text-2xl font-black">{product.title}</h3>
                    <Link href={`/store/${product.handle}`} className="mt-2 inline-block text-sm font-bold text-[#1f67ac]">عرض التفاصيل ←</Link>
                    <p className="mt-3 min-h-14 text-sm leading-7 text-slate-600">{product.description || "لا يوجد وصف منشور لهذا المنتج بعد."}</p>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <strong className="text-lg">{currency.format(Number(product.priceRange.min.amount))}</strong>
                      <Button disabled={!variant?.availableForSale || loading} onClick={() => variant && addItem(variant.id)} className="bg-[#09244f] hover:bg-[#123c78]">
                        {loading ? <Loader2 className="animate-spin" /> : <>أضف للسلة <ArrowLeft className="me-2 size-4" /></>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {cart && cart.items.length > 0 && (
            <aside className="mt-12 flex flex-col gap-4 border border-[#c7d7ea] bg-white p-5 md:flex-row md:items-center md:justify-between">
              <div><p className="font-bold">سلتك جاهزة</p><p className="text-sm text-slate-600">{cart.itemCount} عناصر · {currency.format(Number(cart.total.amount))}</p></div>
              <div className="flex gap-3"><Button variant="outline" onClick={openCart}>مراجعة السلة</Button><Button onClick={proceedToCheckout} className="bg-[#ffd23f] text-[#08204c] hover:bg-[#ffe47b]">إتمام الطلب</Button></div>
            </aside>
          )}
        </section>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-[#061936]/55 p-4" role="dialog" aria-modal="true" aria-label="سلة التسوق">
            <div className="flex h-full w-full max-w-lg flex-col bg-white p-6 text-[#09244f] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#d6e1ef] pb-5">
                <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-[#1f67ac]">سلة SENSE</p><h2 className="mt-1 text-2xl font-black">سلة رحلتك</h2></div>
                <Button variant="ghost" size="icon" onClick={closeCart} aria-label="إغلاق السلة"><X /></Button>
              </div>
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center"><ShoppingCart className="mb-4 size-12 text-[#1f67ac]" /><p className="font-bold">السلة فارغة</p><p className="mt-2 text-sm text-slate-600">أضف المنتجات التي تريد طلبها إلى السلة.</p></div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto py-6">
                    {cart.items.map(item => (
                      <div key={item.lineId} className="flex gap-4 border-b border-[#e6edf5] pb-4">
                        {item.image && <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="size-20 rounded object-cover" />}
                        <div className="min-w-0 flex-1"><p className="font-bold">{item.productTitle}</p><p className="text-sm text-slate-600">{currency.format(Number(item.unitPrice.amount))}</p><div className="mt-3 flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => updateQuantity(item.lineId, Math.max(0, item.quantity - 1))} aria-label="إنقاص الكمية"><Minus className="size-3" /></Button><span className="w-7 text-center font-bold">{item.quantity}</span><Button variant="outline" size="icon" onClick={() => updateQuantity(item.lineId, item.quantity + 1)} aria-label="زيادة الكمية"><Plus className="size-3" /></Button><Button variant="ghost" size="icon" className="ms-auto text-red-600" onClick={() => removeItem(item.lineId)} aria-label="حذف المنتج"><X className="size-4" /></Button></div></div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#d6e1ef] pt-5"><div className="mb-4 flex justify-between text-lg font-black"><span>الإجمالي</span><span>{currency.format(Number(cart.total.amount))}</span></div><Button className="w-full bg-[#ffd23f] text-[#08204c] hover:bg-[#ffe47b]" onClick={proceedToCheckout}>الانتقال إلى إتمام الطلب</Button></div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </PublicShell>
  );
}

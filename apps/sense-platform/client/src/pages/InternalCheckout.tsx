import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowRight, LockKeyhole, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function InternalCheckout() {
  const [, params] = useRoute("/checkout/:cartId");
  const { user } = useAuth();
  const cartId = params?.cartId ? decodeURIComponent(params.cartId) : "";
  const cartQuery = trpc.commerce.cart.get.useQuery({ cartId }, { enabled: Boolean(cartId) });
  const createOrder = trpc.commerce.checkout.createOrder.useMutation();
  const [shippingName, setShippingName] = useState(user?.name ?? "");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  if (!user) {
    return <main dir="rtl" className="min-h-screen bg-[#eef4fb] px-4 py-16"><Card className="mx-auto max-w-xl"><CardHeader><CardTitle>تسجيل الدخول مطلوب لإتمام الطلب</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-slate-600">نحتاج حسابًا موثقًا لربط الطلب بك وحماية بيانات الشحن. لا تُدخل بيانات البطاقة هنا؛ ستتم معالجتها لاحقًا عبر شريك الدفع المعتمد.</p><Button onClick={() => startLogin()} className="bg-[#09244f]">تسجيل الدخول</Button></CardContent></Card></main>;
  }

  if (orderNumber) {
    return <main dir="rtl" className="min-h-screen bg-[#eef4fb] px-4 py-16"><Card className="mx-auto max-w-xl text-center"><CardContent className="space-y-5 p-10"><ShoppingBag className="mx-auto size-12 text-[#1355a3]" /><h1 className="text-3xl font-black text-[#071b42]">تم إنشاء طلبك داخل SENSE</h1><p className="text-slate-600">رقم الطلب: <strong>{orderNumber}</strong></p><p className="text-sm text-slate-500">الحالة الحالية: بانتظار الدفع. لم تُخزّن أي بيانات بطاقة، وسيُستكمل الدفع عبر الشريك المعتمد بعد تفعيل الموصل.</p><Link href="/store"><Button className="bg-[#09244f]">العودة إلى المتجر</Button></Link></CardContent></Card></main>;
  }

  const cart = cartQuery.data;
  return <main dir="rtl" className="min-h-screen bg-[#eef4fb] px-4 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href="/store" className="mb-6 inline-flex items-center gap-2 font-bold text-[#1355a3]"><ArrowRight className="size-4" /> العودة إلى المتجر</Link><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Card><CardHeader><CardTitle>إتمام الطلب داخل SENSE</CardTitle></CardHeader><CardContent><form className="space-y-5" onSubmit={event => { event.preventDefault(); createOrder.mutate({ cartId, shippingName, shippingPhone, shippingAddress }, { onSuccess: result => setOrderNumber(result.orderNumber) }); }}><label className="block space-y-2"><span className="font-bold">اسم المستلم</span><Input required value={shippingName} onChange={event => setShippingName(event.target.value)} /></label><label className="block space-y-2"><span className="font-bold">رقم الهاتف</span><Input required inputMode="tel" value={shippingPhone} onChange={event => setShippingPhone(event.target.value)} /></label><label className="block space-y-2"><span className="font-bold">عنوان التسليم</span><Textarea required minLength={8} value={shippingAddress} onChange={event => setShippingAddress(event.target.value)} /></label>{createOrder.error && <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{createOrder.error.message}</p>}<Button disabled={!cart || cart.items.length === 0 || createOrder.isPending} className="w-full bg-[#09244f]"><LockKeyhole className="me-2 size-4" />{createOrder.isPending ? "جارٍ إنشاء الطلب…" : "إنشاء الطلب والمتابعة للدفع"}</Button></form></CardContent></Card><Card className="h-fit"><CardHeader><CardTitle>ملخص السلة</CardTitle></CardHeader><CardContent>{cartQuery.isLoading && <p>جارٍ التحميل…</p>}{!cartQuery.isLoading && (!cart || cart.items.length === 0) && <p className="text-slate-600">السلة فارغة أو انتهت صلاحيتها.</p>}{cart && cart.items.length > 0 && <div className="space-y-4">{cart.items.map(item => <div key={item.lineId} className="flex justify-between gap-3 text-sm"><span>{item.productTitle} × {item.quantity}</span><strong>{item.lineTotal.amount} {item.lineTotal.currencyCode}</strong></div>)}<div className="border-t pt-4 font-black">الإجمالي: {cart.total.amount} {cart.total.currencyCode}</div></div>}</CardContent></Card></div></div></main>;
}

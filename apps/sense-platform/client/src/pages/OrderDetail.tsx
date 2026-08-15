import { Link, useParams } from "wouter";
import { ExternalLink, ArrowRight, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { parseOrderId } from "./orderDetailState";

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const id = parseOrderId(params.id);
  const validId = id !== null;
  const query = trpc.commerce.checkout.byId.useQuery({ id: id ?? 0 }, { enabled: validId });

  return (
    <DashboardLayout>
      <main dir="rtl" className="min-h-[calc(100vh-2rem)] bg-[#eef4fb] p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-[#1355a3]">
            <ArrowRight className="size-4" /> العودة إلى سجل الطلبات
          </Link>
          <p className="mt-8 text-xs font-black tracking-[.2em] text-[#1355a3]">SENSE / ORDER DETAIL</p>
          <h1 className="mt-2 text-3xl font-black text-[#071b42]">تفاصيل إحالة الشراء</h1>
          <p className="mt-3 text-[#647b96]">هذه الصفحة تعرض سجل الإحالة إلى Checkout الخارجي فقط، ولا تستنتج حالة الدفع أو الشحن.</p>

          {!validId && (
            <Card className="mt-8 border-red-200 shadow-none">
              <CardContent className="p-8 text-center text-red-800">رقم الإحالة غير صالح.</CardContent>
            </Card>
          )}
          {validId && query.isLoading && <p className="mt-8">جارٍ تحميل تفاصيل الإحالة…</p>}
          {validId && query.isError && (
            <Card className="mt-8 border-red-200 bg-red-50 shadow-none">
              <CardContent className="p-8 text-center text-red-800">تعذر تحميل تفاصيل الإحالة الآن.</CardContent>
            </Card>
          )}
          {validId && !query.isLoading && !query.isError && !query.data && (
            <Card className="mt-8 border-dashed shadow-none">
              <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
                <ShoppingBag className="size-10 text-[#1355a3]" />
                <p className="font-bold">لم نعثر على إحالة بهذا الرقم</p>
                <p className="text-sm text-[#647b96]">قد تكون الإحالة غير تابعة لحسابك أو لم تعد متاحة.</p>
              </CardContent>
            </Card>
          )}
          {query.data && (
            <Card className="mt-8 border-[#cbdced] shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4 text-base">
                  <span>إحالة Checkout #{query.data.id}</span>
                  <span className="rounded bg-[#fff3bf] px-3 py-1 text-xs">محال إلى المتجر</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div><dt className="text-sm text-[#647b96]">معرّف Checkout</dt><dd className="mt-1 break-all font-bold">{query.data.checkoutId}</dd></div>
                  <div><dt className="text-sm text-[#647b96]">تاريخ الإحالة</dt><dd className="mt-1 font-bold">{new Date(query.data.createdAt).toLocaleString("ar-SA")}</dd></div>
                </dl>
                <div className="rounded border border-[#cbdced] bg-[#f8fbff] p-4 text-sm leading-7 text-[#38516d]">حالة الدفع والشحن تُدار في Shopify الخارجي. لن نعرض حالة مؤكدة داخل SENSE قبل تفعيل مصدر موثوق من Shopify Admin أو Webhook والتحقق منه.</div>
                <a href={query.data.checkoutUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-[#1355a3] px-4 py-2 font-bold text-white">فتح Checkout الخارجي <ExternalLink className="size-4" /></a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}

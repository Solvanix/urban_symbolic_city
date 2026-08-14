import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminProviders() {
  const queue = trpc.providers.adminReviewQueue.useQuery();
  const review = trpc.providers.adminReview.useMutation({ onSuccess: () => queue.refetch() });
  const [notes, setNotes] = useState<Record<number, string>>({});

  return <DashboardLayout><main className="min-h-screen bg-background p-4 sm:p-6" dir="rtl"><div className="mx-auto max-w-5xl space-y-6"><div><p className="text-xs font-bold tracking-[0.2em] text-primary">ADMIN REVIEW / PROVIDERS</p><h1 className="mt-2 text-3xl font-black">مراجعة مزودي المنتجات والخدمات</h1><p className="mt-2 text-sm text-muted-foreground">لا يظهر محتوى المزود للعامة قبل اعتماد ملفه. كل قرار يسجل في سجل التدقيق.</p></div>{queue.isLoading && <Card><CardContent className="p-6">جاري تحميل قائمة المراجعة...</CardContent></Card>}{queue.isError && <Card className="border-destructive/40"><CardContent className="p-6 text-destructive">لا يمكن تحميل قائمة المراجعة. تأكد من صلاحية المدير.</CardContent></Card>}{queue.data?.length === 0 && <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center"><ClipboardCheck className="h-10 w-10 text-primary" /><p className="font-bold">لا توجد ملفات بانتظار المراجعة</p><p className="text-sm text-muted-foreground">ستظهر هنا ملفات المزودين بعد إرسالها من لوحة المزود.</p></CardContent></Card>}<div className="grid gap-4">{queue.data?.map((provider) => <Card key={provider.id}><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>{provider.displayName}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{provider.legalName} · {provider.providerType}</p></div><Badge variant="outline">قيد المراجعة</Badge></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-7">{provider.description || "لم يضف المزود وصفًا بعد."}</p><Textarea placeholder="ملاحظة القرار (اختيارية)" value={notes[provider.id] || ""} onChange={(e) => setNotes({ ...notes, [provider.id]: e.target.value })} /><div className="flex flex-wrap gap-2"><Button onClick={() => review.mutate({ providerId: provider.id, decision: "approved", note: notes[provider.id] })} disabled={review.isPending}><CheckCircle2 className="ml-2 h-4 w-4" />اعتماد الملف</Button><Button variant="outline" onClick={() => review.mutate({ providerId: provider.id, decision: "rejected", note: notes[provider.id] })} disabled={review.isPending}><XCircle className="ml-2 h-4 w-4" />رفض مع ملاحظة</Button></div></CardContent></Card>)}</div></div></main></DashboardLayout>;
}

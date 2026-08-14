import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ClipboardList, MapPin, Send, ShieldCheck, Star } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";

const statusLabels: Record<string, string> = {
  submitted: "مرسل",
  review: "قيد المراجعة",
  assigned: "مسند للفريق",
  in_progress: "قيد التنفيذ",
  awaiting_approval: "بانتظار الاعتماد",
  closed: "مغلق",
  reopened: "معاد فتحه",
  draft: "مسودة",
  needs_info: "بحاجة إلى معلومات إضافية",
  rejected: "مرفوض بسبب موثق",
};

function ReportRating({ reportId }: { reportId: number }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const existing = trpc.reports.rating.useQuery({ reportId });
  const save = trpc.reports.rate.useMutation({
    onSuccess: () => { toast.success("تم حفظ تقييمك"); void existing.refetch(); },
    onError: error => toast.error(error.message || "تعذر حفظ التقييم"),
  });
  const value = existing.data?.rating ?? rating;
  if (existing.isLoading || existing.data) return existing.data ? <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">تقييمك المسجل: {existing.data.rating}/5{existing.data.comment ? ` · ${existing.data.comment}` : ""}</div> : null;
  return <div className="mt-3 rounded-lg border border-[#dce8f5] bg-[#f8fbff] p-3"><p className="text-sm font-bold text-[#071b42]">كيف كانت معالجة البلاغ؟</p><div className="mt-2 flex items-center gap-1" dir="ltr">{[1, 2, 3, 4, 5].map(item => <button type="button" key={item} aria-label={`تقييم ${item} من 5`} onClick={() => setRating(item)} className="rounded p-1 text-[#f5c542] hover:bg-[#fff4c7]"><Star size={18} fill={item <= value ? "currentColor" : "none"} /></button>)}</div><Input className="mt-2" value={comment} onChange={event => setComment(event.target.value)} placeholder="تعليق اختياري" maxLength={1000} /><Button className="mt-2" size="sm" disabled={!rating || save.isPending} onClick={() => save.mutate({ reportId, rating, comment: comment || undefined })}>{save.isPending ? "جارٍ الحفظ…" : "حفظ التقييم"}</Button></div>;
}

export default function Reports() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("accessibility");
  const [priority, setPriority] = useState("normal");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: string; longitude: string } | null>(null);
  const reportsQuery = trpc.reports.mine.useQuery(undefined, { enabled: Boolean(user) });
  const createReport = trpc.reports.create.useMutation({
    onSuccess: () => {
      setTitle(""); setDescription(""); setAddress(""); setCoordinates(null);
      toast.success("تم إرسال البلاغ للمراجعة");
      void reportsQuery.refetch();
    },
    onError: error => toast.error(error.message || "تعذر إرسال البلاغ"),
  });

  if (loading) {
    return <PublicShell><div className="container py-24 text-center text-muted-foreground">جارٍ التحقق من الحساب…</div></PublicShell>;
  }

  if (!user) {
    return <PublicShell><main className="container py-16"><Card className="mx-auto max-w-2xl border-border/80"><CardContent className="space-y-6 p-8 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-primary" /><h1 className="text-3xl font-black">البلاغات البلدية تبدأ من حسابك</h1><p className="text-muted-foreground">سجّل الدخول لتقديم بلاغ قابل للمتابعة، مع إبقاء قرار المعالجة والتحقق بيد الفريق المختص.</p><Button onClick={() => startLogin()} className="gap-2">تسجيل الدخول <ArrowLeft className="h-4 w-4" /></Button></CardContent></Card></main></PublicShell>;
  }

  return <PublicShell>
    <main className="container space-y-8 py-10">
      <header className="max-w-3xl space-y-3"><p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-primary">CIVIC REPORTS / 01</p><h1 className="text-4xl font-black tracking-tight md:text-5xl">بلاغ واضح، متابعة يمكن فهمها.</h1><p className="text-lg leading-8 text-muted-foreground">سجّل عائقًا أو احتياجًا حضريًا مع وصف كافٍ وموقع اختياري. المعلومات المعروضة هنا أولية وتحتاج مراجعة ميدانية قبل اعتمادها.</p></header>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />إرسال بلاغ جديد</CardTitle></CardHeader><CardContent><form className="space-y-5" onSubmit={event => { event.preventDefault(); createReport.mutate({ title, description, category: category as "accessibility", priority: priority as "normal", address: address || undefined, latitude: coordinates?.latitude, longitude: coordinates?.longitude }); }}>
          <div className="space-y-2"><Label htmlFor="report-title">عنوان البلاغ</Label><Input id="report-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: مدخل غير مهيأ عند محطة النقل" required minLength={3} /></div>
          <div className="space-y-2"><Label htmlFor="report-description">الوصف</Label><Textarea id="report-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="ما الذي حدث؟ وما أثره على الوصول أو السلامة؟" required minLength={10} rows={5} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>التصنيف</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="accessibility">إتاحة ووصول</SelectItem><SelectItem value="road">طريق أو رصيف</SelectItem><SelectItem value="lighting">إنارة</SelectItem><SelectItem value="waste">نظافة</SelectItem><SelectItem value="transport">نقل</SelectItem><SelectItem value="other">أخرى</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>الأولوية المقترحة</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">منخفضة</SelectItem><SelectItem value="normal">عادية</SelectItem><SelectItem value="high">مرتفعة</SelectItem><SelectItem value="urgent">عاجلة</SelectItem></SelectContent></Select></div></div>
          <div className="space-y-2"><Label htmlFor="report-address">الموقع أو العنوان (اختياري)</Label><div className="relative"><MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="report-address" className="pr-9" value={address} onChange={e => setAddress(e.target.value)} placeholder="يمكنك إضافة العنوان يدويًا الآن" /></div></div>
          <div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label>تحديد النقطة على الخريطة (اختياري)</Label><span className="text-xs text-muted-foreground">{coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : "لم تُحدد نقطة"}</span></div><div className="overflow-hidden rounded-xl border border-border/70"><MapView className="h-64" initialCenter={{ lat: 24.7136, lng: 46.6753 }} initialZoom={11} onMapReady={map => { map.addListener("click", (event: google.maps.MapMouseEvent) => { const latitude = event.latLng?.lat(); const longitude = event.latLng?.lng(); if (latitude !== undefined && longitude !== undefined) setCoordinates({ latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }); }); }} /></div><p className="text-xs leading-6 text-muted-foreground">يمكنك استخدام العنوان اليدوي إذا لم تُحمّل الخريطة أو تعذر تحديد الموقع. الإحداثيات المقترحة تحتاج مراجعة ميدانية.</p></div>
          <Button type="submit" disabled={createReport.isPending} className="w-full gap-2">{createReport.isPending ? "جارٍ الإرسال…" : "إرسال للمراجعة"}<Send className="h-4 w-4" /></Button>
        </form></CardContent></Card>
        <Card className="bg-primary text-primary-foreground"><CardHeader><CardTitle>مبادئ البلاغ المسؤول</CardTitle></CardHeader><CardContent className="space-y-4 text-sm leading-7"><p>اكتب وصفًا يمكن للفريق الميداني فهمه دون كشف بيانات شخصية لا يحتاجها البلاغ.</p><p>لا تُعرض البلاغات أو مواقعها للعامة تلقائيًا. تُستخدم البيانات ضمن الصلاحيات التشغيلية المحددة.</p><Link href="/help" className="inline-flex items-center gap-2 font-bold text-primary-foreground underline underline-offset-4">اقرأ إرشادات المساعدة <ArrowLeft className="h-4 w-4" /></Link></CardContent></Card>
      </div>
      <section className="space-y-4"><div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /><h2 className="text-2xl font-black">بلاغاتي</h2></div>{reportsQuery.isLoading ? <p className="text-muted-foreground">جارٍ تحميل البلاغات…</p> : reportsQuery.error ? <p className="text-destructive">تعذر تحميل البلاغات حاليًا.</p> : reportsQuery.data?.length ? <div className="grid gap-3">{reportsQuery.data.map(report => <Card key={report.id}><CardContent className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{report.title}</p><p className="text-sm text-muted-foreground">رقم البلاغ #{report.id} · {new Date(report.createdAt).toLocaleDateString("ar-SA")}</p>{report.reviewReason && <p className="mt-1 text-xs text-muted-foreground">ملاحظة المراجعة: {report.reviewReason}</p>}</div><span className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-bold">{statusLabels[report.status] ?? report.status}</span></div>{report.status === "closed" && <ReportRating reportId={report.id} />}</CardContent></Card>)}</div> : <Card><CardContent className="p-6 text-center text-muted-foreground">لا توجد بلاغات مرتبطة بهذا الحساب بعد.</CardContent></Card>}</section>
    </main>
  </PublicShell>;
}

import { useRef } from "react";
import { ArrowLeft, ClipboardCheck, RefreshCw, Upload } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const labels: Record<string, string> = {
  submitted: "مرسل",
  review: "قيد المراجعة",
  assigned: "مسند",
  in_progress: "قيد التنفيذ",
  awaiting_approval: "بانتظار الاعتماد",
  closed: "مغلق",
  reopened: "معاد فتحه",
};

const actions: Record<
  string,
  { label: string; toStatus: "review" | "assigned" | "in_progress" | "awaiting_approval" | "closed" | "reopened" }[]
> = {
  submitted: [{ label: "بدء المراجعة", toStatus: "review" }],
  review: [{ label: "إسناد", toStatus: "assigned" }],
  assigned: [{ label: "بدء التنفيذ", toStatus: "in_progress" }],
  in_progress: [{ label: "طلب الاعتماد", toStatus: "awaiting_approval" }],
  awaiting_approval: [
    { label: "اعتماد وإغلاق", toStatus: "closed" },
    { label: "إعادة البلاغ", toStatus: "reopened" },
  ],
  closed: [{ label: "إعادة فتح", toStatus: "reopened" }],
  reopened: [{ label: "إعادة للمراجعة", toStatus: "review" }],
};

type EvidencePayload = {
  reportId: number;
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  base64: string;
};

function EvidencePicker({
  reportId,
  pending,
  onUpload,
}: {
  reportId: number;
  pending: boolean;
  onUpload: (payload: EvidencePayload) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 6_000_000) {
      toast.error("الحد الأقصى للدليل 6MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      toast.error("نوع الملف غير مدعوم");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === "string" ? result.split(",")[1] : "";
      if (base64) {
        onUpload({
          reportId,
          fileName: file.name,
          contentType: file.type as EvidencePayload["contentType"],
          base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {pending ? "جارٍ الرفع…" : "رفع دليل"}
      </Button>
    </>
  );
}

export default function OperationsReports() {
  const queue = trpc.reports.queue.useQuery();
  const utils = trpc.useUtils();
  const uploadEvidence = trpc.reports.uploadEvidence.useMutation({
    onSuccess: () => {
      toast.success("تم رفع الدليل وحفظه");
      void utils.reports.queue.invalidate();
    },
    onError: error => toast.error(error.message || "تعذر رفع الدليل"),
  });
  const transition = trpc.reports.transition.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة البلاغ");
      void utils.reports.queue.invalidate();
    },
    onError: error => toast.error(error.message || "تعذر تحديث البلاغ"),
  });

  return (
    <DashboardLayout>
      <div dir="rtl" className="mx-auto max-w-6xl space-y-8 py-4">
        <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">SENSE / OPERATIONS</p>
            <h1 className="mt-2 text-3xl font-black">طابور البلاغات</h1>
            <p className="mt-2 text-muted-foreground">قائمة تشغيلية محمية؛ لا تظهر إلا للموظفين والفرق والمشرفين والمديرين.</p>
          </div>
          <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            واجهة المواطن <ArrowLeft className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">إجمالي الطابور</p><p className="mt-2 text-3xl font-black">{queue.data?.length ?? "—"}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">قيد المراجعة</p><p className="mt-2 text-3xl font-black">{queue.data?.filter(item => item.status === "submitted" || item.status === "review").length ?? "—"}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">بانتظار الاعتماد</p><p className="mt-2 text-3xl font-black">{queue.data?.filter(item => item.status === "awaiting_approval").length ?? "—"}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" />البلاغات المتاحة لدورك</CardTitle>
            <Button variant="outline" size="sm" onClick={() => void queue.refetch()} disabled={queue.isFetching} className="gap-2"><RefreshCw className="h-4 w-4" />تحديث</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.isLoading ? <p className="py-8 text-center text-muted-foreground">جارٍ تحميل الطابور…</p> : queue.error ? <p className="py-8 text-center text-destructive">تعذر تحميل الطابور. تحقق من صلاحية الحساب.</p> : queue.data?.length ? queue.data.map(item => (
              <div key={item.id} className="flex flex-col gap-4 rounded-xl border border-border/70 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{item.title}</p><Badge variant="secondary">{labels[item.status] ?? item.status}</Badge></div>
                  <p className="mt-1 text-sm text-muted-foreground">#{item.id} · {item.category} · {new Date(item.createdAt).toLocaleDateString("ar-SA")}</p>
                  <p className="mt-2 line-clamp-2 text-sm">{item.description}</p>
                  {item.evidenceUrl && <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-primary underline">عرض آخر دليل</a>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {(actions[item.status] ?? []).map(action => <Button key={action.toStatus} size="sm" variant={action.toStatus === "closed" ? "default" : "outline"} disabled={transition.isPending} onClick={() => transition.mutate({ id: item.id, toStatus: action.toStatus })}>{action.label}</Button>)}
                  {(item.status === "in_progress" || item.status === "awaiting_approval") && <EvidencePicker reportId={item.id} pending={uploadEvidence.isPending} onUpload={payload => uploadEvidence.mutate(payload)} />}
                </div>
              </div>
            )) : <div className="py-12 text-center text-muted-foreground">لا توجد بلاغات في طابور هذا الدور حاليًا.</div>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

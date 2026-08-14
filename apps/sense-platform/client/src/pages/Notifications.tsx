import { Bell, CheckCheck, ExternalLink, Info, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import PublicShell from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const kindLabels: Record<string, string> = {
  report: "بلاغ بلدي",
  provider: "مزود خدمة",
  order: "طلب متجر",
  system: "تنبيه عام",
};

export default function Notifications() {
  const utils = trpc.useUtils();
  const notifications = trpc.notifications.mine.useQuery();
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.mine.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.mine.invalidate(),
  });

  const items = notifications.data ?? [];
  const unreadCount = items.filter((item) => !item.readAt).length;

  return (
    <PublicShell>
      <main className="min-h-screen bg-[#eef4fb]">
        <section className="sense-grid text-white">
          <div className="container py-16 md:py-20">
            <div className="eyebrow text-[#f5c542]">SENSE / NOTIFICATIONS</div>
            <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">مركز التنبيهات<br /><span className="text-[#f5c542]">في مكان واحد.</span></h1>
                <p className="mt-5 max-w-2xl text-lg leading-9 text-blue-100/80">تابع تحديثات بلاغاتك، وإجراءات مزودي الخدمات، وأي إشعارات مرتبطة بتجربتك في SENSE.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-100/80"><Bell size={20} className="text-[#f5c542]" /> {unreadCount} غير مقروء</div>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div><div className="eyebrow text-[#1355a3]">YOUR ACTIVITY</div><h2 className="mt-2 text-2xl font-black text-[#071b42]">آخر الإشعارات</h2></div>
            <Button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending || unreadCount === 0} variant="outline" className="w-fit border-[#b4c9e0] bg-white text-[#071b42]"><CheckCheck size={17} /> تعليم الكل كمقروء</Button>
          </div>

          {notifications.isLoading && <div className="cad-frame bg-white p-8 text-center text-[#647b96]">جارٍ تحميل إشعاراتك...</div>}
          {!notifications.isLoading && items.length === 0 && <div className="cad-frame bg-white p-10 text-center"><Info className="mx-auto text-[#1355a3]" size={30} /><h3 className="mt-4 text-xl font-black text-[#071b42]">لا توجد إشعارات بعد</h3><p className="mt-2 text-[#647b96]">ستظهر هنا التحديثات المهمة المرتبطة ببلاغاتك وتفاعلاتك مع المنصة.</p><Link href="/reports"><Button className="mt-6 bg-[#1355a3] text-white hover:bg-[#0e4387]">متابعة البلاغات</Button></Link></div>}
          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.id} className={`cad-frame flex flex-col gap-5 bg-white p-5 md:flex-row md:items-start ${item.readAt ? "opacity-75" : "border-[#f5c542]"}`}>
                <div className={`grid h-12 w-12 shrink-0 place-items-center ${item.readAt ? "bg-[#e8f1fc] text-[#1355a3]" : "bg-[#fff4c7] text-[#8b6a00]"}`}><Bell size={21} /></div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="eyebrow text-[#1355a3]">{kindLabels[item.kind] ?? "تنبيه"}</span>{!item.readAt && <span className="rounded-full bg-[#f5c542] px-2 py-1 text-[11px] font-bold text-[#071b42]">جديد</span>}</div><h3 className="mt-2 text-lg font-black text-[#071b42]">{item.title}</h3><p className="mt-2 leading-7 text-[#647b96]">{item.body}</p><time className="mt-3 block text-xs text-[#8ca0b7]" dateTime={item.createdAt.toISOString()}>{new Date(item.createdAt).toLocaleString("ar-SA")}</time></div>
                <div className="flex shrink-0 flex-wrap gap-2 md:flex-col">{item.href && <Link href={item.href}><Button size="sm" variant="outline" className="border-[#b4c9e0] text-[#1355a3]"><ExternalLink size={15} /> فتح</Button></Link>}{!item.readAt && <Button size="sm" onClick={() => markRead.mutate({ notificationId: item.id })} className="bg-[#1355a3] text-white hover:bg-[#0e4387]">مقروء</Button>}</div>
              </article>
            ))}
          </div>

          <div className="mt-10 border-t border-[#cbdced] pt-6 text-sm leading-7 text-[#647b96]"><ShieldAlert className="mb-2 text-[#1355a3]" size={20} /><p>تظهر الإشعارات الخاصة بحسابك فقط. لا تستخدم SENSE الإشعارات لتطلب منك مشاركة كلمات المرور أو بيانات الدفع السرية.</p></div>
        </section>
      </main>
    </PublicShell>
  );
}

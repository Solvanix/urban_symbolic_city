import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, CircleAlert, MapPinned, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";
import { loadPreferences } from "./Preferences";
import { recommendTripStops, toggleTripStop, tripStops } from "@/lib/tripPlanner";

export default function TripPlanner() {
  const [preferences] = useState(() => loadPreferences());
  const recommendations = useMemo(() => recommendTripStops(tripStops, preferences.accessNeeds), [preferences.accessNeeds]);
  const [selected, setSelected] = useState<string[]>(() => recommendations.slice(0, 2).map((stop) => stop.id));
  const selectedStops = recommendations.filter((stop) => selected.includes(stop.id));
  const tripAssistant = trpc.ai.assistTripPlanning.useMutation();

  const reset = () => setSelected(recommendations.slice(0, 2).map((stop) => stop.id));
  const askAssistant = () => tripAssistant.mutate({
    accessNeeds: preferences.accessNeeds,
    stops: recommendations.map(({ id, name, summary, verificationNote }) => ({ id, name, summary, verificationNote })),
  });

  return (
    <PublicShell>
      <main className="min-h-screen bg-[#f7faff]">
        <section className="sense-grid text-white">
          <div className="container py-20">
            <div className="eyebrow text-[#f5c542]">SENSE / PERSONAL ROUTE</div>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">خطط رحلتك،<br /><span className="text-[#f5c542]">بطريقتك.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-blue-100/80">نرتب لك بداية أولية اعتمادًا على ملف الوصول المحفوظ على جهازك. القرار لك، والمعلومات تحتاج تحققًا ميدانيًا قبل الاعتماد النهائي.</p>
          </div>
        </section>

        <section className="container pt-10">
          <div className="cad-frame bg-white p-6 md:flex md:items-center md:justify-between md:gap-8">
            <div><div className="eyebrow text-[#1355a3]">AI PLANNING ASSIST</div><h2 className="mt-2 text-2xl font-black text-[#071b42]">مساعد تخطيط أولي</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-[#647b96]">يقارن الاحتياجات المحفوظة بالمحطات المتاحة فقط، ويقترح أسئلة تحقق. لا ينشئ حجزًا ولا يثبت إتاحة غير موثقة.</p></div>
            <Button onClick={askAssistant} disabled={tripAssistant.isPending} className="mt-5 shrink-0 bg-[#1355a3] text-white hover:bg-[#0e4387] md:mt-0">{tripAssistant.isPending ? "جارٍ التحليل..." : "حلل مساري مبدئيًا"}</Button>
          </div>
          {tripAssistant.data && <div className="mt-4 cad-frame border-[#dceafd] bg-[#f2f7fd] p-6 text-[#071b42]"><h3 className="font-black">ملخص المساعد</h3><p className="mt-2 leading-7">{tripAssistant.data.summary}</p><div className="mt-4"><strong>أسئلة تحقق قبل الزيارة</strong><ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6">{tripAssistant.data.accessibilityQuestions.map((question) => <li key={question}>{question}</li>)}</ul></div><p className="mt-4 border-t border-[#dceafd] pt-3 text-xs text-[#647b96]">{tripAssistant.data.disclaimer}</p></div>}
          {tripAssistant.error && <p role="alert" className="mt-3 text-sm text-[#a33a3a]">تعذر تشغيل المساعد؛ يمكنك متابعة اختيار المحطات يدويًا.</p>}
        </section>

        <section className="container grid gap-8 py-16 lg:grid-cols-[1fr_.34fr]">
          <div>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div><div className="eyebrow text-[#1355a3]">CURATED FOR YOU</div><h2 className="mt-3 text-3xl font-black text-[#071b42]">محطات مقترحة</h2><p className="mt-2 text-sm text-[#647b96]">{preferences.accessNeeds.length ? `تمت المطابقة مع ${preferences.accessNeeds.length} احتياجًا محفوظًا.` : "لم تُحفظ احتياجات محددة؛ اعرض كل الخيارات ثم خصصها."}</p></div>
              <Button variant="outline" onClick={reset} className="border-[#b4c9e0] bg-white text-[#071b42]"><RotateCcw size={16} /> إعادة الترتيب</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {recommendations.map((stop) => {
                const active = selected.includes(stop.id);
                return <article key={stop.id} className={`cad-frame bg-white p-6 transition ${active ? "border-[#1355a3] ring-2 ring-[#dceafd]" : ""}`}>
                  <div className="flex items-start justify-between gap-4"><div className="grid h-12 w-12 place-items-center bg-[#e8f1fc] text-[#1355a3]"><MapPinned size={24} /></div><button onClick={() => setSelected((ids) => toggleTripStop(ids, stop.id))} aria-pressed={active} className={`grid h-9 w-9 place-items-center rounded-full border ${active ? "border-[#159a77] bg-[#159a77] text-white" : "border-[#b4c9e0] text-transparent"}`}><Check size={17} /></button></div>
                  <div className="mt-7 text-sm font-bold text-[#1355a3]">{stop.type} · {stop.duration}</div><h3 className="mt-2 text-2xl font-black text-[#071b42]">{stop.name}</h3><p className="mt-3 leading-7 text-[#647b96]">{stop.summary}</p><p className="mt-4 flex items-start gap-2 border-t border-[#e5edf7] pt-4 text-xs leading-6 text-[#647b96]"><CircleAlert size={15} className="mt-1 shrink-0 text-[#d29400]" />{stop.verificationNote}</p>
                </article>;
              })}
            </div>
          </div>

          <aside className="cad-frame h-fit bg-[#071b42] p-7 text-white"><div className="eyebrow text-[#f5c542]">YOUR ROUTE</div><h2 className="mt-4 text-2xl font-black">مسارك الأولي</h2><p className="mt-3 text-sm leading-7 text-blue-100/70">اختر المحطات التي تريدها، ثم راجع الخدمات والمتجر قبل اعتماد الخطة.</p><div className="mt-7 space-y-3">{selectedStops.length ? selectedStops.map((stop, index) => <div key={stop.id} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm"><span className="grid h-7 w-7 place-items-center bg-[#f5c542] font-black text-[#071b42]">{index + 1}</span><span>{stop.name}</span></div>) : <p className="text-sm text-blue-100/70">لم تختر محطة بعد.</p>}</div><div className="mt-7 border-t border-white/15 pt-5 text-sm text-blue-100/70">المحطات المختارة: <strong className="text-[#f5c542]">{selectedStops.length}</strong></div><Link href="/preferences" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f5c542]">تعديل ملف الوصول <SlidersHorizontal size={15} /></Link></aside>
        </section>

        <section className="container pb-20"><div className="flex flex-wrap gap-3"><Link href="/tourism"><Button className="bg-[#1355a3] text-white hover:bg-[#0e4387]">العودة إلى الدليل <ArrowLeft size={17} /></Button></Link><Link href="/services"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]">تصفح الخدمات</Button></Link><Link href="/store"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]">استكشف منتجات الرحلة</Button></Link></div></section>
      </main>
    </PublicShell>
  );
}

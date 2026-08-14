import { ArrowLeft, BadgeCheck, CircleCheck, HeartHandshake, MapPinned, Search, SlidersHorizontal, Sparkles, Store } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";
import { trpc } from "@/lib/trpc";

const destinations = [
  { name: "البلدة القديمة", type: "تراث وثقافة", note: "مسارات هادئة ومعلومات صوتية متاحة", tags: ["معلومات موثقة", "مرافق قريبة"] },
  { name: "واجهة البحر", type: "طبيعة واستجمام", note: "ممر مستوٍ ونقاط راحة على طول المسار", tags: ["وصول حركي", "دليل مرئي"] },
  { name: "سوق الحرف المحلي", type: "تجربة محلية", note: "تجربة قصيرة قابلة للتخصيص مع مزودي خدمات", tags: ["مرافق", "مواقف"] },
];

const municipalServices = [
  { name: "طلب تهيئة مسار", type: "وصول حضري", note: "أرسل طلبًا لتحسين الرصيف أو المنحدر أو الإرشاد في وجهة عامة.", tags: ["موقع على الخريطة", "متابعة الحالة"] },
  { name: "حجز مرفق عام", type: "مرافق وخدمات", note: "اعرف خصائص المرفق وساعات الوصول قبل الزيارة أو الحجز.", tags: ["معلومات واضحة", "حجز مسبق"] },
  { name: "بلاغ خدمة سياحية", type: "تواصل بلدي", note: "ارفع بلاغًا أو ملاحظة حول عائق يؤثر على تجربة الزوار.", tags: ["دليل مصور", "إشعارات الحالة"] },
];

export default function PublicDirectory() {
  const [location] = useLocation();
  const isProviders = location === "/providers";
  const isServices = location === "/services";
  const isMunicipal = location === "/municipal-services";
  const providerCatalog = trpc.providers.publicCatalog.useQuery(undefined, { enabled: isProviders });
  const providerItems = [
    ...(providerCatalog.data?.products ?? []).map((item) => ({ id: `product-${item.id}`, name: item.name, category: "منتج من مزود معتمد", detail: item.description || "بيانات المنتج قيد التحقق من المزود.", icon: Store, href: `/providers/product/${item.id}` })),
    ...(providerCatalog.data?.services ?? []).map((item) => ({ id: `service-${item.id}`, name: item.name, category: "خدمة من مزود معتمد", detail: item.description || item.accessibilityNotes || "بيانات الخدمة قيد التحقق من المزود.", icon: HeartHandshake, href: `/providers/service/${item.id}` })),
  ];
  const title = isProviders ? "مزودون يفهمون الرحلة" : isMunicipal ? "خدمات بلدية لمدينة أسهل" : isServices ? "خدمات تجعل الوصول أسهل" : "وجهات تستقبلك بوضوح";
  const intro = isProviders ? "تواصل مع مزودي نقل وإرشاد ومساندة يعرضون خصائص خدمتهم بوضوح قبل أن تختار." : isMunicipal ? "تواصل مع المدينة، تابع الطلبات، وساعدنا على تحسين المرافق والمسارات التي يعتمد عليها الزوار والسكان." : isServices ? "خدمات سياحية ومنتجات وتجارب مصممة حول الراحة، الوضوح، وحقك في اختيار ما يناسبك." : "استكشف أماكن وتجارب محلية مع معلومات وصول قابلة للفهم، وملاحظات تساعدك على التخطيط بثقة.";
  const cards = isMunicipal ? municipalServices : destinations;

  return <PublicShell>
    <main className="bg-[#f7faff]">
      <section className="sense-grid py-20 text-white"><div className="container"><div className="eyebrow text-[#f5c542]">SENSE / {isProviders ? "PROVIDERS" : isMunicipal ? "MUNICIPAL" : isServices ? "SERVICES" : "DESTINATIONS"}</div><h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/80">{intro}</p><div className="mt-9 flex max-w-2xl items-center gap-3 bg-white p-2 text-[#071b42]"><Search size={20} className="mr-2 text-[#1355a3]" /><input aria-label="ابحث في الدليل" placeholder="ابحث عن وجهة أو خدمة أو احتياج" className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none" /><Button className="bg-[#1355a3] text-white hover:bg-[#0e4387]">بحث</Button></div></div></section>
      <section className="container py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow text-[#1355a3]">CURATED DIRECTORY</div><h2 className="mt-3 text-3xl font-black text-[#071b42]">اختيارات أولية قابلة للتحقق</h2></div><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><SlidersHorizontal size={17} /> تخصيص النتائج</Button></div>{isProviders ? <div className="grid gap-5 md:grid-cols-3">{providerCatalog.isLoading ? <div className="cad-frame bg-white p-8 text-[#647b96]">جاري تحميل الكتالوج المعتمد...</div> : providerItems.length === 0 ? <div className="cad-frame bg-white p-8 text-[#647b96]"><h3 className="text-xl font-black text-[#071b42]">لا توجد عناصر منشورة بعد</h3><p className="mt-2 leading-7">يظهر هنا فقط محتوى مزود تم اعتماده ونشره، حتى تبقى معلومات الوصول والخدمة قابلة للمراجعة.</p><Link href="/providers/admin" className="mt-5 inline-flex font-black text-[#1355a3]">إدارة حساب المزود</Link></div> : providerItems.map(({ id, name, category, icon: Icon, detail, href }) => <article key={id} className="cad-frame bg-white p-7 sense-shadow"><div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center bg-[#e8f1fc] text-[#1355a3]"><Icon /></div><BadgeCheck className="text-[#159a77]" size={20} /></div><div className="mt-10 text-sm font-bold text-[#1355a3]">{category}</div><h3 className="mt-2 text-xl font-black text-[#071b42]">{name}</h3><p className="mt-3 leading-7 text-[#647b96]">{detail}</p><Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#1355a3]">استكشف <ArrowLeft size={15} /></Link></article>)}</div> : <div className="grid gap-5 md:grid-cols-3">{cards.map(({ name, type, note, tags }) => <article key={name} className="cad-frame overflow-hidden bg-white sense-shadow"><div className="sense-grid-fine grid h-44 place-items-center text-[#1355a3]"><MapPinned size={48} strokeWidth={1.2} /></div><div className="p-7"><div className="text-sm font-bold text-[#1355a3]">{type}</div><h3 className="mt-2 text-2xl font-black text-[#071b42]">{name}</h3><p className="mt-3 leading-7 text-[#647b96]">{note}</p><div className="mt-5 flex flex-wrap gap-2">{tags.map(tag => <span key={tag} className="bg-[#e8f1fc] px-3 py-1 text-xs font-bold text-[#1355a3]"><CircleCheck className="mr-1 inline" size={13} />{tag}</span>)}</div><Link href={isMunicipal ? "/reports" : "/plan"} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#1355a3]">{isMunicipal ? "ابدأ الطلب" : "أضف إلى رحلتك"} <ArrowLeft size={15} /></Link></div></article>)}</div>} </section>
      <section className="container pb-20"><div className="flex flex-col items-start justify-between gap-6 bg-[#071b42] p-8 text-white md:flex-row md:items-center"><div><div className="eyebrow text-[#f5c542]">BUILD YOUR ROUTE</div><h2 className="mt-3 text-2xl font-black">لا تعرف من أين تبدأ؟</h2><p className="mt-2 text-blue-100/70">دع المساعد يساعدك على ترتيب خياراتك مع بقاء القرار لك.</p></div><Link href="/ai-planner"><Button className="bg-[#f5c542] text-[#071b42] hover:bg-[#ffd967]"><Sparkles size={17} /> خطط رحلتك</Button></Link></div></section>
    </main>
  </PublicShell>;
}

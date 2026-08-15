import { Link } from "wouter";
import { ArrowLeft, AudioLines, BrainCircuit, CircleCheck, Eye, HandHeart, MapPinned, ShoppingBag, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";

const pillars = [
  { icon: MapPinned, title: "دليل الوجهات والخدمات", text: "اعثر على الوجهات والخدمات المدرجة في SENSE، وراجع معلومات الوصول المتاحة قبل أن تختار." },
  { icon: HandHeart, title: "مزودون ومنتجات", text: "تواصل مع مزودي الخدمات المتخصصين وتصفح منتجات وتجهيزات الرحلة من المتجر الداخلي." },
  { icon: BrainCircuit, title: "تخطيط قابل للتخصيص", text: "استخدم تفضيلاتك ومخطط الرحلة لتنظيم المحطات ووقت الراحة وطريقة عرض المعلومات." },
];

const features = [
  { icon: Eye, title: "إعدادات عرض واضحة", text: "كبّر النص أو فعّل التباين من شريط الوصول الموجود في جميع الصفحات العامة." },
  { icon: AudioLines, title: "قراءة عربية للمحتوى", text: "شغّل القراءة الصوتية للنصوص المتاحة عندما يكون الاستماع أنسب لك." },
  { icon: ShieldCheck, title: "تحكم في تفضيلاتك", text: "احفظ تفضيلات الوصول محليًا، وعدّلها أو احذفها من صفحة التفضيلات." },
];

export default function Home() {
  return (
    <PublicShell>
      <main>
        <section className="sense-grid overflow-hidden text-white">
          <div className="container grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
            <div className="reveal">
              <div className="eyebrow mb-6">SENSE / منصة السياحة والخدمات</div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.12] tracking-tight md:text-7xl">كل ما تحتاجه<br /><span className="text-[#f5c542]">لرحلة أوضح.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-9 text-blue-100/80">SENSE منصة تجمع الوجهات والخدمات والمنتجات ومزوديها في مساحة واحدة، لتبحث وتقارن وتخطط وتتابع طلباتك وفق المعلومات المتاحة لكل خدمة.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/tourism"><Button size="lg" className="bg-[#f5c542] text-[#071b42] hover:bg-[#ffd967]">تصفح الوجهات والخدمات <ArrowLeft size={18} /></Button></Link><Link href="/store"><Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">افتح المتجر <ShoppingBag size={18} /></Button></Link></div>
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-white/15 pt-6 text-sm"><div><div className="text-2xl font-black text-[#f5c542]">01</div><div className="mt-1 text-white/60">ابحث عن وجهة أو خدمة</div></div><div><div className="text-2xl font-black text-[#f5c542]">02</div><div className="mt-1 text-white/60">راجع التفاصيل المتاحة</div></div><div><div className="text-2xl font-black text-[#f5c542]">03</div><div className="mt-1 text-white/60">خطط واطلب وتابع</div></div></div>
            </div>
            <div className="reveal reveal-delay-2 relative hidden min-h-[430px] lg:block">
              <div className="cad-frame absolute inset-8 rotate-2 bg-[#0c2b5c]/60 p-8">
                <div className="absolute -top-5 right-8 bg-[#f5c542] px-3 py-1 text-xs font-black text-[#071b42]">SENSE / ACCESS</div>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between"><div className="text-6xl font-black text-white/90">S</div><div className="text-left text-xs leading-6 text-blue-100/60">DESTINATIONS<br />SERVICES<br />PRODUCTS</div></div>
                  <div><div className="mb-5 h-px bg-white/20" /><div className="flex items-end justify-between"><div><div className="text-xs text-blue-100/60">منصة SENSE</div><div className="mt-2 text-3xl font-black">وجهة، خدمة، منتج</div></div><div className="grid h-16 w-16 place-items-center border border-[#f5c542] text-[#f5c542]"><MapPinned /></div></div></div>
                </div>
              </div>
              <div className="absolute bottom-2 left-0 cad-frame bg-white p-5 text-[#071b42] sense-shadow"><div className="flex items-center gap-3"><CircleCheck className="text-[#159a77]" /><div><div className="text-xs font-bold text-[#56718f]">داخل SENSE</div><div className="font-black">معلومات، مزودون، وطلبات</div></div></div></div>
            </div>
          </div>
        </section>

        <section className="bg-white py-10"><div className="container grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="border-r border-[#dce7f3] px-6 py-4"><div className="text-3xl font-black text-[#1355a3]">وجهات</div><div className="mt-1 text-sm font-bold text-[#647b96]">دليل عام بمصادر تحقق معلنة</div></div><div className="border-r border-[#dce7f3] px-6 py-4"><div className="text-3xl font-black text-[#1355a3]">خدمات</div><div className="mt-1 text-sm font-bold text-[#647b96]">مزودون وملفات خدمات</div></div><div className="border-r border-[#dce7f3] px-6 py-4"><div className="text-3xl font-black text-[#1355a3]">متجر</div><div className="mt-1 text-sm font-bold text-[#647b96]">كتالوج وطلبات داخل SENSE</div></div><div className="px-6 py-4"><div className="text-3xl font-black text-[#1355a3]">تفضيلات</div><div className="mt-1 text-sm font-bold text-[#647b96]">طريقة عرض تناسبك</div></div></div></section>

        <section className="container py-24"><div className="max-w-2xl"><div className="eyebrow text-[#1355a3]">كيف تعمل المنصة</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42] md:text-5xl">من البحث إلى الطلب،<br /><span className="text-[#1355a3]">المعلومات في مكان واحد.</span></h2><p className="mt-5 leading-8 text-[#59708c]">توضح SENSE ما هو متاح فعليًا في كل صفحة: وجهات وخدمات ومنتجات وملفات مزودين، مع حالات فارغة واضحة عندما لا تتوفر بيانات موثقة بعد.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{pillars.map(({ icon: Icon, title, text }, i) => <article key={title} className={`cad-frame reveal reveal-delay-${i + 1} bg-white p-7 sense-shadow`}><div className="mb-12 flex items-center justify-between"><div className="grid h-12 w-12 place-items-center bg-[#e8f1fc] text-[#1355a3]"><Icon /></div><span className="text-xs font-black text-[#9ab0c9]">0{i + 1}</span></div><h3 className="text-xl font-black text-[#071b42]">{title}</h3><p className="mt-3 leading-7 text-[#647b96]">{text}</p><Link href={i === 0 ? "/tourism" : i === 1 ? "/providers" : "/ai-planner"} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#1355a3]">عرض القسم <ArrowLeft size={15} /></Link></article>)}</div></section>

        <section className="bg-[#e8f1fc] py-24"><div className="container grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]"><div><div className="eyebrow text-[#1355a3]">إعدادات الاستخدام</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42]">أنت تتحكم في<br />طريقة الاستخدام.</h2><p className="mt-5 leading-8 text-[#59708c]">إعدادات الوصول أدوات تشغيلية داخل المنصة: حجم النص، التباين، القراءة العربية، وتقليل الحركة. فعّل ما تحتاجه واترك الباقي.</p><Link href="/profile/preferences"><Button className="mt-7 bg-[#071b42] text-white hover:bg-[#12336e]">فتح التفضيلات <ArrowLeft size={17} /></Button></Link></div><div className="grid gap-4 sm:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <div key={title} className="bg-white p-6 sense-shadow"><Icon className="text-[#1355a3]" size={25} /><h3 className="mt-8 font-black text-[#071b42]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#647b96]">{text}</p></div>)}</div></div></section>

        <section className="sense-grid-fine py-24"><div className="container grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="eyebrow text-[#1355a3]">أقسام SENSE</div><h2 className="mt-4 text-4xl font-black text-[#071b42]">اختر ما تريد إنجازه الآن.</h2><p className="mt-4 max-w-2xl leading-8 text-[#59708c]">المنصة الحالية هي تجربة الويب الأساسية. المتجر جزء تجاري داخلي منها، ولوحات المزودين والإدارة لإدارة المحتوى والطلبات. التطبيقات الأصلية للهاتف مرحلة لاحقة وليست منشورة ضمن هذه النسخة.</p></div><div className="flex flex-wrap gap-3"><Link href="/store"><Button className="bg-[#1355a3] text-white hover:bg-[#0e4387]"><ShoppingBag size={17} /> المتجر الداخلي</Button></Link><Link href="/providers"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><UsersRound size={17} /> مزودو الخدمات</Button></Link><Link href="/ai-planner"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><BrainCircuit size={17} /> مخطط الرحلة</Button></Link></div></div></section>
      </main>
    </PublicShell>
  );
}

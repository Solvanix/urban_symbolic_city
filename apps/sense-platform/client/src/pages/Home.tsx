import { Link } from "wouter";
import { ArrowLeft, AudioLines, BrainCircuit, Check, Eye, FileCheck2, MapPinned, PackageCheck, Search, ShoppingBag, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";

const workflow = [
  {
    icon: Search,
    number: "01",
    title: "ابحث في المعلومات المنشورة",
    text: "ابدأ من الوجهات والخدمات أو المتجر. كل بطاقة منشورة يجب أن تعرض ما هو معروف عن الخدمة، وما يحتاج إلى تحقق إضافي، بدل تقديم وعد عام بالجاهزية.",
    href: "/tourism",
    action: "فتح الدليل",
  },
  {
    icon: FileCheck2,
    number: "02",
    title: "قارن ما يناسب رحلتك",
    text: "راجع تفاصيل الوصول والموقع ووقت الخدمة والخيارات المتاحة، ثم استخدم تفضيلاتك لتصفية ما يظهر لك. القرار لك؛ SENSE لا تفترض احتياجك ولا تختار نيابة عنك.",
    href: "/ai-planner",
    action: "فتح مخطط الرحلة",
  },
  {
    icon: PackageCheck,
    number: "03",
    title: "اطلب وتابع من مساحة واحدة",
    text: "إذا كانت الخدمة أو المنتجات متاحة للطلب، انتقل إلى الخطوة المناسبة داخل SENSE. تظهر حالة الطلب كما وصلت من النظام، ولا تُعرض حالة دفع أو شحن غير مؤكدة.",
    href: "/store",
    action: "فتح المتجر",
  },
];

const operatingAreas = [
  {
    icon: MapPinned,
    title: "دليل الوجهات والخدمات",
    text: "مساحة للبحث في الوجهات وملفات الخدمات ومعلومات الوصول المتاحة. لا تُعد الوجهة مدرجة لمجرد وجود اسمها؛ النشر المسؤول يتطلب مصدرًا ووقت مراجعة وحقولًا قابلة للقراءة.",
    href: "/tourism",
    action: "استعرض الدليل",
  },
  {
    icon: UsersRound,
    title: "مزودون يديرون ما يقدمونه",
    text: "حساب المزود هو مساحة لإدارة الملف والخدمات والمنتجات والمخزون ضمن الصلاحيات المعتمدة. المزود مسؤول عن دقة ما يقدمه، والمنصة تحفظ سجل التغييرات والحالات التشغيلية.",
    href: "/providers",
    action: "تعرف على المزودين",
  },
  {
    icon: ShoppingBag,
    title: "متجر داخلي للمنتجات",
    text: "المتجر جزء من SENSE وليس صفحة إحالة خارجية: كتالوج داخلي، سلة، Checkout، طلبات، وإدارة للمخزون. يظل الدفع الفعلي مرتبطًا بموصل شريك معتمد عندما يتم تفعيله.",
    href: "/store",
    action: "تصفح المنتجات",
  },
];

const accessTools = [
  { icon: Eye, title: "إعدادات العرض", text: "حجم النص والتباين وتقليل الحركة متاحة كأدوات استخدام، وليست بديلًا عن جودة المحتوى أو تصميم الخدمة." },
  { icon: AudioLines, title: "قراءة صوتية عربية", text: "يمكن تشغيل القراءة للمحتوى الذي تسمح الصفحة بقراءته عندما يكون الاستماع أنسب من القراءة." },
  { icon: BrainCircuit, title: "تفضيلات ومخطط رحلة", text: "تُستخدم التفضيلات لترتيب المعلومات والاقتراحات، مع إبقاء القرار النهائي للمستخدم وعدم ضمان صلاحية أي وجهة دون مصدر موثق." },
];

export default function Home() {
  return (
    <PublicShell>
      <main>
        <section className="sense-grid overflow-hidden text-white">
          <div className="container grid min-h-[660px] items-center gap-14 py-20 lg:grid-cols-[1.08fr_.92fr]">
            <div className="reveal">
              <div className="eyebrow mb-6">SENSE · منصة وجهات وخدمات ومنتجات</div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.12] tracking-tight md:text-7xl">اعرف ما هو متاح،<br /><span className="text-[#f5c542]">واختر ما يناسب رحلتك.</span></h1>
              <p className="mt-8 max-w-2xl text-lg leading-9 text-blue-100/85">SENSE مساحة تشغيلية تجمع دليل الوجهات والخدمات، حسابات مزوديها، متجر المنتجات، ومخطط الرحلة في تجربة ويب عربية واحدة. هدفها تقليل البحث المتكرر بين المواقع والاتصالات، وإظهار المعلومات المتاحة وحدودها قبل اتخاذ القرار.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/tourism"><Button size="lg" className="bg-[#f5c542] text-[#071b42] hover:bg-[#ffd967]">ابدأ من الدليل <ArrowLeft size={18} /></Button></Link><Link href="/store"><Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">تصفح المتجر الداخلي <ShoppingBag size={18} /></Button></Link></div>
              <p className="mt-6 max-w-xl text-sm leading-7 text-blue-100/65">هذه النسخة هي تطبيق ويب متجاوب. التطبيق الأصلي للهاتف، ومزامنة الشركاء الخارجيين، وبيانات الوجهات الواسعة لا تُعد منشورة تلقائيًا؛ كل منها يحتاج تنفيذًا أو مصدرًا موثقًا.</p>
            </div>
            <div className="reveal reveal-delay-2 relative hidden min-h-[470px] lg:block">
              <div className="cad-frame absolute inset-6 rotate-2 bg-[#0c2b5c]/70 p-8">
                <div className="absolute -top-5 right-8 bg-[#f5c542] px-3 py-1 text-xs font-black text-[#071b42]">من الدليل إلى الطلب</div>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between"><div className="text-7xl font-black text-white/90">S</div><div className="text-left text-xs leading-7 text-blue-100/65">وجهات<br />خدمات<br />منتجات<br />طلبات</div></div>
                  <div><div className="mb-5 h-px bg-white/20" /><div className="grid gap-5 text-right"><div className="flex items-center gap-3 text-sm text-white/75"><span className="grid h-8 w-8 place-items-center border border-[#f5c542] text-[#f5c542]">1</span> معلومات منشورة ومصدرها معروف</div><div className="flex items-center gap-3 text-sm text-white/75"><span className="grid h-8 w-8 place-items-center border border-[#f5c542] text-[#f5c542]">2</span> مزود أو منتج بحالة واضحة</div><div className="flex items-center gap-3 text-sm text-white/75"><span className="grid h-8 w-8 place-items-center border border-[#f5c542] text-[#f5c542]">3</span> طلب يمكن متابعته داخل المنصة</div></div></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 cad-frame bg-white p-5 text-[#071b42] sense-shadow"><div className="flex items-start gap-3"><Check className="mt-1 text-[#159a77]" /><div><div className="text-xs font-bold text-[#56718f]">مبدأ العمل</div><div className="mt-1 font-black">لا نملأ الفراغ بمعلومة غير متحققة</div></div></div></div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#dce7f3] bg-white py-9"><div className="container grid gap-6 md:grid-cols-3"><div className="border-r border-[#dce7f3] px-6"><div className="text-sm font-black text-[#1355a3]">للمستخدم</div><div className="mt-2 font-bold text-[#071b42]">بحث، مقارنة، تخطيط، طلب، متابعة</div></div><div className="border-r border-[#dce7f3] px-6"><div className="text-sm font-black text-[#1355a3]">للمزود</div><div className="mt-2 font-bold text-[#071b42]">ملف خدمة، منتجات، مخزون، وحالات</div></div><div className="px-6"><div className="text-sm font-black text-[#1355a3]">للإدارة</div><div className="mt-2 font-bold text-[#071b42]">صلاحيات، مراجعة، طلبات، وسجل تشغيل</div></div></div></section>

        <section className="container py-24"><div className="max-w-3xl"><div className="eyebrow text-[#1355a3]">كيف تُستخدم SENSE</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42] md:text-5xl">ليست صفحة معلومات فقط.<br /><span className="text-[#1355a3]">هي مسار عمل واضح.</span></h2><p className="mt-6 text-lg leading-9 text-[#59708c]">تتعامل المنصة مع الرحلة كسلسلة قرارات ومعلومات: ما الذي تبحث عنه؟ ما الذي تم التحقق منه؟ من يقدم الخدمة؟ هل يمكن الطلب؟ وما الحالة الحالية؟ عندما لا تتوفر الإجابة، تعرض SENSE ذلك صراحة بدل تحويل التوقع إلى وعد.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{workflow.map(({ icon: Icon, number, title, text, href, action }) => <article key={number} className="cad-frame bg-white p-7 sense-shadow"><div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center bg-[#e8f1fc] text-[#1355a3]"><Icon /></div><span className="text-sm font-black text-[#9ab0c9]">{number}</span></div><h3 className="mt-10 text-xl font-black text-[#071b42]">{title}</h3><p className="mt-4 leading-8 text-[#647b96]">{text}</p><Link href={href} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#1355a3]">{action} <ArrowLeft size={15} /></Link></article>)}</div></section>

        <section className="bg-[#f5f8fc] py-24"><div className="container"><div className="max-w-3xl"><div className="eyebrow text-[#1355a3]">مكونات المنصة الحالية</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42] md:text-5xl">كل جزء له وظيفة وحدود.</h2><p className="mt-5 text-lg leading-9 text-[#59708c]">SENSE ليست اسمًا لمنتج واحد غامض. هي منصة ويب تتكون من مساحات مترابطة، لكل منها مستخدم ومسؤولية وحالة تشغيلية مختلفة.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{operatingAreas.map(({ icon: Icon, title, text, href, action }) => <article key={title} className="cad-frame bg-white p-7 sense-shadow"><div className="grid h-12 w-12 place-items-center bg-[#e8f1fc] text-[#1355a3]"><Icon /></div><h3 className="mt-9 text-xl font-black text-[#071b42]">{title}</h3><p className="mt-4 leading-8 text-[#647b96]">{text}</p><Link href={href} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#1355a3]">{action} <ArrowLeft size={15} /></Link></article>)}</div></div></section>

        <section className="container py-24"><div className="grid items-start gap-14 lg:grid-cols-[.82fr_1.18fr]"><div><div className="eyebrow text-[#1355a3]">أدوات الاستخدام</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42]">التخصيص إعداد تشغيلي،<br /><span className="text-[#1355a3]">وليس وصفًا للمستخدم.</span></h2><p className="mt-5 leading-8 text-[#59708c]">يمكنك تغيير طريقة عرض المعلومات والصوت والحركة بما يساعدك أثناء الاستخدام. هذه الأدوات لا تستبدل المعلومات الدقيقة ولا تعني أن المنصة تعرف احتياجك مسبقًا.</p><Link href="/profile/preferences"><Button className="mt-7 bg-[#071b42] text-white hover:bg-[#12336e]">فتح التفضيلات <ArrowLeft size={17} /></Button></Link></div><div className="grid gap-4 sm:grid-cols-3">{accessTools.map(({ icon: Icon, title, text }) => <div key={title} className="border border-[#dce7f3] bg-white p-6"><Icon className="text-[#1355a3]" size={25} /><h3 className="mt-8 font-black text-[#071b42]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#647b96]">{text}</p></div>)}</div></div></section>

        <section className="sense-grid-fine py-24"><div className="container"><div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="eyebrow text-[#1355a3]">حدود النسخة الحالية</div><h2 className="mt-4 text-4xl font-black text-[#071b42]">ما تراه هنا هو تطبيق الويب الأساسي.</h2><p className="mt-5 max-w-3xl leading-8 text-[#59708c]">المتجر الداخلي ولوحات المزودين والإدارة جزء من هذه المنصة. التطبيق الأصلي للهاتف، ربط بوابات الدفع واللوجستيات، وتوسيع دليل الوجهات إلى بيانات إنتاجية واسعة هي مراحل مستقلة تحتاج شركاء ومصادر واعتمادًا تشغيليًا.</p></div><div className="flex flex-wrap gap-3"><Link href="/store"><Button className="bg-[#1355a3] text-white hover:bg-[#0e4387]"><ShoppingBag size={17} /> المتجر الداخلي</Button></Link><Link href="/providers"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><UsersRound size={17} /> مساحة المزودين</Button></Link><Link href="/ai-planner"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><BrainCircuit size={17} /> مخطط الرحلة</Button></Link></div></div></div></section>
      </main>
    </PublicShell>
  );
}

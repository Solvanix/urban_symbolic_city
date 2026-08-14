import { Link } from "wouter";
import { ArrowLeft, AudioLines, BrainCircuit, BusFront, ChevronLeft, CircleCheck, Eye, HandHeart, MapPinned, ShieldCheck, ShoppingBag, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";

const pillars = [
  { icon: MapPinned, title: "وجهات مفهومة", text: "معلومات وصول واضحة ومؤرخة تساعدك على اختيار المكان قبل الانطلاق." },
  { icon: HandHeart, title: "مزودون موثوقون", text: "خدمات نقل وإقامة ومرافقة وتأجير أجهزة ضمن دليل واحد." },
  { icon: Sparkles, title: "رحلتك بطريقتك", text: "خصص المسافة، وقت الراحة، مستوى الحركة، ونمط المعلومات الذي تفضله." },
];

const features = [
  { icon: Eye, title: "وضع بصري مرن", text: "حجم نص وتباين وكثافة محتوى قابلة للتعديل." },
  { icon: AudioLines, title: "صوت ولغة مبسطة", text: "استكشف المعلومات بصيغ بديلة تناسب طريقة تواصلك." },
  { icon: ShieldCheck, title: "بياناتك بإذنك", text: "التفضيلات اختيارية ويمكن تعديلها أو حذفها في أي وقت." },
];

export default function Home() {
  return (
    <PublicShell>
      <main>
        <section className="sense-grid overflow-hidden text-white">
          <div className="container grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
            <div className="reveal">
              <div className="eyebrow mb-6">SENSE / INCLUSIVE TOURISM</div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.12] tracking-tight md:text-7xl">اكتشف العالم<br /><span className="text-[#f5c542]">بطريقتك.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-9 text-blue-100/80">منصة سياحية شاملة تساعدك على العثور على وجهات وخدمات ومنتجات تناسب احتياجاتك، وتمنحك مساحة لتصميم تجربة سفر أكثر راحة ووضوحًا.</p>
              <div className="mt-9 flex flex-wrap gap-3"><Link href="/tourism"><Button size="lg" className="bg-[#f5c542] text-[#071b42] hover:bg-[#ffd967]">ابدأ استكشافك <ArrowLeft size={18} /></Button></Link><Link href="/services"><Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">تصفح الخدمات <ChevronLeft size={18} /></Button></Link></div>
              <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-white/15 pt-6 text-sm"><div><div className="text-2xl font-black text-[#f5c542]">01</div><div className="mt-1 text-white/60">اختر احتياجك</div></div><div><div className="text-2xl font-black text-[#f5c542]">02</div><div className="mt-1 text-white/60">خطط رحلتك</div></div><div><div className="text-2xl font-black text-[#f5c542]">03</div><div className="mt-1 text-white/60">استمتع بثقة</div></div></div>
            </div>
            <div className="reveal reveal-delay-2 relative hidden min-h-[430px] lg:block">
              <div className="cad-frame absolute inset-8 rotate-2 bg-[#0c2b5c]/60 p-8">
                <div className="absolute -top-5 right-8 bg-[#f5c542] px-3 py-1 text-xs font-black text-[#071b42]">ACCESS / 24</div>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between"><div className="text-6xl font-black text-white/90">S</div><div className="text-left text-xs leading-6 text-blue-100/60">URBAN<br />TRAVEL<br />SYSTEM</div></div>
                  <div><div className="mb-5 h-px bg-white/20" /><div className="flex items-end justify-between"><div><div className="text-xs text-blue-100/60">NEXT DESTINATION</div><div className="mt-2 text-3xl font-black">رحلة بلا عوائق</div></div><div className="grid h-16 w-16 place-items-center border border-[#f5c542] text-[#f5c542]"><MapPinned /></div></div></div>
                </div>
              </div>
              <div className="absolute bottom-2 left-0 cad-frame bg-white p-5 text-[#071b42] sense-shadow"><div className="flex items-center gap-3"><CircleCheck className="text-[#159a77]" /><div><div className="text-xs font-bold text-[#56718f]">معلومات الوصول</div><div className="font-black">موثقة ومفهومة</div></div></div></div>
            </div>
          </div>
        </section>

        <section className="bg-white py-10"><div className="container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ value: "24/7", label: "معلومات ومساندة" }, { value: "4", label: "طرق تواصل ووصول" }, { value: "1", label: "مساحة رحلة موحدة" }, { value: "AA", label: "خط أساس الوصول الرقمي" }].map(({ value, label }) => <div key={label} className="border-r border-[#dce7f3] px-6 py-4 last:border-0"><div className="text-3xl font-black text-[#1355a3]">{value}</div><div className="mt-1 text-sm font-bold text-[#647b96]">{label}</div></div>)}</div></section>

        <section className="container py-24"><div className="max-w-2xl"><div className="eyebrow text-[#1355a3]">THE SENSE METHOD</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42] md:text-5xl">السياحة تبدأ من<br /><span className="text-[#1355a3]">أن تشعر أنك مرحّب بك.</span></h2><p className="mt-5 leading-8 text-[#59708c]">نربط بين تفاصيل الوجهة واحتياجك الحقيقي، بدل أن نتركك تجمع الإجابات من أماكن متفرقة.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{pillars.map(({ icon: Icon, title, text }, i) => <article key={title} className={`cad-frame reveal reveal-delay-${i + 1} bg-white p-7 sense-shadow`}><div className="mb-12 flex items-center justify-between"><div className="grid h-12 w-12 place-items-center bg-[#e8f1fc] text-[#1355a3]"><Icon /></div><span className="text-xs font-black text-[#9ab0c9]">0{i + 1}</span></div><h3 className="text-xl font-black text-[#071b42]">{title}</h3><p className="mt-3 leading-7 text-[#647b96]">{text}</p><Link href="/tourism" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#1355a3]">اكتشف المزيد <ArrowLeft size={15} /></Link></article>)}</div></section>

        <section className="bg-[#e8f1fc] py-24"><div className="container grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]"><div><div className="eyebrow text-[#1355a3]">YOUR EXPERIENCE / YOUR SETTINGS</div><h2 className="mt-4 text-4xl font-black leading-tight text-[#071b42]">أنت تختار كيف<br />تتلقى العالم.</h2><p className="mt-5 leading-8 text-[#59708c]">خصص طريقة العرض، المعلومات، التنبيهات، ومسار الرحلة. لا توجد تجربة واحدة تناسب الجميع، لذلك صُممت SENSE لتتغير معك.</p><Link href="/profile/preferences"><Button className="mt-7 bg-[#071b42] text-white hover:bg-[#12336e]">جرّب التخصيص <ArrowLeft size={17} /></Button></Link></div><div className="grid gap-4 sm:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <div key={title} className="bg-white p-6 sense-shadow"><Icon className="text-[#1355a3]" size={25} /><h3 className="mt-8 font-black text-[#071b42]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#647b96]">{text}</p></div>)}</div></div></section>

        <section className="sense-grid-fine py-24"><div className="container grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="eyebrow text-[#1355a3]">ONE PLATFORM / MANY POSSIBILITIES</div><h2 className="mt-4 text-4xl font-black text-[#071b42]">من اكتشاف الوجهة إلى تفاصيل الرحلة.</h2><p className="mt-4 max-w-2xl leading-8 text-[#59708c]">تصفح وجهات مهيأة، اطلب خدمة من مزود متخصص، اشترِ منتجات الرحلة، وتابع كل شيء من مساحة واحدة.</p></div><div className="flex flex-wrap gap-3"><Link href="/shop"><Button className="bg-[#1355a3] text-white hover:bg-[#0e4387]"><ShoppingBag size={17} /> متجر الرحلة</Button></Link><Link href="/providers"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><UsersRound size={17} /> مزودو الخدمات</Button></Link><Link href="/ai-planner"><Button variant="outline" className="border-[#b4c9e0] bg-white text-[#071b42]"><BrainCircuit size={17} /> مساعد الرحلة</Button></Link></div></div></section>
      </main>
    </PublicShell>
  );
}

import { useEffect, useState } from "react";
import { ArrowLeft, AudioLines, Check, Eye, Languages, Move, RotateCcw, Type } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PublicShell from "@/components/PublicShell";

export type PreferencesState = {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  audioSupport: boolean;
  simplifiedLanguage: boolean;
  accessNeeds: string[];
};

export const defaultPreferences: PreferencesState = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  audioSupport: false,
  simplifiedLanguage: false,
  accessNeeds: [],
};

export function loadPreferences(storage: Pick<Storage, "getItem"> = localStorage): PreferencesState {
  try {
    return { ...defaultPreferences, ...JSON.parse(storage.getItem("sense-preferences") ?? "{}") };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(storage: Pick<Storage, "setItem">, preferences: PreferencesState) {
  storage.setItem("sense-preferences", JSON.stringify(preferences));
}

export function togglePreference(preferences: PreferencesState, key: keyof Omit<PreferencesState, "accessNeeds">): PreferencesState {
  return { ...preferences, [key]: !preferences[key] };
}

const options = [
  { key: "largeText", icon: Type, title: "نص أكبر", text: "زيادة حجم النص والمسافات لتحسين القراءة." },
  { key: "highContrast", icon: Eye, title: "تباين أعلى", text: "تقوية التباين بين الخلفية والمحتوى." },
  { key: "reducedMotion", icon: Move, title: "حركة أقل", text: "تقليل الانتقالات والحركة غير الضرورية." },
  { key: "audioSupport", icon: AudioLines, title: "معلومات صوتية", text: "إظهار خيارات الاستماع عند توفرها." },
  { key: "simplifiedLanguage", icon: Languages, title: "لغة مبسطة", text: "عرض ملخصات أقصر ومصطلحات أوضح." },
] as const;

export default function Preferences() {
  const [preferences, setPreferences] = useState<PreferencesState>(() => loadPreferences());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.senseLargeText = String(preferences.largeText);
    document.documentElement.dataset.senseHighContrast = String(preferences.highContrast);
    document.documentElement.dataset.senseReducedMotion = String(preferences.reducedMotion);
  }, [preferences]);

  const toggle = (key: keyof Omit<PreferencesState, "accessNeeds">) => setPreferences((current) => togglePreference(current, key));
  const toggleNeed = (need: string) => setPreferences((current) => ({ ...current, accessNeeds: current.accessNeeds.includes(need) ? current.accessNeeds.filter((item) => item !== need) : [...current.accessNeeds, need] }));
  const save = () => { savePreferences(localStorage, preferences); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  const clear = () => { localStorage.removeItem("sense-preferences"); setPreferences(defaultPreferences); setSaved(false); };

  return (
    <PublicShell>
      <main className="min-h-screen bg-[#eef4fb]">
        <section className="sense-grid text-white">
          <div className="container py-20">
            <div className="eyebrow text-[#f5c542]">SENSE / YOUR EXPERIENCE</div>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">تجربتك،<br /><span className="text-[#f5c542]">بإعداداتك.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-blue-100/80">اختر طريقة عرض المعلومات والتنبيهات التي تساعدك على التخطيط والتنقل بثقة. تحفظ الإعدادات على جهازك ويمكن تعديلها أو حذفها في أي وقت.</p>
          </div>
        </section>
        <section className="container grid gap-8 py-16 lg:grid-cols-[1fr_.38fr]">
          <div className="cad-frame mb-2 bg-white p-6 md:col-span-2"><div className="eyebrow text-[#1355a3]">ACCESS NEEDS / OPTIONAL</div><h2 className="mt-3 text-2xl font-black text-[#071b42]">ما الذي يساعدك في الرحلة؟</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-[#647b96]">اختر ما تريد استخدامه لتصفية الوجهات ومزودي الخدمات لاحقًا. هذه الاختيارات اختيارية، ويمكن مسحها من الزر أدناه.</p><div className="mt-5 flex flex-wrap gap-3">{[{ key: "mobility", label: "تنقل وحركة" }, { key: "visual", label: "وصول بصري" }, { key: "hearing", label: "وصول سمعي" }, { key: "cognitive", label: "معلومات مبسطة" }, { key: "companion", label: "مرافق سفر" }].map(({ key, label }) => { const active = preferences.accessNeeds.includes(key); return <button key={key} onClick={() => toggleNeed(key)} aria-pressed={active} className={`border px-4 py-3 text-sm font-bold transition ${active ? "border-[#1355a3] bg-[#1355a3] text-white" : "border-[#b4c9e0] bg-white text-[#071b42] hover:bg-[#eef4fb]"}`}>{label}</button>; })}</div></div>
          <div className="grid gap-4 md:grid-cols-2">
            {options.map(({ key, icon: Icon, title, text }) => {
              const active = preferences[key];
              return <button key={key} onClick={() => toggle(key)} className={`cad-frame flex min-h-44 flex-col items-start justify-between p-6 text-right transition ${active ? "border-[#1355a3] bg-[#dceafd]" : "bg-white"}`} aria-pressed={active}>
                <div className="flex w-full items-start justify-between"><span className={`grid h-12 w-12 place-items-center ${active ? "bg-[#1355a3] text-white" : "bg-[#e8f1fc] text-[#1355a3]"}`}><Icon size={22} /></span><span className={`grid h-7 w-7 place-items-center rounded-full border ${active ? "border-[#159a77] bg-[#159a77] text-white" : "border-[#b4c9e0] text-transparent"}`}><Check size={16} /></span></div>
                <div><h2 className="font-black text-[#071b42]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#647b96]">{text}</p></div>
              </button>;
            })}
          </div>
          <aside className="cad-frame h-fit bg-[#071b42] p-7 text-white"><div className="eyebrow text-[#f5c542]">MY ACCESS PROFILE</div><h2 className="mt-4 text-2xl font-black">ملف تجربة السفر</h2><p className="mt-4 text-sm leading-7 text-blue-100/70">سيستخدم هذا الملف لاحقًا لترشيح الوجهات ومزودي الخدمات والمنتجات المناسبة، مع إبقاء القرار لك.</p><div className="mt-8 border-t border-white/15 pt-5 text-sm text-blue-100/70">الإعدادات المفعلة: <strong className="text-[#f5c542]">{Object.values(preferences).filter((value) => typeof value === "boolean" && value).length} / {options.length}</strong><br />احتياجات الرحلة: <strong className="text-[#f5c542]">{preferences.accessNeeds.length}</strong></div><Button onClick={save} className="mt-7 w-full bg-[#f5c542] text-[#071b42] hover:bg-[#ffd967]"><Check size={16} /> {saved ? "تم حفظ الملف" : "حفظ ملف الوصول"}</Button><Button onClick={clear} variant="outline" className="mt-3 w-full border-white/25 bg-transparent text-white hover:bg-white/10"><RotateCcw size={16} /> مسح الملف وإعادة الضبط</Button></aside>
        </section>
        <div className="container pb-20"><Link href="/tourism"><Button className="bg-[#1355a3] text-white hover:bg-[#0e4387]">استكشف وجهات تناسبك <ArrowLeft size={17} /></Button></Link></div>
      </main>
    </PublicShell>
  );
}

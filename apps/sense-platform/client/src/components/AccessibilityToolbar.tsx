import { Accessibility, Minus, Pause, Plus, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sense-display-preferences";
type DisplayPreferences = { fontScale: 100 | 110 | 125 | 140; highContrast: boolean; reducedMotion: boolean };
const defaults: DisplayPreferences = { fontScale: 100, highContrast: false, reducedMotion: false };

function readPreferences(): DisplayPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<DisplayPreferences> | null;
    return { ...defaults, ...parsed };
  } catch { return defaults; }
}

function applyPreferences(value: DisplayPreferences) {
  document.documentElement.style.setProperty("--sense-font-scale", `${value.fontScale / 100}`);
  document.documentElement.dataset.senseLargeText = value.fontScale > 100 ? "true" : "false";
  document.documentElement.dataset.senseHighContrast = value.highContrast ? "true" : "false";
  document.documentElement.dataset.senseReducedMotion = value.reducedMotion ? "true" : "false";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export default function AccessibilityToolbar() {
  const [preferences, setPreferences] = useState<DisplayPreferences>(defaults);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => { const initial = readPreferences(); setPreferences(initial); applyPreferences(initial); }, []);
  const update = (changes: Partial<DisplayPreferences>) => { const next = { ...preferences, ...changes }; setPreferences(next); applyPreferences(next); };
  const changeScale = (delta: number) => update({ fontScale: Math.min(140, Math.max(100, preferences.fontScale + delta)) as DisplayPreferences["fontScale"] });
  const readAloud = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const text = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 5000));
    utterance.lang = "ar-SA";
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); setSpeaking(true);
  };

  return <div className="sense-access-toolbar" aria-label="أدوات الوصول"><span className="sr-only">أدوات تخصيص العرض</span><Button type="button" size="sm" variant="outline" onClick={() => changeScale(-10)} aria-label="تصغير النص" title="تصغير النص"><Minus size={15} /></Button><span aria-live="polite" className="min-w-12 text-center text-xs font-black">{preferences.fontScale}%</span><Button type="button" size="sm" variant="outline" onClick={() => changeScale(10)} aria-label="تكبير النص" title="تكبير النص"><Plus size={15} /></Button><Button type="button" size="sm" variant={preferences.highContrast ? "default" : "outline"} onClick={() => update({ highContrast: !preferences.highContrast })} aria-pressed={preferences.highContrast}><Accessibility size={15} /> تباين</Button><Button type="button" size="sm" variant={preferences.reducedMotion ? "default" : "outline"} onClick={() => update({ reducedMotion: !preferences.reducedMotion })} aria-pressed={preferences.reducedMotion}><Pause size={15} /> حركة</Button><Button type="button" size="sm" variant="outline" onClick={readAloud} aria-pressed={speaking}><Volume2 size={15} /> {speaking ? "إيقاف القراءة" : "استمع"}</Button></div>;
}

export type TripNeed = "mobility" | "visual" | "hearing" | "cognitive" | "companion";

export type TripStop = {
  id: string;
  name: string;
  type: string;
  summary: string;
  needs: TripNeed[];
  duration: string;
  verificationNote: string;
};

export const tripStops: TripStop[] = [
  {
    id: "old-town",
    name: "البلدة القديمة",
    type: "تراث وثقافة",
    summary: "مسار هادئ مع ملخصات واضحة وخيارات معلومات صوتية عند توفرها.",
    needs: ["visual", "cognitive", "companion"],
    duration: "90 دقيقة",
    verificationNote: "تحتاج خصائص الوصول إلى تحقق ميداني قبل الزيارة.",
  },
  {
    id: "sea-front",
    name: "واجهة البحر",
    type: "طبيعة واستجمام",
    summary: "ممر مستوٍ ونقاط راحة موزعة على امتداد المسار.",
    needs: ["mobility", "visual", "companion"],
    duration: "120 دقيقة",
    verificationNote: "تحتاج خصائص الوصول إلى تحقق ميداني قبل الزيارة.",
  },
  {
    id: "craft-market",
    name: "سوق الحرف المحلي",
    type: "تجربة محلية",
    summary: "تجربة قصيرة قابلة للتعديل مع مزودي خدمات ومرافق قريبة.",
    needs: ["mobility", "hearing", "cognitive", "companion"],
    duration: "60 دقيقة",
    verificationNote: "تحتاج خصائص الوصول إلى تحقق ميداني قبل الزيارة.",
  },
];

export function recommendTripStops(stops: TripStop[], accessNeeds: string[]): TripStop[] {
  if (accessNeeds.length === 0) return stops;
  const needs = new Set(accessNeeds);
  const scored = stops.map((stop, index) => ({
    stop,
    score: stop.needs.reduce((total, need) => total + (needs.has(need) ? 1 : 0), 0),
    index,
  }));
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .filter(({ score }) => score > 0)
    .map(({ stop }) => stop);
}

export function toggleTripStop(stopIds: string[], stopId: string): string[] {
  return stopIds.includes(stopId) ? stopIds.filter((id) => id !== stopId) : [...stopIds, stopId];
}

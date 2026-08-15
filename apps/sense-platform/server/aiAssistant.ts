import { invokeLLM } from "./_core/llm";

export const reportAssistantCategories = ["accessibility", "road", "lighting", "waste", "transport", "other"] as const;
export type ReportAssistantResult = { category: (typeof reportAssistantCategories)[number]; priority: "low" | "normal" | "high" | "urgent"; suggestedService: string; rationale: string; disclaimer: string };

export function redactPersonalData(input: string) {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[بريد محجوب]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[هاتف محجوب]")
    .replace(/https?:\/\/\S+/gi, "[رابط محجوب]")
    .replace(/(?:الاسم|اسمي|العنوان|رقم الهوية)\s*[:：-]?\s*[^،.\n]{1,80}/gi, (match) => `${match.split(/[:：-]/)[0]}: [بيانات محجوبة]`)
    .slice(0, 2400);
}

export async function classifyReportDescription(description: string): Promise<ReportAssistantResult> {
  const safeDescription = redactPersonalData(description);
  if (!safeDescription.trim()) throw new Error("EMPTY_DESCRIPTION");
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد فرز أولي لمنصة SENSE. لا تتخذ قرارًا إداريًا، ولا تخترع معلومات. أعد JSON فقط بالعربية. اختر category من accessibility أو road أو lighting أو waste أو transport أو other، وحدد أولوية أولية متحفظة. اجعل suggestedService وصفًا عامًا لا اسم جهة غير موجودة." },
        { role: "user", content: `وصف البلاغ بعد تنقيح البيانات الشخصية:\n${safeDescription}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sense_report_assistant",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: { type: "string", enum: [...reportAssistantCategories] },
              priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
              suggestedService: { type: "string", minLength: 1, maxLength: 160 },
              rationale: { type: "string", minLength: 1, maxLength: 500 },
            },
            required: ["category", "priority", "suggestedService", "rationale"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    if (!reportAssistantCategories.includes(parsed.category) || !["low", "normal", "high", "urgent"].includes(parsed.priority)) throw new Error("INVALID_ASSISTANT_RESULT");
    return { ...parsed, disclaimer: "هذا اقتراح أولي للمساعدة فقط؛ القرار النهائي ووصف البلاغ يعتمدان على المستخدم والموظف المختص." } as ReportAssistantResult;
  } catch {
    return { category: "other", priority: "normal", suggestedService: "المراجعة العامة للبلاغات", rationale: "تعذر تشغيل المساعد الآن؛ يمكنك متابعة البلاغ يدويًا.", disclaimer: "المساعد غير متاح حاليًا. لم يتم حفظ الوصف أو إرساله إلى جهة أخرى." };
  }
}

export type OperationsAssistantResult = {
  summary: string;
  suggestedNextAction: string;
  safetyNotes: string;
  disclaimer: string;
};

export async function assistOperationsReport(input: { title: string; description: string; category: string; status: string }): Promise<OperationsAssistantResult> {
  const safeText = redactPersonalData(`العنوان: ${input.title}\nالوصف: ${input.description}\nالفئة: ${input.category}\nالحالة: ${input.status}`);
  if (!safeText.trim()) throw new Error("EMPTY_REPORT");
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد عمليات داخلي لمنصة SENSE. لخّص البلاغ واقترح خطوة تشغيلية عامة فقط اعتمادًا على النص المعطى. لا تتخذ قرارًا، ولا تغيّر الحالة، ولا تخترع جهة أو موعدًا أو معلومة ميدانية. أعد JSON عربيًا فقط." },
        { role: "user", content: safeText },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sense_operations_assistant",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", minLength: 1, maxLength: 500 },
              suggestedNextAction: { type: "string", minLength: 1, maxLength: 240 },
              safetyNotes: { type: "string", minLength: 1, maxLength: 300 },
            },
            required: ["summary", "suggestedNextAction", "safetyNotes"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    if (![parsed.summary, parsed.suggestedNextAction, parsed.safetyNotes].every(value => typeof value === "string" && value.trim())) throw new Error("INVALID_OPERATIONS_RESULT");
    return { ...parsed, disclaimer: "اقتراح مساعد فقط؛ لا يغيّر الحالة ولا يغني عن تحقق الموظف والقرار البشري." } as OperationsAssistantResult;
  } catch {
    return { summary: "تعذر إنشاء ملخص آلي لهذا البلاغ.", suggestedNextAction: "راجع البلاغ يدويًا وفق الإجراء المعتمد.", safetyNotes: "لم يُتخذ أي إجراء آلي ولم تُحفظ بيانات إضافية.", disclaimer: "المساعد غير متاح حاليًا؛ القرار البشري نهائي." };
  }
}


export type TripPlanningAssistantResult = {
  summary: string;
  suggestedOrder: string[];
  accessibilityQuestions: string[];
  disclaimer: string;
};

export async function assistTripPlanning(input: { accessNeeds: string[]; stops: Array<{ id: string; name: string; summary: string; verificationNote: string }> }): Promise<TripPlanningAssistantResult> {
  const safeNeeds = input.accessNeeds.map((need) => redactPersonalData(need).slice(0, 80));
  const safeStops = input.stops.slice(0, 12).map((stop) => ({
    id: stop.id.slice(0, 80),
    name: redactPersonalData(stop.name).slice(0, 120),
    summary: redactPersonalData(stop.summary).slice(0, 260),
    verificationNote: redactPersonalData(stop.verificationNote).slice(0, 260),
  }));
  if (!safeStops.length) throw new Error("EMPTY_STOPS");
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت مساعد تخطيط أولي لمنصة SENSE. استخدم فقط أسماء المحطات والملاحظات المقدمة. لا تخترع درجة وصول أو وقتًا أو مسافة أو جهة. أعد JSON عربيًا فقط. اقترح ترتيبًا من ids الموجودة، وأسئلة تحقق ميداني عند نقص المعلومات." },
        { role: "user", content: JSON.stringify({ accessNeeds: safeNeeds, stops: safeStops }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sense_trip_planning_assistant",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string", minLength: 1, maxLength: 500 },
              suggestedOrder: { type: "array", items: { type: "string" }, maxItems: 12 },
              accessibilityQuestions: { type: "array", items: { type: "string" }, maxItems: 8 },
            },
            required: ["summary", "suggestedOrder", "accessibilityQuestions"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const validIds = new Set(safeStops.map((stop) => stop.id));
    const suggestedOrder = Array.isArray(parsed.suggestedOrder) ? parsed.suggestedOrder.filter((id: unknown): id is string => typeof id === "string" && validIds.has(id)) : [];
    if (typeof parsed.summary !== "string" || !parsed.summary.trim() || !Array.isArray(parsed.accessibilityQuestions)) throw new Error("INVALID_TRIP_RESULT");
    return {
      summary: parsed.summary,
      suggestedOrder,
      accessibilityQuestions: parsed.accessibilityQuestions.filter((item: unknown): item is string => typeof item === "string").slice(0, 8),
      disclaimer: "اقتراح أولي مبني على المعلومات المتاحة فقط؛ تحقق ميدانيًا قبل الاعتماد ولا يثبت وجود إتاحة غير موثقة.",
    };
  } catch {
    return {
      summary: "تعذر تشغيل مساعد التخطيط الآن؛ يمكنك اختيار المحطات يدويًا.",
      suggestedOrder: safeStops.map((stop) => stop.id),
      accessibilityQuestions: ["تحقق من مسار الوصول الفعلي والمرافق المتاحة قبل الزيارة."],
      disclaimer: "المساعد غير متاح حاليًا، ولم تُنشأ خطة ملزمة أو معلومة وصول جديدة.",
    };
  }
}

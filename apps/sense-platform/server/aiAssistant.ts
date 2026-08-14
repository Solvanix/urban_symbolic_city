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

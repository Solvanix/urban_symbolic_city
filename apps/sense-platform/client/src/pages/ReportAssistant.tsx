import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const classify = trpc.ai.classifyReport.useMutation({
    onSuccess: (result, variables) => {
      setMessages((current) => [...current, { role: "user", content: variables.description }, { role: "assistant", content: `**الاقتراح الأولي**\n\n- التصنيف: ${result.category}\n- الأولوية المقترحة: ${result.priority}\n- المسار المناسب: ${result.suggestedService}\n- السبب: ${result.rationale}\n\n> ${result.disclaimer}` }]);
    },
    onError: () => setMessages((current) => [...current, { role: "assistant", content: "تعذر تشغيل المساعد الآن. يمكنك إرسال البلاغ يدويًا من صفحة البلاغات، ولن تُفقد أي بيانات." }]),
  });

  return <DashboardLayout><main dir="rtl" className="min-h-[calc(100vh-2rem)] bg-[#eef4fb] p-4 md:p-8"><div className="mx-auto max-w-6xl"><div className="mb-6"><p className="text-xs font-black tracking-[.2em] text-[#1355a3]">SENSE / ASSIST</p><h1 className="mt-2 text-3xl font-black text-[#071b42]">مساعد توجيه البلاغ</h1><p className="mt-2 max-w-3xl text-[#647b96]">اكتب وصفًا مختصرًا للمشكلة، وسيقترح المساعد تصنيفًا وخدمة مناسبة. لا يرسل المساعد اسمك أو رقم هاتفك أو عنوانك، والقرار النهائي يبقى لك وللموظف المختص.</p></div><Card className="border-[#cbdced] bg-white shadow-none"><CardHeader><CardTitle className="text-[#071b42]">اقتراح غير ملزم</CardTitle></CardHeader><CardContent><AIChatBox messages={messages} onSendMessage={(description) => classify.mutate({ description })} isLoading={classify.isPending} placeholder="مثال: يوجد منحدر مكسور أمام مدخل المركز..." emptyStateMessage="ابدأ بوصف المشكلة بلغة طبيعية" suggestedPrompts={["منحدر الوصول مكسور أمام مبنى عام", "مصباح لا يعمل في ممر المشاة"]} height="520px" /></CardContent></Card><p className="mt-4 text-xs text-[#647b96]">المحتوى لا يُحفظ كمحادثة دائمة. راجع الاقتراح قبل إرسال البلاغ، واستخدم صفحة الإرسال اليدوي عند الحاجة.</p></div></main></DashboardLayout>;
}

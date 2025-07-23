document.addEventListener("DOMContentLoaded", () => {
  const messageList = document.getElementById("message-list");
  const aiResponse = document.getElementById("ai-response");
  const voiceButton = document.getElementById("ai-voice-button");

  // قراءة السياق الرمزي من التخزين المحلي
  const mode = localStorage.getItem("recommendation_mode") || "مدرسي";
  const level = localStorage.getItem("alert_level") || "منخفض";

  // تحميل الرسائل من ملف JSON
  fetch('../../../assets/config/messages/messages.json')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.messages)) {
        messageList.innerHTML = '';

        // ترتيب الرسائل حسب نمط التوصية
        const sortedMessages = data.messages.sort((a, b) => {
          if (mode === "طوارئ") return b.priority - a.priority;
          if (mode === "مدرسي") return a.type === "school" ? -1 : 1;
          if (mode === "صحي") return a.type === "health" ? -1 : 1;
          if (mode === "حضري") return a.type === "urban" ? -1 : 1;
          return 0;
        });

        sortedMessages.forEach((msg) => {
          const div = document.createElement("div");
          div.className = "message";
          div.textContent = `📩 ${msg.content}`;
          messageList.appendChild(div);
        });
      } else {
        messageList.textContent = "لا توجد رسائل رمزية حالياً.";
      }
    })
    .catch(() => {
      messageList.textContent = "تعذر تحميل الرسائل الرمزية.";
    });

  // تفعيل القراءة الصوتية
  voiceButton.addEventListener("click", () => {
    const messages = document.querySelectorAll(".message");
    if (messages.length === 0) {
      aiResponse.textContent = "لا توجد رسائل لقراءتها.";
      return;
    }

    let combinedText = "";
    messages.forEach(msg => {
      combinedText += msg.textContent + " ";
    });

    aiResponse.textContent = "جاري قراءة الرسائل...";

    const utterance = new SpeechSynthesisUtterance(combinedText);
    utterance.lang = "ar";

    // ضبط نغمة الصوت حسب مستوى التنبيه
    if (level === "مرتفع") {
      utterance.rate = 1.3;
      utterance.pitch = 0.8;
    } else if (level === "متوسط") {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    } else {
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
    }

    speechSynthesis.speak(utterance);
  });
});

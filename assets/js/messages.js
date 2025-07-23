document.addEventListener("DOMContentLoaded", () => {
  const messageList = document.getElementById("message-list");
  const aiResponse = document.getElementById("ai-response");
  const voiceButton = document.getElementById("ai-voice-button");

  // قراءة السياق الرمزي من التخزين المحلي
  const mode = localStorage.getItem("recommendation_mode") || "مدرسي";
  const level = localStorage.getItem("alert_level") || "منخفض";
  const role = localStorage.getItem("user_role") || "user";

  let voiceConfig = {};

  // تحميل إعدادات الصوت من voice_config.json
  fetch('../../../assets/config/voice/voice_config.json')
    .then(res => res.json())
    .then(config => {
      voiceConfig = config;
    });

  // تحميل الرسائل من ملف JSON
  fetch('../../../assets/config/messages/messages.json')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.messages)) {
        const now = new Date();
        messageList.innerHTML = '';

        // ترتيب الرسائل حسب نمط التوصية
        const sortedMessages = data.messages
          .filter(msg => {
            const deferTime = new Date(msg.defer_until);
            const audienceMatch = msg.audience === role || msg.audience === "all";
            return deferTime <= now && audienceMatch;
          })
          .sort((a, b) => {
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

          // عرض توقيت defer_until
          const timeInfo = document.createElement("span");
          timeInfo.className = "timestamp";
          const deferTime = new Date(msg.defer_until);
          timeInfo.textContent = `📅 تظهر الساعة ${deferTime.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}`;
          div.appendChild(document.createElement("br"));
          div.appendChild(timeInfo);

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
    utterance.lang = voiceConfig?.recommendation_mode?.[mode]?.lang || "ar";

    // ضبط النغمة حسب alert_level
    const alertVoice = voiceConfig?.alert_level?.[level] || {};
    utterance.rate = alertVoice.rate || 1.0;
    utterance.pitch = alertVoice.pitch || 1.0;
    utterance.volume = alertVoice.volume || 1.0;

    // إذا كان هناك ضبط خاص حسب recommendation_mode
    const modeVoice = voiceConfig?.recommendation_mode?.[mode] || {};
    if (modeVoice.rate) utterance.rate = modeVoice.rate;
    if (modeVoice.pitch) utterance.pitch = modeVoice.pitch;

    speechSynthesis.speak(utterance);
  });
});

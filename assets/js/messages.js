document.addEventListener("DOMContentLoaded", () => {
  const messageList = document.getElementById("message-list");
  const aiResponse = document.getElementById("ai-response");
  const voiceButton = document.getElementById("ai-voice-button");

  // تحميل الرسائل من ملف JSON
  fetch('../../../assets/config/messages/messages.json')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.messages)) {
        messageList.innerHTML = '';
        data.messages.forEach((msg, index) => {
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
    speechSynthesis.speak(utterance);
  });
});

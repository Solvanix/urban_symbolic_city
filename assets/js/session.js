document.addEventListener("DOMContentLoaded", () => {
  // تحميل بيانات المستخدم من user.json
  fetch('../../../assets/config/user/user.json')
    .then(res => res.json())
    .then(data => {
      if (data && data.role) {
        localStorage.setItem("user_id", data.user_id || "unknown");
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_name", data.name || "مستخدم");
        localStorage.setItem("user_language", data.language || "ar");

        // تحميل التفضيلات الرمزية
        const prefs = data.preferences || {};
        localStorage.setItem("recommendation_mode", prefs.recommendation_mode || "مدرسي");
        localStorage.setItem("alert_level", prefs.alert_level || "منخفض");

        console.log("✅ تم تحميل السياق الرمزي للمستخدم:", data.name);
      } else {
        console.warn("⚠️ لم يتم العثور على بيانات المستخدم.");
      }
    })
    .catch(() => {
      console.error("❌ تعذر تحميل ملف user.json.");
    });
});

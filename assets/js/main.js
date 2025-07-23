document.addEventListener("DOMContentLoaded", () => {

  // 🧬 1. تحميل بيانات التواصل العامة
  fetch('assets/config/contact.json')
    .then(res => res.json())
    .then(data => {
      const contact = document.getElementById("contact-email");
      if (contact) {
        contact.innerHTML = `<strong><a href="mailto:${data.email}">${data.email}</a></strong>`;
      }
    })
    .catch(() => {
      const contact = document.getElementById("contact-email");
      if (contact) contact.textContent = "تعذر تحميل عنوان التواصل.";
    });


  // 🏛️ 2. تحميل تعريف المدينة الرمزية
  fetch('config/entities/ramallah.json')
    .then(res => res.json())
    .then(data => {
      const entityInfo = document.getElementById("entity-info");
      if (entityInfo) {
        entityInfo.textContent = `🏛️ ${data.entity} – ${data.symbolic_label}`;
        entityInfo.style.color = "#888";  // لتخفيف النص مثل المثال
      }
    })
    .catch(() => {
      const entityInfo = document.getElementById("entity-info");
      if (entityInfo) {
        entityInfo.textContent = "📍 لم يتم تحميل تعريف المدينة الرمزية.";
        entityInfo.style.color = "#888";
      }
    });

});

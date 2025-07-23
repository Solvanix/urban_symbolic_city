document.addEventListener("DOMContentLoaded", () => {

  // تحميل بيانات التواصل العامة
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
      if (contact) {
        contact.textContent = "تعذر تحميل عنوان التواصل.";
      }
    });

  // تحميل تعريف الجهة الرمزية (مثل المدينة أو البلدية)
  fetch('config/entities/ramallah.json')
    .then(res => res.json())
    .then(data => {
      const entityInfo = document.getElementById("entity-info");
      if (entityInfo) {
        entityInfo.textContent = `${data.entity} – ${data.symbolic_label}`;
        entityInfo.style.color = "#888";
      }
    })
    .catch(() => {
      const entityInfo = document.getElementById("entity-info");
      if (entityInfo) {
        entityInfo.textContent = "لم يتم تحميل تعريف المدينة الرمزية.";
        entityInfo.style.color = "#888";
      }
    });

  // مثال مستقبلي: تحميل النقلة الرمزية (يُفعّل لاحقًا)
  /*
  fetch('config/moves/symbolic_moves.json')
    .then(res => res.json())
    .then(data => {
      const moveLabel = document.getElementById("symbolic-move");
      if (moveLabel && data.current_move) {
        moveLabel.textContent = `النقلة الرمزية الحالية: ${data.current_move}`;
      }
    });
  */

  // مثال لتفعيل وضع السنو حسب الحالة الموسمية
  /*
  fetch('config/moves/seasonal.json')
    .then(res => res.json())
    .then(data => {
      if (data.snow_mode === true) {
        document.body.classList.add("snow-theme");
      }
    });
  */

});

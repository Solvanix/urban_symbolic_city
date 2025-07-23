document.addEventListener("DOMContentLoaded", () => {
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
});

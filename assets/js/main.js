document.addEventListener("DOMContentLoaded", () => {
  fetch('assets/config/contact.json')
    .then(res => res.json())
    .then(data => {
      const contact = document.getElementById("contact-email");
      if (contact && data.email) {
        contact.innerHTML = `<strong><a href="mailto:${data.email}">${data.email}</a></strong>`;
      }
    })
    .catch(() => {
      const contact = document.getElementById("contact-email");
      if (contact) {
        contact.textContent = "تعذر تحميل عنوان التواصل.";
      }
    });

  fetch('assets/config/entities/ramallah.json')
    .then(res => res.json())
    .then(data => {
      const entityInfo = document.getElementById("entity-info");
      if (entityInfo && data.entity && data.symbolic_label) {
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

  fetch('assets/config/moves/symbolic_moves.json')
    .then(res => res.json())
    .then(data => {
      const moveLabel = document.getElementById("symbolic-move");
      if (moveLabel && data.current_move) {
        moveLabel.textContent = `النقلة الرمزية الحالية: ${data.current_move}`;
      }
    });

  fetch('assets/config/moves/seasonal.json')
    .then(res => res.json())
    .then(data => {
      if (data.snow_mode === true) {
        document.body.classList.add("snow-theme");
      }

      const seasonInfo = document.getElementById("season-info");
      if (seasonInfo && data.season_label && data.season_note) {
        seasonInfo.textContent = `${data.season_label} – ${data.season_note}`;
      }
    });
});
